import { Schema, model, Document, Types } from 'mongoose';

export interface IResponseMember {
    _id: Types.ObjectId;
    name: string;
    employeeCode: string;
    role: string;
    contact?: string; // Protect contact information
    status: 'ACTIVE' | 'INACTIVE';
}

export interface IResponseTeam extends Document {
    cityId: Types.ObjectId;
    name: string;
    teamCode: string;
    department: Types.ObjectId;
    type: string;
    members: IResponseMember[];
    status: 'AVAILABLE' | 'ASSIGNED' | 'RESPONDING' | 'ON_SCENE' | 'UNAVAILABLE' | 'OFF_DUTY';
    baseLocation?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    currentLocation?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    lastLocationUpdate?: Date;
    availability: boolean;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const responseTeamSchema = new Schema<IResponseTeam>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true, maxlength: 120 },
        teamCode: { type: String, required: true },
        department: { type: Schema.Types.ObjectId, ref: 'CityDepartment', required: true },
        type: { type: String, required: true }, // e.g., MEDICAL, MAINTENANCE, HAZMAT
        members: [
            {
                name: { type: String, required: true },
                employeeCode: { type: String, required: true },
                role: { type: String, required: true },
                contact: { type: String }, // Optional to protect sensitive data
                status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' }
            }
        ],
        status: { type: String, enum: ['AVAILABLE', 'ASSIGNED', 'RESPONDING', 'ON_SCENE', 'UNAVAILABLE', 'OFF_DUTY'], default: 'AVAILABLE' },
        baseLocation: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        currentLocation: {
            type: { type: String, enum: ['Point'] },
            coordinates: { type: [Number] }
        },
        lastLocationUpdate: { type: Date },
        availability: { type: Boolean, default: true },
        active: { type: Boolean, default: true }
    },
    { timestamps: true }
);

responseTeamSchema.index({ cityId: 1, status: 1 });
responseTeamSchema.index({ cityId: 1, department: 1 });
responseTeamSchema.index({ cityId: 1, currentLocation: '2dsphere' });

export const ResponseTeam = model<IResponseTeam>('ResponseTeam', responseTeamSchema);
