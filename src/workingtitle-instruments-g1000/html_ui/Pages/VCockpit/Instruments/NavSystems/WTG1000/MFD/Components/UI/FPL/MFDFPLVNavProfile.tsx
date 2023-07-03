import {
  AdcEvents, ComputedSubject, ConsumerSubject, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, EventBus, FlightPlanner, FocusPosition,
  FSComponent, GNSSEvents, LegDefinition, MappedSubject, MathUtils, NumberFormatter, NumberUnitSubject, Subject, Subscribable, UnitType, VNavControlEvents,
  VNavEvents, VNavState, VNode
} from '@microsoft/msfs-sdk';

import { DefaultVNavDataProvider, Fms } from '@microsoft/msfs-garminsdk';

import { G1000ControlEvents } from '../../../../Shared/G1000Events';
import { NumberUnitDisplay } from '../../../../Shared/UI/Common/NumberUnitDisplay';
import { G1000UiControl, G1000UiControlProps } from '../../../../Shared/UI/G1000UiControl';
import { UiControl } from '../../../../Shared/UI/UiControl';

import './MFDFPLVNavProfile.css';

/**
 * The props on the MFDFPLVNavProfile component.
 */
interface MFDFPLVNavProfileProps extends G1000UiControlProps {
  /** The event bus to use. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of the FMS. */
  fms: Fms;
}

/**
 * A component that displays the active VNAV profile on the MFD flight plan page.
 */
export class MFDFPLVNavProfile extends G1000UiControl<MFDFPLVNavProfileProps> {
  private readonly waypointSubject = ComputedSubject.create<string | undefined, string>(undefined, name => {
    if (name === undefined || this.vnavState.get() === VNavState.Disabled) {
      return '_ _ _ _ _ _ _ _ _ _ _ _';
    } else {
      return name;
    }
  });

  private readonly targetAlt = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));
  private readonly timeToTarget = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  private readonly targetVs = NumberUnitSubject.create(UnitType.FPM.createNumber(NaN));
  private readonly requiredVs = NumberUnitSubject.create(UnitType.FPM.createNumber(NaN));
  private readonly verticalDev = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  private readonly groundSpeed = ConsumerSubject.create(null, NaN).pause();
  private readonly altitude = ConsumerSubject.create(null, NaN).pause();
  private readonly vnavState = ConsumerSubject.create(null, VNavState.Disabled).pause();

  private readonly fpa = Subject.create<number>(0);
  private readonly timeToTod = Subject.create(NaN);
  private readonly timeToBod = Subject.create(NaN);
  private readonly distanceToTod = Subject.create(NaN);

  private vnavDataProvider: DefaultVNavDataProvider | undefined;
  private isPaused = true;

  private detailsSubject = MappedSubject.create(
    ([alt, gs, todDist, todTime, bodTime, constraintAlt]): boolean => {
      const constraintAltFeet = constraintAlt.asUnit(UnitType.FOOT);
      if (!isNaN(constraintAltFeet) && alt > constraintAltFeet - 100 && gs > 30) {
        return (todDist > 0 && todDist < 999999 && todTime <= 60) || (bodTime > 0 && todTime <= 0);
      } else {
        return false;
      }
    },
    this.altitude, this.groundSpeed, this.distanceToTod, this.timeToTod, this.timeToBod, this.targetAlt
  );

  private todBodLabel = MappedSubject.create(
    ([vnavState, todDistance, details]): string => {
      if (vnavState !== VNavState.Disabled && details && todDistance < 100) {
        return 'BOD';
      } else {
        return 'TOD';
      }
    },
    this.vnavState, this.distanceToTod, this.detailsSubject
  );

  private secsToTarget = MappedSubject.create(
    ([todTime, bodTime, todBodLabel]): number => {
      if (todBodLabel === 'BOD') {
        return bodTime;
      } else {
        return todTime;
      }
    },
    this.timeToTod, this.timeToBod, this.todBodLabel
  );



  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);


    const sub = this.props.bus.getSubscriber<GNSSEvents & AdcEvents & VNavEvents & G1000ControlEvents>();
    this.groundSpeed.setConsumer(sub.on('ground_speed').withPrecision(1));
    this.altitude.setConsumer(sub.on('indicated_alt').withPrecision(0));
    this.vnavState.setConsumer(sub.on('vnav_state'));
    sub.on('vnv_prof_key').handle(() => this.focus(FocusPosition.First));

    this.vnavDataProvider = new DefaultVNavDataProvider(this.props.bus, this.props.fms, 1);
    this.vnavDataProvider.init();

    this.vnavDataProvider.fpa.pipe(this.fpa);
    this.vnavDataProvider.verticalSpeedTarget.pipe(this.targetVs, val => val ?? NaN);
    this.vnavDataProvider.vsRequired.pipe(this.requiredVs, val => this.detailsSubject.get() ? val ?? NaN : NaN);
    this.vnavDataProvider.timeToTod.pipe(this.timeToTod, (val: number | null): number => val ?? NaN);
    this.vnavDataProvider.timeToBod.pipe(this.timeToBod, (val: number | null): number => val ?? NaN);
    this.vnavDataProvider.distanceToTod.pipe(this.distanceToTod, val => UnitType.NMILE.convertTo(val ?? NaN, UnitType.METER));

    this.vnavDataProvider.activeConstraintLeg.map((def: LegDefinition | null): number => def?.verticalData.altitude1 ?? NaN).pipe(
      this.targetAlt, (meters: number | null): number => {
        if (this.vnavState.get() !== VNavState.Disabled && meters !== null) {
          return meters > 0 ? UnitType.METER.convertTo(meters, UnitType.FOOT) : NaN;
        } else {
          return NaN;
        }
      });

    // TODO Move this map into the pipe.
    this.vnavDataProvider.activeConstraintLeg.map((def: LegDefinition | null): string | undefined => {
      return this.vnavState.get() !== VNavState.Disabled ? def?.name ?? undefined : undefined;
    }).pipe(this.waypointSubject);

    this.vnavDataProvider.verticalDeviation.pipe(this.verticalDev, (feet: number | null): number => {
      if (!this.detailsSubject.get() || feet === null || Math.abs(feet) > 10000) {
        return NaN;
      } else {
        return feet;
      }
    });

    this.secsToTarget.pipe(this.timeToTarget);
  }

  /**
   * Pauses updates for this component. While paused, this component will not update its displayed values.
   */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.vnavDataProvider?.pause();
    this.groundSpeed.pause();
    this.altitude.pause();
    this.vnavState.pause();
    this.isPaused = true;
  }

  /**
   * Resumes updates for this component. When resumed, this component will periodically update its displayed values.
   */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }
    this.vnavDataProvider?.resume();
    this.groundSpeed.resume();
    this.altitude.resume();
    this.vnavState.resume();
    this.isPaused = false;
  }

  /**
   * Sets a vnav segment FPA manually.
   * @param fpa The FPA Value to set.
   */
  private setFpa = (fpa: number): void => {
    const publisher = this.props.bus.getPublisher<VNavControlEvents>();
    fpa = Math.round(fpa * 10) / 10;
    publisher.pub('vnav_set_current_fpa', fpa);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div>
        <div class="mfd-fpl-vnav row-1">
          <div class='mfd-fpl-vnav-wpt'>
            <label>WPT</label><span>{this.waypointSubject}</span>
          </div>
          <NumberUnitDisplay
            value={this.targetAlt} displayUnit={Subject.create(UnitType.FOOT)}
            formatter={NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' })}
            class='mfd-fpl-vnav-tgtalt'
          />
          <div class='mfd-fpl-vnav-tod'>
            <label>{this.todBodLabel}</label>
            <DurationDisplay
              value={this.timeToTarget}
              options={{ format: DurationDisplayFormat.hh_mm_or_mm_ss, delim: DurationDisplayDelim.ColonOrCross, nanString: '_ _ : _ _' }}
              class='mfd-fpl-vnav-value'
            />
          </div>
        </div>
        <div class="mfd-fpl-vnav row-2">
          <div class='mfd-fpl-vnav-tgtvs'>
            <label>VS TGT</label>
            <NumberUnitDisplay
              value={this.targetVs} displayUnit={Subject.create(UnitType.FPM)}
              formatter={NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' })}
              class='mfd-fpl-vnav-value supplied-value'
            />
          </div>
          <div class='mfd-fpl-vnav-fpa'>
            <label>FPA</label>
            <FpaSelector fpa={this.fpa} onChanged={this.setFpa} />
          </div>
        </div>
        <div class="mfd-fpl-vnav row-3">
          <div class='mfd-fpl-vnav-vsreq'>
            <label>VS REQ</label>
            <NumberUnitDisplay
              value={this.requiredVs} displayUnit={Subject.create(UnitType.FPM)}
              formatter={NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' })}
              class='mfd-fpl-vnav-value'
            />
          </div>
          <div class='mfd-fpl-vnav-vdev'>
            <label>V DEV</label>
            <NumberUnitDisplay
              value={this.verticalDev} displayUnit={Subject.create(UnitType.FOOT)}
              formatter={NumberFormatter.create({ precision: 1, nanString: '_ _ _ _ _' })}
              class='mfd-fpl-vnav-value'
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Props on the FpaSelector component.
 */
interface FpaSelectorProps extends G1000UiControlProps {
  /** The current FPA. */
  fpa: Subscribable<number>

  /** A callback called when the FPA is changed by the user. */
  onChanged: (fpa: number) => void;
}

/**
 * A component that allows a user to change the FPA.
 */
class FpaSelector extends G1000UiControl<FpaSelectorProps> {

  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly value = Subject.create<number>(0);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.fpa.sub(fpa => {
      if (!this.isFocused) {
        this.value.set(fpa);
      }
    }, true);
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add(UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove(UiControl.FOCUS_CLASS);
    this.value.set(this.props.fpa.get());
  }

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    return this.setValue(this.value.get() - 0.1);
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    return this.setValue(this.value.get() + 0.1);
  }

  /**
   * Sets a new edited FPA value.
   * @param value The value to set.
   * @returns True as the event is handled.
   */
  protected setValue(value: number): boolean {
    const newValue = MathUtils.clamp(value, 0, 6);
    this.value.set(newValue);
    this.props.onChanged(newValue);

    return true;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span class='supplied-value' ref={this.el}>
        {this.value.map(fpa => fpa !== 0 ? `-${fpa.toFixed(1)}°` : '_ _ _ _°')}
      </span>
    );
  }
}