import {
  ComputedSubject, ConsumerSubject, DurationFormatter, Facility, FSComponent, GeoPoint, GNSSEvents, ICAO, IcaoType, NumberFormatter, NumberUnitSubject, Subject,
  Subscribable,
  Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { GNSDigitInput } from '../../../Controls/GNSDigitInput';
import { GNSGenericNumberInput } from '../../../Controls/GNSGenericNumberInput';
import { GNSNumberUnitDisplay, GNSVerticalUnitDisplay } from '../../../Controls/GNSNumberUnitDisplay';
import { GNSNumberUnitInput } from '../../../Controls/GNSNumberUnitInput';
import { SelectableText } from '../../../Controls/SelectableText';
import { ViewService } from '../../Pages';
import { AuxPage } from '../AuxPages';
import { FuelPlanningMenu } from './FuelPlanningMenu';

import './FuelPlanning.css';

/**
 * Flight planning page for Aux group of pages
 */
export class FuelPlanning extends AuxPage {
  /** @inheritDoc */
  protected readonly menu = new FuelPlanningMenu();

  private readonly unitsSettingsManager = this.props.settingsProvider.units;
  private readonly generalSettingsManager = this.props.settingsProvider.generalSettings;

  private readonly gpsPosition = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').whenChanged(), new LatLongAlt());

  private readonly volumeUnit = Subject.create<Unit<UnitFamily.Weight>>(UnitType.GALLON_FUEL);
  private readonly distanceUnit = Subject.create<Unit<UnitFamily.Distance>>(UnitType.NMILE);
  private readonly speedUnit = ComputedSubject.create<Unit<UnitFamily.Distance>, Unit<UnitFamily.Speed>>(this.distanceUnit.get(), v => {
    switch (v) {
      case UnitType.MILE:
        return UnitType.MPH;
      case UnitType.KILOMETER:
        return UnitType.KPH;
      default:
        return UnitType.KNOT;
    }
  }
  );

  private readonly fromFacility = ComputedSubject.create<Facility | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '_____';
    }
    return ICAO.getIdent(v.icao);
  }
  );
  private readonly toFacility = ComputedSubject.create<Facility | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '_____';
    }
    return ICAO.getIdent(v.icao);
  }
  );
  private readonly fobInput = FSComponent.createRef<GNSGenericNumberInput>();
  private readonly flowInput = FSComponent.createRef<GNSGenericNumberInput>();
  private readonly gsInput = FSComponent.createRef<GNSGenericNumberInput>();

  public readonly fob = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(0));
  public readonly flow = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(0));
  public readonly gs = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  public readonly req = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN));

  public readonly lfob = NumberUnitSubject.create(UnitType.GALLON_FUEL.createNumber(NaN));
  public readonly lres = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  public readonly rng = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  public readonly endur = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  public readonly eff = ComputedSubject.create<number | undefined, string>(undefined, v => {
    if (v === undefined) {
      return '__._';
    }
    return v.toFixed(1);
  }
  );

  public readonly distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  /**
   * Calculate the Fuel Page Output Values
   */
  private calculate(): void {

    if (this.distance.get().isNaN() || this.gs.get().number < 1 || this.flow.get().number < 1 || this.fob.get().number < 1) {
      this.lfob.set(NaN);
      this.lres.set(NaN);
      this.req.set(NaN);
      this.endur.set(NaN);
      this.rng.set(NaN);
      this.eff.set(undefined);
      return;
    }

    const distance = this.distance.get().asUnit(this.unitsSettingsManager.distanceUnitsLarge.get());
    const gs = this.gs.get().asUnit(this.unitsSettingsManager.speedUnits.get());
    // flow is set with a multiplier of 10 to allow for proper decimal place selecting
    // without getting weird JS rounding errors, must be divided by 10 to get the actuall flow rate.
    const flow = this.flow.get().asUnit(this.unitsSettingsManager.fuelUnits.get()) / 10;
    const fob = this.fob.get().asUnit(this.unitsSettingsManager.fuelUnits.get());

    //calc REQ fuel
    const time = distance / gs;
    const req = time * flow;
    this.req.set(req, this.unitsSettingsManager.fuelUnits.get());

    //calc LFOB
    const lfob = fob - req;
    this.lfob.set(lfob, this.unitsSettingsManager.fuelUnits.get());

    //calc LRES
    this.lres.set(lfob / flow, UnitType.HOUR);

    //calc ENDUR
    const endur = fob / flow;
    this.endur.set(endur, UnitType.HOUR);

    //calc RNG
    const rng = endur * gs;
    this.rng.set(rng, this.unitsSettingsManager.distanceUnitsLarge.get());

    //calc EFF
    this.eff.set(rng / fob);
  }

  /**
   * Gets the GC distance between two facilities.
   */
  private getDistance(): void {
    const fromFacility = this.fromFacility.getRaw();
    const toFacility = this.toFacility.getRaw();
    if (fromFacility != undefined && toFacility != undefined) {
      this.distance.set(UnitType.GA_RADIAN.createNumber(new GeoPoint(fromFacility.lat, fromFacility.lon).distance(toFacility.lat, toFacility.lon)));
    } else {
      this.distance.set(NaN);
    }
    this.calculate();
  }

  /**
   * Gets a temporary facility from the present position
   * @returns the temporary facility
   */
  private getPresentPositionFacility(): Facility {
    const icaoStruct = ICAO.value(
      IcaoType.User,
      '',
      '',
      ' P.POS'
    );
    return {
      icao: ICAO.valueToStringV1(icaoStruct),
      icaoStruct,
      name: 'P.POS',
      lat: this.gpsPosition.get().lat,
      lon: this.gpsPosition.get().long,
      region: '',
      city: '',
    };
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.fromFacility.sub(() => this.getDistance());
    this.toFacility.sub(() => this.getDistance());
    this.distanceUnit.sub(() => {
      this.calculate();
    });
    this.volumeUnit.sub(() => {
      this.calculate();
    });
    this.fob.sub(() => this.calculate());
    this.flow.sub(() => this.calculate());
    this.gs.sub(() => this.calculate());
  }

  /**
   * Handles when the inner knob is turned.
   * @param isToFacility whether we are selecting the to facility
   * @returns True as it will always be handled.
   */
  private selectFacility(isToFacility: boolean): boolean {
    ViewService.getWaypoint().then(facility => {
      if (isToFacility) {
        this.toFacility.set(facility);
      } else {
        this.fromFacility.set(facility);
      }
    });

    return true;
  }

  public selectToFacility = (): boolean => {
    return this.selectFacility(true);
  };
  public selectFromFacility = (): boolean => {
    return this.selectFacility(false);
  };

  oneDecimalFormat = (value: string): string => {
    return (parseInt(value) / 10).toFixed(1);
  };

  /**
   * Callback to render an inactive value.
   * @param value The value to display.
   * @param unit The display unit of the value.
   * @returns a VNODE to render.
   */
  private renderInactiveValue<F extends string>(value: string, unit: Subscribable<Unit<F>>): VNode {
    return (
      <div>
        {value}
        <GNSVerticalUnitDisplay unit={unit} />
      </div>
    );
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page fuel-planning-page hide-element' ref={this.el}>
        <h2 class="page-header">
          FUEL PLANNING
        </h2>
        <div class='fuel-planning-page-header cyan'><h2>POINT TO POINT</h2></div>
        <div class='fuel-planning-input-table'>
          {/* Empty cell for padding */}
          <div class="fuel-planning-input-table-cell" />

          <div class="fuel-planning-input-table-cell" id='fuel-planning-from'>
            <SelectableText
              data={this.fromFacility}
              class={''}
              onClr={(): boolean => {
                this.fromFacility.set(this.getPresentPositionFacility());
                return true;
              }}
              onEnt={(): boolean => this.scroll('forward')}
              onRightInnerDec={this.selectFromFacility}
              onRightInnerInc={this.selectFromFacility}
            />
          </div>

          <div id='fuel-planning-arrow'>
            <svg width="9" height="10">
              <path d="M 8 4 l -5 -4 l 0 3 l -3 0 l 0 2 l 3 0 l 0 3 l 5 -4 z" stroke="rgb(0, 255, 0)"
                fill="rgb(0, 255, 0)" stroke-width="1px"></path>
            </svg>
          </div>

          <div class="fuel-planning-input-table-cell" id='fuel-planning-to'>
            <SelectableText
              data={this.toFacility}
              class={''}
              onClr={(): boolean => {
                this.toFacility.set(this.getPresentPositionFacility());
                return true;
              }}
              onEnt={(): boolean => this.scroll('forward')}
              onRightInnerDec={this.selectToFacility}
              onRightInnerInc={this.selectToFacility}
            />
          </div>

          <div class='fuel-planning-input-table-cell' id="fuel-planning-fob">
            <GNSNumberUnitInput
              data={this.fob as unknown as NumberUnitSubject<UnitFamily.Weight>}
              displayUnit={this.unitsSettingsManager.fuelUnits}
              ref={this.fobInput}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value / 10000));
                digitValues[1].set(Math.floor((value % 10000) / 1000));
                digitValues[2].set(Math.floor((value % 1000) / 100));
                digitValues[3].set(Math.floor((value % 100) / 10));
                digitValues[4].set(Math.floor((value % 10) / 1));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => { return this.renderInactiveValue((value).toFixed(0), this.unitsSettingsManager.fuelUnits); }}
              onInputAccepted={(v): void => { this.fob.set(v, this.unitsSettingsManager.fuelUnits.get()); }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.fuelUnits} />
            </GNSNumberUnitInput>
          </div>

          <div class='fuel-planning-input-table-cell' id="fuel-planning-flow">
            <GNSNumberUnitInput
              data={this.flow as unknown as NumberUnitSubject<UnitFamily.Weight>}
              displayUnit={this.unitsSettingsManager.fuelUnits}
              ref={this.flowInput}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value / 1000));
                digitValues[1].set(Math.floor((value % 1000) / 100));
                digitValues[2].set(Math.floor((value % 100) / 10));
                digitValues[3].set(Math.floor((value % 10) / 1));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => { return this.renderInactiveValue((value / 10).toFixed(1), this.unitsSettingsManager.fuelUnits); }}
              onInputAccepted={(v): void => { this.flow.set(v, this.unitsSettingsManager.fuelUnits.get()); }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <span>.</span>
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.fuelUnits} />
            </GNSNumberUnitInput>
          </div>

          <div class="fuel-planning-input-table-cell" id="fuel-planning-gs">
            <GNSNumberUnitInput
              data={this.gs as unknown as NumberUnitSubject<UnitFamily.Speed>}
              displayUnit={this.unitsSettingsManager.speedUnits}
              ref={this.gsInput}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value / 100));
                digitValues[1].set(Math.floor((value % 100) / 10));
                digitValues[2].set(Math.floor((value % 10) / 1));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => { return this.renderInactiveValue(value.toFixed(0), this.unitsSettingsManager.speedUnits); }}
              onInputAccepted={(v): void => { this.gs.set(v, this.unitsSettingsManager.speedUnits.get()); }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.speedUnits} />
            </GNSNumberUnitInput>
          </div>
        </div>

        <div class="fuel-planning-labels cyan">
          <div>FOB</div>
          <div>FLOW</div>
          <div>GS</div>
        </div>

        <div class="fuel-planning-labels-bot cyan">
          <div>REQ</div>
          <div>LFOB</div>
          <div>LRES</div>
        </div>

        <div id='fuel-planning-data-table'>
          <div class="fuel-planning-output-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 4, nanString: '___._' })}
              value={this.req} displayUnit={this.unitsSettingsManager.fuelUnits}
            />
          </div>

          <div class="fuel-planning-output-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 4, nanString: '___._' })}
              value={this.lfob} displayUnit={this.unitsSettingsManager.fuelUnits}
            />
          </div>

          <div class="fuel-planning-output-cell">
            <GNSNumberUnitDisplay
              formatter={DurationFormatter.create('{hh}:{mm}', UnitType.HOUR, 0, '__:__')}
              value={this.lres}
              displayUnit={UnitType.HOUR}
            />
          </div>

          <div class="fuel-planning-output-cell">{this.eff}</div>

          <div class="fuel-planning-output-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 4, nanString: '_.__' })}
              value={this.rng} displayUnit={this.unitsSettingsManager.distanceUnitsLarge.get()}
            />
          </div>

          <div class="fuel-planning-output-cell">
            <GNSNumberUnitDisplay
              formatter={DurationFormatter.create('{hh}:{mm}', UnitType.HOUR, 0, '__:__')}
              value={this.endur}
              displayUnit={UnitType.HOUR}
            />
          </div>

        </div><div class="fuel-planning-labels cyan">
          <div style="text-align: left;">EFF</div>
          <div style="text-align: center;">RNG</div>
          <div style="text-align: right;">ENDUR</div>
        </div>
      </div>
    );
  }
}
