import mongoose from 'mongoose';
export declare const Branch: mongoose.Model<{
    name: string;
    address: string;
    city: string;
    phone: string;
    isActive: boolean;
    coords?: {
        lat: number;
        lng: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    address: string;
    city: string;
    phone: string;
    isActive: boolean;
    coords?: {
        lat: number;
        lng: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    name: string;
    address: string;
    city: string;
    phone: string;
    isActive: boolean;
    coords?: {
        lat: number;
        lng: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    address: string;
    city: string;
    phone: string;
    isActive: boolean;
    coords?: {
        lat: number;
        lng: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    address: string;
    city: string;
    phone: string;
    isActive: boolean;
    coords?: {
        lat: number;
        lng: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    name: string;
    address: string;
    city: string;
    phone: string;
    isActive: boolean;
    coords?: {
        lat: number;
        lng: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default Branch;
