export { City } from './City';
export { User } from './User';
export { RefreshToken } from './RefreshToken';
export { AuditLog } from './AuditLog';
export { Driver } from './Driver';
export { GarbageVehicle } from './GarbageVehicle';
export { GarbageRoute } from './GarbageRoute';
export { GarbageRouteStop } from './GarbageRouteStop';
// Phase 5 — Live Tracking
export { TrackingSession } from './TrackingSession';
export { VehicleLocation } from './VehicleLocation';

// Phase 6 - Water Management
export { WaterAsset, IWaterAsset } from './WaterAsset';
export { WaterSensor, IWaterSensor } from './WaterSensor';
export { WaterSensorReading, IWaterSensorReading } from './WaterSensorReading';
export { WaterIncident, IWaterIncident } from './WaterIncident';
export { WaterSupplySchedule, IWaterSupplySchedule } from './WaterSupplySchedule';

// Phase 7 - Electricity Management
export { ElectricityAsset, IElectricityAsset } from './ElectricityAsset';
export { ElectricitySensor, IElectricitySensor } from './ElectricitySensor';
export { ElectricitySensorReading, IElectricitySensorReading } from './ElectricitySensorReading';
export { PowerOutage, IPowerOutage } from './PowerOutage';
export { ElectricityIncident, IElectricityIncident } from './ElectricityIncident';
export { ElectricityMaintenance, IElectricityMaintenance } from './ElectricityMaintenance';

// Phase 8 - Traffic Management
export { TrafficRoad, ITrafficRoad } from './TrafficRoad';
export { TrafficIntersection, ITrafficIntersection } from './TrafficIntersection';
export { TrafficSignal, ITrafficSignal } from './TrafficSignal';
export { TrafficSensor, ITrafficSensor } from './TrafficSensor';
export { TrafficSensorReading, ITrafficSensorReading } from './TrafficSensorReading';
export { TrafficCongestionEvent, ITrafficCongestionEvent } from './TrafficCongestionEvent';
export { TrafficIncident, ITrafficIncident } from './TrafficIncident';
export { TrafficRoadClosure, ITrafficRoadClosure } from './TrafficRoadClosure';
export { TrafficRoadwork, ITrafficRoadwork } from './TrafficRoadwork';

// Phase 9 - EV Infrastructure
export { EVChargingStation, IEVChargingStation } from './EVChargingStation';
export { EVConnector, IEVConnector } from './EVConnector';
export { EVChargingSession, IEVChargingSession } from './EVChargingSession';
export { EVStationReading, IEVStationReading } from './EVStationReading';
export { EVIncident, IEVIncident } from './EVIncident';
export { EVMaintenance, IEVMaintenance } from './EVMaintenance';
export { EVReservation, IEVReservation } from './EVReservation';

// Phase 10 - Streetlight Management
export { StreetlightAsset, IStreetlightAsset } from './StreetlightAsset';
export { StreetlightZone, IStreetlightZone } from './StreetlightZone';
export { StreetlightController, IStreetlightController } from './StreetlightController';
export { StreetlightSensor, IStreetlightSensor } from './StreetlightSensor';
export { StreetlightSensorReading, IStreetlightSensorReading } from './StreetlightSensorReading';
export { StreetlightSchedule, IStreetlightSchedule } from './StreetlightSchedule';
export { StreetlightIncident, IStreetlightIncident } from './StreetlightIncident';
export { StreetlightMaintenance, IStreetlightMaintenance } from './StreetlightMaintenance';

// Phase 11 - Citizen Reporting
export { CityDepartment, ICityDepartment } from './CityDepartment';
export { CitizenReport, ICitizenReport, IAttachment } from './CitizenReport';
export { CitizenReportTimeline, ICitizenReportTimeline } from './CitizenReportTimeline';
export { CitizenReportComment, ICitizenReportComment } from './CitizenReportComment';

// Phase 12 - Notifications
export { Notification, INotification } from './Notification';
export { NotificationPreference, INotificationPreference } from './NotificationPreference';

// Phase 13 AI Models
export * from './IntelligenceEvent';
export * from './AnomalyDetection';
export * from './RiskAssessment';
export * from './Prediction';
export * from './Recommendation';
export * from './IntelligenceFeedback';
export * from './IntelligenceModelConfig';
