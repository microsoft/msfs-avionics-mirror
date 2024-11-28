import {
  AdcEvents, AltitudeRestrictionType, ConsumerSubject, EventBus, FlightPlanSegmentType, FSComponent, LegDefinition,
  MappedSubject, NumberFormatter, NumberUnitSubject, Subject, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import {
  AltitudeFeetInputFormat, ButtonBoxArrow, ButtonMenu, CelsiusTemperatureInputFormat, Epic2Fms, Epic2FmsUtils,
  FaranheitTemperatureInputFormat, FlightPlanStore, InputField, NumberUnitDisplay, TabContent, TabContentProps, TouchButton
} from '@microsoft/msfs-epic2-shared';

import './TCompTab.css';

/** The properties for the {@link TCompTab} component. */
interface TCompTabProps extends TabContentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The flight plan store.  */
  readonly activeFlightPlanStore: FlightPlanStore;
}

enum TCompModes {
  off = 'Off',
  cold = 'Cold',
  both = 'Cold/Hot',
}

/** The TCompTab component. */
export class TCompTab extends TabContent<TCompTabProps> {

  /** Destination OAT section */
  private readonly destOatC = Subject.create<number | null>(null);
  private readonly destOatF = Subject.create<number | null>(null);
  private readonly oatValid = MappedSubject.create(
    ([destOatC, destOatF]): boolean => {
      if (destOatC !== null && destOatF !== null) {
        return true;
      } else {
        return false;
      }
    },
    this.destOatC,
    this.destOatF,
  );

  /** TComp type and Compute section */
  private readonly tCompMode = Subject.create(TCompModes.off);
  private readonly tCompComputed = Subject.create(false);
  private isa = ConsumerSubject.create(this.props.bus.getSubscriber<AdcEvents>().on('isa_temp_c').withPrecision(0), 0);  // celcius
  private readonly computeEnabled = MappedSubject.create(
    ([oatValid, tCompMode, tCompComputed]): boolean => {
      if (oatValid && tCompMode !== TCompModes.off && !tCompComputed) {
        return true;
      } else {
        return false;
      }
    },
    this.oatValid,
    this.tCompMode,
    this.tCompComputed,
  );

  private readonly altitudeFieldEnabled = Subject.create<boolean>(false);

  /** TComp Calculator section */
  private readonly calcOverlayRef = FSComponent.createRef<HTMLDivElement>();  // Disabled overlay for the TComp Calculator section
  private readonly altitude = Subject.create<number | null>(null);  // Destination Altitude in feet
  private rwyElevFt = Subject.create(NaN);  // Destination runway elevation in feet
  private readonly tCompAlt = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));  // Compensated Altitude in Feet

  /** Adds or removes temperature compensation by modifying the active flight plan. */
  private applyTComp(): void {

    const flightPlan = this.props.fms.getFlightPlan();
    let apprLegs: LegDefinition[] | undefined = undefined;

    // Find approach legs
    for (let i = 0; i < flightPlan.segmentCount; i++) {
      if (flightPlan.getSegment(i).segmentType === FlightPlanSegmentType.Approach) {
        apprLegs = flightPlan.getSegment(i).legs;
      }
    }

    // Add or remove temperature compensation to alt constrains in approach legs
    if (apprLegs) {

      let destOatC = this.destOatC.get();
      destOatC = destOatC === null ? NaN : destOatC;

      const tComp = this.tCompMode.get() === TCompModes.both || (this.tCompMode.get() === TCompModes.cold && destOatC < this.isa.get()) ?
        true :
        false;

      for (let i = 0; i < apprLegs.length; i++) {
        if (apprLegs[i].verticalData.altDesc !== AltitudeRestrictionType.Unused) {
          if (tComp) {
            Epic2FmsUtils.addLegTComp(this.props.fms, apprLegs[i], destOatC, this.rwyElevFt.get());
          } else {
            Epic2FmsUtils.removeLegTComp(this.props.fms, apprLegs[i]);
          }
        }
      }
    }

    this.tCompComputed.set(true);
    this.altitudeFieldEnabled.set(true);
  }

  /** handles the Compute button press */
  private computePress(): void {
    this.applyTComp();
    this.calcOverlayRef.instance.classList.add('hidden');
  }

  private subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public override onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.subscriptions = [
      // Sync Dest OAT fields
      this.destOatC.sub((c) => {
        c = c === null ? NaN : c;
        const tempC = UnitType.CELSIUS.createNumber(c);
        const tempF = Math.round(UnitType.FAHRENHEIT.convertFrom(tempC.number, tempC.unit));
        this.destOatF.set(isNaN(tempF) ? null : tempF);
      }, true),

      this.destOatF.sub((f) => {
        f = f === null ? NaN : f;
        const tempF = UnitType.FAHRENHEIT.createNumber(f);
        const tempC = Math.round(UnitType.CELSIUS.convertFrom(tempF.number, tempF.unit));
        this.destOatC.set(isNaN(tempC) ? null : tempC);
      }, true),

      // Watch for changes in runway elevation
      this.props.activeFlightPlanStore.arrivalRunway.sub((runway) => {
        const elevM = UnitType.METER.createNumber(runway?.elevation ?? 0);
        const elevFt = UnitType.FOOT.convertFrom(elevM.number, elevM.unit);
        this.rwyElevFt.set(elevFt);
      }, true),

      // Watch for changes in TComp data
      MappedSubject.create(
        (): void => {
          this.tCompComputed.set(false);
        },
        this.destOatC,
        this.destOatF,
        this.tCompMode,
        this.rwyElevFt,
        this.isa,
      ),

      // Remove TComp when turned off
      this.tCompMode.sub((mode) => {
        if (mode === TCompModes.off) {
          this.applyTComp();
        }
      }),

      // Calculate TComp Alt
      MappedSubject.create(
        ([destOatC, altitude, destElev, tCompMode, isa]): void => {
          destOatC = destOatC === null ? NaN : destOatC;
          altitude = altitude === null ? NaN : altitude;
          let tCompAlt;
          if (tCompMode === TCompModes.both || (tCompMode === TCompModes.cold && destOatC < isa)) {
            tCompAlt = Epic2FmsUtils.calculateTComp(altitude, destOatC, destElev);
          } else {
            tCompAlt = altitude;
          }
          this.tCompAlt.set(tCompAlt);
        },
        this.destOatC,
        this.altitude,
        this.rwyElevFt,
        this.tCompMode,
        this.isa,
      ),

      this.computeEnabled.sub((enabled) => {
        if (!enabled) {
          this.altitudeFieldEnabled.set(false);
        }
      }),
    ];
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="fpln-tcomp-tab">
        <div class="fpln-tcomp-grid">
          <div>
            <div class="fpln-tcomp-dest">
              <InputField
                bus={this.props.bus}
                topLabel="Dest OAT"
                suffix="°C"
                bind={this.destOatC}
                formatter={new CelsiusTemperatureInputFormat('□□□□□', -54, 50)}
                dragConfig={{
                  increment: 1,
                  min: -55,
                  max: 50,
                  bus: this.props.bus,
                }}
                textAlign={'right'}
                maxLength={5}
                tscConnected
              />
              <InputField
                bus={this.props.bus}
                suffix="°F"
                bind={this.destOatF}
                formatter={new FaranheitTemperatureInputFormat('□□□□□', -65, 122)}
                dragConfig={{
                  increment: 1,
                  min: -67,
                  max: 122,
                  bus: this.props.bus,
                }}
                textAlign={'right'}
                maxLength={5}
                tscConnected
              />
            </div>
            <div class="fpln-tcomp-calc">
              <div class="fpln-tcomp-label">TComp Calculator</div>
              <InputField
                bus={this.props.bus}
                topLabel="Altitude:"
                suffix="Ft"
                bind={this.altitude}
                formatter={new AltitudeFeetInputFormat('-----', this.rwyElevFt, 25000)}
                dragConfig={{
                  increment: 1,
                  min: 0,
                  max: 30000,
                  bus: this.props.bus,
                }}
                textAlign={'right'}
                maxLength={5}
                isEnabled={this.altitudeFieldEnabled}
                tscConnected
              />
              <div class="fpln-tcomp-alt">
                <p>TComp Alt:</p>
                <NumberUnitDisplay
                  class="fpln-tcomp-ft"
                  value={this.tCompAlt}
                  displayUnit={null}
                  unitFormatter={(out: [string, string]) => {
                    out[0] = 'F';
                    out[1] = 't';
                  }}
                  formatter={NumberFormatter.create({
                    precision: 1,
                    forceDecimalZeroes: false,
                    maxDigits: 5,
                    nanString: '',
                  })}
                />
              </div>
              <div ref={this.calcOverlayRef} class='calc-disable-overlay' />
            </div>
          </div>
          <div class="fpln-tcomp">
            <div class="fpln-tcomp-inner">
              <div class="fpln-tcomp-menu">
                <ButtonMenu
                  buttons={[
                    <TouchButton variant={'bar'} label={TCompModes.off} onPressed={() => this.tCompMode.set(TCompModes.off)} />,
                    <TouchButton variant={'bar'} label={TCompModes.cold} onPressed={() => this.tCompMode.set(TCompModes.cold)} />,
                    <TouchButton variant={'bar'} label={TCompModes.both} onPressed={() => this.tCompMode.set(TCompModes.both)} />,
                  ]}
                  position={'bottom'}
                  isEnabled={this.oatValid}
                >
                  <ButtonBoxArrow title={'Tcomp'} label={this.tCompMode} isEnabled={this.oatValid} />
                </ButtonMenu>
              </div>
              <TouchButton
                label="Compute"
                class="fpln-tcomp-compute-button"
                variant={'small'}
                isEnabled={this.computeEnabled}
                onPressed={() => this.computePress()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();
    this.subscriptions.forEach((sub) => sub.destroy());
  }
}
