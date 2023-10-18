import { UnitType } from '@microsoft/msfs-sdk';
import { WT21FixInfoOptions } from './WT21FixInfoManager';

export const WT21FixInfoConfig: WT21FixInfoOptions = {
  numberOfFixes: 5,
  numberOfBearingDistances: 1,
  numberOfLatLonCrossings: 1,
  maxDistance: UnitType.METER.convertFrom(500, UnitType.NMILE),
};
