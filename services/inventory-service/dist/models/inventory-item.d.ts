import mongoose from 'mongoose';
export declare const InventoryItem: mongoose.Model<{
    branchId: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    supplier: string;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    branchId: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    supplier: string;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    branchId: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    supplier: string;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    branchId: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    supplier: string;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    branchId: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    supplier: string;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    branchId: string;
    name: string;
    quantity: number;
    unit: string;
    minThreshold: number;
    supplier: string;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default InventoryItem;
