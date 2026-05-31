"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loyalty = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LoyaltySchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    userName: { type: String, required: true },
    points: { type: Number, default: 0 },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
        default: 'Bronze',
    },
    totalSpent: { type: Number, default: 0 },
}, { timestamps: true });
// Trigger helper to compute dynamic customer membership tiers
LoyaltySchema.methods.recalculateTier = function () {
    const spent = this.totalSpent;
    if (spent >= 1000) {
        this.tier = 'Platinum';
    }
    else if (spent >= 500) {
        this.tier = 'Gold';
    }
    else if (spent >= 200) {
        this.tier = 'Silver';
    }
    else {
        this.tier = 'Bronze';
    }
};
exports.Loyalty = mongoose_1.default.model('Loyalty', LoyaltySchema);
exports.default = exports.Loyalty;
//# sourceMappingURL=loyalty.js.map