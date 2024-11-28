import {
  AdcEvents, AhrsEvents, AirportFacility, BaseLegPredictions, BitFlags, ClockEvents, ConsumerValue, DisplayField, DurationFormatter, EngineEvents, FacilityType,
  FlightPlannerEvents, FlightPlanPredictor, FmcRenderTemplate, Formatter, GNSSEvents, ICAO, LegDefinitionFlags, LegType, MappedSubject, Subject, UnitType
} from '@microsoft/msfs-sdk';

import { WT21AlternatePredictor, WT21FlightPlanPredictorConfiguration, WT21FmsUtils, WT21LNavDataEvents, WT21UnitsUtils } from '@microsoft/msfs-wt21-shared';

import { NumberAndUnitFormat } from '../Framework/FmcFormats';
import { WT21FmcPage } from '../WT21FmcPage';

/**
 * Rounds a number to an integer if > 100, or to a float with one decimal digit otherwise
 *
 * @param distance in nautical miles
 *
 * @returns the rounded number string
 */
function formatNumberForDistance(distance: number): string {
  if (distance > 9_999) {
    return '9999'; // Not sure if this is accurate, but this what I've seen those systems do
  } else if (distance > 100) {
    return Math.trunc(distance).toString();
  } else {
    return distance.toFixed(1);
  }
}

/**
 * Data required to construct a PROG page airport row
 */
interface ProgPageRowData extends BaseLegPredictions {
  /**
   * Whether the leg is previous (ETE blank)
   */
  isPrevious: boolean,
}

/**
 * Formatter for showing a PROG page row
 */
class ProgPageRowFormat implements Formatter<ProgPageRowData> {
  private static readonly DURATION_FORMATTER = DurationFormatter.create('{h}:{mm}', UnitType.MINUTE, 0, '--:--');

  /**
   * Ctor
   *
   * @param style style class for the line
   */
  constructor(
    private readonly style: string,
  ) {
  }

  nullValueString = `-----   --- -:--   -----[${this.style}]`;

  /** @inheritDoc */
  format(value: ProgPageRowData): string {
    const nameString = value.ident?.padEnd(6, ' ') ?? '-----';

    const distance = value.distance;
    const distString = distance !== null && !value.isPrevious ? formatNumberForDistance(distance).padStart(4, ' ') : ' ---';
    const eteMinutes = Math.ceil(value.estimatedTimeEnroute / 60);
    const eteString = value.isPrevious ? '     ' : (value.estimatedTimeEnroute !== null ? ProgPageRowFormat.DURATION_FORMATTER(eteMinutes).padEnd(5, ' ') : '-:-- ');
    const fobString = (): string => {
      if (value.fob !== null && !value.isPrevious) {
        if (WT21UnitsUtils.getIsMetric()) {
          return (UnitType.POUND.convertTo(value.fob, UnitType.KILOGRAM) / 1000).toFixed(1).padStart(5, ' ');
        } else {
          return (value.fob / 1000).toFixed(1).padStart(5, ' ');
        }
      } else {
        return '-----';
      }
    };

    return `${nameString} ${distString} ${eteString}  ${fobString()}[${this.style}]`;
  }
}

/**
 * Progress page
 */
export class ProgPage extends WT21FmcPage {
  // Data

  // 1/2

  private readonly PrevLeg = Subject.create<ProgPageRowData | null>(null);

  private readonly ActiveLeg = Subject.create<ProgPageRowData | null>(null);

  private readonly NextLeg = Subject.create<ProgPageRowData | null>(null);

  private readonly DestLeg = Subject.create<ProgPageRowData | null>(null);

  private readonly AltnLeg = Subject.create<ProgPageRowData | null>(null);

  // 2/2

  private currentUtcSeconds: number | null = null;

  private currentGroundSpeed: number | null = null;

  private currentFuelTotalQuantity: number | null = null;

  private currentFuelFlow: number | null = null;

  private currentFuelWeightPerGallon: number | null = null;

  private readonly altnIcaoSubject = Subject.create<string | null>(null);

  private readonly altnFacilitySubject = Subject.create<AirportFacility | null>(null);

  private currentEffectiveLegIndex = Subject.create<number>(-1);

  private readonly xtkSource = ConsumerValue.create(null, 0).pause();

  private readonly HeadingSubject = Subject.create<number | null>(null);

  private readonly WindDirectionSubject = Subject.create<number | null>(null);

  private readonly WindSpeedSubject = Subject.create<number | null>(null);

  private readonly SatSubject = Subject.create<number | null>(null);

  private readonly IsaTempSubject = Subject.create<number | null>(null);

  private readonly Xtk = Subject.create<number | null>(null);

  private readonly Tas = Subject.create<number | null>(null);

  private readonly SatIsaDev = MappedSubject.create(([sat, isa]) => {
    if (sat === null || isa === null) {
      return null;
    }

    return [sat, sat - isa] as const;
  }, this.SatSubject, this.IsaTempSubject);

  private readonly WindHeadwindComponent = MappedSubject.create(([heading, direction, speed]) => {
    if (heading === null || direction === null || speed === null) {
      return null;
    }

    return Math.trunc(speed * (Math.cos((heading * Math.PI / 180) - (direction * Math.PI / 180))));
  }, this.HeadingSubject, this.WindDirectionSubject, this.WindSpeedSubject);

  private readonly WindCrosswindComponent = MappedSubject.create(([heading, direction, speed]) => {
    if (heading === null || direction === null || speed === null) {
      return null;
    }

    return Math.trunc(speed * (Math.sin((heading * Math.PI / 180) - (direction * Math.PI / 180))));
  }, this.HeadingSubject, this.WindDirectionSubject, this.WindSpeedSubject);

  private readonly Wind = MappedSubject.create(([direction, speed]) => {
    if (direction === null || speed === null) {
      return null;
    }

    return [direction, speed] as const;
  }, this.WindDirectionSubject, this.WindSpeedSubject);

  // Fields

  // 1/2

  private readonly PrevLegField = new DisplayField<ProgPageRowData | null>(this, {
    formatter: new ProgPageRowFormat('blue'),
  });

  private readonly ActiveLegField = new DisplayField<ProgPageRowData | null>(this, {
    formatter: new ProgPageRowFormat('magenta'),
  });

  private readonly NextLegField = new DisplayField<ProgPageRowData | null>(this, {
    formatter: new ProgPageRowFormat('white'),
  });

  private readonly DestLegField = new DisplayField<ProgPageRowData | null>(this, {
    formatter: new ProgPageRowFormat('white'),
  });

  private readonly AltnLegField = new DisplayField<ProgPageRowData | null>(this, {
    formatter: new ProgPageRowFormat('white'),
  });

  // 2/2

  private readonly HeadwindLabel = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: ' HEADWIND[blue]',

      /** @inheritDoc */
      format(value: number): string {
        if (value > 0) {
          return ' HEADWIND[blue]';
        } else {
          return ' TAILWIND[blue]';
        }
      },
    },
  });

  private readonly HeadwindField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: '--- KT',

      /** @inheritDoc */
      format(value: number): string {
        return `${Math.abs(value).toFixed(0)} KT`;
      },
    },
  });

  private readonly CrosswindField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: '- --- KT',

      /** @inheritDoc */
      format(value: number): string {
        const sideString = value > 0 ? 'L' : 'R';
        const valueString = Math.round(Math.abs(value)).toString().padStart(3, ' ');

        return `${sideString} ${valueString} KT`;
      },
    },
  });

  private readonly WindField = new DisplayField<readonly [number, number] | null>(this, {
    formatter: {
      nullValueString: '---T/--- KT',

      /** @inheritDoc */
      format([direction, speed]): string {
        const directionString = Math.round(direction).toString().padStart(3, '0');
        const speedString = Math.round(speed).toString().padStart(3, ' ');

        return `${directionString}T/${speedString} KT`;
      },
    },
  });

  private readonly SatIsaDevField = new DisplayField<readonly [number, number] | null>(this, {
    formatter: {
      nullValueString: ' --°C/ --°C',

      /** @inheritDoc */
      format([sat, isaDev]): string {
        const satString = (sat >= 0 ? '+' : '-') + Math.round(Math.abs(sat)).toString();
        const isaDevString = (isaDev >= 0 ? '+' : '-') + Math.round(Math.abs(isaDev)).toString();

        return `${satString}°C/${isaDevString}°C`;
      },
    },
  });

  private readonly XtkField = new DisplayField<number | null>(this, {
    formatter: {
      nullValueString: '- --- NM',

      /** @inheritDoc */
      format(value: number): string {
        const fixedVal = value > 100 ? Math.round(value) : value;
        const valueString = Math.abs(fixedVal).toFixed(fixedVal > 100 ? 0 : 1);
        const signString = fixedVal > 0 ? 'R' : 'L';

        return `${signString} ${valueString} NM`;
      },
    },
  });

  private readonly TasField = new DisplayField<number | null>(this, {
    formatter: new NumberAndUnitFormat('KT', { padStart: 3 }),
  });

  private readonly predictor = new FlightPlanPredictor(
    this.bus,
    this.fms.flightPlanner,
    Subject.create(WT21FmsUtils.PRIMARY_ACT_PLAN_INDEX),
    this.currentEffectiveLegIndex,
    WT21FlightPlanPredictorConfiguration
  );

  private readonly altnPredictor = new WT21AlternatePredictor(this.fms.flightPlanner, this.fms.facLoader, this.predictor);

  private PREDICTIONS_UPDATE_RATE_HZ = 1 / 2;

  private WIND_UPDATE_RATE_HZ = 1 / 2;

  /** @inheritDoc */
  protected onInit(): void {
    // 2/2

    // Always true north referenced
    this.addBinding(this.bus.getSubscriber<GNSSEvents>().on('zulu_time').atFrequency(this.PREDICTIONS_UPDATE_RATE_HZ).handle((value) => {
      this.currentUtcSeconds = value;
    }));

    this.addBinding(this.bus.getSubscriber<GNSSEvents>().on('ground_speed').atFrequency(this.PREDICTIONS_UPDATE_RATE_HZ).handle((value) => {
      this.currentGroundSpeed = Math.max(150, value);
    }));

    this.addBinding(this.bus.getSubscriber<EngineEvents>().on('fuel_total').atFrequency(this.PREDICTIONS_UPDATE_RATE_HZ).handle((value) => {
      this.currentFuelTotalQuantity = value;
    }));

    this.addBinding(this.bus.getSubscriber<EngineEvents>().on('fuel_flow_total').atFrequency(this.PREDICTIONS_UPDATE_RATE_HZ).handle((value) => {
      this.currentFuelFlow = value;
    }));

    this.addBinding(this.bus.getSubscriber<EngineEvents>().on('fuel_weight_per_gallon').atFrequency(this.PREDICTIONS_UPDATE_RATE_HZ).handle((value) => {
      return this.currentFuelWeightPerGallon = value;
    }));

    this.addBinding(this.bus.getSubscriber<AhrsEvents>().on('hdg_deg_true').atFrequency(this.WIND_UPDATE_RATE_HZ).handle((heading) => {
      this.HeadingSubject.set(heading);
    }));

    this.addBinding(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_direction').atFrequency(this.WIND_UPDATE_RATE_HZ).handle((value) => {
      this.WindDirectionSubject.set(value);
    }));

    this.addBinding(this.bus.getSubscriber<AdcEvents>().on('ambient_wind_velocity').atFrequency(this.WIND_UPDATE_RATE_HZ).handle((value) => {
      this.WindSpeedSubject.set(value);
    }));

    this.addBinding(this.bus.getSubscriber<AdcEvents>().on('ambient_temp_c').atFrequency(1).handle((value) => {
      this.SatSubject.set(value);
    }));

    this.addBinding(this.bus.getSubscriber<AdcEvents>().on('isa_temp_c').atFrequency(1).handle((value) => {
      this.IsaTempSubject.set(value);
    }));

    this.addBinding(this.bus.getSubscriber<AdcEvents>().on('tas').atFrequency(1).handle((value) => {
      this.Tas.set(value);
    }));

    this.xtkSource.setConsumer(this.bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_xtk'));
    this.addBinding(this.xtkSource);

    this.addBinding(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(1).handle(() => {
      this.Xtk.set(this.xtkSource.get());
    }));

    this.HeadwindLabel.bind(this.WindHeadwindComponent);
    this.HeadwindField.bind(this.WindHeadwindComponent);
    this.CrosswindField.bind(this.WindCrosswindComponent);
    this.WindField.bind(this.Wind);
    this.SatIsaDevField.bind(this.SatIsaDev);
    this.XtkField.bind(this.Xtk);
    this.TasField.bind(this.Tas);

    // 1/2

    this.addBinding(this.bus.getSubscriber<WT21LNavDataEvents>().on('lnavdata_nominal_leg_index').whenChanged().handle((index) => {
      this.currentEffectiveLegIndex.set(Math.max(0, index));

      this.handleFlightPlanChange();
      this.handlePeriodicallyRecomputePredictions();
    }));

    this.addBinding(this.bus.getSubscriber<FlightPlannerEvents>().on('fplCopied').handle(() => {
      this.handleFlightPlanChange();
      this.handlePeriodicallyRecomputePredictions();
    }));

    this.addBinding((this.bus.getSubscriber<ClockEvents>().on('simTime').handle(() => {
      if (!this.firstCompleteUpdate) {
        this.handlePeriodicallyRecomputePredictions();
      }
    }
    )));

    this.addBinding(this.bus.getSubscriber<ClockEvents>().on('simTime').atFrequency(this.PREDICTIONS_UPDATE_RATE_HZ).handle(() => {
      this.handlePeriodicallyRecomputePredictions();
    }));

    this.addBinding(this.altnFacilitySubject.sub(() => {
      this.handlePeriodicallyRecomputePredictions();
    }));

    this.PrevLegField.bind(this.PrevLeg);
    this.ActiveLegField.bind(this.ActiveLeg);
    this.NextLegField.bind(this.NextLeg);
    this.DestLegField.bind(this.DestLeg);
    this.AltnLegField.bind(this.AltnLeg);
  }

  /** @inheritDoc */
  protected onResume(): void {
    this.predictor.update();
    this.altnPredictor.update().catch();
    this.handleFlightPlanChange();
    this.handlePeriodicallyRecomputePredictions();
  }

  private firstCompleteUpdate = false;

  /**
   * Recomputes predictions on LNAV DTG change
   */
  private handlePeriodicallyRecomputePredictions(): void {
    this.predictor.update();
    this.altnPredictor.update().catch();

    if (!this.predictor.planAndPredictionsValid) {
      return;
    }

    if (this.currentGroundSpeed && this.currentFuelFlow && this.currentFuelTotalQuantity && this.currentFuelWeightPerGallon
      && this.currentEffectiveLegIndex !== null && this.currentEffectiveLegIndex.get() >= 1
    ) {
      if (!this.firstCompleteUpdate) {
        this.firstCompleteUpdate = true;
      }

      const plan = this.fms.getPrimaryFlightPlan();

      // Active leg

      const activeLeg = plan.getLeg(this.currentEffectiveLegIndex.get());
      const activeLegPredictions = this.predictor.predictionsForLegIndex(this.currentEffectiveLegIndex.get());

      if (activeLegPredictions) {
        this.ActiveLeg.set({ isPrevious: false, ...activeLegPredictions });
      } else {
        this.ActiveLeg.set(null);
      }

      // Previous leg

      let prevLegIndex = activeLeg && BitFlags.isAll(activeLeg?.flags, LegDefinitionFlags.DirectTo)
        ? this.currentEffectiveLegIndex.get() - 4
        : this.currentEffectiveLegIndex.get() - 1;

      // Skip all discontinuities
      while (plan.getLeg(prevLegIndex).leg.type === LegType.Discontinuity || plan.getLeg(prevLegIndex).leg.type === LegType.ThruDiscontinuity) {
        prevLegIndex--;
      }

      const prevLegPredictions = this.predictor.predictionsForLegIndex(prevLegIndex);

      if (prevLegPredictions) {
        this.PrevLeg.set({ isPrevious: true, ...prevLegPredictions });
      } else {
        this.PrevLeg.set(null);
      }

      // Next leg

      const immediateNextLeg = plan.tryGetLeg(this.currentEffectiveLegIndex.get() + 1);

      if (immediateNextLeg) {
        const nextLegIndex = immediateNextLeg.leg.type === LegType.Discontinuity || immediateNextLeg.leg.type === LegType.ThruDiscontinuity
          ? this.currentEffectiveLegIndex.get() + 2
          : this.currentEffectiveLegIndex.get() + 1;

        const nextLegPredictions = this.predictor.predictionsForLegIndex(nextLegIndex);

        if (nextLegPredictions) {
          this.NextLeg.set({ isPrevious: false, ...nextLegPredictions });
        } else {
          this.NextLeg.set(null);
        }
      } else {
        // There are no more legs
        this.NextLeg.set(null);
      }

      // Destination

      if (this.fms.facilityInfo.destinationFacility) {
        const predictions = this.predictor.getDestinationPrediction(this.fms.facilityInfo.destinationFacility);

        if (predictions) {
          this.DestLeg.set({ isPrevious: false, ...predictions });
        } else {
          this.DestLeg.set(null);
        }
      } else {
        this.DestLeg.set(null);
      }

      // Altn

      const altnPredictions = this.altnPredictor.alternatePredictions;

      if (altnPredictions) {
        this.AltnLeg.set({ isPrevious: false, ...altnPredictions });
      } else {
        this.AltnLeg.set(null);
      }
    }
  }

  /**
   * Recomputes initial predictions on a flight plan change
   */
  private handleFlightPlanChange(): void {
    if (this.currentEffectiveLegIndex === null) {
      return;
    }

    if (this.fms.hasPrimaryFlightPlan()) {
      const plan = this.fms.getPrimaryFlightPlan();

      const activeLeg = plan.tryGetLeg(this.currentEffectiveLegIndex.get());

      const prevLegIndex = activeLeg && BitFlags.isAll(activeLeg?.flags, LegDefinitionFlags.DirectTo)
        ? this.currentEffectiveLegIndex.get() - 4
        : this.currentEffectiveLegIndex.get() - 1;

      const prevLeg = plan.tryGetLeg(prevLegIndex);
      if (prevLeg) {
        let distance = prevLeg.calculated?.distanceWithTransitions ?? null;
        distance = distance !== null ? UnitType.METER.convertTo(distance, UnitType.NMILE) : 0;

        this.PrevLeg.set({
          kind: 'activeOrUpcoming',
          ident: prevLeg.name ?? '',
          isPrevious: true,
          estimatedTimeOfArrival: 0,
          estimatedTimeEnroute: 0,
          distance,
          fob: null,
        });
      } else {
        this.PrevLeg.set(null);
      }

      if (activeLeg) {
        let distance = activeLeg.calculated?.distanceWithTransitions ?? null;
        distance = distance !== null ? UnitType.METER.convertTo(distance, UnitType.NMILE) : 0;

        this.ActiveLeg.set({
          kind: 'activeOrUpcoming',
          ident: activeLeg.name ?? '',
          isPrevious: false,
          estimatedTimeOfArrival: 0,
          estimatedTimeEnroute: 0,
          distance,
          fob: 0,
        });
      } else {
        this.ActiveLeg.set(null);
      }

      const nextLeg = plan.tryGetLeg(this.currentEffectiveLegIndex.get() + 1);
      if (nextLeg) {
        let distance = nextLeg.calculated?.distanceWithTransitions ?? null;
        distance = distance !== null ? UnitType.METER.convertTo(distance, UnitType.NMILE) : 0;

        this.NextLeg.set({
          kind: 'activeOrUpcoming',
          ident: nextLeg.name ?? '',
          isPrevious: false,
          estimatedTimeOfArrival: 0,
          estimatedTimeEnroute: 0,
          distance,
          fob: 0,
        });
      } else {
        this.NextLeg.set(null);
      }

      if (this.fms.facilityInfo.destinationFacility) {
        const ident = ICAO.getIdent(this.fms.facilityInfo.destinationFacility.icao);

        this.DestLeg.set({
          kind: 'activeOrUpcoming',
          ident,
          isPrevious: false,
          estimatedTimeOfArrival: 0,
          estimatedTimeEnroute: 0,
          distance: 0,
          fob: 0,
        });
      } else {
        this.DestLeg.set(null);
      }

      const altnData = plan.getUserData(WT21FmsUtils.USER_DATA_KEY_ALTN);

      if (altnData) {
        this.fms.facLoader.getFacility(FacilityType.Airport, altnData as string).then((facility) => {
          if (facility) {
            this.altnFacilitySubject.set(facility);
          }
        }).catch();
      } else {
        this.altnFacilitySubject.set(null);
      }
    }
  }

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    const fuelUnit = WT21UnitsUtils.getIsMetric() ? WT21UnitsUtils.getUnitString(UnitType.KILOGRAM) : WT21UnitsUtils.getUnitString(UnitType.POUND);
    return [
      [
        [' PROGRESS[blue]', this.PagingIndicator, ''],
        [' LAST  DIST[blue]', `ETE  FUEL-${fuelUnit}[blue]`],
        [this.PrevLegField],
        [' TO[blue]', ''],
        [this.ActiveLegField],
        [' NEXT[blue]', ''],
        [this.NextLegField],
        [' DEST[blue]', ''],
        [this.DestLegField],
        [' ALTN[blue]', ''],
        [this.AltnLegField],
        [' NAVIGATION[blue]', ''],
        ['GNSS1', ''],
      ],
      [
        [' PROGRESS[blue]', this.PagingIndicator, ''],
        [this.HeadwindLabel, 'CROSSWIND [blue]'],
        [this.HeadwindField, this.CrosswindField],
        [' WIND[blue]', 'SAT/ISA DEV [blue]'],
        [this.WindField, this.SatIsaDevField],
        [' XTK[blue]', 'TAS [blue]'],
        [this.XtkField, this.TasField],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', 'POS ACCURACY[blue]'],
        ['', '', '0.1'],
      ],
    ];
  }

}
