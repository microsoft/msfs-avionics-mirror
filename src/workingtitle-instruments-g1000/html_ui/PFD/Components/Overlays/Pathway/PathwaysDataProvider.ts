import {
  AdcEvents, AhrsEvents, APEvents, ApproachGuidanceMode, APVerticalModes, BaseControlSurfacesEvents, ClockEvents, ConsumerSubject, EventBus,
  FixTypeFlags, FlightPathUtils, FlightPathVector, FlightPlanner, GeoCircle, GeoPoint, GNSSEvents, LegDefinition, LegType, LerpLookupTable, LNavEvents, LNavTransitionMode,
  MappedSubject, MathUtils, NavComEvents, NavMath, Subject, UnitType, Vec3Math, VNavEvents
} from '@microsoft/msfs-sdk';

import { Fms, FmsUtils } from '@microsoft/msfs-garminsdk';

import { G1000ControlEvents } from '../../../../MFD';
import { PFDUserSettings } from '../../../PFDUserSettings';
import { Pathways3DMath } from './Pathways3DMath';

enum BoxesDisplayState {
  Off,             // After landing until after a new flightplan has been started to be entered.
  AltSelected,     // During the entire cruise phase of the flight: All boxes altitudes will be constant and match the selected alt
  AltHoldTarget,   // After the moment when TOD is 1 min away: The boxes altitudes will match the AP ALT mode target alt
  VnavPath,        // While descending in VPATH: The boxes altitudes will follow the descend path
  FinalApproach,   // While descending on the final approach: The boxes altitudes will follow the GS/GP path
}

// When collecting boxes to be shown, we walk along the flightplan with the following states:
enum BoxesCalculationState {
  BeforeFirst, Collecting, Completed,
}

export enum BoxesColors {
  Magenta, Green, White, Grey,
}

/** Collection of pointer related data: */
export interface PointerData {
  /** Flag that tells, whether this pointer object contains valid data (= the related box has pointers) */
  pointersAreValid: boolean;

  /** Array containg the coordinates for the 4 pointers: */
  boxesPointersResultVec: Float64Array;
}

/**
 * This class computes and stores the positional data of the pathway boxes
 *
 * The entire pathways processing works as follows:
 *
 * 1. Principally for all calculations any geographic coordinates are converted into a cartesian coordinate system
 * which has the zero point at the current aircraft position.
 *
 * 2. At a low (1Hz) rate, we compute the visible boxes and their corner cordinates in world space.
 *
 * 3. At a higher rate, the display component calls renderBoxesInScreenCoordinates to retrieve the corners in
 * screen coordinates. renderBoxesInScreenCoordinates uses the usual matrix rendering pipeline with a camera matrix based
 * on the aircraft position and attitude and a projection matrix for the translation into screen coordinates (but without
 * world matrix because the corners are computed in world coordinates already, see step 2).
 */
export class PathwaysDataProvider {

  // Constants for the pathway calculations:
  private readonly boxToBoxDistance = 463;    // The distance between two boxes, in Meter (=1/4NM). Measured in the SR22T Trainer!

  private readonly halfBoxWidth = 106.7;                // [Meter]
  private readonly halfBoxHeight = 30.48;               // [Meter]
  private readonly pointerLength = 30.0;                // [Meter]

  private readonly fovCalibration = 1.15;
  private readonly halfFovVertical = 19.3 * this.fovCalibration;        // [Degrees]
  private readonly halfFovHorizontal = 27.5 * this.fovCalibration;      // [Degrees]

  private readonly nearClippingDistance = 250;          // [Meter]
  private readonly farClippingDistance = 20000;         // [Meter]

  private readonly maxBoxCount = 50;

  // Input data:
  private readonly settingManager = PFDUserSettings.getManager(this.bus);

  private readonly sub = this.bus.getSubscriber<ClockEvents & GNSSEvents & LNavEvents & APEvents & AhrsEvents & AdcEvents &
    G1000ControlEvents & VNavEvents & BaseControlSurfacesEvents & NavComEvents>();

  private readonly SimTime1HzConsumer = ConsumerSubject.create(this.sub.on('simTime').atFrequency(4), 0);               //
  private readonly currentPosition = ConsumerSubject.create(this.sub.on('gps-position'), new LatLongAlt(0, 0, 0));      // lat long alt
  private readonly lnavTrackedVectorIndex = ConsumerSubject.create(this.sub.on('lnav_tracked_vector_index'), 0);
  private readonly lnavTransitionMode = ConsumerSubject.create(this.sub.on('lnav_transition_mode'), 0);
  private readonly lnavIsSuspended = ConsumerSubject.create(this.sub.on('lnav_is_suspended'), false);

  private readonly selectedAlt = ConsumerSubject.create(this.sub.on('ap_altitude_selected'), 0);
  private readonly currentAlt = ConsumerSubject.create(this.sub.on('indicated_alt').whenChangedBy(1), 0);
  private readonly currentAltAboveGround = ConsumerSubject.create(this.sub.on('above_ground_height').whenChangedBy(10), 0);
  private readonly pitchAngle = ConsumerSubject.create(this.sub.on('pitch_deg'), 0);
  private readonly bankAngle = ConsumerSubject.create(this.sub.on('roll_deg'), 0);
  private readonly yawAngle = ConsumerSubject.create(this.sub.on('hdg_deg_true'), 0);

  private readonly fmaModes = ConsumerSubject.create(this.sub.on('fma_modes'), null);

  private readonly vnavFpa = ConsumerSubject.create(this.sub.on('vnav_fpa'), 0);
  private readonly vnavDeviation = ConsumerSubject.create(this.sub.on('vnav_vertical_deviation'), 0);                // [Feet]
  private readonly gpDeviation = ConsumerSubject.create(this.sub.on('gp_vertical_deviation').whenChangedBy(1), 0);   // [Feet]
  private readonly gpMode = ConsumerSubject.create(this.sub.on('gp_approach_mode'), 0);
  private readonly gsDeviation = ConsumerSubject.create(this.sub.on('nav_gs_error_1'), 0);
  private readonly gsRawAngle = ConsumerSubject.create(this.sub.on('nav_raw_gs_1'), 0);
  private readonly gsNavLocation = ConsumerSubject.create(this.sub.on('nav_gs_lla_1'), null);

  private readonly isTodValid = Subject.create(false);
  private readonly vnavTodDistance = ConsumerSubject.create(this.sub.on('vnav_tod_distance'), 0);                    // [Meter]
  private todDistance = 0;

  private readonly vnavTargetAlt = ConsumerSubject.create(this.sub.on('vnav_target_altitude'), 0);
  private readonly vnavConstrainAlt = ConsumerSubject.create(this.sub.on('vnav_constraint_altitude'), 0);

  private readonly groundSpeed = ConsumerSubject.create(this.sub.on('ground_speed').atFrequency(1), 0);
  private readonly timeToTod = MappedSubject.create(  // minutes
    ([todDistance, groundSpeed, isTodValid]): number => {
      const todDistanceNm = UnitType.METER.convertTo(todDistance, UnitType.NMILE);
      return (isTodValid && todDistance > 0) ? (todDistanceNm / groundSpeed) * 60 : 999999;
    },
    this.vnavTodDistance, this.groundSpeed, this.isTodValid,
  );
  private readonly closeToTod = this.timeToTod.map((t) => t < 1);

  private readonly isOnGround = ConsumerSubject.create(this.sub.on('on_ground'), true);


  // Helper and state variables:
  private isEnabled = false;
  private isCalculationValid = false;

  private readonly passedLegIcaoIds: string[] = [];

  private apAltModeTargetAltitude = 0;
  private readonly constantBoxesAltMeter = Subject.create(0);  // Boxes alt when all boxes are drawn at the same height.
  private readonly currentAltMeter = Subject.create(0);
  private boxesAltitudeLookup = new LerpLookupTable([[0, 0], [0, 1000000]]);
  private maxPointersDistanceLookup = new LerpLookupTable([[2000, 0], [8000, Math.PI / 2.0]]);

  private currentBoxesState = BoxesDisplayState.AltSelected;
  private currentBoxesCollectingState = BoxesCalculationState.BeforeFirst;
  private momentaryAltitudeTarget = 0;                             // This is constantBoxesAltMeter for the ALT mode, but ever decreasing for VPATH or GS/GP modes.

  private finalApproachArmed = false;                              // If true, the final approach has been armed

  private currentBoxColor = BoxesColors.Magenta;

  private boxPositionsCount = 0;

  private activeLegSpilloverDistance = 0;                          // Root unused meters to the next box at the beginning of the first considered leg (the active one).
  private nextActiveLegSpilloverDistance = 0;                      // Unused meters to the next box at the end of the active leg.
  private traversingSpilloverDistance = 0;                         // Next applicable unused meters to the next box while traversing.

  private currentToBoxDistance = 1000000;                          // 1000km in Meter

  // The following vectors have one element per calculated box, with matching indexes:
  private readonly boxesCornerPositions = new Float64Array(this.maxBoxCount * 16); // Corner vector in world scale (x = north/south, y = up/down, z = east/west).
  private readonly boxesNormalsUnit = new Float64Array(this.maxBoxCount * 3);      // The normal vector for a found box.
  private readonly boxesColors: BoxesColors[] = [];

  // For the vector math we need quite some float 64 arrays, to be used like caches:
  private readonly vec3Cache = [Vec3Math.create(), Vec3Math.create(), Vec3Math.create()];
  private readonly geoCircleCache = new GeoCircle(new Float64Array(3), 0);
  private readonly geoPointCache = new GeoPoint(0, 0);

  private readonly currentAircraftPos = new Float64Array([0, 0, 0]);        // Current aircraft position.
  private readonly aircraftFwdVecUnit = new Float64Array([0, 0, 0]);        // Current fwd looking vector from the current aircraft position.
  private readonly straightUpVec = new Float64Array([0, 1, 0]);             // Unit vector straight up.

  // For box (center) calculations:
  private readonly boxCenterPos = new Float64Array([0, 0, 0]);              // Position of the center of the currently calculated box.
  private readonly previousBoxCenterPos = new Float64Array([0, 0, 0]);      // Position of the previous box center along straight legs.
  private readonly boxNormalVec = new Float64Array([0, 0, 0]);              // Holds the normal vector of the currently calculated box.

  private readonly navGsStationVec = new Float64Array([0, 0, 0]);           // Vector to the the GS station
  private readonly fafPos = new Float64Array([0, 0, 0]);                    // Position of the FAF
  private readonly mapPos = new Float64Array([0, 0, 0]);                    // Position of the MAP

  // For box vs current aircraft position calculations:
  private readonly currentToBoxVec = new Float64Array([0, 0, 0]);           // Holds the vector between current aircraft position and the box center.
  private readonly currentToBoxVecUnit = new Float64Array([0, 0, 0]);       // Same but the unit vector.

  // For box corner calculations:
  private readonly turnCenterPos = new Float64Array([0, 0, 0]);             // Position of the turn center.
  private readonly turnBeginPos = new Float64Array([0, 0, 0]);              // Position where the turn begins.
  private readonly turnEndPos = new Float64Array([0, 0, 0]);                // Position where the turn ends.
  private readonly turnCenterToBoxVec = new Float64Array([0, 0, 0]);        // Vector from the turn center to the current box center.
  private readonly boxCenterToLEVec = new Float64Array([0, 0, 0]);          // Vector from the box center to the left edge.
  private readonly boxEdgeVec = new Float64Array([0, 0, 0]);                // Vector from the box center to the upper left corner.

  /**
   * Output data, this provider generates data with this format:
   * -> screenCoordsIndex
   * Accumulates all written screen coordinates
   *
   * -> renderedScreenCoordinates
   * This is the single container which contains the screen coordinates of all boxes and pointers. The boxes are stored one after another.
   * For each box without pointers, 16 floats are reserved, 4 coordinates for each corner.
   * And for each box with pointers, 32 floats are reserved, first 4 coordinates for each corner and the 4 coordinates for each pointer.
   *
   * -> renderedBoxHasPointers
   * Boolean array, that tells for each box, whether it has pointers or not.
   *
   * -> renderedBoxesColors
   * Array that contains the color of each box.
   *
   * -> renderedBoxesOpacities
   * Number array, containing the opacity of each box.
   *
   */

  private screenCoordsIndex = 0;
  private renderedScreenCoordinates: Float64Array = new Float64Array(10);    // This is the container which contains the screen coordinates of all boxes and pointers
  private readonly renderedBoxHasPointers: boolean[] = [];                            // If true, the box at this index has pointers
  private readonly renderedBoxesColors: BoxesColors[] = [];
  private readonly renderedBoxesOpacities: number[] = [];

  // Caches for the box rendering:
  private readonly aioMat4 = new Float64Array(16);
  private readonly boxPointersPositions = new Float64Array([0, 0, 0, 1]);
  private readonly cameraMat4 = new Float64Array(16);
  private readonly screenProjectionMat4 = new Float64Array(16);

  // For the grey boxes:
  private currentIsFafOrMapLeg = false;

  /**
   * Creates a PathwaysDataStore.
   * @param bus An instance of the event bus.
   * @param flightPlanner The flight planner.
   * @param fms Fms
   */
  constructor(private readonly bus: EventBus,
    private readonly flightPlanner: FlightPlanner,
    private readonly fms: Fms) {

    this.isEnabled = this.settingManager.getSetting('svtPathwaysShow').value;
    this.settingManager.whenSettingChanged('svtPathwaysShow').handle(showPathways => {
      this.isEnabled = showPathways;
    });

    this.SimTime1HzConsumer.sub(() => {
      this.computeBoxesInWorldSpace();
    }, true);

    this.currentAlt.sub(newAlt => {
      this.currentAltMeter.set(UnitType.FOOT.convertTo(newAlt, UnitType.METER));
    }, true);

    this.selectedAlt.sub(newSelected => {
      if (this.currentBoxesState === BoxesDisplayState.AltSelected) {
        // Set the selected alt as constant boxes alt:
        this.constantBoxesAltMeter.set(newSelected * Avionics.Utils.FEET2METER);
      }
    }, true);

    this.fmaModes.sub(newFmaModes => {
      switch (newFmaModes?.verticalActive) {
        case APVerticalModes.ALT:
        case APVerticalModes.CAP:
          this.apAltModeTargetAltitude = newFmaModes.altitudeCaptureValue * Avionics.Utils.FEET2METER;
          if (this.currentBoxesState === BoxesDisplayState.VnavPath) {
            // When ALT follows a VPATH segment, we fall back to alt hold state:
            this.currentBoxesState = BoxesDisplayState.AltHoldTarget;
            this.constantBoxesAltMeter.set(this.apAltModeTargetAltitude);
          }
          break;

        case APVerticalModes.GS:
        case APVerticalModes.GP:
          if (this.currentBoxesState > BoxesDisplayState.Off) {
            this.currentBoxesState = BoxesDisplayState.FinalApproach;
          }
          break;

        case APVerticalModes.PATH:
          if (this.currentBoxesState > BoxesDisplayState.Off) {
            this.currentBoxesState = BoxesDisplayState.VnavPath;
          }
          break;

        default:
          if (this.currentBoxesState === BoxesDisplayState.AltSelected) {
            this.constantBoxesAltMeter.set(this.selectedAlt.get() * Avionics.Utils.FEET2METER);
          }
          break;
      }
    }, true);

    this.vnavTodDistance.sub(newTodDist => {
      if (newTodDist <= 0) {
        this.isTodValid.set(false);
      } else {
        this.todDistance = newTodDist;
        this.isTodValid.set(true);
      }
    }, true);

    this.gpMode.sub(newMode => {
      this.finalApproachArmed = [ApproachGuidanceMode.GPArmed, ApproachGuidanceMode.GSArmed].includes(newMode) ? true : false;
    }, true);

    this.closeToTod.sub(todIsClose => {
      if (todIsClose && this.currentBoxesState === BoxesDisplayState.AltSelected) {
        this.constantBoxesAltMeter.set(this.apAltModeTargetAltitude);
        this.currentBoxesState = BoxesDisplayState.AltHoldTarget;
      }
    }, false);

    this.isOnGround.sub(isOnGround => {
      if (isOnGround) {
        // We come here exactly only when landing, so we disable the pathways:
        this.currentBoxesState = BoxesDisplayState.Off;
      } else {
        // At takeoff, set the basic state that makes the boxes visible, so the usersetting controls visibility again alone.
        this.currentBoxesState = BoxesDisplayState.AltSelected;
      }
    }, false);

    this.fms.flightPlanner.onEvent('fplOriginDestChanged').handle(event => {
      if (event.planIndex === FmsUtils.PRIMARY_PLAN_INDEX) {
        // The disabled pathways after landing are reactivated whenever the flightplan origin or the destination are modified:
        if (this.isOnGround.get()) {
          this.currentBoxesState = BoxesDisplayState.AltSelected;
        }
      }
    });

  }

  /**
   * Render the boxes from world space into screen coordinates:
   *
   * Allows to fetch the screen coordinates of the 4 corners for all visible boxes.
   * This method applies a render pipeline consisting of a camera matrix based on the aircraft attitude, altitude and yaw angle and a
   * projection matrix that converts any worldspace coordinate into a screen x,y-pair.
   *
   * This method is called from the display component at a sufficiantly high rate to make the movements of the boxes smooth.
   *
   * @returns the following data:
   * -> screenCoordsIndex
   * Accumulates all written screen coordinates
   *
   * -> renderedScreenCoordinates
   * This is the single container which contains the screen coordinates of all boxes and pointers. The boxes are stored one after another.
   * For each box without pointers, 16 floats are reserved, 4 coordinates for each corner.
   * And for each box with pointers, 32 floats are reserved, first 4 coordinates for each corner and the 4 coordinates for each pointer.
   *
   * -> renderedBoxHasPointers
   * Boolean array, that tells for each box, whether it has pointers or not.
   *
   * -> renderedBoxesColors
   * Array that contains the color of each box.
   *
   * -> renderedBoxesOpacities
   * Number array, containing the opacity of each box.
   */
  public renderBoxesInScreenCoordinates(): [Float64Array, number, number[], BoxesColors[], boolean[], number] {

    let renderedBoxIndex = 0;
    this.screenCoordsIndex = 0;

    if (this.isEnabled && (this.currentBoxesState > BoxesDisplayState.Off) && this.isCalculationValid && this.flightPlanner.hasActiveFlightPlan()) {
      const pos = this.currentPosition.get();
      Pathways3DMath.getMetersFromRef(pos.lat, pos.long, this.currentAltMeter.get(), this.currentAircraftPos);

      const pitchRad = UnitType.DEGREE.convertTo(this.pitchAngle.get(), UnitType.RADIAN);
      const bankRad = UnitType.DEGREE.convertTo(this.bankAngle.get(), UnitType.RADIAN);
      const yawRad = UnitType.DEGREE.convertTo(this.yawAngle.get(), UnitType.RADIAN);

      const viewVector = Vec3Math.set(Math.sin(yawRad), Math.sin(-pitchRad), Math.cos(yawRad), this.vec3Cache[0]);
      const viewPoint = Vec3Math.add(viewVector, this.currentAircraftPos, viewVector);

      Pathways3DMath.lookAtScherfgen(this.cameraMat4, this.currentAircraftPos, viewPoint, this.straightUpVec, bankRad);
      Pathways3DMath.perspectiveFromFieldOfView(this.screenProjectionMat4,
        this.halfFovVertical, this.halfFovVertical, this.halfFovHorizontal, this.halfFovHorizontal, this.nearClippingDistance, this.farClippingDistance);

      // Combine camera and projection matrix in one (aio):
      Pathways3DMath.multiply(this.aioMat4, this.screenProjectionMat4, this.cameraMat4);

      let farthestBoxOpacity = 1.0;
      for (let boxPositionIndex = 0; boxPositionIndex < this.boxPositionsCount; boxPositionIndex++) {

        // Obtain the box center:
        const inputVectorIndex = boxPositionIndex * 16;
        this.boxCenterPos[0] = (this.boxesCornerPositions[inputVectorIndex + 0] + this.boxesCornerPositions[inputVectorIndex + 8]) / 2.0;
        this.boxCenterPos[1] = (this.boxesCornerPositions[inputVectorIndex + 1] + this.boxesCornerPositions[inputVectorIndex + 9]) / 2.0;
        this.boxCenterPos[2] = (this.boxesCornerPositions[inputVectorIndex + 2] + this.boxesCornerPositions[inputVectorIndex + 10]) / 2.0;
        this.setCurrentToBoxVectors();
        const vertBoxOffset = this.boxCenterPos[1] - this.selectedAlt.get() * Avionics.Utils.FEET2METER;

        // The fading in and out of boxes happens based on the distance to the closest box.
        const fadeInOutDistance = 50;
        let opacity = 1.0;
        if (boxPositionIndex === 0) {
          // Pacemaker for the fading in/out process is the distance from the aircraft position to the closest box (box pos idx = 0).
          //
          // Before fading out the closest box, we fade in the farthest box. This means, that from a bit further out,
          // we start fading in the last (typically the 5th) box to always show at least 4. So while the distance to the closest box
          // reduces from 330m to 280m, we fade in the farthest box (applied at the next frame using this.farthestBoxOpacity):
          const fadeinBegin = 230 + 2 * fadeInOutDistance;
          farthestBoxOpacity = MathUtils.clamp((fadeinBegin - this.currentToBoxDistance) / fadeInOutDistance, 0.0, 1.0);

          // From a closer distance, we start fading out the closest box. So while distance to the closest box reduces from 280m to 230m,
          // we fade it out:
          const fadeoutBegin = 230 + fadeInOutDistance;
          if (this.currentToBoxDistance < fadeoutBegin) {
            opacity = MathUtils.clamp(1 - (fadeoutBegin - this.currentToBoxDistance) / fadeInOutDistance, 0.0, 1.0);
          }

        } else if (boxPositionIndex === this.boxPositionsCount - 1) {
          opacity = farthestBoxOpacity;
        }

        // Handle the little pointers at the corners of each box:
        // First test whether they need to be shown. We show them on any box closer than 900m and
        // on further away boxes the more the box normal is pointing orthogonal to our view.
        const boxNormalUnit = Pathways3DMath.copy(this.boxesNormalsUnit, boxPositionIndex * 3, this.vec3Cache[2], 0);
        const enclosedAngle = Math.acos(Vec3Math.dot(this.currentToBoxVecUnit, boxNormalUnit)); // [Rad]
        const pointerVec = Vec3Math.setMagnitude(boxNormalUnit, this.pointerLength, this.vec3Cache[0]);
        const thisBoxHasPointers = (this.currentToBoxDistance < this.maxPointersDistanceLookup.get(enclosedAngle));

        // Add a grey box if required. Add grey box first, so it is rendered behind the respective magenta/white/green-box:
        if (this.currentIsFafOrMapLeg && vertBoxOffset > 0) {
          this.renderBoxToOutput(renderedBoxIndex, thisBoxHasPointers, opacity, inputVectorIndex, pointerVec, BoxesColors.Grey, vertBoxOffset);
          renderedBoxIndex++;
        }

        // Extend the screen coords output array if needed. This will only for the first few frames result in a few memory allocations:
        this.renderBoxToOutput(renderedBoxIndex, thisBoxHasPointers, opacity, inputVectorIndex, pointerVec, this.boxesColors[boxPositionIndex]);
        renderedBoxIndex++;
      }
    }
    return [this.renderedScreenCoordinates, this.screenCoordsIndex, this.renderedBoxesOpacities, this.renderedBoxesColors, this.renderedBoxHasPointers, renderedBoxIndex];
  }

  /**
   * This method stores the complete data of one box in the output arrays.
   * @param renderedBoxIndex  Index of the rendered box.
   * @param thisBoxHasPointers True if this box has pointers.
   * @param opacity Opacity of this box, is number in 0...1 range
   * @param inputBoxIndex Index of the box in the boxesCornerPositions array (which does not contain the grey boxes)
   * @param pointerVec vectors for the pointers.
   * @param color Color for this box.
   * @param vertBoxOffset Optional vertical offset from this.boxesCornerPositions, for grey boxes
   */
  private renderBoxToOutput(renderedBoxIndex: number, thisBoxHasPointers: boolean, opacity: number, inputBoxIndex: number,
    pointerVec: Float64Array, color: BoxesColors, vertBoxOffset = 0): void {
    if ((renderedBoxIndex + 1) * 64 > this.renderedScreenCoordinates.length) {
      // If the screen coords array is too small reserve new permanent cache for the next 5-10 boxes (with/without pointers):
      const arrayExtension = new Float64Array(5 * 32);
      this.renderedScreenCoordinates = Float64Array.from([...this.renderedScreenCoordinates, ...arrayExtension]);
    }

    this.renderedBoxHasPointers[renderedBoxIndex] = thisBoxHasPointers;
    this.renderedBoxesOpacities[renderedBoxIndex] = opacity;
    this.renderedBoxesColors[renderedBoxIndex] = color;

    for (let cornerIndex = 0; cornerIndex < 4; cornerIndex++) {
      const inputVectorIndex = inputBoxIndex + cornerIndex * 4;
      const outputVectorIndex = this.screenCoordsIndex + cornerIndex * 4;
      // Render the four corners:
      Pathways3DMath.render3DPosOnScreen(this.aioMat4, this.boxesCornerPositions, inputVectorIndex, this.renderedScreenCoordinates, outputVectorIndex, vertBoxOffset);

      // Render the pointers if required:
      if (thisBoxHasPointers) {
        Pathways3DMath.add(this.boxesCornerPositions, inputVectorIndex, pointerVec, 0, this.boxPointersPositions, 0);
        Pathways3DMath.render3DPosOnScreen(this.aioMat4, this.boxPointersPositions, 0, this.renderedScreenCoordinates, outputVectorIndex + 16, vertBoxOffset);
      }
    }
    this.screenCoordsIndex += thisBoxHasPointers ? 32 : 16;
  }

  /**
   * Compute the visibles boxes in world space:
   *
   * This is the performance heavy main method, running at a low 1Hz rate, which calculates the boxes and their corners in world space.
   *
   * The method only adds these boxes, which horizontally lay inside the field of view (fov).
   *
   * The function works by traversing along the flight plan, starting at the active leg and check for every box center the
   * fov-criteria and if that yields true, calculate the 4 corners and add them to the boxesCornerVector-vector.
   */
  private computeBoxesInWorldSpace(): void {
    // Reset the collecting state:
    this.currentBoxesCollectingState = BoxesCalculationState.BeforeFirst;
    this.boxPositionsCount = 0;

    // We need an active flightplan:
    if (this.isEnabled && (this.currentBoxesState > BoxesDisplayState.Off) && this.flightPlanner.hasActiveFlightPlan()) {

      // Fetch the currently acctive constant alt (selected alt or vnav target alt):
      const boxesAltitude = this.constantBoxesAltMeter.get();
      this.momentaryAltitudeTarget = boxesAltitude;
      if (this.currentBoxesState === BoxesDisplayState.AltSelected || this.currentBoxesState === BoxesDisplayState.AltHoldTarget) {
        const altAboveGroundMeter = (this.currentAltMeter.get() - this.currentAltAboveGround.get() * Avionics.Utils.FEET2METER);
        if (boxesAltitude - altAboveGroundMeter > 50) {
          this.isCalculationValid = true;
        } else {
          // Hide pathways if they would be below the ground or below 50m ground alt.
          this.isCalculationValid = false;
          return;
        }
      }

      // Determine the aircraft fwd vector and the position vector:
      Pathways3DMath.getRadialVector(this.yawAngle.get(), 1, this.aircraftFwdVecUnit);
      const pos = this.currentPosition.get();
      const currentLat = pos.lat;
      const currentLong = pos.long;
      // Update the ref point every time before we re-calculate the boxes:
      Pathways3DMath.updateReferencePoint(currentLat, currentLong);
      Pathways3DMath.getMetersFromRef(currentLat, currentLong, 0.0, this.currentAircraftPos);

      // Now we fetch the flightplan and we prepare some more variables:
      const fp = this.flightPlanner.getActiveFlightPlan();
      const legs = Array.from(fp.legs());
      const activeLegIndex = Math.max(1, fp.activeLateralLeg);
      const activeLeg = legs[activeLegIndex];
      if (legs.length === 0 || legs.length <= activeLegIndex) {
        return;
      }

      if ((typeof activeLeg.leg.fixIcao === 'string') && (this.passedLegIcaoIds.slice(-1)[0] !== activeLeg.leg.fixIcao)) {
        // The last time, activeLeg was different, so we have a new leg:
        this.passedLegIcaoIds.push(activeLeg.leg.fixIcao);
        // We use the recorded spillover distance initially:
        this.activeLegSpilloverDistance = this.nextActiveLegSpilloverDistance;
      }

      const todDistance = this.isTodValid.get() ? this.todDistance : 1000000;

      // The glidepath armed state depends on the availability of a faf- and a map-leg.
      let isFinalApproachDefined = false;
      let fafDistance = 0;
      let fafAltitude = 0;
      let mapDistance = 0;
      let mapAltitude = 0;
      const bodAltitude = this.vnavTargetAlt.get() * Avionics.Utils.FEET2METER;
      const fafLeg = legs.filter(leg => { return leg.leg.fixTypeFlags & 8; });
      const mapLeg = legs.filter(leg => { return leg.leg.fixTypeFlags & 4; });

      if ((fafLeg.length === 1) && (mapLeg.length === 1)) {
        if ((mapLeg[0].calculated?.startLat !== undefined) &&
          (mapLeg[0].calculated?.startLon !== undefined) &&
          (mapLeg[0].calculated?.endLat !== undefined) &&
          (mapLeg[0].calculated?.endLon !== undefined)) {
          fafAltitude = fafLeg[0].leg.altitude1;
          mapAltitude = mapLeg[0].leg.altitude1;

          Pathways3DMath.getMetersFromRef(mapLeg[0].calculated.startLat, mapLeg[0].calculated.startLon, 0.0, this.fafPos);
          Pathways3DMath.getMetersFromRef(mapLeg[0].calculated.endLat, mapLeg[0].calculated.endLon, 0.0, this.mapPos);

          Vec3Math.sub(this.mapPos, this.fafPos, this.vec3Cache[0]);

          Vec3Math.sub(this.mapPos, this.currentAircraftPos, this.vec3Cache[0]);
          mapDistance = Vec3Math.abs(this.vec3Cache[0]);

          Vec3Math.sub(this.fafPos, this.currentAircraftPos, this.vec3Cache[0]);
          fafDistance = Vec3Math.abs(this.vec3Cache[0]);

          isFinalApproachDefined = true;
        }
      }

      if ((activeLeg.leg.fixTypeFlags & 4) > 0) {
        this.currentBoxesState = BoxesDisplayState.FinalApproach;
      }

      this.currentIsFafOrMapLeg = (activeLeg.leg.fixTypeFlags & (FixTypeFlags.FAF + FixTypeFlags.MAP)) > 0;

      // Calculate the altitude profile ahead of the aircraft and store in this.boxesAltitudeLookup:
      this.calculateAltProfileAhead(boxesAltitude, todDistance, bodAltitude, isFinalApproachDefined, fafLeg, fafDistance, fafAltitude, mapDistance, mapAltitude);

      // Some helper variables:
      let boxIndex = 0; // Used to count every box, which is in range and field-of-view and which actually was added.

      // Initialize the traversing spillover distance with the one for the active leg:
      this.traversingSpilloverDistance = this.activeLegSpilloverDistance;

      for (let legIndex = activeLegIndex; legIndex < Math.min(fp.length); legIndex++) {

        // This leg we are considering next:
        const leg = legs[legIndex];

        let considerPreviousEgress = false;
        if (legIndex === activeLegIndex) {
          if ((leg.leg.fixTypeFlags & FixTypeFlags.MAP) && ([ApproachGuidanceMode.GSActive, ApproachGuidanceMode.GSArmed].includes(this.gpMode.get()))) {
            this.currentBoxColor = BoxesColors.Green;
          } else {
            this.currentBoxColor = BoxesColors.Magenta;
          }
          considerPreviousEgress = true;
        } else {
          this.currentBoxColor = BoxesColors.White;
        }

        // Next collect every vector in the right order:
        const vectors: Readonly<FlightPathVector>[] = [];

        // Sometimes the next leg is activated while completing the egress of the previous leg. In this case, consider the
        // egress of the previous leg too:
        if (considerPreviousEgress && (legIndex - 1 > 0)) {
          const prevLeg = legs[legIndex - 1];
          if (prevLeg.calculated?.egress !== undefined && prevLeg.calculated.egress.length > 0 && legIndex < fp.length - 1) {
            vectors.push(prevLeg.calculated.egress[prevLeg.calculated.egress.length - 1]);
          }
        }

        vectors.push(...this.getAllLegVectors(leg, legIndex === activeLegIndex)); // Retrieve all the vectors of the leg

        // Compute the boxes for every vector:
        for (const vector of vectors) {
          if (vector.radius === Math.PI / 2.0) {
            // Great arc straight vector:
            boxIndex = this.computeBoxesAlongGreatArc(vector, boxIndex);
          } else {
            // Vector represent a turn:
            boxIndex = this.computeBoxesAlongTurn(vector, boxIndex);
          }
          if (this.isCollectingCompleted(boxIndex)) {
            break;
          }
        }

        if (this.isCollectingCompleted(boxIndex)) {
          break;
        }

        if (legIndex === activeLegIndex) {
          // If we are looking at the active leg, let's record the spillover distance as initial next active leg spillover distance.
          this.nextActiveLegSpilloverDistance = this.traversingSpilloverDistance;
          if (this.lnavIsSuspended.get() === true) {
            // Do not continue beyond the active leg to the following legs, if we are in suspended mode:
            break;
          }
        }

        // After the MAP, we don't traverse through any further legs:
        if (leg.leg.fixTypeFlags & 4) {
          break;
        }
      }
      // Update currentBoxCount with the actually calculated boxes:
      this.boxPositionsCount = Math.min(this.maxBoxCount, boxIndex);
    }
  }

  /**
   * Calculates the lerp tables, that describe the altitude of a box vs their distance form the current aircraft position.
   * For each of the three boxes alt modes, we carefully construct the vertical profile ahead.
   * @param boxesAltitude Level flight target altitude
   * @param todDistance distance to TOD
   * @param bodAltitude altitude at BOD
   * @param isFinalApproachDefined true if a final approach is defined
   * @param fafLeg FAF leg
   * @param fafDistance distance to FAF
   * @param fafAltitude altitude at FAF
   * @param mapDistance distance to MAP
   * @param mapAltitude altitude at MAP
   */
  private calculateAltProfileAhead(
    boxesAltitude: number, todDistance: number, bodAltitude: number, isFinalApproachDefined: boolean, fafLeg: LegDefinition[],
    fafDistance: number, fafAltitude: number,
    mapDistance: number, mapAltitude: number): void {

    // For BoxesAltDeterminationMode.SelectedAlt and all uncoded if cases below, we define a steady row of boxes at a constant altitude:
    this.boxesAltitudeLookup = new LerpLookupTable([[boxesAltitude, 0], [boxesAltitude, 1000000]]);

    if (this.currentBoxesState === BoxesDisplayState.AltHoldTarget) {
      // A VPATH segment is armed, so we expect tod, bod to be defined:
      const bodDistance = todDistance + (Math.abs(boxesAltitude - bodAltitude) / Math.tan(this.vnavFpa.get() * Avionics.Utils.DEG2RAD));
      if (this.finalApproachArmed && isFinalApproachDefined) {
        bodAltitude = Math.max(fafLeg[0].leg.altitude1, bodAltitude); // We dont let bod alt become less than faf alt.
        if (bodDistance < fafDistance) {
          // We have tod, bod, faf and map:
          this.boxesAltitudeLookup = new LerpLookupTable([
            [boxesAltitude, 0],
            [boxesAltitude, todDistance],
            [bodAltitude, bodDistance],
            [fafAltitude, fafDistance],
            [mapAltitude, mapDistance]
          ]);
        } else {
          // We have tod, faf and map. Bod is past faf, so skip it:
          this.boxesAltitudeLookup = new LerpLookupTable([
            [boxesAltitude, 0],
            [boxesAltitude, todDistance],
            [fafAltitude, fafDistance],
            [mapAltitude, mapDistance]
          ]);
        }
      } else {
        // There is no VPATH segment ahead, so check whether approach is available:
        if (this.finalApproachArmed && isFinalApproachDefined) {
          bodAltitude = Math.max(fafLeg[0].leg.altitude1, bodAltitude); // We dont let bod alt become less than faf alt.

          // We have faf and map:
          this.boxesAltitudeLookup = new LerpLookupTable([
            [fafAltitude, 0],
            [fafAltitude, fafDistance],
            [mapAltitude, mapDistance]
          ]);
        }
      }
    } else if (this.currentBoxesState === BoxesDisplayState.VnavPath) {
      this.momentaryAltitudeTarget = this.currentAltMeter.get() + this.vnavDeviation.get() * Avionics.Utils.FEET2METER;
      const bodDistance = Math.abs(this.momentaryAltitudeTarget - bodAltitude) / Math.tan(this.vnavFpa.get() * Avionics.Utils.DEG2RAD);
      if (this.finalApproachArmed && isFinalApproachDefined) {
        // After the VPATH section, a final approach is armed.
        if (bodDistance < fafDistance) {
          // We have bod, faf and map:
          this.boxesAltitudeLookup = new LerpLookupTable([
            [this.momentaryAltitudeTarget, 0],
            [bodAltitude, bodDistance],
            [fafAltitude, fafDistance],
            [mapAltitude, mapDistance]
          ]);
        } else {
          // We have faf and map. Bod is past faf, so skip it:
          this.boxesAltitudeLookup = new LerpLookupTable([
            [this.momentaryAltitudeTarget, 0],
            [fafAltitude, fafDistance],
            [mapAltitude, mapDistance]
          ]);
        }
      } else {
        // We only have bod:
        this.boxesAltitudeLookup = new LerpLookupTable([
          [this.momentaryAltitudeTarget, 0],
          [bodAltitude, bodDistance]
        ]);
      }
    } else if (this.currentBoxesState === BoxesDisplayState.FinalApproach) {
      if (isFinalApproachDefined) {
        let deviation = this.gpDeviation.get();
        if ([ApproachGuidanceMode.GSActive, ApproachGuidanceMode.GSArmed].includes(this.gpMode.get())) {
          // For ILS approaches, gpDeviation is not available, therefor we need some additional math:
          const gsNavLla = this.gsNavLocation.get();
          if (gsNavLla !== null) {
            Pathways3DMath.getMetersFromRef(gsNavLla.lat, gsNavLla?.long, 0, this.navGsStationVec);
            Vec3Math.sub(this.navGsStationVec, this.currentAircraftPos, this.vec3Cache[0]);
            const distToGsStation = Vec3Math.abs(this.vec3Cache[0]);
            const relAltTarget = distToGsStation * Math.tan(this.gsRawAngle.get() * Avionics.Utils.DEG2RAD);
            const relAltAircraft = distToGsStation * Math.tan((this.gsRawAngle.get() + this.gsDeviation.get()) * Avionics.Utils.DEG2RAD);
            deviation = relAltTarget - relAltAircraft;
            mapAltitude = this.currentAltMeter.get() - relAltAircraft;
            mapDistance = distToGsStation;
          }
        }

        this.momentaryAltitudeTarget = this.currentAltMeter.get() + deviation * Avionics.Utils.FEET2METER;
        this.boxesAltitudeLookup = new LerpLookupTable([
          [this.momentaryAltitudeTarget, 0],
          [mapAltitude, mapDistance]
        ]);
      }
    }
  }

  /**
   * Return the vectors, which represent the flight path along this leg.
   * @param leg Input leg
   * @param isActiveLeg true if the leg is the active leg
   * @returns array of circleVectors
   */
  private getAllLegVectors(leg: LegDefinition, isActiveLeg: boolean): Readonly<FlightPathVector>[] {
    const vectors: Readonly<FlightPathVector>[] = [];
    if (leg.calculated !== undefined) {
      switch (leg.leg.type) {
        case LegType.HM:
        case LegType.HA:
          if (isActiveLeg) {
            const trackedVectorIndex = this.lnavTrackedVectorIndex.get();
            if (this.lnavIsSuspended.get()) {
              if (this.lnavTransitionMode.get() === LNavTransitionMode.Ingress) {
                // During ingress, we remove passed vectors from the beginning:
                vectors.push(...leg.calculated.ingress.slice(trackedVectorIndex));
                // The regular hold shall not be considered before the last vector of the ingress is tracked:
                if (trackedVectorIndex > leg.calculated.ingress.length - 2) {
                  vectors.push(...leg.calculated.flightPath.slice(leg.calculated.ingressJoinIndex, leg.calculated.ingressJoinIndex + 2));
                }
              } else {
                // Appends the 4 next vectors of the regular hold, always starting at the tracked vector:
                vectors.push(...leg.calculated.flightPath.slice(trackedVectorIndex));
                vectors.push(...leg.calculated.flightPath.slice(0, trackedVectorIndex));
              }
            } else {
              // After the LNAV suspension is terminated, we follow the egress route:
              if (this.lnavTransitionMode.get() !== LNavTransitionMode.Egress) {
                vectors.push(...leg.calculated.ingressToEgress.slice(trackedVectorIndex));
              }
              vectors.push(...leg.calculated.egress);
            }
          } else { // Hold leg is ahead
            vectors.push(...leg.calculated.ingress);
            vectors.push(...leg.calculated.ingressToEgress);
          }
          break;
        default:
          // For all other leg types, the standard leg structure is assumed:
          if ((isActiveLeg === false) || (this.lnavTransitionMode.get() === LNavTransitionMode.Ingress)) {
            vectors.push(...leg.calculated.ingress);
          }
          vectors.push(...leg.calculated.ingressToEgress);
          vectors.push(...leg.calculated.egress);
          break;
      }
    }
    return vectors;
  }

  /**
   * Check all criteria whether enough boxes have been collected.
   * @param boxIndex currently collected box count
   * @returns true if no more boxes need to be collected.
   */
  private isCollectingCompleted(boxIndex: number): boolean {
    return (this.currentBoxesCollectingState === BoxesCalculationState.Completed) || ((boxIndex > 0) && (boxIndex >= this.boxPositionsCount));
  }

  /** Calculate the two current to box vectors. */
  private setCurrentToBoxVectors(): void {
    Vec3Math.sub(this.boxCenterPos, this.currentAircraftPos, this.currentToBoxVec);
    this.currentToBoxVec[1] = 0.0; // Erase any alt difference in the Y comp. For the box selections we strictly work with a top down view alone.
    Vec3Math.normalize(this.currentToBoxVec, this.currentToBoxVecUnit);
    this.currentToBoxDistance = Vec3Math.abs(this.currentToBoxVec);
  }

  /**
   * Check wheather a point lays inside the fov.
   * @param currentToPointVec vector  from current to the test point. Needs to be a unit vector!
   * @returns true if point inside fov.
   */
  private isPointInFov(currentToPointVec: Float64Array): boolean {
    // Get the inner angle via dot product (=cos of the inner angle) of the 2D horizontal vector components (x, z):
    const dotProd = Vec3Math.dot(this.aircraftFwdVecUnit, currentToPointVec);
    const innerAngleDeg = Math.acos(dotProd) * Avionics.Utils.RAD2DEG;
    if (innerAngleDeg < this.halfFovHorizontal) {
      return true;
    }
    return false;
  }

  /**
   * Checks whether the current box center is inside the field-of-view:
   * @returns true if inside fov
   */
  private handleBoxFovState(): boolean {
    let isInsideFov = false;
    if (this.currentBoxesCollectingState < BoxesCalculationState.Completed) {
      if (this.isPointInFov(this.currentToBoxVecUnit)) {
        // We found a box inside the horizontal fov angle! Now check the distance:
        const boxDistance = Vec3Math.abs(this.currentToBoxVec);
        if ((this.nearClippingDistance < boxDistance) && (boxDistance < this.farClippingDistance)) {

          isInsideFov = true;

          if (this.currentBoxesCollectingState === BoxesCalculationState.BeforeFirst) {
            this.currentBoxesCollectingState = BoxesCalculationState.Collecting;
            // At the first box, determine the number of displayed boxes based on the horizontal and vertical distance.
            // Horizontal deviations contribute at least 5 boxes or the number of boxes that cover the entire distance
            // between aircraft position and the first box. We maintain 5 boxes at least all the time, to get 4 after the
            // fade-in/-out cycles:
            const boxCountByHorizontalDistance = Math.floor(Math.max(5, boxDistance / this.boxToBoxDistance));
            // Vertical deviations contribute by one more box for any 30m altitude deviation:
            const relativeBoxesAlt = Math.abs(this.momentaryAltitudeTarget - this.currentAltMeter.get());
            const boxCountByVerticalDistance = relativeBoxesAlt > 300 ? Math.floor((relativeBoxesAlt - 300) / 30.0) : 0.0;
            this.boxPositionsCount = Math.min(boxCountByHorizontalDistance + boxCountByVerticalDistance, this.maxBoxCount);
          }
        } else {
          // If a box is not inside the fov while collecting, we set the completed state:
          if (this.currentBoxesCollectingState === BoxesCalculationState.Collecting) {
            this.currentBoxesCollectingState = BoxesCalculationState.Completed;
          }
        }
      }
    }
    return isInsideFov;
  }

  /**
   * Calculates the position of boxes along a turn and adds the visible ones.
   * @param circleVec circle vector object for the turn
   * @param boxIndex current box index
   * @returns boxIndex after the turn is calculated
   */
  private computeBoxesAlongTurn(circleVec: Readonly<FlightPathVector>, boxIndex: number): number {
    // Describe the geometry of the turn:
    const geoCircle = FlightPathUtils.setGeoCircleFromVector(circleVec, this.geoCircleCache);
    const turnCenterGeoPoint = FlightPathUtils.getTurnCenterFromCircle(geoCircle, this.geoPointCache);
    const radiusMeter = UnitType.GA_RADIAN.convertTo(FlightPathUtils.getTurnRadiusFromCircle(geoCircle), UnitType.METER);
    const isLeftTurn = FlightPathUtils.getVectorTurnDirection(circleVec) === 'left';

    Pathways3DMath.getMetersFromRef(circleVec.startLat, circleVec.startLon, 0, this.turnBeginPos);
    Pathways3DMath.getMetersFromRef(circleVec.endLat, circleVec.endLon, 0, this.turnEndPos);
    Pathways3DMath.getMetersFromRef(turnCenterGeoPoint.lat, turnCenterGeoPoint.lon, 0, this.turnCenterPos);

    // Handle the angles from the turn center...:
    const turnCenterToBeginVec = Vec3Math.sub(this.turnBeginPos, this.turnCenterPos, this.vec3Cache[1]);
    const turnCenterToBeginBearing = Pathways3DMath.getBearing(turnCenterToBeginVec[0], turnCenterToBeginVec[2]);

    const turnCenterToEndVec = Vec3Math.sub(this.turnEndPos, this.turnCenterPos, this.vec3Cache[1]); // Returns a vector from the turn center to the turn end
    const turnCenterToEndBearing = Pathways3DMath.getBearing(turnCenterToEndVec[0], turnCenterToEndVec[2]);

    // ... to get the turn angle:
    const turnAngle = isLeftTurn ?
      MathUtils.diffAngleDeg(turnCenterToEndBearing, turnCenterToBeginBearing) :
      MathUtils.diffAngleDeg(turnCenterToBeginBearing, turnCenterToEndBearing);

    // Radius to angle conversions:
    const circumference = Math.PI * 2.0 * radiusMeter;
    const remainingAngleToFirstBox = (isLeftTurn ? -360.0 : 360.0) * this.traversingSpilloverDistance / circumference;
    const regularBoxToBoxAngle = (isLeftTurn ? -360.0 : 360.0) * this.boxToBoxDistance / circumference;
    let completedTurnAngle = remainingAngleToFirstBox; // This, box by box, incrementally will accumulate the completed turn angle

    // Now iterate through the boxes along the turn's arc, until completedTurnAngle is larger than the required turn angle:
    while (Math.abs(completedTurnAngle) < turnAngle) {
      // Obtain the box center for the next box:
      const turnCenterToBoxDirectionDeg = NavMath.normalizeHeading(turnCenterToBeginBearing + completedTurnAngle);
      Pathways3DMath.getRadialVector(turnCenterToBoxDirectionDeg, radiusMeter, this.turnCenterToBoxVec);
      Vec3Math.add(this.turnCenterPos, this.turnCenterToBoxVec, this.boxCenterPos);

      // Get the position of the box vs the current aircraft position:
      this.setCurrentToBoxVectors();

      // Now test whether the box is visible (inside fov):
      if (this.handleBoxFovState()) {

        // Rotate turnCenterToBoxVec by 90° to get the box normal, to the left x is negated, to the right z
        this.boxNormalVec[0] = isLeftTurn ? -this.turnCenterToBoxVec[2] : this.turnCenterToBoxVec[2];
        this.boxNormalVec[2] = isLeftTurn ? this.turnCenterToBoxVec[0] : -this.turnCenterToBoxVec[0];

        this.addGenericBox(boxIndex);
        boxIndex++;
      }
      completedTurnAngle += regularBoxToBoxAngle;
      if (this.isCollectingCompleted(boxIndex)) {
        break;
      }
    }
    // Consolidate after the iteration along the turn arc:
    const remainingAngleAfterLastBox = Math.abs(completedTurnAngle) - turnAngle;
    if (remainingAngleAfterLastBox > 0.0) {
      // After this distance along the next section, the next box needs to appear:
      this.traversingSpilloverDistance = remainingAngleAfterLastBox * circumference / 360.0;
    }
    return boxIndex;
  }

  /**
   * Calculates the position of boxes along a great arc (straight legs) and adds the visible ones.
   * @param vector circle vector object for the turn
   * @param boxIndex current box index
   * @returns boxIndex after the boxes are calculated
   */
  private computeBoxesAlongGreatArc(vector: Readonly<FlightPathVector>, boxIndex: number): number {
    const startGeoPoint = new GeoPoint(vector.startLat, vector.startLon);
    const endGeoPoint = new GeoPoint(vector.endLat, vector.endLon);
    const straightLegGeoCircle = FlightPathUtils.setGeoCircleFromVector(vector, this.geoCircleCache);
    let lengthLegVec = UnitType.GA_RADIAN.convertTo(straightLegGeoCircle.distanceAlong(startGeoPoint, endGeoPoint), UnitType.METER);
    const counterClockwise = lengthLegVec > 0 ? 1.0 : -1.0;

    // Prepare the variables for the first box along the straight leg:
    const boxCenterGeoPoint = new GeoPoint(0, 0);
    Pathways3DMath.getMetersFromRef(startGeoPoint.lat, startGeoPoint.lon, 0, this.previousBoxCenterPos);
    lengthLegVec = Math.abs(lengthLegVec);

    // Iterate over all boxes along the straight leg.
    // Start at the spillover distance into the straight leg, but maintain at least 5m if the spillover distance would be
    // very small or zero by accident (to get a valid direction from start point to the first box):
    let distanceAlongLeg = Math.max(5, this.traversingSpilloverDistance);
    while (distanceAlongLeg < lengthLegVec) {
      straightLegGeoCircle.offsetDistanceAlong(startGeoPoint,
        UnitType.METER.convertTo(Math.sign(counterClockwise) * distanceAlongLeg, UnitType.GA_RADIAN), boxCenterGeoPoint);
      Pathways3DMath.getMetersFromRef(boxCenterGeoPoint.lat, boxCenterGeoPoint.lon, 0, this.boxCenterPos);
      Vec3Math.sub(this.boxCenterPos, this.previousBoxCenterPos, this.boxNormalVec); // Retrieve the box normal
      Vec3Math.set(this.boxCenterPos[0], this.boxCenterPos[1], this.boxCenterPos[2], this.previousBoxCenterPos); // Overwrite the previous box center with the new one

      // Get the position of the box vs the current aircraft position:
      this.setCurrentToBoxVectors();
      if (this.handleBoxFovState()) {
        this.addGenericBox(boxIndex);
        boxIndex++;
        if (this.isCollectingCompleted(boxIndex)) {
          break;
        }
      }
      distanceAlongLeg += this.boxToBoxDistance;
    }
    this.traversingSpilloverDistance = distanceAlongLeg - lengthLegVec;
    return boxIndex;
  }

  /**
   * Generic calculation of the corners, based on the boxCenter-vector which positions the box and the
   * boxNormalVecUnit vector which rotates it as needed in world space.
   * @param boxIndex box index
   */
  private addGenericBox(boxIndex: number): void {
    // Record the current color as box color:
    this.boxesColors[boxIndex] = this.currentBoxColor;

    const thisBoxVerticeIndex = boxIndex * 16;
    const thisBoxNormalIndex = boxIndex * 3;

    // Always overwrite the altitude component of the box center as follows:
    this.boxCenterPos[1] = this.boxesAltitudeLookup.get(this.currentToBoxDistance);

    // To get the four corners of the frame, we first reach the left edge of the box:
    Vec3Math.setMagnitude(Vec3Math.cross(this.boxNormalVec, this.straightUpVec, this.boxCenterToLEVec), this.halfBoxWidth, this.boxCenterToLEVec);
    Vec3Math.add(this.boxCenterPos, this.boxCenterToLEVec, this.boxEdgeVec);

    // Store the normal for this box:
    Vec3Math.normalize(this.boxNormalVec, this.boxNormalVec);
    Pathways3DMath.copy(this.boxNormalVec, 0, this.boxesNormalsUnit, thisBoxNormalIndex);

    // Upper left corner:
    this.boxesCornerPositions[thisBoxVerticeIndex] = this.boxEdgeVec[0];
    this.boxesCornerPositions[thisBoxVerticeIndex + 1] = this.boxEdgeVec[1] + this.halfBoxHeight;
    this.boxesCornerPositions[thisBoxVerticeIndex + 2] = this.boxEdgeVec[2];
    this.boxesCornerPositions[thisBoxVerticeIndex + 3] = 1;
    // Lower left corner:
    this.boxesCornerPositions[thisBoxVerticeIndex + 4] = this.boxEdgeVec[0];
    this.boxesCornerPositions[thisBoxVerticeIndex + 5] = this.boxEdgeVec[1] - this.halfBoxHeight;
    this.boxesCornerPositions[thisBoxVerticeIndex + 6] = this.boxEdgeVec[2];
    this.boxesCornerPositions[thisBoxVerticeIndex + 7] = 1;

    // Reverse the vector pointing to the left edge to get the right edge:
    Vec3Math.multScalar(this.boxCenterToLEVec, -1.0, this.boxCenterToLEVec);
    Vec3Math.add(this.boxCenterPos, this.boxCenterToLEVec, this.boxEdgeVec);

    // Lower right corner:
    this.boxesCornerPositions[thisBoxVerticeIndex + 8] = this.boxEdgeVec[0];
    this.boxesCornerPositions[thisBoxVerticeIndex + 9] = this.boxEdgeVec[1] - this.halfBoxHeight;
    this.boxesCornerPositions[thisBoxVerticeIndex + 10] = this.boxEdgeVec[2];
    this.boxesCornerPositions[thisBoxVerticeIndex + 11] = 1;
    // Upper right corner:
    this.boxesCornerPositions[thisBoxVerticeIndex + 12] = this.boxEdgeVec[0];
    this.boxesCornerPositions[thisBoxVerticeIndex + 13] = this.boxEdgeVec[1] + this.halfBoxHeight;
    this.boxesCornerPositions[thisBoxVerticeIndex + 14] = this.boxEdgeVec[2];
    this.boxesCornerPositions[thisBoxVerticeIndex + 15] = 1;
  }
}