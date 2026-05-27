import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/notification.js';
import { BadRequestError, NotFoundError, UnauthorizedError, eventBus } from 'shared';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (req.user && notification.userId !== req.user.id) {
      throw new UnauthorizedError('Unauthorized to modify this notification');
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// ASYNCHRONOUS EVENT BUS SUBSCRIBERS
// =========================================================================

export const registerNotificationSubscribers = () => {
  // Listen for order status updates
  eventBus.subscribe('order.status_updated', async (payload: any) => {
    const { orderId, userId, status } = payload;
    console.log(`[NotificationService] Preparing status update alert for order ${orderId} -> ${status}`);

    const statusDescriptions: Record<string, string> = {
      CONFIRMED: 'Your order has been accepted by the kitchen staff and will be prepared shortly.',
      PREPARING: 'The chefs are now preparing your delicious meal with fresh ingredients!',
      READY: 'Your food is ready! It is waiting for pickup or packaging.',
      OUT_FOR_DELIVERY: 'Your delivery driver has picked up your order and is heading your way!',
      DELIVERED: 'Yum! Your order has been successfully delivered. Enjoy your meal!',
      CANCELLED: 'We regret to inform you that your order has been cancelled.',
    };

    try {
      const msg = statusDescriptions[status] || `Your order status has changed to ${status}.`;
      const notification = new Notification({
        userId,
        title: `Order #${orderId.toString().slice(-6)} Update`,
        message: msg,
        type: 'order',
      });

      await notification.save();

      // Dispatch event to EventBus so API Gateway can immediately sync the browser clients!
      await eventBus.publish('notification.created', {
        userId,
        title: notification.title,
        message: notification.message,
        type: 'order',
        createdAt: notification.createdAt,
      });

      // Mock Email / SMS Log Dispatch
      console.log(`[MOCK NOTIFICATION DISPATCH]`);
      console.log(`📧 SMS / EMAIL sent to User ID: ${userId}`);
      console.log(`💬 Subject: ${notification.title}`);
      console.log(`📝 Body: ${notification.message}`);
      console.log(`--------------------------------------------------`);
    } catch (err: any) {
      console.error('[NotificationService] Status update processor error:', err.message);
    }
  });

  // Listen for low stock warnings
  eventBus.subscribe('inventory.low_stock', async (payload: any) => {
    const { branchId, name, quantity, unit } = payload;
    console.log(`[NotificationService] Logging low stock alert for ${name} at branch ${branchId}`);

    try {
      // Create admin notification
      // Note: In production we query database to find all admin user ids of the branch.
      // For developer setup we route to a generic "admin" user target
      const notification = new Notification({
        userId: `branch_admin_${branchId}`, // Targeted placeholder
        title: `⚠️ LOW STOCK WARNING`,
        message: `Branch ingredient "${name}" is dangerously low! Current level: ${quantity}${unit}. Please restock immediately from suppliers.`,
        type: 'inventory',
      });

      await notification.save();

      // Dispatch event
      await eventBus.publish('notification.created', {
        userId: `branch_admin_${branchId}`,
        title: notification.title,
        message: notification.message,
        type: 'inventory',
        createdAt: notification.createdAt,
      });
    } catch (err: any) {
      console.error('[NotificationService] Low stock processor error:', err.message);
    }
  });

  // Listen for custom created notification events (like points awarded in loyalty)
  eventBus.subscribe('notification.created', async (payload: any) => {
    // If it's not already in the database (which we check by avoiding infinite loop triggers),
    // let's save loyalty updates. Loyalty published notification.created directly, so we persist it!
    const { userId, title, message, type, createdAt } = payload;
    if (type === 'loyalty') {
      try {
        const exists = await Notification.findOne({ userId, title, message });
        if (!exists) {
          const notification = new Notification({ userId, title, message, type });
          await notification.save();
          console.log(`[NotificationService] Saved external notification for user ${userId}: "${title}"`);
        }
      } catch (err: any) {
        console.error('[NotificationService] External event saving error:', err.message);
      }
    }
  });
};
