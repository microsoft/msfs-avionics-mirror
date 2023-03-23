import { AdsbOperatingMode, NumberUnitSubject, Subject, Subscribable, TcasOperatingMode, UnitType } from '@microsoft/msfs-sdk';

import { TrafficSystem } from '../../../traffic';

/**
 * Traffic alert level modes.
 */
export enum MapTrafficAlertLevelMode {
  All,
  Advisories,
  TA_RA,
  RA
}

/**
 * Traffic motion vector modes.
 */
export enum MapTrafficMotionVectorMode {
  Off,
  Absolute,
  Relative
}

/**
 * Traffic display altitude restriction modes.
 */
export enum MapTrafficAltitudeRestrictionMode {
  Unrestricted,
  Above,
  Normal,
  Below
}

/**
 * A module describing the display of traffic.
 */
export class MapGarminTrafficModule {
  /** Whether to show traffic information. */
  public readonly show = Subject.create(true);

  /** The TCAS operating mode. */
  public readonly operatingMode: Subscribable<TcasOperatingMode> = Subject.create(TcasOperatingMode.Standby);

  /** The ADS-B operating mode. */
  public readonly adsbOperatingMode: Subscribable<AdsbOperatingMode> = Subject.create(AdsbOperatingMode.Standby);

  /** Whether to show intruder labels. */
  public readonly showIntruderLabel = Subject.create(true);

  /** The index of the outer ring range. */
  public readonly outerRangeIndex = Subject.create(0);

  /** The index of the inner ring range. */
  public readonly innerRangeIndex = Subject.create(0);

  /** The alert level mode. */
  public readonly alertLevelMode = Subject.create(MapTrafficAlertLevelMode.All);

  /** The altitude restriction mode. */
  public readonly altitudeRestrictionMode = Subject.create(MapTrafficAltitudeRestrictionMode.Normal);

  /** Whether displayed intruder altitude is relative. */
  public readonly isAltitudeRelative = Subject.create(true);

  /** The motion vector mode. */
  public readonly motionVectorMode = Subject.create(MapTrafficMotionVectorMode.Off);

  /** The motion vector mode. */
  public readonly motionVectorLookahead = NumberUnitSubject.createFromNumberUnit(UnitType.SECOND.createNumber(60));

  /**
   * Constructor.
   * @param trafficSystem This module's associated traffic system.
   */
  constructor(public readonly trafficSystem: TrafficSystem) {
    trafficSystem.getEventSubscriber().on('tcas_operating_mode').whenChanged().handle(mode => {
      (this.operatingMode as Subject<TcasOperatingMode>).set(mode);
    });

    trafficSystem.adsb?.getEventSubscriber().on('adsb_operating_mode').whenChanged().handle(mode => {
      (this.adsbOperatingMode as Subject<AdsbOperatingMode>).set(mode);
    });
  }
}