import {
  BasicNavAngleSubject, BasicNavAngleUnit, DmsFormatter2, Facility, FacilityLoader, FacilityRepository, FacilityType, FacilityUtils,
  GeoPoint, GeoPointSubject, ICAO, IcaoType, LatLonInterface, MagVar, NumberUnitSubject, Subject, Subscribable, Subscription,
  Unit, UnitFamily, UnitType, UserFacility, UserFacilityType
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { G3000FacilityUtils } from '@microsoft/msfs-wtg3000-common';

/**
 * Types of user waypoint.
 */
export enum GtcUserWaypointType {
  RadialDistance = 'RAD / DIS',
  RadialRadial = 'RAD / RAD',
  LatLon = 'LAT / LON',
  PPos = 'P.POS'
}

/**
 * A store which holds data used to create and edit user waypoints (facilities) from the GTC.
 */
export class GtcUserWaypointDialogStore {
  private static readonly REFERENCE_FORMATTER = (reference: Facility | null): string => reference === null ? '______' : ICAO.getIdent(reference.icao);
  private static readonly RADIAL_FORMATTER = (radial: number): string => {
    const rounded = Math.round(radial) % 360;
    return rounded === 0 ? '360' : rounded.toString().padStart(3, '0');
  };
  private static readonly DISTANCE_FORMATTER = (distance: number): string => distance.toFixed(0);
  private static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}{dd} {mm.m}', UnitType.ARC_MIN, 0.1, 'N__ __._');
  private static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]}{dd} {mm.m}', UnitType.ARC_MIN, 0.1, 'E___ __._');

  private static readonly geoPointCache = [new GeoPoint(0, 0)];

  /** The selected ident. */
  public readonly ident = Subject.create('');
  /** The selected waypoint temporary flag. */
  public readonly isTemporary = Subject.create(true);
  /** The selected waypoint type. */
  public readonly type = Subject.create(GtcUserWaypointType.RadialDistance);
  /** The selected waypoint comment. */
  public readonly comment = Subject.create('');

  /** The first reference. */
  public readonly ref1 = Subject.create<Facility | null>(null);
  /** The radial from the first reference. */
  public readonly rad1 = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));
  /** The distance from the first reference. */
  public readonly dis1 = NumberUnitSubject.create<UnitFamily.Distance, Unit<UnitFamily.Distance>>(UnitType.NMILE.createNumber(0));

  /** The second reference. */
  public readonly ref2 = Subject.create<Facility | null>(null);
  /** The radial from the second reference. */
  public readonly rad2 = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  /** The most recent valid latitude/longitude coordinates entered into the store or computed from references. */
  public readonly latLon = GeoPointSubject.create(new GeoPoint(0, 0));

  private autoComment = true;
  private readonly commentSub: Subscription;

  private syncOpId = 0;

  private readonly internalSyncSubs: Subscription[];
  private readonly autoCommentSubs: Subscription[];

  /**
   * Constructor.
   * @param facRepo The facility repository.
   * @param facLoader The facility loader.
   * @param ppos The airplane's present position.
   * @param unitsSettingManager A manager for display unit user settings.
   */
  public constructor(
    private readonly facRepo: FacilityRepository,
    private readonly facLoader: FacilityLoader,
    private readonly ppos: Subscribable<LatLonInterface>,
    private readonly unitsSettingManager: UnitsUserSettingManager
  ) {
    this.internalSyncSubs = [
      this.type.sub(this.onTypeChanged.bind(this)),

      this.ref1.sub(this.onReference1Changed.bind(this)),
      this.ref2.sub(this.onReference2Changed.bind(this)),

      this.rad1.sub(this.onRadial1Changed.bind(this)),
      this.rad2.sub(this.onRadial2Changed.bind(this)),

      this.dis1.sub(this.onDistance1Changed.bind(this))
    ];

    const updateAutoComment = this.updateAutoComment.bind(this);

    this.autoCommentSubs = [
      this.ref1.sub(updateAutoComment),
      this.ref2.sub(updateAutoComment),
      this.rad1.sub(updateAutoComment),
      this.rad2.sub(updateAutoComment),
      this.dis1.sub(updateAutoComment),
      this.latLon.sub(updateAutoComment)
    ];

    this.commentSub = this.comment.sub(() => {
      this.autoComment = false;
      this.pauseAutoComment();
    });

    this.updateAutoComment();
  }

  /**
   * Responds to when this store's selected user waypoint type changes.
   * @param type The selected user waypoint type.
   */
  private onTypeChanged(type: GtcUserWaypointType): void {
    this.pauseInternalSync();

    switch (type) {
      case GtcUserWaypointType.RadialDistance:
        this.updateMagVarFromReference(this.ref1.get(), this.rad1);
        this.updateRadialFromReference(this.ref1.get(), this.rad1);
        this.updateDistanceFromReference(this.ref1.get(), this.dis1);
        this.recomputeRadialDistanceLatLon();
        break;
      case GtcUserWaypointType.RadialRadial:
        this.updateMagVarFromReference(this.ref1.get(), this.rad1);
        this.updateRadialFromReference(this.ref1.get(), this.rad1);
        this.updateRadialFromReference(this.ref2.get(), this.rad2);
        this.recomputeRadialRadialLatLon();
        break;
      case GtcUserWaypointType.PPos:
        // TODO: Handle GPS failure state
        this.latLon.set(this.ppos.get());
        break;
    }

    this.resumeInternalSync();

    if (this.autoComment) {
      this.updateAutoComment();
    }
  }

  /**
   * Responds to when this store's first reference facility changes.
   * @param reference The first reference facility.
   */
  private onReference1Changed(reference: Facility | null): void {
    const type = this.type.get();

    if (type === GtcUserWaypointType.RadialDistance || type === GtcUserWaypointType.RadialRadial) {
      this.pauseInternalSync();

      this.updateMagVarFromReference(reference, this.rad1);
      this.updateRadialFromReference(reference, this.rad1);

      if (type === GtcUserWaypointType.RadialDistance) {
        this.updateDistanceFromReference(reference, this.dis1);

        this.recomputeRadialDistanceLatLon();
      } else {
        this.recomputeRadialRadialLatLon();
      }

      this.resumeInternalSync();
    }
  }

  /**
   * Responds to when this store's second reference facility changes.
   * @param reference The second reference facility.
   */
  private onReference2Changed(reference: Facility | null): void {
    if (this.type.get() === GtcUserWaypointType.RadialRadial) {
      this.pauseInternalSync();

      this.updateMagVarFromReference(reference, this.rad2);
      this.updateRadialFromReference(reference, this.rad2);

      this.recomputeRadialRadialLatLon();

      this.resumeInternalSync();
    }
  }

  /**
   * Responds to when this store's first radial changes.
   */
  private onRadial1Changed(): void {
    const type = this.type.get();

    if (type === GtcUserWaypointType.RadialDistance) {
      this.recomputeRadialDistanceLatLon();
    } else if (type === GtcUserWaypointType.RadialRadial) {
      this.recomputeRadialRadialLatLon();
    }
  }

  /**
   * Responds to when this store's second radial changes.
   */
  private onRadial2Changed(): void {
    if (this.type.get() === GtcUserWaypointType.RadialRadial) {
      this.recomputeRadialRadialLatLon();
    }
  }

  /**
   * Responds to when this store's first distance changes.
   */
  private onDistance1Changed(): void {
    if (this.type.get() === GtcUserWaypointType.RadialDistance) {
      this.recomputeRadialDistanceLatLon();
    }
  }

  /**
   * Updates a radial for a reference facility such that it intersects this store's latitude/longitude coordinates. If
   * the reference facility is `null`, then the radial will be set to zero degrees magnetic. If the reference facility
   * is not `null` but a unique radial which intersects the coordinates cannot be found, then the radial will be left
   * unchanged.
   * @param reference The reference facility.
   * @param subject The subject holding the radial to update.
   */
  private updateRadialFromReference(reference: Facility | null, subject: BasicNavAngleSubject): void {
    if (reference === null) {
      subject.set(0);
      return;
    }

    const radial = GtcUserWaypointDialogStore.getRadialFromReference(this.latLon.get(), reference);

    if (radial !== undefined) {
      subject.set(radial);
    }
  }

  /**
   * Updates a distance from a reference facility such that it equals the great-circle distance from the reference
   * facility to this store's latitude/longitude coordinates. If the reference facility is `null`, then the distance
   * will be set to zero.
   * @param reference The reference facility.
   * @param subject The subject holding the distance to update.
   */
  private updateDistanceFromReference(reference: Facility | null, subject: NumberUnitSubject<UnitFamily.Distance>): void {
    if (reference === null) {
      subject.set(0);
      return;
    }

    const distance = GtcUserWaypointDialogStore.getDistanceFromReference(this.latLon.get(), reference);

    if (distance !== undefined) {
      subject.set(distance);
    }
  }

  /**
   * Updates the magnetic variation of a radial according to a reference facility.
   * @param reference A reference facility. If `null`, the magnetic variation of the radial will remain unchanged.
   * @param subject The subject containing the radial to update.
   */
  private updateMagVarFromReference(reference: Facility | null, subject: BasicNavAngleSubject): void {
    const magVar = GtcUserWaypointDialogStore.getMagVarFromReference(reference);

    const navUnit = this.unitsSettingManager.navAngleUnits.get();
    if (navUnit.isMagnetic()) {
      subject.set(subject.get().number, magVar);
    } else {
      // If the magvar changes while we are in true bearing mode, we don't want the selected true radial to change,
      // so we need to set the stored radial (which is in magnetic degrees) to a value that, with the new magvar,
      // is numerically equivalent to the selected true radial.

      const trueRadial = subject.get().asUnit(navUnit);
      subject.set(MagVar.trueToMagnetic(trueRadial, magVar), magVar);
    }
  }

  /**
   * Recomputes this store's latitude/longitude coordinates using radial and distance from the first reference. If the
   * first reference is `null`, then the coordinates will be left unchanged.
   */
  private recomputeRadialDistanceLatLon(): void {
    const reference = this.ref1.get();

    if (reference === null) {
      return;
    }

    this.latLon.set(FacilityUtils.getLatLonFromRadialDistance(
      reference,
      this.rad1.get().number,
      this.dis1.get().number,
      GtcUserWaypointDialogStore.geoPointCache[0]
    ));
  }

  /**
   * Recomputes this store's latitude/longitude coordinates using the intersection of radials from the first and second
   * references. If either the first or second reference is `null`, then the coordinates will be left unchanged.
   */
  private recomputeRadialRadialLatLon(): void {
    const reference1 = this.ref1.get();
    const reference2 = this.ref2.get();

    if (reference1 === null || reference2 === null) {
      return;
    }

    const latLon = FacilityUtils.getLatLonFromRadialRadial(
      reference1,
      this.rad1.get().number,
      reference2,
      this.rad2.get().number,
      GtcUserWaypointDialogStore.geoPointCache[0]
    );

    if (!isNaN(latLon.lat) && !isNaN(latLon.lon)) {
      this.latLon.set(latLon);
    }
  }

  /**
   * Updates this store's selected comment with an automatically generated version.
   */
  private updateAutoComment(): void {
    this.commentSub.pause();

    switch (this.type.get()) {
      case GtcUserWaypointType.RadialDistance:
        this.comment.set(`${GtcUserWaypointDialogStore.REFERENCE_FORMATTER(this.ref1.get())}${GtcUserWaypointDialogStore.RADIAL_FORMATTER(this.rad1.get().number)} / ${GtcUserWaypointDialogStore.DISTANCE_FORMATTER(this.dis1.get().number)}`);
        break;
      case GtcUserWaypointType.RadialRadial:
        this.comment.set(`${GtcUserWaypointDialogStore.REFERENCE_FORMATTER(this.ref1.get())}${GtcUserWaypointDialogStore.RADIAL_FORMATTER(this.rad1.get().number)} / ${GtcUserWaypointDialogStore.REFERENCE_FORMATTER(this.ref2.get())}${GtcUserWaypointDialogStore.RADIAL_FORMATTER(this.rad2.get().number)}`);
        break;
      default: {
        const latLon = this.latLon.get();
        this.comment.set(`${GtcUserWaypointDialogStore.LAT_FORMATTER(latLon.lat * 60)} / ${GtcUserWaypointDialogStore.LON_FORMATTER(latLon.lon * 60)}`);
      }
    }

    this.commentSub.resume();
  }

  /**
   * Resumes this store's logic for syncing radials and distances with references and latitude/longitude coordinates.
   */
  private resumeInternalSync(): void {
    this.internalSyncSubs.forEach(sub => { sub.resume(); });
  }

  /**
   * Pauses this store's logic for syncing radials and distances with references and latitude/longitude coordinates.
   */
  private pauseInternalSync(): void {
    this.internalSyncSubs.forEach(sub => { sub.pause(); });
  }

  /**
   * Resumes this store's automatic comment generation logic.
   */
  private resumeAutoComment(): void {
    this.autoCommentSubs.forEach(sub => { sub.resume(); });
    this.updateAutoComment();
  }

  /**
   * Pauses this store's automatic comment generation logic.
   */
  private pauseAutoComment(): void {
    this.autoCommentSubs.forEach(sub => { sub.pause(); });
  }

  /**
   * Resets this store's automatic comment generation state. Once reset, the store will automatically generate
   * comments based on the selected waypoint type and parameters until the comment is manually selected.
   */
  public resetAutoComment(): void {
    if (this.autoComment) {
      return;
    }

    this.autoComment = true;
    this.resumeAutoComment();
  }

  /**
   * Sets this store's selected ident to an automatically generated one of the form `USRNNN`, where `NNN` is the
   * smallest three-digit number not already assigned to an existing user waypoint. If all three-digit numbers have
   * been assigned, then the selected ident is set to the empty string.
   */
  public setAutoIdent(): void {
    for (let i = 0; i < 1000; i++) {
      const ident = `USR${i.toString().padStart(3, '0')}`;
      const icao = ICAO.value(IcaoType.User, '', G3000FacilityUtils.USER_FACILITY_SCOPE, ident);
      if (this.facRepo.get(icao) === undefined) {
        this.ident.set(ident);
        return;
      }
    }

    this.ident.set('');
  }

  /**
   * Syncs this store's latitude/longitude coordinates from a specific set of coordinates, and sets this store's
   * selected waypoint type to LAT/LON.
   * @param lat The latitude coordinate, in degrees, to sync from.
   * @param lon The longitude coordinate, in degrees, to sync from.
   */
  public syncFromLatLon(lat: number, lon: number): void {
    this.type.set(GtcUserWaypointType.LatLon);
    this.latLon.set(lat, lon);
  }

  /**
   * Syncs this store's parameters from an existing user facility.
   * @param fac The user facility to sync from.
   */
  public async syncFromFacility(fac: UserFacility): Promise<void> {
    this.pauseInternalSync();

    this.ident.set(ICAO.getIdent(fac.icao));
    this.latLon.set(fac);
    this.isTemporary.set(fac.isTemporary);
    this.comment.set(fac.name);

    switch (fac.userFacilityType) {
      case UserFacilityType.RADIAL_DISTANCE:
        this.type.set(GtcUserWaypointType.RadialDistance);

        await this.syncRadialDistance(fac, ++this.syncOpId);
        break;
      case UserFacilityType.RADIAL_RADIAL:
        this.type.set(GtcUserWaypointType.RadialRadial);
        await this.syncRadialRadial(fac, ++this.syncOpId);
        break;
      default:
        this.type.set(GtcUserWaypointType.LatLon);
    }

    this.resumeInternalSync();
  }

  /**
   * Syncs this store's parameters from an existing RAD/DIS user facility.
   * @param fac The user facility to sync from.
   * @param opId The sync operation's unique ID.
   */
  private async syncRadialDistance(fac: UserFacility, opId: number): Promise<void> {
    const referenceIcao = fac.reference1IcaoStruct;
    let referenceFac: Facility | null = null;
    let radial: number | undefined;
    let distance: number | undefined;

    if (referenceIcao !== undefined && ICAO.isValueFacility(referenceIcao)) {
      if (ICAO.isValueFacility(referenceIcao, FacilityType.USR)) {
        referenceFac = this.facRepo.get(referenceIcao) ?? null;

        // The reference user facility might have been changed since it was referenced. Therefore if the reference
        // stil exists we want to recalculate the radial/distance instead of using the saved values. However, if the
        // reference doesn't exist anymore, then we can't recalculate, so we attempt to default to the saved values.
        if (referenceFac === undefined) {
          radial = fac.reference1Radial;
          distance = fac.reference1Distance;
        }
      } else {
        try {
          referenceFac = await this.facLoader.getFacility(ICAO.getFacilityTypeFromValue(referenceIcao), referenceIcao);
          radial = fac.reference1Radial;
          distance = fac.reference1Distance;
        } catch {
          // noop
        }
      }
    }

    if (opId !== this.syncOpId) {
      return;
    }

    if (referenceFac === null) {
      radial ??= 0;
      distance ??= 0;
    } else if (radial === undefined || distance === undefined) {
      radial = GtcUserWaypointDialogStore.getRadialFromReference(fac, referenceFac) ?? 0;
      distance = GtcUserWaypointDialogStore.getDistanceFromReference(fac, referenceFac) ?? 0;
    }

    this.ref1.set(referenceFac);
    this.rad1.set(radial);
    this.dis1.set(distance);
  }

  /**
   * Syncs this store's parameters from an existing RAD/RAD user facility.
   * @param fac The user facility to sync from.
   * @param opId The sync operation's unique ID.
   */
  private async syncRadialRadial(fac: UserFacility, opId: number): Promise<void> {
    const reference1Icao = fac.reference1IcaoStruct;
    const reference2Icao = fac.reference2IcaoStruct;
    let reference1Fac: Facility | null = null;
    let reference2Fac: Facility | null = null;
    let radial1: number | undefined;
    let radial2: number | undefined;

    if (reference1Icao !== undefined && ICAO.isValueFacility(reference1Icao)) {
      if (ICAO.isValueFacility(reference1Icao, FacilityType.USR)) {
        reference1Fac = this.facRepo.get(reference1Icao) ?? null;

        // The reference user facility might have been changed since it was referenced. Therefore if the reference
        // stil exists we want to recalculate the radial/distance instead of using the saved values. However, if the
        // reference doesn't exist anymore, then we can't recalculate, so we attempt to default to the saved values.
        if (reference1Fac === undefined) {
          radial1 = fac.reference1Radial;
        }
      } else {
        try {
          reference1Fac = await this.facLoader.getFacility(ICAO.getFacilityTypeFromValue(reference1Icao), reference1Icao);
          radial1 = fac.reference1Radial;
        } catch {
          // noop
        }
      }
    }

    if (opId !== this.syncOpId) {
      return;
    }

    if (reference2Icao !== undefined && ICAO.isValueFacility(reference2Icao)) {
      if (ICAO.isValueFacility(reference2Icao, FacilityType.USR)) {
        reference2Fac = this.facRepo.get(reference2Icao) ?? null;

        // The reference user facility might have been changed since it was referenced. Therefore if the reference
        // stil exists we want to recalculate the radial/distance instead of using the saved values. However, if the
        // reference doesn't exist anymore, then we can't recalculate, so we attempt to default to the saved values.
        if (reference2Fac === undefined) {
          radial2 = fac.reference2Radial;
        }
      } else {
        try {
          reference2Fac = await this.facLoader.getFacility(ICAO.getFacilityTypeFromValue(reference2Icao), reference2Icao);
          radial2 = fac.reference2Radial;
        } catch {
          // noop
        }
      }
    }

    if (opId !== this.syncOpId) {
      return;
    }

    if (reference1Fac === null) {
      radial1 ??= 0;
    } else if (radial1 === undefined) {
      radial1 = GtcUserWaypointDialogStore.getRadialFromReference(fac, reference1Fac) ?? 0;
    }

    if (reference2Fac === null) {
      radial2 ??= 0;
    } else if (radial2 === undefined) {
      radial2 = GtcUserWaypointDialogStore.getRadialFromReference(fac, reference2Fac) ?? 0;
    }

    this.ref1.set(reference1Fac);
    this.rad1.set(radial1);
    this.ref2.set(reference2Fac);
    this.rad2.set(radial2);
  }

  /**
   * Gets the magnetic variation, in degrees, at a reference facility.
   * @param reference A reference facility.
   * @returns The magnetic variation, in degrees, at the specified reference facility, or `0` if the facility is
   * `null`.
   */
  private static getMagVarFromReference(reference: Facility | null): number {
    if (reference === null) {
      return 0;
    } else {
      return FacilityUtils.getMagVar(reference);
    }
  }

  /**
   * Gets the magnetic radial, in degrees, from a reference facility that intersects a point. If the facility is
   * `null` or a unique intersecting radial cannot be found, `undefined` will be returned.
   * @param latLon The point to intersect.
   * @param reference The reference facility.
   * @returns The magnetic radial, in degrees, from a reference facility that intersects the specified point.
   */
  private static getRadialFromReference(latLon: LatLonInterface, reference: Facility | null): number | undefined {
    if (reference === null) {
      return undefined;
    }

    const magVar = GtcUserWaypointDialogStore.getMagVarFromReference(reference);
    const trueRadial = GeoPoint.initialBearing(reference.lat, reference.lon, latLon.lat, latLon.lon);

    return isNaN(trueRadial) ? undefined : MagVar.trueToMagnetic(trueRadial, magVar);
  }

  /**
   * Gets the distance, in nautical miles, from a reference facility to a point. If the facility is `null`, `undefined`
   * will be returned.
   * @param latLon The point to measure.
   * @param reference The reference facility.
   * @returns The distance, in nautical miles, from the reference facility to the specified point.
   */
  private static getDistanceFromReference(latLon: LatLonInterface, reference: Facility | null): number | undefined {
    if (reference === null) {
      return undefined;
    }

    return UnitType.GA_RADIAN.convertTo(GeoPoint.distance(reference.lat, reference.lon, latLon.lat, latLon.lon), UnitType.NMILE);
  }
}
