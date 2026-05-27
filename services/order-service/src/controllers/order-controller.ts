import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/order.js';
import { BadRequestError, NotFoundError, UnauthorizedError, eventBus } from 'shared';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { branchId, branchName, items, orderType, tableNumber, deliveryAddress, paymentMethod, discountAmount } = req.body;

    if (!req.user) {
      throw new UnauthorizedError('User authentication required');
    }
    if (!branchId || !branchName || !items || !items.length || !orderType) {
      throw new BadRequestError('Required: branchId, branchName, items, and orderType');
    }

    // Calculate billing
    let subtotal = 0;
    for (const item of items) {
      if (!item.price || !item.quantity) {
        throw new BadRequestError('Each item must contain a price and quantity');
      }
      subtotal += item.price * item.quantity;
    }

    const discount = discountAmount || 0;
    const taxRate = 0.05; // 5% tax
    const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
    const total = Math.max(0, Math.round((subtotal - discount + tax) * 100) / 100);

    const order = new Order({
      userId: req.user.id,
      userName: req.user.name || 'Valued Customer',
      branchId,
      branchName,
      items,
      subtotal,
      discount,
      tax,
      total,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : null,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      paymentMethod: paymentMethod || 'CARD',
      paymentStatus: 'PAID', // In development, default mock payment to paid
      status: 'PLACED',
    });

    await order.save();

    // Publish asynchronous system event for core integrations!
    // 1. inventory-service catches 'order.created' to decrement raw ingredients
    // 2. loyalty-service catches 'order.created' to increment points based on total spent
    await eventBus.publish('order.created', {
      orderId: order._id,
      userId: order.userId,
      branchId: order.branchId,
      items: order.items,
      total: order.total,
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const { status, branchId } = req.query;
    const query: any = {};

    // Customer can only view their own orders
    if (req.user.role === 'customer') {
      query.userId = req.user.id;
    } else if (req.user.role === 'kitchen' || req.user.role === 'admin') {
      // Staff filter by branch
      query.branchId = req.user.branchId || branchId;
    } else if (req.user.role === 'superadmin' && branchId) {
      // Super admin optional filter
      query.branchId = branchId;
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // RBAC verification
    if (req.user && req.user.role === 'customer' && order.userId !== req.user.id) {
      throw new UnauthorizedError('Unauthorized to access this order');
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!status) {
      throw new BadRequestError('Status is required');
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.status = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    await order.save();

    // Trigger dynamic status websocket changes & notifications
    await eventBus.publish('order.status_updated', {
      orderId: order._id,
      userId: order.userId,
      branchId: order.branchId,
      status: order.status,
    });

    if (status === 'DELIVERED') {
      await eventBus.publish('order.completed', {
        orderId: order._id,
        userId: order.userId,
        branchId: order.branchId,
        total: order.total,
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic aggregation counts for dashboard metrics
    const orderCount = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const branchBreakdown = await Order.aggregate([
      { $group: { _id: '$branchName', revenue: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);

    const orderTypeBreakdown = await Order.aggregate([
      { $group: { _id: '$orderType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          orders: orderCount,
          revenue: totalRevenue,
          avgOrderValue: orderCount ? Math.round((totalRevenue / orderCount) * 100) / 100 : 0,
        },
        branches: branchBreakdown,
        orderTypes: orderTypeBreakdown,
      }
    });
  } catch (err) {
    next(err);
  }
};
