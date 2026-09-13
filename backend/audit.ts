import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './src/config/database';
import { City, WaterAsset, ElectricityAsset, TrafficSignal, GarbageVehicle, EvStation, StreetlightController } from './src/models';

async function auditIntegrity() {
    console.log('Starting Phase 16 Data Integrity Audit...');
    await connectDatabase();

    const validCityIds = await City.distinct('_id');
    console.log(`Found ${validCityIds.length} valid cities.`);

    if (validCityIds.length === 0) {
        console.log('No cities found. Integrity sweep passed.');
        await disconnectDatabase();
        return;
    }

    const oWater = await WaterAsset.countDocuments({ cityId: { $nin: validCityIds } });
    const oElec = await ElectricityAsset.countDocuments({ cityId: { $nin: validCityIds } });
    const oTraffic = await TrafficSignal.countDocuments({ cityId: { $nin: validCityIds } });
    const oGarb = await GarbageVehicle.countDocuments({ cityId: { $nin: validCityIds } });
    const oEV = await EvStation.countDocuments({ cityId: { $nin: validCityIds } });
    const oLight = await StreetlightController.countDocuments({ cityId: { $nin: validCityIds } });

    console.log('--- Orphan Records By Domain ---');
    console.log('Water Assets:', oWater);
    console.log('Electricity Assets:', oElec);
    console.log('Traffic Signals:', oTraffic);
    console.log('Garbage Vehicles:', oGarb);
    console.log('EV Stations:', oEV);
    console.log('Streetlight Controllers:', oLight);

    if (oWater + oElec + oTraffic + oGarb + oEV + oLight > 0) {
        console.error('❌ Data integrity failure detected: Orphan records exist.');
        process.exitCode = 1;
    } else {
        console.log('✅ All data perfectly mapped to valid City contexts. No orphan records.');
    }

    await disconnectDatabase();
}

auditIntegrity().catch(console.error);
