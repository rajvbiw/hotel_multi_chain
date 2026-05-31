import mongoose from 'mongoose';
export declare const MenuItem: mongoose.Model<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    branchIds: string[];
    ingredients: mongoose.Types.DocumentArray<{
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }> & {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }>;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    branchIds: string[];
    ingredients: mongoose.Types.DocumentArray<{
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }> & {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }>;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, {}, {
    timestamps: true;
}> & {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    branchIds: string[];
    ingredients: mongoose.Types.DocumentArray<{
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }> & {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }>;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    branchIds: string[];
    ingredients: mongoose.Types.DocumentArray<{
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }> & {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }>;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    branchIds: string[];
    ingredients: mongoose.Types.DocumentArray<{
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }> & {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }>;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps>, {}, mongoose.MergeType<mongoose.DefaultSchemaOptions, {
    timestamps: true;
}>> & mongoose.FlatRecord<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    isVegetarian: boolean;
    isAvailable: boolean;
    branchIds: string[];
    ingredients: mongoose.Types.DocumentArray<{
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }> & {
        name: string;
        itemId: string;
        quantity: number;
        unit: string;
    }>;
    nutritionalInfo?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    } | null | undefined;
} & mongoose.DefaultTimestampProps> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default MenuItem;
