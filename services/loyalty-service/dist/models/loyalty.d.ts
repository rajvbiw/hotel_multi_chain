import mongoose from 'mongoose';
export declare const Loyalty: mongoose.Model<{
    userId: string;
    userName: string;
    points: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    totalSpent: number;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: string;
    userName: string;
    points: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    totalSpent: number;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    userId: string;
    userName: string;
    points: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    totalSpent: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: string;
    userName: string;
    points: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    totalSpent: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: string;
    userName: string;
    points: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    totalSpent: number;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    userId: string;
    userName: string;
    points: number;
    tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    totalSpent: number;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Loyalty;
