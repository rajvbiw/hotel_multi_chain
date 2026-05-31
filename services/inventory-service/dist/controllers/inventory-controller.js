"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInventorySubscribers = exports.updateStock = exports.getInventory = exports.createInventoryItem = void 0;
const inventory_item_js_1 = require("../models/inventory-item.js");
const shared_1 = require("shared");
const createInventoryItem = async (req, res, next) => {
    try {
        const { branchId, name, quantity, unit, minThreshold, supplier } = req.body;
        if (!branchId || !name || quantity === undefined || !unit) {
            throw new shared_1.BadRequestError('Required: branchId, name, quantity, and unit');
        }
        const item = new inventory_item_js_1.InventoryItem({
            branchId,
            name,
            quantity,
            unit,
            minThreshold: minThreshold || 1000,
            supplier,
        });
        await item.save();
        res.status(201).json({
            success: true,
            message: 'Inventory item created successfully',
            data: item,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createInventoryItem = createInventoryItem;
const getInventory = async (req, res, next) => {
    try {
        const { branchId, lowStock } = req.query;
        const query = {};
        if (branchId) {
            query.branchId = branchId;
        }
        const items = await inventory_item_js_1.InventoryItem.find(query);
        let filteredItems = items;
        if (lowStock === 'true') {
            filteredItems = items.filter((item) => item.quantity <= item.minThreshold);
        }
        res.json({
            success: true,
            data: filteredItems,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getInventory = getInventory;
const updateStock = async (req, res, next) => {
    try {
        const { quantity } = req.body; // Represents quantity to ADD (positive) or REMOVE (negative)
        if (quantity === undefined) {
            throw new shared_1.BadRequestError('Quantity is required');
        }
        const item = await inventory_item_js_1.InventoryItem.findById(req.params.id);
        if (!item) {
            throw new shared_1.NotFoundError('Inventory item not found');
        }
        item.quantity = Math.max(0, item.quantity + Number(quantity));
        await item.save();
        res.json({
            success: true,
            message: 'Stock level updated successfully',
            data: item,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateStock = updateStock;
// =========================================================================
// ASYNCHRONOUS EVENT BUS SUBSCRIBERS
// =========================================================================
// Local database helper maps of typical recipes to ingredients in the inventory.
// In production, these mappings would be fetched or synced from the menu-service.
const RECIPE_MOCK_MAP = {
    // Burgers
    'Classic Cheese Burger': [
        { name: 'Beef Patty', quantity: 1 },
        { name: 'Cheese Slice', quantity: 1 },
        { name: 'Burger Bun', quantity: 1 },
        { name: 'Lettuce Leaves', quantity: 20 }, // 20g
    ],
    'Double Smash Burger': [
        { name: 'Beef Patty', quantity: 2 },
        { name: 'Cheese Slice', quantity: 2 },
        { name: 'Burger Bun', quantity: 1 },
        { name: 'Secret Sauce', quantity: 15 }, // 15ml
    ],
    'Crispy Chicken Burger': [
        { name: 'Chicken Patty', quantity: 1 },
        { name: 'Burger Bun', quantity: 1 },
        { name: 'Lettuce Leaves', quantity: 15 },
        { name: 'Mayonnaise', quantity: 10 },
    ],
    // Pizzas
    'Margherita Pizza': [
        { name: 'Pizza Dough', quantity: 1 },
        { name: 'Tomato Sauce', quantity: 100 }, // 100ml
        { name: 'Mozzarella Cheese', quantity: 150 }, // 150g
        { name: 'Fresh Basil', quantity: 10 }, // 10g
    ],
    'Spicy Pepperoni Pizza': [
        { name: 'Pizza Dough', quantity: 1 },
        { name: 'Tomato Sauce', quantity: 100 },
        { name: 'Mozzarella Cheese', quantity: 120 },
        { name: 'Pepperoni Slices', quantity: 15 },
    ],
    'BBQ Chicken Pizza': [
        { name: 'Pizza Dough', quantity: 1 },
        { name: 'BBQ Sauce', quantity: 80 },
        { name: 'Mozzarella Cheese', quantity: 120 },
        { name: 'Chicken Breast', quantity: 100 },
    ],
    // Desserts
    'Chocolate Fudge Brownie': [
        { name: 'Fudge Mix', quantity: 1 },
        { name: 'Chocolate Syrup', quantity: 30 },
    ],
    'Warm Apple Pie': [
        { name: 'Apple Filling', quantity: 150 },
        { name: 'Flour crust', quantity: 1 },
    ],
    // Beverages
    'Craft Stout Beer': [
        { name: 'Beer Bottle', quantity: 1 },
    ],
    'Organic Lemonade': [
        { name: 'Lemons', quantity: 2 },
        { name: 'Soda Can', quantity: 1 },
    ],
};
const registerInventorySubscribers = () => {
    shared_1.eventBus.subscribe('order.created', async (payload) => {
        const { branchId, items, orderId } = payload;
        console.log(`[InventoryService] Processing stock deduction for order ${orderId} in branch ${branchId}`);
        for (const orderItem of items) {
            // Lookup recipe mock ingredients for the menu item name
            const ingredients = RECIPE_MOCK_MAP[orderItem.name];
            if (!ingredients) {
                console.warn(`[InventoryService] No recipe mapped for item "${orderItem.name}". Skipping deduction.`);
                continue;
            }
            for (const ingredient of ingredients) {
                const requiredAmount = ingredient.quantity * orderItem.quantity;
                try {
                    // Attempt to find the inventory item at this specific branch
                    const inventoryItem = await inventory_item_js_1.InventoryItem.findOne({
                        branchId: branchId.toString(),
                        name: { $regex: new RegExp(`^${ingredient.name}$`, 'i') },
                    });
                    if (inventoryItem) {
                        inventoryItem.quantity = Math.max(0, inventoryItem.quantity - requiredAmount);
                        await inventoryItem.save();
                        console.log(`[InventoryService] Deducted ${requiredAmount}${inventoryItem.unit} of ${ingredient.name}. New Stock: ${inventoryItem.quantity}`);
                        // Low stock warning trigger check
                        if (inventoryItem.quantity <= inventoryItem.minThreshold) {
                            console.warn(`[InventoryService] LOW STOCK WARNING: "${ingredient.name}" at branch ${branchId} is below threshold (${inventoryItem.quantity} <= ${inventoryItem.minThreshold})`);
                            await shared_1.eventBus.publish('inventory.low_stock', {
                                branchId,
                                itemId: inventoryItem._id,
                                name: inventoryItem.name,
                                quantity: inventoryItem.quantity,
                                unit: inventoryItem.unit,
                                threshold: inventoryItem.minThreshold,
                            });
                        }
                    }
                    else {
                        console.error(`[InventoryService] Could not find ingredient "${ingredient.name}" in branch ${branchId} inventory to deduct.`);
                    }
                }
                catch (err) {
                    console.error(`[InventoryService] Deduction failed for ${ingredient.name}:`, err.message);
                }
            }
        }
    });
};
exports.registerInventorySubscribers = registerInventorySubscribers;
//# sourceMappingURL=inventory-controller.js.map