"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.updateOrderStatus = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const order_js_1 = require("../models/order.js");
const shared_1 = require("shared");
const createOrder = async (req, res, next) => {
    try {
        const { branchId, branchName, items, orderType, tableNumber, deliveryAddress, paymentMethod, discountAmount } = req.body;
        if (!req.user) {
            throw new shared_1.UnauthorizedError('User authentication required');
        }
        if (!branchId || !branchName || !items || !items.length || !orderType) {
            throw new shared_1.BadRequestError('Required: branchId, branchName, items, and orderType');
        }
        // Calculate billing
        let subtotal = 0;
        for (const item of items) {
            if (!item.price || !item.quantity) {
                throw new shared_1.BadRequestError('Each item must contain a price and quantity');
            }
            subtotal += item.price * item.quantity;
        }
        const discount = discountAmount || 0;
        const taxRate = 0.05; // 5% tax
        const tax = Math.round((subtotal - discount) * taxRate * 100) / 100;
        const total = Math.max(0, Math.round((subtotal - discount + tax) * 100) / 100);
        const order = new order_js_1.Order({
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
        await shared_1.eventBus.publish('order.created', {
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
    }
    catch (err) {
        next(err);
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new shared_1.UnauthorizedError();
        }
        const { status, branchId } = req.query;
        const query = {};
        // Customer can only view their own orders
        if (req.user.role === 'customer') {
            query.userId = req.user.id;
        }
        else if (req.user.role === 'kitchen' || req.user.role === 'admin') {
            // Staff filter by branch
            query.branchId = req.user.branchId || branchId;
        }
        else if (req.user.role === 'superadmin' && branchId) {
            // Super admin optional filter
            query.branchId = branchId;
        }
        if (status) {
            query.status = status;
        }
        const orders = await order_js_1.Order.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: orders,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getOrders = getOrders;
const getOrderById = async (req, res, next) => {
    try {
        const order = await order_js_1.Order.findById(req.params.id);
        if (!order) {
            throw new shared_1.NotFoundError('Order not found');
        }
        // RBAC verification
        if (req.user && req.user.role === 'customer' && order.userId !== req.user.id) {
            throw new shared_1.UnauthorizedError('Unauthorized to access this order');
        }
        res.json({
            success: true,
            data: order,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderById = getOrderById;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) {
            throw new shared_1.BadRequestError('Status is required');
        }
        const order = await order_js_1.Order.findById(req.params.id);
        if (!order) {
            throw new shared_1.NotFoundError('Order not found');
        }
        order.status = status;
        if (status === 'DELIVERED') {
            order.paymentStatus = 'PAID';
        }
        await order.save();
        // Trigger dynamic status websocket changes & notifications
        await shared_1.eventBus.publish('order.status_updated', {
            orderId: order._id,
            userId: order.userId,
            branchId: order.branchId,
            status: order.status,
        });
        if (status === 'DELIVERED') {
            await shared_1.eventBus.publish('order.completed', {
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
    }
    catch (err) {
        next(err);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getAnalytics = async (req, res, next) => {
    try {
        // Basic aggregation counts for dashboard metrics
        const orderCount = await order_js_1.Order.countDocuments();
        const totalRevenueResult = await order_js_1.Order.aggregate([
            { $match: { paymentStatus: 'PAID' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const branchBreakdown = await order_js_1.Order.aggregate([
            { $group: { _id: '$branchName', revenue: { $sum: '$total' }, count: { $sum: 1 } } }
        ]);
        const orderTypeBreakdown = await order_js_1.Order.aggregate([
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
    }
    catch (err) {
        next(err);
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=order-controller.js.map