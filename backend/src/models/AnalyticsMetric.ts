import { Schema, model, Document, Types } from 'mongoose';

export interface IAnalyticsMetric extends Document {
    cityId: Types.ObjectId;
    metricType: 'GENERAL' | 'SERVICE_HEALTH' | 'TREND' | 'COMPARISON' | 'OPERATIONAL' | 'DEPARTMENT';
    service?: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'EV' | 'STREETLIGHT' | 'GARBAGE' | 'CITIZEN_SERVICES' | 'SYSTEM';
    name: string;
    value: number;
    unit?: string;
    period: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';
    periodStart?: Date;
    periodEnd?: Date;
    generatedAt: Date;
}

const analyticsMetricSchema = new Schema<IAnalyticsMetric>({
    cityId: { type: Schema.Types.ObjectId, ref: 'City', required: true },
    metricType: { type: String, required: true },
    service: { type: String },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
    period: { type: String, required: true },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    generatedAt: { type: Date, default: Date.now }
});

// Used heavily for filtering metrics by city/service/date ranges
analyticsMetricSchema.index({ cityId: 1, metricType: 1, service: 1, name: 1, period: 1 });
analyticsMetricSchema.index({ cityId: 1, generatedAt: -1 });

export const AnalyticsMetric = model<IAnalyticsMetric>('AnalyticsMetric', analyticsMetricSchema);
