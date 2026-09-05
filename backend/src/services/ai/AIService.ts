/* eslint-disable @typescript-eslint/require-await */
/**
 * AIService — Isolated AI processing architecture.
 *
 * Critical rule: AI logic must NEVER be embedded in normal CRUD controllers.
 * AI runs as a separate service layer that controllers and WebSocket handlers
 * can call — but AI failures must not disrupt core functionality.
 *
 * Architecture:
 *   AIService
 *     ├── classifyReport()      — Phase 14, 17
 *     ├── analyzeImage()        — Phase 14
 *     ├── detectAnomalies()     — Phase 17
 *     ├── predictDemand()       — Phase 17
 *     ├── prioritizeReports()   — Phase 17
 *     └── getRecommendations()  — Phase 18
 */

export enum AIServiceType {
    REPORT_CLASSIFICATION = 'REPORT_CLASSIFICATION',
    IMAGE_ANALYSIS = 'IMAGE_ANALYSIS',
    ANOMALY_DETECTION = 'ANOMALY_DETECTION',
    PREDICTION = 'PREDICTION',
    PRIORITIZATION = 'PRIORITIZATION',
    RECOMMENDATION = 'RECOMMENDATION',
}

export interface ReportClassificationInput {
    title: string;
    description: string;
    imageUrls?: string[];
    cityId: string;
}

export interface ReportClassificationResult {
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    suggestedDepartment?: string;
    tags: string[];
}

export interface AnomalyDetectionInput {
    service: 'WATER' | 'ELECTRICITY' | 'TRAFFIC' | 'GARBAGE';
    cityId: string;
    data: Record<string, unknown>;
}

export interface AnomalyDetectionResult {
    isAnomaly: boolean;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description?: string;
    confidence?: number;
}

export interface PredictionInput {
    service: string;
    cityId: string;
    historicalData: Record<string, unknown>[];
    horizonHours?: number;
}

export interface PredictionResult {
    predictions: Array<{ timestamp: Date; value: number; confidence: number }>;
    model: string;
    generatedAt: Date;
}

// ── AIService ─────────────────────────────────────────────────

export class AIService {
    /**
     * Classify a citizen report — determine category, priority, department.
     * Phase 14+: Uses LLM / fine-tuned classifier.
     */
    async classifyReport(
        _input: ReportClassificationInput
    ): Promise<ReportClassificationResult> {
        throw new Error('AIService.classifyReport: Not implemented — Phase 14');
    }

    /**
     * Analyze an image for damage/issue detection.
     * Phase 14+: Uses vision model.
     */
    async analyzeImage(_imageUrl: string): Promise<Record<string, unknown>> {
        throw new Error('AIService.analyzeImage: Not implemented — Phase 14');
    }

    /**
     * Detect anomalies in service data (water pressure, electricity load, etc.)
     * Phase 17+: Uses statistical model / ML model.
     */
    async detectAnomalies(_input: AnomalyDetectionInput): Promise<AnomalyDetectionResult> {
        throw new Error('AIService.detectAnomalies: Not implemented — Phase 17');
    }

    /**
     * Predict future demand/load for a city service.
     * Phase 17+: Uses time-series model.
     */
    async predictDemand(_input: PredictionInput): Promise<PredictionResult> {
        throw new Error('AIService.predictDemand: Not implemented — Phase 17');
    }

    /**
     * Re-prioritize a batch of citizen reports.
     * Phase 17+: Considers recency, severity, duplicates, sentiment.
     */
    async prioritizeReports(
        _reportIds: string[]
    ): Promise<Array<{ id: string; priority: string; score: number }>> {
        throw new Error('AIService.prioritizeReports: Not implemented — Phase 17');
    }

    /**
     * Generate cross-service recommendations for city operations.
     * Phase 18+: Cross-service intelligence.
     */
    async getRecommendations(_cityId: string): Promise<string[]> {
        throw new Error('AIService.getRecommendations: Not implemented — Phase 18');
    }
}

export const aiService = new AIService();
