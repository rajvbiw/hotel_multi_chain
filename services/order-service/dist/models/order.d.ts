import mongoose from 'mongoose';
export declare const Order: mongoose.Model<{
    userId: string;
    userName: string;
    branchId: string;
    branchName: string;
    items: mongoose.Types.DocumentArray<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }> & {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderType: "dine-in" | "takeaway" | "delivery";
    status: "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod: "CARD" | "CASH" | "UPI";
    tableNumber?: string | null | undefined;
    deliveryAddress?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: string;
    userName: string;
    branchId: string;
    branchName: string;
    items: mongoose.Types.DocumentArray<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }> & {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderType: "dine-in" | "takeaway" | "delivery";
    status: "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod: "CARD" | "CASH" | "UPI";
    tableNumber?: string | null | undefined;
    deliveryAddress?: string | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    userId: string;
    userName: string;
    branchId: string;
    branchName: string;
    items: mongoose.Types.DocumentArray<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }> & {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderType: "dine-in" | "takeaway" | "delivery";
    status: "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod: "CARD" | "CASH" | "UPI";
    tableNumber?: string | null | undefined;
    deliveryAddress?: string | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: string;
    userName: string;
    branchId: string;
    branchName: string;
    items: mongoose.Types.DocumentArray<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }> & {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderType: "dine-in" | "takeaway" | "delivery";
    status: "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod: "CARD" | "CASH" | "UPI";
    tableNumber?: string | null | undefined;
    deliveryAddress?: string | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: string;
    userName: string;
    branchId: string;
    branchName: string;
    items: mongoose.Types.DocumentArray<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }> & {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderType: "dine-in" | "takeaway" | "delivery";
    status: "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod: "CARD" | "CASH" | "UPI";
    tableNumber?: string | null | undefined;
    deliveryAddress?: string | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    userId: string;
    userName: string;
    branchId: string;
    branchName: string;
    items: mongoose.Types.DocumentArray<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }> & {
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    orderType: "dine-in" | "takeaway" | "delivery";
    status: "PLACED" | "CONFIRMED" | "PREPARING" | "READY" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    paymentMethod: "CARD" | "CASH" | "UPI";
    tableNumber?: string | null | undefined;
    deliveryAddress?: string | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Order;
