import { Request, Response, NextFunction } from 'express';
import { Loyalty } from '../models/loyalty.js';
import { Coupon } from '../models/coupon.js';
import { BadRequestError, NotFoundError, UnauthorizedError, eventBus } from 'shared';

export const getLoyaltyStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    let loyalty = await Loyalty.findOne({ userId: req.user.id });
    if (!loyalty) {
      // Lazy initialize loyalty card for new customers
      loyalty = new Loyalty({
        userId: req.user.id,
        userName: req.user.name || 'Valued Customer',
      });
      await loyalty.save();
    }

    res.json({
      success: true,
      data: loyalty,
    });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, discountType, value, minOrderValue, expiresAt } = req.body;

    if (!code || !discountType || value === undefined || !expiresAt) {
      throw new BadRequestError('Required: code, discountType, value, and expiresAt');
    }

    const coupon = new Coupon({
      code,
      discountType,
      value,
      minOrderValue: minOrderValue || 0,
      expiresAt: new Date(expiresAt),
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (err) {
    next(err);
  }
};

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await Coupon.find({ isActive: true, expiresAt: { $gt: new Date() } });
    res.json({
      success: true,
      data: coupons,
    });
  } catch (err) {
    next(err);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderValue } = req.body;

    if (!code || orderValue === undefined) {
      throw new BadRequestError('Coupon code and orderValue are required');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      throw new NotFoundError('Invalid or inactive coupon code');
    }

    if (new Date() > coupon.expiresAt) {
      coupon.isActive = false;
      await coupon.save();
      throw new BadRequestError('This coupon has expired');
    }

    if (orderValue < coupon.minOrderValue) {
      throw new BadRequestError(`Minimum order value of $${coupon.minOrderValue} required for this coupon`);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderValue * (coupon.value / 100)) * 100) / 100;
    } else {
      discountAmount = Math.min(orderValue, coupon.value);
    }

    res.json({
      success: true,
      message: 'Coupon is valid',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        discountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// =========================================================================
// ASYNCHRONOUS EVENT BUS SUBSCRIBERS
// =========================================================================

export const registerLoyaltySubscribers = () => {
  eventBus.subscribe('order.completed', async (payload: any) => {
    const { userId, total, orderId } = payload;
    console.log(`[LoyaltyService] Awarding points for completed order ${orderId} by user ${userId}`);

    try {
      let loyalty = await Loyalty.findOne({ userId });

      if (!loyalty) {
        // Find user name or default
        loyalty = new Loyalty({
          userId,
          userName: 'Customer',
        });
      }

      // 1 Point for every $1 spent
      const pointsEarned = Math.round(total);
      loyalty.points += pointsEarned;
      loyalty.totalSpent += total;
      
      // Auto recalculate membership tier!
      (loyalty as any).recalculateTier();

      await loyalty.save();

      console.log(`[LoyaltyService] User ${userId} earned ${pointsEarned} points. Total Points: ${loyalty.points}. Tier: ${loyalty.tier}`);

      // Push custom event alert to the notifications service!
      await eventBus.publish('notification.created', {
        userId,
        title: '🎉 Loyalty Points Awarded!',
        message: `You earned ${pointsEarned} loyalty points from order #${orderId.toString().slice(-6)}. Your total points balance is now ${loyalty.points} (${loyalty.tier} tier)!`,
        type: 'loyalty',
      });
    } catch (err: any) {
      console.error('[LoyaltyService] Event processor error:', err.message);
    }
  });
};
