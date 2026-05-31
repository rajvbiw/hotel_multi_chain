import mongoose from 'mongoose';
export declare const Coupon: mongoose.Model<{
    code: string;
    discountType: "fixed" | "percentage";
    value: number;
    minOrderValue: number;
    isActive: boolean;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    code: string;
    discountType: "fixed" | "percentage";
    value: number;
    minOrderValue: number;
    isActive: boolean;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    code: string;
    discountType: "fixed" | "percentage";
    value: number;
    minOrderValue: number;
    isActive: boolean;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    code: string;
    discountType: "fixed" | "percentage";
    value: number;
    minOrderValue: number;
    isActive: boolean;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    code: string;
    discountType: "fixed" | "percentage";
    value: number;
    minOrderValue: number;
    isActive: boolean;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    code: string;
    discountType: "fixed" | "percentage";
    value: number;
    minOrderValue: number;
    isActive: boolean;
    expiresAt: NativeDate;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Coupon;
