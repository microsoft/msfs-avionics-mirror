import {
  AdcEvents, ControlEvents, DisplayField, FlightPathUtils, FlightPathVectorFlags, FlightPlan, FlightPlanLeg, FlightPlannerEvents, FmcRenderTemplate, GNSSEvents,
  HoldMaxSpeedRule, HoldUtils, ICAO, LegDefinition, LegTurnDirection, LegType, LNavEvents, MagVar, MappedSubject, RawFormatter, Subject, SwitchLabel,
  TextInputField, UnitType
} from '@microsoft/msfs-sdk';

import { WT21FmsUtils } from '@microsoft/msfs-wt21-shared';

import { WT21Fms } from '../FlightPlan/WT21Fms';
import { SimpleStringFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 * Contains the inbound course and turn direction of a hold
 */
type HoldDirectionParameters = [number, 'L' | 'R']

/**
 * Contains the inbound course and turn direction of a hold. For input only.
 */
type HoldDirectionInputParameters = [number | null, 'L' | 'R' | null]

/**
 * Store for FPLN HOLD page
 */
export class FplnHoldPageStore {

  /**
   * Contains current ground speed
   */
  readonly GroundSpeedSubject = Subject.create<number>(150);

  /**
   * Contains current MSL altitude
   */
  readonly MslAltitudeSubject = Subject.create<number>(1_000);

  /**
   * Contains MSL altitude used for calculating hold speed. Only set when hold leg is selected.
   */
  readonly FrozenMslAltitudeSubject = Subject.create<number>(1_000);

  /**
   * Contains whether LNAV is suspended
   */
  readonly LnavSuspended = Subject.create<boolean>(false);

  /**
   * Contains index of hold leg in the plan
   */
  readonly HoldLegIndex = Subject.create<number | null>(null);

  /**
   * Contains hold leg
   */
  readonly HoldLegSubject = Subject.create<LegDefinition | null>(null);

  /**
   * Contains whether the hold leg is PPOS
   */
  readonly HoldLegIsPpos = Subject.create<boolean>(false);

  /**
   * Contains hold leg data
   */
  readonly HoldLeg = Subject.create<LegDefinition | null>(null);

  /**
   * Contains selected speed mode data
   */
  readonly HoldSpeedRule = Subject.create<HoldMaxSpeedRule>(0);

  /**
   * Contains data for display of hold speed
   */
  readonly HoldSpeed = MappedSubject.create(([altitude, rule]) => {
    return HoldUtils.getHoldSpeed(altitude, rule);
  },
    this.FrozenMslAltitudeSubject,
    this.HoldSpeedRule,
  );

  /**
   * Contains selected inbound course
   */
  readonly InboundCourse = Subject.create<number>(0);

  /**
   * Contains selected turn direction
   */
  readonly TurnDirection = Subject.create<'L' | 'R'>('R');

  readonly InboundCourseTurnDirection = MappedSubject.create(
    (inputs): HoldDirectionParameters => [inputs[0], inputs[1]] as HoldDirectionParameters,
    this.InboundCourse,
    this.TurnDirection,
  );

}

/**
 * Controller for FPLN HOL Dpage
 */
class FplnHoldPageController {
  /**
   * Ctor
   *
   * @param page page instance
   * @param fms FMS instance
   * @param store store instance
   */
  constructor(
    private readonly page: FplnHoldPage,
    private readonly fms: WT21Fms,
    private readonly store: FplnHoldPageStore,
  ) {
  }

  /**
   * Initializes FPLN HOLD page data
   *
   * @param atLeg hold parent leg index
   *
   * @throws if `atLeg` is invalid or a new hold leg cannot be created
   */
  initializeData(atLeg: number): void {
    this.store.FrozenMslAltitudeSubject.set(this.store.MslAltitudeSubject.get());

    const targetLeg = this.fms.getPlanForFmcRender().tryGetLeg(atLeg);
    const targetLegIsPpos = targetLeg?.leg.fixIcao === ICAO.emptyIcao;

    if (!targetLeg) {
      throw new Error('[FMC/FplnHoldPage] FplnHoldPage created with bad targetLeg');
    }

    const alreadyHold = WT21FmsUtils.isHoldAtLeg(targetLeg.leg.type);

    if (alreadyHold) {
      // Leg is already a hold, edit it

      this.store.HoldLegIndex.set(atLeg);
      this.store.HoldLegSubject.set(targetLeg);
      this.store.HoldLegIsPpos.set(targetLegIsPpos);
      this.store.HoldLeg.set(targetLeg);
    } else {
      // Have to create a new hold

      let course = 100;
      if (targetLeg.calculated) {
        const trueCourse = FlightPathUtils.getLegFinalCourse(targetLeg.calculated);

        if (trueCourse !== undefined) {
          course = MagVar.trueToMagnetic(trueCourse, targetLeg.calculated.courseMagVar);
        }
      }

      const newLeg = FlightPlan.createLeg({
        type: LegType.HM,
        turnDirection: LegTurnDirection.Left,
        distance: 1,
        distanceMinutes: true,
        fixIcao: targetLeg.leg.fixIcao,
        course,
      });

      const segmentIndex = this.fms.getPlanForFmcRender().getSegmentIndex(atLeg);
      const segment = this.fms.getPlanForFmcRender().getSegment(segmentIndex);

      const created = this.fms.insertHold(segmentIndex, atLeg - segment.offset, newLeg);

      if (created) {
        const insertedLeg = this.fms.getPlanForFmcRender().tryGetLeg(atLeg + 1);

        if (!insertedLeg || insertedLeg.leg.type !== LegType.HM) {
          throw new Error('[FMC/FplnHoldPage] Could not create new HM leg');
        }

        this.store.HoldLegIndex.set(atLeg + 1);
        this.store.HoldLegSubject.set(insertedLeg);
        this.store.HoldLeg.set(insertedLeg);
      }
    }
  }

  /**
   * Applies a modification to the hold leg being edited
   *
   * @param partial data to modify
   */
  applyModification(partial: Partial<FlightPlanLeg>): void {
    const legIndex = this.store.HoldLegIndex.get();

    if (legIndex) {
      const leg = FlightPlan.createLeg({
        ...this.store.HoldLegSubject.get()?.leg,
        ...partial,
      });

      const segmentIndex = this.fms.getPlanForFmcRender().getSegmentIndex(legIndex);
      const segment = this.fms.getPlanForFmcRender().getSegment(segmentIndex);

      if (leg.fixIcao === ICAO.emptyIcao) {
        this.fms.insertPposHold(leg);
      } else {
        this.fms.insertHold(segmentIndex, legIndex - segment.offset - 1, leg);
      }

      this.initializeData(legIndex);

      this.page.invalidate();
    }
  }
}

/**
 * FPLN HOLD page
 */
export class FplnHoldPage extends WT21FmcPage {

  private readonly store = new FplnHoldPageStore();

  private readonly controller = new FplnHoldPageController(this, this.fms, this.store);

  private readonly FixIdent = MappedSubject.create(([leg, isPpos]) => {
    if (isPpos) {
      return 'PPOS'; // No ref for this, but it is logical
    } else if (leg) {
      return ICAO.getIdent(leg.leg.fixIcao);
    } else {
      return null;
    }
  }, this.store.HoldLegSubject, this.store.HoldLegIsPpos);

  private readonly FixIdentField = new DisplayField<string | null>(this, {
    formatter: {
      ...RawFormatter,

      nullValueString: '-----',
    },
  });

  private readonly HoldSpeedField = new SwitchLabel(this, {
    optionStrings: ['FAA', 'ICAO'],
  });

  private readonly EntryTypeField = new DisplayField<LegDefinition | null>(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format(value: LegDefinition): string {
        const lastIngressVector = value.calculated?.ingress?.[value.calculated?.ingress.length - 1];

        if (!lastIngressVector) {
          return '';
        }

        if (lastIngressVector?.flags & FlightPathVectorFlags.HoldDirectEntry) {
          return 'DIRECT';
        } else if (lastIngressVector?.flags & FlightPathVectorFlags.HoldTeardropEntry) {
          return 'TEARDROP';
        } else if (lastIngressVector?.flags & FlightPathVectorFlags.HoldParallelEntry) {
          return 'PARALLEL';
        }

        return '';
      },
    },
    style: '[s-text]',
  });

  private readonly QuadRadialField = new DisplayField<HoldDirectionParameters | null>(this, {
    formatter: {
      nullValueString: '--/---°',

      /** @inheritDoc */
      format(value: HoldDirectionParameters): string {
        const radial = value[0];

        const quad = HoldUtils.getDirectionString(radial, true);

        const radialString = Math.trunc(radial).toString().padStart(3, '0');

        return `${quad}/${radialString}°`;
      },
    },
  });

  private readonly MaxKiasField: DisplayField<[number, boolean] | null> = new DisplayField<[number, boolean] | null>(this, {
    formatter: {
      nullValueString: '---',

      /** @inheritDoc */
      format([speed, isMach]: [number, boolean]): string {
        if (isMach) {
          return `M ${speed}`;
        } else {
          return Math.round(speed).toString();
        }
      },
    },
  });

  private readonly InbdCrsDirField = new TextInputField<HoldDirectionParameters, HoldDirectionInputParameters | null>(this, {
    formatter: {
      nullValueString: '---°/-',

      /** @inheritDoc */
      format(value: HoldDirectionParameters): string {
        const inboundCourseString = `${Math.trunc(value[0]).toString().padStart(3, '0')}°`;

        return `${inboundCourseString}/${value[1]} TURN`;
      },

      /** @inheritDoc */
      parse(input: string): HoldDirectionInputParameters | null {
        const REGEX = /^(\d{1,3})?\/?([LR])?$/;

        const match = REGEX[Symbol.match](input);

        if (!match) {
          return null;
        }

        const [, course, direction] = match;

        const courseInt = parseInt(course);

        return [Number.isNaN(courseInt) ? null : courseInt, direction as 'L' | 'R' | null];
      },
    },
    onModified: async (newValue): Promise<string | boolean> => {
      if (newValue) {
        const [course, turnDir] = newValue;

        if (course && turnDir) {
          this.controller.applyModification({
            course,
            turnDirection: turnDir === 'R' ? LegTurnDirection.Right : LegTurnDirection.Left,
          });
        } else if (course) {
          this.controller.applyModification({
            course,
          });
        } else {
          this.controller.applyModification({
            turnDirection: turnDir === 'R' ? LegTurnDirection.Right : LegTurnDirection.Left,
          });
        }
      } else {
        this.controller.applyModification({
          course: 100,
          turnDirection: LegTurnDirection.Right,
        });
      }

      return true;
    },
  });

  private readonly LegTimeField = new TextInputField<LegDefinition | null, number>(this, {
    formatter: {
      nullValueString: '-.-[d-text] MIN',

      /** @inheritDoc */
      format: (value: LegDefinition): string => {
        const distanceInMinutes = value.leg.distanceMinutes;

        let displayedTime: number;
        if (distanceInMinutes) {
          displayedTime = value.leg.distance;
        } else {
          displayedTime = WT21FmsUtils.estimateSecondsForDistance(UnitType.NMILE.convertFrom(value.leg.distance, UnitType.METER), this.store.GroundSpeedSubject.get()) / 60;
        }

        const timeString = displayedTime.toFixed(1);

        return `${timeString}[${distanceInMinutes ? 'd-text' : 's-text'}] MIN`;
      },

      /** @inheritDoc */
      parse(input: string): number | null {
        const float = parseFloat(input);

        if (Number.isNaN(float) || float <= 0) {
          return null;
        }

        return float;
      },
    },
    onModified: async (distance: number): Promise<string | boolean> => {
      this.controller.applyModification({
        distanceMinutes: true,
        distance,
      });

      return true;
    },
    style: '[s-text]',
  });

  private readonly LegDistanceField = new TextInputField<LegDefinition | null, number>(this, {
    formatter: {
      nullValueString: '-.-[d-text] NM',

      /** @inheritDoc */
      format: (value: LegDefinition): string => {
        const distanceInNM = !value.leg.distanceMinutes;

        let displayedDistance: number;
        if (distanceInNM) {
          displayedDistance = UnitType.NMILE.convertFrom(value.leg.distance, UnitType.METER);
        } else {
          displayedDistance = WT21FmsUtils.estimateDistanceForSeconds(value.leg.distance * 60, this.store.GroundSpeedSubject.get());
        }

        const timeString = displayedDistance.toFixed(1);

        return `${timeString}[${distanceInNM ? 'd-text' : 's-text'}] NM`;
      },

      /** @inheritDoc */
      parse(input: string): number | null {
        const float = parseFloat(input);

        if (Number.isNaN(float) || float <= 0) {
          return null;
        }

        return float;
      },
    },
    onModified: async (value: number): Promise<string | boolean> => {
      this.controller.applyModification({
        distanceMinutes: false,
        distance: UnitType.METER.convertFrom(value, UnitType.NMILE),
      });

      return true;
    },
    style: '[s-text]',
  });

  private readonly CancelModField = new DisplayField(this, {
    formatter: new SimpleStringFormat('<CANCEL MOD'),
    onSelected: async (): Promise<string | boolean> => {
      this.fms.cancelMod();

      const holdLegIndex = this.store.HoldLegIndex.get();

      if (holdLegIndex !== null) {
        this.invalidate();
      }

      return true;
    },
  });

  private readonly ExitHoldField = new DisplayField<boolean>(this, {
    formatter: {
      nullValueString: 'EXIT HOLD>',

      /** @inheritDoc */
      format(value: boolean): string {
        if (value) {
          return 'EXIT HOLD>';
        } else {
          return 'CANCEL EXIT>';
        }
      },
    },
    onSelected: async (): Promise<string | boolean> => {
      this.bus.getPublisher<ControlEvents>().pub('suspend_sequencing', !this.store.LnavSuspended.get());
      return true;
    },
  });

  /** @inheritDoc */
  protected onInit(): void {
    const bus = this.bus;

    this.addBinding(bus.getSubscriber<GNSSEvents>().on('ground_speed').handle((value) => {
      this.store.GroundSpeedSubject.set(Math.max(150, value));
    }));

    this.addBinding(bus.getSubscriber<AdcEvents>().on('indicated_alt').handle((value) => {
      this.store.MslAltitudeSubject.set(value);
    }));

    this.addBinding(bus.getSubscriber<AdcEvents>().on('indicated_alt').handle((value) => {
      this.store.MslAltitudeSubject.set(value);
    }));

    this.addBinding(bus.getSubscriber<FlightPlannerEvents>().on('fplCopied').handle(() => {
      const index = this.store.HoldLegIndex.get();

      if (index) {
        this.controller.initializeData(index);

        this.invalidate();
      }
    }));

    this.addBinding(bus.getSubscriber<LNavEvents>().on('lnav_is_suspended').handle((state) => {
      if (state !== null) {
        this.store.LnavSuspended.set(state);
      }
    }));

    this.FixIdentField.bind(this.FixIdent);
    this.HoldSpeedField.bind(this.store.HoldSpeedRule);
    this.EntryTypeField.bind(this.store.HoldLeg);
    this.QuadRadialField.bind(this.store.InboundCourseTurnDirection);
    this.MaxKiasField.bind(this.store.HoldSpeed);
    this.InbdCrsDirField.bind(this.store.InboundCourseTurnDirection);
    this.LegTimeField.bind(this.store.HoldLeg);
    this.LegDistanceField.bind(this.store.HoldLeg);
    this.ExitHoldField.bind(this.store.LnavSuspended);
  }

  /** @inheritDoc */
  protected onResume(): void {
    const atLeg = this.params.get('atLeg');

    if (!atLeg || typeof atLeg !== 'number') {
      throw new Error('[FMC/FplnHoldPage] Cannot create FplnHoldPage without number atLeg in router.params');
    }

    this.controller.initializeData(atLeg);
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    this.updateDataFromHoldLeg();

    return [
      [
        [`${this.fms.getPlanIndexForFmcPage() === WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX ? 'ACT' : 'MOD'}[white] FPLN HOLD[blue]`, this.PagingIndicator],
        [' FIX[blue]', 'HOLD SPD[blue] ', 'ENTRY[blue] '],
        [this.FixIdentField, this.HoldSpeedField, this.EntryTypeField],
        [' QUAD/RADIAL[blue]', 'MAX KIAS[blue] '],
        [this.QuadRadialField, this.MaxKiasField],
        [' INBD CRS/DIR[blue]', 'FIX ETA[blue] '],
        [this.InbdCrsDirField, '--:--[disabled s-text]'],
        [' LEG TIME[blue]', 'EFC TIME[blue] '],
        [this.LegTimeField, '--:--[disabled]'],
        [' LEG DIST[blue]'],
        [this.LegDistanceField, 'NEW HOLD>'],
        ['', '', '------------------------[blue]'],
        [this.fms.planInMod.get() ? this.CancelModField : '', this.ExitHoldField],
      ],
    ];
  }

  /**
   * Updates the data from the displayed hold leg
   */
  private updateDataFromHoldLeg(): void {
    const leg = this.store.HoldLegSubject.get();

    if (leg) {
      this.store.InboundCourse.set(leg.leg.course);
      this.store.TurnDirection.set(leg.leg.turnDirection === LegTurnDirection.Left ? 'L' : 'R');
    }
  }

}
