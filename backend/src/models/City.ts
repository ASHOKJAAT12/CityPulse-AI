import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
    name: string;
    state: string;
    country: string;
    location: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    timezone: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    description?: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const citySchema = new Schema<ICity>(
    {
        name: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: 'India' },
        location: {
            type: { type: String, enum: ['Point'], required: true },
            coordinates: { type: [Number], required: true }, // [longitude, latitude]
        },
        timezone: { type: String, default: 'Asia/Kolkata' },
        status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'], default: 'ACTIVE' },
        description: { type: String },
        logoUrl: { type: String },
    },
    { timestamps: true }
);

// Indexes
citySchema.index({ status: 1 });
citySchema.index({ country: 1, state: 1 });
citySchema.index({ location: '2dsphere' });

export const City = mongoose.model<ICity>('City', citySchema);
