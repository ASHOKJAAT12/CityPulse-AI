import mongoose, { Schema, Document } from 'mongoose';

export interface IEVMaintenance extends Document {
    cityId: mongoose.Types.ObjectId;
    stationId: mongoose.Types.ObjectId;
    connectorId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    scheduledStart: Date;
    scheduledEnd: Date;
    completedAt?: Date;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const EVMaintenanceSchema = new Schema(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        stationId: { type: Schema.Types.ObjectId, ref: 'EVChargingStation', required: true },
        connectorId: { type: Schema.Types.ObjectId, ref: 'EVConnector' },
        title: { type: String, required: true },
        description: { type: String, required: true },
        type: {
            type: String,
            enum: ['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY'],
            required: true
        },
        status: {
            type: String,
            enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: 'SCHEDULED'
        },
        scheduledStart: { type: Date, required: true },
        scheduledEnd: { type: Date, required: true },
        completedAt: { type: Date },
        notes: { type: String },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

EVMaintenanceSchema.index({ cityId: 1, stationId: 1 });
EVMaintenanceSchema.index({ stationId: 1, status: 1 });
EVMaintenanceSchema.index({ cityId: 1, scheduledStart: 1 });

export const EVMaintenance = mongoose.model<IEVMaintenance>('EVMaintenance', EVMaintenanceSchema);
