import mongoose, { Schema, Document } from 'mongoose';

export interface IOptimizationScenario extends Document {
    cityId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    scenarioType: string;
    inputs: Record<string, any>;
    constraints: Record<string, any>;
    objective: string;
    result?: Record<string, any>;
    status: 'DRAFT' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const optimizationScenarioSchema = new Schema<IOptimizationScenario>(
    {
        cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
        name: { type: String, required: true },
        description: { type: String, default: '' },
        scenarioType: { type: String, required: true },
        inputs: { type: Schema.Types.Mixed, required: true },
        constraints: { type: Schema.Types.Mixed, default: {} },
        objective: { type: String, required: true },
        result: { type: Schema.Types.Mixed },
        status: {
            type: String,
            enum: ['DRAFT', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
            default: 'DRAFT'
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

optimizationScenarioSchema.index({ cityId: 1, createdAt: -1 });

export const OptimizationScenario = mongoose.model<IOptimizationScenario>('OptimizationScenario', optimizationScenarioSchema);
