export class DataNormalizationEngine {
    /**
     * Normalizes a metric value based on its unit.
     */
    static normalize(service: string, metric: string, value: number, unit?: string): number {
        switch (service) {
            case 'WATER':
                return this.normalizeWater(metric, value, unit);
            case 'ELECTRICITY':
                return this.normalizeElectricity(metric, value, unit);
            case 'TRAFFIC':
                return this.normalizeTraffic(metric, value, unit);
            case 'EV':
                return this.normalizeEV(metric, value, unit);
            case 'STREETLIGHT':
                return this.normalizeStreetlight(metric, value, unit);
            case 'GARBAGE':
                return value; // E.g., ETA or speed are usually standardized internally
            default:
                return value;
        }
    }

    private static normalizeWater(metric: string, value: number, unit?: string): number {
        if (metric === 'PRESSURE') {
            if (unit === 'Pa') return value / 100000; // Convert to Bar
            if (unit === 'PSI') return value * 0.0689476; // Convert to Bar
        }
        if (metric === 'FLOW') {
            if (unit === 'L/s') return value * 3.6; // Convert to m3/h
        }
        return value;
    }

    private static normalizeElectricity(metric: string, value: number, unit?: string): number {
        if (metric === 'POWER' || metric === 'LOAD') {
            if (unit === 'W') return value / 1000; // Convert to kW
            if (unit === 'MW') return value * 1000; // Convert to kW
        }
        return value;
    }

    private static normalizeTraffic(metric: string, value: number, unit?: string): number {
        if (metric === 'SPEED') {
            if (unit === 'mph') return value * 1.60934; // Convert to km/h
            if (unit === 'm/s') return value * 3.6; // Convert to km/h
        }
        return value;
    }

    private static normalizeEV(metric: string, value: number, unit?: string): number {
        if (metric === 'POWER') {
            if (unit === 'W') return value / 1000; // Convert to kW
        }
        if (metric === 'TEMPERATURE') {
            if (unit === 'F') return (value - 32) * (5 / 9); // Convert to Celsius
        }
        return value;
    }

    private static normalizeStreetlight(metric: string, value: number, unit?: string): number {
        if (metric === 'POWER') {
            if (unit === 'W') return value / 1000; // Convert to kW
        }
        return value;
    }
}
