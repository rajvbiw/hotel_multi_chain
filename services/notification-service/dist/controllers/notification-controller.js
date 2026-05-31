"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNotificationSubscribers = exports.markAsRead = exports.getNotifications = void 0;
const notification_js_1 = require("../models/notification.js");
const shared_1 = require("shared");
const getNotifications = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new shared_1.UnauthorizedError();
        }
        const notifications = await notification_js_1.Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: notifications,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const notification = await notification_js_1.Notification.findById(req.params.id);
        if (!notification) {
            throw new shared_1.NotFoundError('Notification not found');
        }
        if (req.user && notification.userId !== req.user.id) {
            throw new shared_1.UnauthorizedError('Unauthorized to modify this notification');
        }
        notification.isRead = true;
        await notification.save();
        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.markAsRead = markAsRead;
// =========================================================================
// ASYNCHRONOUS EVENT BUS SUBSCRIBERS
// =========================================================================
const registerNotificationSubscribers = () => {
    // Listen for order status updates
    shared_1.eventBus.subscribe('order.status_updated', async (payload) => {
        const { orderId, userId, status } = payload;
        console.log(`[NotificationService] Preparing status update alert for order ${orderId} -> ${status}`);
        const statusDescriptions = {
            CONFIRMED: 'Your order has been accepted by the kitchen staff and will be prepared shortly.',
            PREPARING: 'The chefs are now preparing your delicious meal with fresh ingredients!',
            READY: 'Your food is ready! It is waiting for pickup or packaging.',
            OUT_FOR_DELIVERY: 'Your delivery driver has picked up your order and is heading your way!',
            DELIVERED: 'Yum! Your order has been successfully delivered. Enjoy your meal!',
            CANCELLED: 'We regret to inform you that your order has been cancelled.',
        };
        try {
            const msg = statusDescriptions[status] || `Your order status has changed to ${status}.`;
            const notification = new notification_js_1.Notification({
                userId,
                title: `Order #${orderId.toString().slice(-6)} Update`,
                message: msg,
                type: 'order',
            });
            await notification.save();
            // Dispatch event to EventBus so API Gateway can immediately sync the browser clients!
            await shared_1.eventBus.publish('notification.created', {
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
        }
        catch (err) {
            console.error('[NotificationService] Status update processor error:', err.message);
        }
    });
    // Listen for low stock warnings
    shared_1.eventBus.subscribe('inventory.low_stock', async (payload) => {
        const { branchId, name, quantity, unit } = payload;
        console.log(`[NotificationService] Logging low stock alert for ${name} at branch ${branchId}`);
        try {
            // Create admin notification
            // Note: In production we query database to find all admin user ids of the branch.
            // For developer setup we route to a generic "admin" user target
            const notification = new notification_js_1.Notification({
                userId: `branch_admin_${branchId}`, // Targeted placeholder
                title: `⚠️ LOW STOCK WARNING`,
                message: `Branch ingredient "${name}" is dangerously low! Current level: ${quantity}${unit}. Please restock immediately from suppliers.`,
                type: 'inventory',
            });
            await notification.save();
            // Dispatch event
            await shared_1.eventBus.publish('notification.created', {
                userId: `branch_admin_${branchId}`,
                title: notification.title,
                message: notification.message,
                type: 'inventory',
                createdAt: notification.createdAt,
            });
        }
        catch (err) {
            console.error('[NotificationService] Low stock processor error:', err.message);
        }
    });
    // Listen for custom created notification events (like points awarded in loyalty)
    shared_1.eventBus.subscribe('notification.created', async (payload) => {
        // If it's not already in the database (which we check by avoiding infinite loop triggers),
        // let's save loyalty updates. Loyalty published notification.created directly, so we persist it!
        const { userId, title, message, type, createdAt } = payload;
        if (type === 'loyalty') {
            try {
                const exists = await notification_js_1.Notification.findOne({ userId, title, message });
                if (!exists) {
                    const notification = new notification_js_1.Notification({ userId, title, message, type });
                    await notification.save();
                    console.log(`[NotificationService] Saved external notification for user ${userId}: "${title}"`);
                }
            }
            catch (err) {
                console.error('[NotificationService] External event saving error:', err.message);
            }
        }
    });
};
exports.registerNotificationSubscribers = registerNotificationSubscribers;
//# sourceMappingURL=notification-controller.js.map