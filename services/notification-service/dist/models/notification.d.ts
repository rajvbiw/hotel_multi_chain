import mongoose from 'mongoose';
export declare const Notification: mongoose.Model<{
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Notification;
