import {
  CombinedSubject, ConsumerSubject, DateTimeFormatter, DurationFormatter, Facility, FSComponent, GeoPoint, GNSSEvents, ICAO, NumberFormatter,
  NumberUnit, NumberUnitSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { PropsWithBus } from '../../../../UITypes';
import { GNSDigitInput } from '../../../Controls/GNSDigitInput';
import { GNSGenericNumberInput } from '../../../Controls/GNSGenericNumberInput';
import { GNSNumberUnitDisplay, GNSVerticalUnitDisplay } from '../../../Controls/GNSNumberUnitDisplay';
import { GNSNumberUnitInput } from '../../../Controls/GNSNumberUnitInput';
import { SelectableText } from '../../../Controls/SelectableText';
import { ViewService } from '../../Pages';
import { AuxPage, AuxPageProps } from '../AuxPages';

import './TripPlanning.css';

/**
 * Trip planning props
 */
export type TripPlanningProps = AuxPageProps & PropsWithBus

/**
 * Trip planning page
 */
export class TripPlanning extends AuxPage<TripPlanningProps> {
  private static readonly dateFormatter = DateTimeFormatter.create('{dd}-{MON}-{YY}', { nanString: '__-___-__' });

  //settings for the units
  private readonly unitsSettingsManager = this.props.settingsProvider.units;

  private readonly notEl = FSComponent.createRef<HTMLDivElement>();
  private readonly depTimeInput = FSComponent.createRef<GNSGenericNumberInput>();
  private readonly depDateInput = FSComponent.createRef<GNSGenericNumberInput>();
  private readonly gsInput = FSComponent.createRef<GNSGenericNumberInput>();

  private readonly gpsPosition = ConsumerSubject.create(this.props.bus.getSubscriber<GNSSEvents>().on('gps-position').whenChanged(), new LatLongAlt());

  public readonly depTimeRaw = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));
  public readonly depDateRaw = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  public readonly gs = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private readonly timeUnit = Subject.create<Unit<UnitFamily.Duration>>(UnitType.SECOND);
  private readonly angleUnit = Subject.create<Unit<UnitFamily.Angle>>(UnitType.DEGREE);

  /**
   * Formats a compressed time value into a string for display
   *
   * @param value the compressed time value
   *
   * @returns formatted time string
   */
  private formatCompressedTime(value: number): string {
    /*
    FIXME - this is really dirty, as we are using numerical values to store time and date. However, the current input system
            basically only supports that, so for now we have to do this.
    */

    if (!value || isNaN(value)) {
      return '__:__';
    }

    let h, m;

    const timeFixed = value.toFixed(0);
    if (timeFixed.length === 3) {
      h = timeFixed.substring(0, 1);
      m = timeFixed.substring(1, 3);
    } else {
      h = timeFixed.substring(0, 2);
      m = timeFixed.substring(2, 4);
    }

    const hh = h.padStart(2, '0');
    const mm = m.padStart(2, '0');

    return `${hh}:${mm}`;
  }

  /**
   * Formats a compressed date value into a string for display
   *
   * @param value the compressed date value
   *
   * @returns formatted date string
   */
  private formatCompressedDate(value: number): string {
    /*
    FIXME - this is really dirty, as we are using numerical values to store time and date. However, the current input system
            basically only supports that, so for now we have to do this.
    */

    if (!value || isNaN(value)) {
      return '__-___-__';
    }

    let y, M, d;

    const dateFixed = value.toFixed(0);
    if (dateFixed.length === 3) {
      y = '0';
      M = dateFixed.substring(0, 1);
      d = dateFixed.substring(1, 3);
    } else if (dateFixed.length === 5) {
      y = dateFixed.substring(0, 1);
      M = dateFixed.substring(1, 3);
      d = dateFixed.substring(3, 5);
    } else {
      y = dateFixed.substring(0, 2);
      M = dateFixed.substring(2, 4);
      d = dateFixed.substring(4, 6);
    }

    const yy = y.padStart(2, '0');
    const MMM = DateTimeFormatter.DEFAULT_OPTIONS.monthNamesShort[parseInt(M) - 1]?.toUpperCase() ?? '___';
    const dd = d.padStart(2, '0');

    return `${dd}-${MMM}-${yy}`;
  }

  /*
  FIXME - this is really dirty, as we are using numerical values to store time and date. However, the current input system
          basically only supports that, so for now we have to do this.
 */
  private readonly depTime = CombinedSubject.create(this.depTimeRaw, this.depDateRaw).map(([timeRaw, dateRaw]) => {
    if (isNaN(dateRaw.number) || isNaN(timeRaw.number)) {
      return NaN;
    }

    let y, M, d, m, h;

    const dateFixed = dateRaw.number.toFixed(0);
    if (dateFixed.length === 3) {
      y = '0';
      M = dateFixed.substring(0, 1);
      d = dateFixed.substring(1, 3);
    } else if (dateFixed.length === 5) {
      y = dateFixed.substring(0, 1);
      M = dateFixed.substring(1, 3);
      d = dateFixed.substring(3, 5);
    } else {
      y = dateFixed.substring(0, 2);
      M = dateFixed.substring(2, 4);
      d = dateFixed.substring(4, 6);
    }

    const timeFixed = timeRaw.number.toFixed(0);
    if (timeFixed.length === 3) {
      h = timeFixed.substring(0, 1);
      m = timeFixed.substring(1, 3);
    } else {
      h = timeFixed.substring(0, 2);
      m = timeFixed.substring(2, 4);
    }

    const yy = y.padStart(2, '0');
    const MM = M.padStart(2, '0');
    const dd = d.padStart(2, '0');
    const hh = h.padStart(2, '0');
    const mm = m.padStart(2, '0');

    return new Date(Date.parse(`20${yy}-${MM}-${dd}T${hh}:${mm}:00`)).getTime();
  });

  /** @inheritDoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.notEl.instance.classList.remove('hide-element');
    } else {
      this.notEl.instance.classList.add('hide-element');
    }
  }

  /** @inheritDoc */
  public onRightKnobPush(): boolean {
    if (this.isFocused) {
      this.setVisible(false);
      this.blur();
      this.props.onDisabled && this.props.onDisabled(this);
      return true;
    }
    return false;
  }

  private readonly fromFacility = Subject.create<Facility | undefined>(undefined);

  private readonly fromFacilityIdent = this.fromFacility.map((v) => {
    if (v === undefined) {
      return '_____';
    }
    return ICAO.getIdent(v.icao);
  }
  );

  private readonly toFacility = Subject.create<Facility | undefined>(undefined);

  private readonly toFacilityIdent = this.toFacility.map((v) => {
    if (v === undefined) {
      return '_____';
    }
    return ICAO.getIdent(v.icao);
  }
  );

  /**
   * Handles when the inner knob is turned.
   * @param isToFacility whether we are selecting the to facility
   * @returns True as it will always be handled.
   */
  private selectFacility(isToFacility: boolean): boolean {
    ViewService.getWaypoint().then((facility) => {
      if (isToFacility) {
        this.toFacility.set(facility);
      } else {
        this.fromFacility.set(facility);
      }
    });

    return true;
  }

  public selectFromFacility = (): boolean => {
    return this.selectFacility(false);
  };

  public selectToFacility = (): boolean => {
    return this.selectFacility(true);
  };

  /**
   * Gets a temporary facility from the present position
   * @returns the temporary facility
   */
  private getPresentPositionFacility(): Facility {
    return {
      icao: '        P.POS',
      name: 'P.POS',
      lat: this.gpsPosition.get().lat,
      lon: this.gpsPosition.get().long,
      region: '',
      city: '',
      magvar: 0
    };
  }

  /**
   * Outputs DTK in nautical miles
   */
  private readonly directTrackOutput = CombinedSubject.create(this.fromFacility, this.toFacility).map(([from, to]) => {
    if (from && to) {
      const fromLla = new GeoPoint(from.lat, from.lon);
      const toLla = new GeoPoint(to.lat, to.lon);

      return fromLla.bearingTo(toLla);
    }
  });

  /**
   * Outputs DIS in nautical miles
   */
  private readonly distanceOutput = CombinedSubject.create(this.fromFacility, this.toFacility).map(([from, to]) => {
    if (from && to) {
      const fromLla = new GeoPoint(from.lat, from.lon);
      const toLla = new GeoPoint(to.lat, to.lon);

      return UnitType.GA_RADIAN.convertTo(fromLla.distance(toLla), UnitType.NMILE);
    }
  });

  /**
   * Outputs ETE in seconds
   */
  private readonly eteOutput = CombinedSubject.create(this.distanceOutput, this.gs).map(([distance, gs]) => {
    if (distance !== undefined) {
      const hours = distance / gs.number;

      if (hours > 99) {
        return NaN;
      }

      return hours * 3_600;
    }

    return NaN;
  });

  /**
   * Outputs ETA in seconds
   */
  private readonly etaOutput = CombinedSubject.create(this.depTime, this.eteOutput).map(([simTime, ete]) => {
    if (simTime > 0) {
      return simTime + (ete * 1000);
    }

    return NaN;
  });

  /**
   * DTK NumberUnitSubject
   */
  private readonly dtk = NumberUnitSubject.create(UnitType.DEGREE.createNumber(NaN));

  /**
   * DIS NumberUnitSubject
   */
  private readonly dis = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));

  /**
   * ERE NumberUnitSubject
   */
  private readonly ete = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

  /**
   * ETA NumberUnitSubject
   */
  private readonly eta = NumberUnitSubject.create(UnitType.SECOND.createNumber(NaN));

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

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.directTrackOutput.sub((value) => this.dtk.set(value ?? NaN, this.angleUnit.get()));
    this.distanceOutput.sub((value) => this.dis.set(value ?? NaN, this.unitsSettingsManager.distanceUnitsLarge.get()));
    this.eteOutput.sub((value) => this.ete.set(value ?? NaN, this.timeUnit.get()));
    this.etaOutput.sub((value) => this.eta.set(value ?? NaN, this.timeUnit.get()));
  }

  /** @inheritDoc */
  render(): VNode {
    return <div ref={this.notEl} class="page trip-planning-page aux-page hide-element">
      <h2 class='page-header'>TRIP PLANNING</h2>

      <div class='trip-planning-page-header cyan'><h2>POINT TO POINT</h2></div>

      <div class='aux-table trip-planning-table'>
        {/* Empty cell for padding */}
        <div class="trip-planning-table-cell" />

        <div class="trip-planning-table-cell" id='trip-planning-from'>
          <SelectableText
            data={this.fromFacilityIdent}
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

        <div id='trip-planning-arrow'>
          <svg width="9" height="10">
            <path d="M 8 4 l -5 -4 l 0 3 l -3 0 l 0 2 l 3 0 l 0 3 l 5 -4 z" stroke="rgb(0, 255, 0)"
              fill="rgb(0, 255, 0)" stroke-width="1px"></path>
          </svg>
        </div>

        <div class="trip-planning-table-cell" id='trip-planning-to'>
          <SelectableText
            data={this.toFacilityIdent}
            class={''}
            onClr={(): boolean => {
              this.toFacility.set(this.getPresentPositionFacility());
              return true;
            }}
            onEnt={(): boolean => this.scroll('forward')}
            onRightInnerDec={this.selectToFacility}
            onRightInnerInc={this.selectToFacility
            } />
        </div>

        <div class='trip-planning-table-cell' id="trip-planning-time">
          <GNSNumberUnitInput
            data={this.depTimeRaw as unknown as NumberUnitSubject<UnitFamily.Duration>}
            displayUnit={this.timeUnit}
            ref={this.depTimeInput}
            digitizer={(value, signValues, digitValues): void => {
              digitValues[0].set(Math.floor(value));
              digitValues[1].set(Math.floor(value % 100));
              digitValues[2].set(Math.floor(value % 10));
            }}
            editOnActivate={false}
            activateOnClr={true}
            class=''
            renderInactiveValue={(value): VNode => {
              const formatted = this.formatCompressedTime(value);

              return this.renderInactiveValue(formatted, Subject.create(UnitType.TON));
            }}
            onInputAccepted={(v): void => {
              this.depTimeRaw.set(v, this.timeUnit.get());
            }}
          >
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={25} increment={1} scale={100} wrap={true} />
            <span>:</span>
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={6} increment={1} scale={10} wrap={true} />
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
            <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.weightUnits} />
          </GNSNumberUnitInput>
        </div>

        <div class='trip-planning-table-cell' id="trip-planning-date">
          <GNSNumberUnitInput
            data={this.depDateRaw as unknown as NumberUnitSubject<UnitFamily.Duration>}
            displayUnit={this.timeUnit}
            ref={this.depDateInput}
            digitizer={(value, signValues, digitValues): void => {
              digitValues[0].set(Math.floor(value % 100));
              digitValues[2].set(Math.floor(value));
              digitValues[1].set(Math.floor(value % 1000));
            }}
            editOnActivate={false}
            activateOnClr={true}
            class=''
            renderInactiveValue={(value): VNode => {
              const formatted = this.formatCompressedDate(value);

              return this.renderInactiveValue(formatted, Subject.create(UnitType.TON));
            }}
            onInputAccepted={(v): void => {
              this.depDateRaw.set(v, this.timeUnit.get());
            }}
          >
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={31} increment={1} scale={1} wrap={true} formatter={(value): string => value.toString().padStart(2, '0')} />
            <span>-</span>
            <GNSDigitInput value={Subject.create(0)} minValue={1} maxValue={13} increment={1} scale={100} wrap={true} formatter={(month): string => {
              return (DateTimeFormatter.DEFAULT_OPTIONS.monthNamesShort[Math.max(0, month - 1)].toUpperCase());
            }} />
            <span>-</span>
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={99} increment={1} scale={10000} wrap={true} formatter={(value): string => value.toString().padStart(2, '0')} />
            <GNSVerticalUnitDisplay unit={Subject.create(UnitType.FPM)} />
          </GNSNumberUnitInput>
        </div>

        <div class="trip-planning-table-cell" id="trip-planning-gs">
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
            renderInactiveValue={(value): VNode => {
              return this.renderInactiveValue(value.toFixed(0), this.unitsSettingsManager.speedUnits);
            }}
            onInputAccepted={(v): void => {
              this.gs.set(v, this.unitsSettingsManager.speedUnits.get());
            }}
          >
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
            <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
            <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.speedUnits} />
          </GNSNumberUnitInput>
        </div>
      </div>

      <div class="trip-planning-labels cyan">
        <div><span>DEP TIME</span></div>
        <div><span>DEP DATE</span></div>
        <div><span>GS</span></div>
      </div>

      <div class="trip-planning-labels-bot cyan">
        <div>DTK</div>
        <div>DIS</div>
        <div>ETE</div>
      </div>

      <div class='aux-table trip-planning-table' style="height: 45px;">
        <div class="trip-planning-table-cell">
          <GNSNumberUnitDisplay
            formatter={NumberFormatter.create({
              precision: -1,
              forceDecimalZeroes: true,
              maxDigits: 3,
              nanString: '___'
            })}
            value={this.dtk}
            displayUnit={this.angleUnit}
          />
        </div>

        <div class="trip-planning-table-cell">
          <GNSNumberUnitDisplay
            formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
            value={this.dis}
            displayUnit={this.unitsSettingsManager.distanceUnitsLarge}
          />
        </div>

        <div class="trip-planning-table-cell">
          <GNSNumberUnitDisplay
            formatter={DurationFormatter.create('{HH}:{mm}', UnitType.SECOND, 0, '__:__')}
            value={this.ete}
            displayUnit={this.timeUnit}
          />
        </div>

        <div class="trip-planning-table-cell">
          <GNSNumberUnitDisplay
            formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 5, nanString: '_____' })}
            value={NumberUnitSubject.create(new NumberUnit(NaN, UnitType.FOOT))}
            displayUnit={this.unitsSettingsManager.altitudeUnits}
          />
        </div>

        <div class="trip-planning-table-cell" />

        <div class="trip-planning-table-cell">
          <GNSNumberUnitDisplay
            formatter={DateTimeFormatter.create('{HH}:{mm}', { nanString: '__:__' })}
            value={this.eta}
            displayUnit={this.timeUnit}
          />
        </div>
      </div>

      <div class="aux-table-labels cyan" style="padding-top:2px;">
        <div>ESA</div>
        <div></div>
        <div>ETA</div>
      </div>

      <div class="trip-planning-sun">
        <div class="aux-table-labels-two cyan" style="padding-bottom:2px;">
          <div>SUNRISE AT DEST</div>
          <div>SUNSET AT DEST</div>
        </div>

        <div class="trip-planning-sun-flex">
          <div class='aux-table' style="width: 100px; height: 23px;">

          </div>

          <div class='aux-table' style="width: 100px; height: 23px;">

          </div>
        </div>
      </div>
    </div>;
  }
}
