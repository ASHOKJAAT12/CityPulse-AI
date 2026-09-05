import mongoose, { Schema, Document } from 'mongoose';
import { Role, UserStatus } from '../constants/roles';

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
    role: Role;
    status: UserStatus;
    cityId?: mongoose.Types.ObjectId;
    adminCityId?: mongoose.Types.ObjectId;
    deletedAt?: Date;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        phone: { type: String },
        avatarUrl: { type: String },
        role: { type: String, enum: Object.values(Role), default: Role.CITIZEN, index: true },
        status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING_VERIFICATION, index: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', index: true },
        adminCityId: { type: Schema.Types.ObjectId, ref: 'City' },
        deletedAt: { type: Date, index: true },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
