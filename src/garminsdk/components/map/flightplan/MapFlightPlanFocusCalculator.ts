import {
  BitFlags, GeoPoint, LatLonInterface, LegDefinition, LegDefinitionFlags, LegType, MapFieldOfView,
  MapFieldOfViewCalculator, MapProjection, ResourceHeap
} from '@microsoft/msfs-sdk';

import { FlightPlanFocus } from '../../../flightplan/FlightPlanFocus';

/**
 * A map range and target solution to fit a flight plan focus.
 */
export type MapFlightPlanFocusRangeTarget = MapFieldOfView;

/**
 * Calculates map projection parameters to fit flight plan foci.
 */
export class MapFlightPlanFocusCalculator {
  private readonly fovCalculator = new MapFieldOfViewCalculator();
  private readonly pointHeap = new ResourceHeap<GeoPoint>(() => new GeoPoint(0, 0), () => { });

  /**
   * Constructor.
   * @param mapProjection This calculator's map projection.
   */
  constructor(private readonly mapProjection: MapProjection) {
  }

  /**
   * Calculates a maximum range and target center for a given flight plan focus such that the terminators of all legs
   * in the focus are visible in this calculator's map projection. If there is only one leg terminator in the specified
   * focus, the calculated range will be equal to 0. If a range and target could not be calculated, NaN will be written
   * to the results.
   * @param focus The array of legs on which to focus.
   * @param margins The margins around the projected map boundaries to respect. Expressed as [left, top, right, bottom].
   * @param ppos The current position of the airplane.
   * @param out The object to which to write the results.
   * @returns The calculated range and target for the specified focus.
   */
  public calculateRangeTarget(
    focus: FlightPlanFocus,
    margins: Float64Array,
    ppos: LatLonInterface,
    out: MapFlightPlanFocusRangeTarget
  ): MapFlightPlanFocusRangeTarget {
    out.range = NaN;
    out.target.set(NaN, NaN);

    if (!focus) {
      return out;
    }

    if (!(focus instanceof Array)) {
      out.range = 0;
      out.target.set(focus);
      return out;
    }

    focus = focus as readonly LegDefinition[];

    const targetWidth = this.mapProjection.getProjectedSize()[0] - margins[0] - margins[2];
    const targetHeight = this.mapProjection.getProjectedSize()[1] - margins[1] - margins[3];

    if (targetWidth * targetHeight <= 0) {
      return out;
    }

    const points = [];

    let currentLat: number | undefined = undefined;
    let currentLon: number | undefined = undefined;

    const len = focus.length;
    for (let i = 0; i < len; i++) {
      const leg = focus[i];

      if (BitFlags.isAll(leg.flags, LegDefinitionFlags.DirectTo) && leg.leg.type === LegType.CF) {
        // Special case for Direct-To legs with user-defined course: PPOS needs to be in focus instead of the start
        // of the leg (which is arbitrary)

        if (!isNaN(ppos.lat) && !isNaN(ppos.lon)) {
          currentLat = ppos.lat;
          currentLon = ppos.lon;
          points.push(ppos);
        }
      } else if (leg.calculated !== undefined) {
        if (
          leg.calculated.startLat !== undefined && leg.calculated.startLon !== undefined
          && leg.calculated.startLat !== currentLat && leg.calculated.startLon !== currentLon
        ) {
          currentLat = leg.calculated.startLat;
          currentLon = leg.calculated.startLon;

          points.push(this.pointHeap.allocate().set(currentLat, currentLon));
        }
      }

      if (
        leg.calculated !== undefined
        && leg.calculated.endLat !== undefined && leg.calculated.endLon !== undefined
        && leg.calculated.endLat !== currentLat && leg.calculated.endLon !== currentLon
      ) {
        currentLat = leg.calculated.endLat;
        currentLon = leg.calculated.endLon;

        points.push(this.pointHeap.allocate().set(currentLat, currentLon));
      }
    }

    this.fovCalculator.calculateFov(this.mapProjection, points, margins, out);

    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (point instanceof GeoPoint) {
        this.pointHeap.free(point);
      }
    }

    return out;
  }
}