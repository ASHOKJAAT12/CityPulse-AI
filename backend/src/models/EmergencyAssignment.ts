import { Schema, model, Document, Types } from 'mongoose';

export interface IEmergencyAssignment extends Document {
    emergencyId: Types.ObjectId;
    cityId: Types.ObjectId;
    department: Types.ObjectId;
    teamId: Types.ObjectId;
    resourceIds: Types.ObjectId[];
    assignedBy: Types.ObjectId;
    assignedAt: Date;
    acceptedAt?: Date;
    startedAt?: Date;
    arrivedAt?: Date;
    completedAt?: Date;
    status: 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'ON_SCENE' | 'COMPLETED' | 'CANCELLED';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const emergencyAssignmentSchema = new Schema<IEmergencyAssignment>(
    {
        emergencyId: { type: Schema.Types.ObjectId, ref: 'EmergencyIncident', required: true },
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        department: { type: Schema.Types.ObjectId, ref: 'CityDepartment', required: true },
        teamId: { type: Schema.Types.ObjectId, ref: 'ResponseTeam', required: true },
        resourceIds: [{ type: Schema.Types.ObjectId, ref: 'EmergencyResource' }],
        assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        assignedAt: { type: Date, default: Date.now },
        acceptedAt: { type: Date },
        startedAt: { type: Date },
        arrivedAt: { type: Date },
        completedAt: { type: Date },
        status: { type: String, enum: ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED', 'CANCELLED'], default: 'ASSIGNED' },
        notes: { type: String, maxlength: 2000 }
    },
    { timestamps: true }
);

emergencyAssignmentSchema.index({ cityId: 1, teamId: 1, status: 1 });
emergencyAssignmentSchema.index({ emergencyId: 1 });

export const EmergencyAssignment = model<IEmergencyAssignment>('EmergencyAssignment', emergencyAssignmentSchema);
