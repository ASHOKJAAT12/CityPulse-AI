import { Schema, model, Document, Types } from 'mongoose';

export interface ICityDepartment extends Document {
    cityId: Types.ObjectId;
    name: string;
    code: string;
    description?: string;
    categories: string[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const cityDepartmentSchema = new Schema<ICityDepartment>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true, index: true },
        name: { type: String, required: true },
        code: { type: String, required: true },
        description: { type: String },
        categories: [{ type: String }],
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Ensure unique department codes per city
cityDepartmentSchema.index({ cityId: 1, code: 1 }, { unique: true });

export const CityDepartment = model<ICityDepartment>('CityDepartment', cityDepartmentSchema);
