import { NumberUnitSubject, Subject, UnitType } from '@microsoft/msfs-sdk';

/**
 * G3X map track vector display modes.
 */
export enum G3XMapTrackVectorMode {
  Off = 'Off',
  Distance = 'Distance',
  Time = 'Time'
}

/**
 * A module describing the display of the track vector.
 */
export class G3XMapTrackVectorModule {
  /** The track vector's display mode. */
  public readonly mode = Subject.create(G3XMapTrackVectorMode.Off);

  /** The track vector's lookahead distance. */
  public readonly lookaheadDistance = NumberUnitSubject.create(UnitType.NMILE.createNumber(10));

  /** The track vector's lookahead time. */
  public readonly lookaheadTime = NumberUnitSubject.create(UnitType.SECOND.createNumber(60));
}