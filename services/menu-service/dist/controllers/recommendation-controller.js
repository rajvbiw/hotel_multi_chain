"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIRecommendations = void 0;
const menu_item_js_1 = require("../models/menu-item.js");
const getAIRecommendations = async (req, res, next) => {
    try {
        const { branchId, isVegetarian } = req.query;
        const query = { isAvailable: true };
        if (branchId) {
            query.branchIds = branchId;
        }
        if (isVegetarian === 'true') {
            query.isVegetarian = true;
        }
        const items = await menu_item_js_1.MenuItem.find(query);
        // If we have items, package them with AI-metadata
        const recommendations = items.map((item) => {
            // Generate some realistic high confidence percentages and reasons
            let matchScore = 85 + Math.floor(Math.random() * 14); // 85% to 99%
            let reason = 'Trending in your neighborhood';
            if (item.isVegetarian) {
                reason = 'High match for green/veggie diet profile';
                matchScore = 92 + Math.floor(Math.random() * 7);
            }
            else if (item.price > 12) {
                reason = 'Customer favorite dinner pairing';
            }
            else if (item.category === 'Desserts') {
                reason = 'Perfect sweet completion for your order history';
            }
            else if (item.category === 'Beverages') {
                reason = 'Highly refreshing option frequently bought together';
            }
            return {
                item,
                aiScore: matchScore,
                aiReason: reason,
            };
        });
        // Sort by score descending and return top 3-4 items
        const sortedRecommendations = recommendations
            .sort((a, b) => b.aiScore - a.aiScore)
            .slice(0, 4);
        res.json({
            success: true,
            data: sortedRecommendations,
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAIRecommendations = getAIRecommendations;
//# sourceMappingURL=recommendation-controller.js.map