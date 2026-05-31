import mongoose from 'mongoose';
export declare const Review: mongoose.Model<{
    comment: string;
    userId: string;
    userName: string;
    menuItemId: string;
    rating: number;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    comment: string;
    userId: string;
    userName: string;
    menuItemId: string;
    rating: number;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    comment: string;
    userId: string;
    userName: string;
    menuItemId: string;
    rating: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    comment: string;
    userId: string;
    userName: string;
    menuItemId: string;
    rating: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    comment: string;
    userId: string;
    userName: string;
    menuItemId: string;
    rating: number;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    comment: string;
    userId: string;
    userName: string;
    menuItemId: string;
    rating: number;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Review;
