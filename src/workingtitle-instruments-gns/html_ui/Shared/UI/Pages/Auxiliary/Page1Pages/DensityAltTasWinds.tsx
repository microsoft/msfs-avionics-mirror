import {
  AdcEvents, ConsumerSubject, FSComponent, GNSSEvents, MappedSubject, NumberFormatter, NumberUnitSubject, Subject, Subscribable,
  Unit, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';

import { PropsWithBus } from '../../../../UITypes';
import { AdcMath } from '../../../../Utils/AdcMath';
import { GNSDigitInput } from '../../../Controls/GNSDigitInput';
import { GNSNumberUnitDisplay, GNSVerticalUnitDisplay } from '../../../Controls/GNSNumberUnitDisplay';
import { GNSNumberUnitInput } from '../../../Controls/GNSNumberUnitInput';
import { GNSSignInput } from '../../../Controls/GNSSignInput';
import { AuxPage, AuxPageProps } from '../AuxPages';

import './DensityAltTasWinds.css';

/**
 * Props for {@link DensityAltTasWinds}
 */
export type DensityAltTasWindsProps = PropsWithBus & AuxPageProps

/**
 * DENSITY / ALT / TAS / WINDS
 */
export class DensityAltTasWinds extends AuxPage<DensityAltTasWindsProps> {

  // User Settings
  private readonly unitsSettingsManager = this.props.settingsProvider.units;
  private readonly generalSettingsManager = this.props.settingsProvider.generalSettings;

  // ADC Data

  private readonly adcGpsSubscriber = this.props.bus.getSubscriber<AdcEvents & GNSSEvents>();

  private readonly groundSpeedSub = ConsumerSubject.create(this.adcGpsSubscriber.on('ground_speed'), null);
  private readonly magneticTrackSub = ConsumerSubject.create(this.adcGpsSubscriber.on('track_deg_magnetic'), null);
  private readonly magvarSub = ConsumerSubject.create(this.adcGpsSubscriber.on('magvar'), null);

  // Inputs

  private readonly indAlt = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly cas = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  // FIXME we store the baro here as inHg * 100, because the digit inputs do not play well with decimals at
  //       the moment
  private readonly baro = NumberUnitSubject.create(UnitType.IN_HG.createNumber(0)); // TODO hPa
  private readonly tat = NumberUnitSubject.create(UnitType.CELSIUS.createNumber(0));
  private readonly hdg = NumberUnitSubject.create(UnitType.DEGREE.createNumber(0));

  // Outputs

  private readonly denAlt = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly tas = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly windSpeedOut = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly windDirectionOut = NumberUnitSubject.create(UnitType.DEGREE.createNumber(0));
  private readonly headwind = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));
  private readonly headwindAbs = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  //these need to stay angle unit does not change in the units/position menu
  private readonly baroUnit = Subject.create<Unit<UnitFamily.Pressure>>(UnitType.IN_HG);
  private readonly angleUnit = Subject.create<Unit<UnitFamily.Angle>>(UnitType.DEGREE);

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

    // TODO re-enable this when bugs on digit inputs are fixed
    // this.indAlt.set(UnitType.FOOT.createNumber(23_597));
    // this.baro.set(UnitType.IN_HG.createNumber(29.92));

    // Calculate density altitude from inputs
    MappedSubject.create(this.indAlt, this.baro, this.tat).map(([indAtl, baro, tat]) => {
      // We divide baro by 100 because we store it like this. See comment on baro field
      const denAlt = AdcMath.calcDensityAltitude(indAtl.number, baro.unit === UnitType.IN_HG ? baro.number / 100 : baro.number, tat.number);

      this.denAlt.set(UnitType.FOOT.createNumber(denAlt));
    });

    // Calculate TAS from inputs
    MappedSubject.create(this.denAlt, this.tat, this.cas, this.baro).map(([denAlt, tat, cas, baro]) => {
      const tas = AdcMath.calcTasfromCas(denAlt.number, tat.number, cas.number, baro.unit === UnitType.IN_HG ? baro.number / 100 : baro.number);

      this.tas.set(UnitType.KNOT.createNumber(tas));
    });

    MappedSubject.create(this.tas, this.groundSpeedSub, this.hdg, this.magneticTrackSub, this.magvarSub).map(([tas, gs, hdg, magneticTrack, magvar]) => {
      if (gs !== null && magneticTrack !== null && magvar !== null) {
        const wind = AdcMath.calcWind(tas.asUnit(UnitType.KNOT), gs, hdg.number, magneticTrack);

        const windDirection = wind[0];
        const windSpeed = wind[1];

        this.windDirectionOut.set(windDirection, UnitType.DEGREE);
        this.windSpeedOut.set(windSpeed, this.unitsSettingsManager.speedUnits.get());

        const windComponents = AdcMath.calcRelativeWindComponents(hdg.number, windSpeed, windDirection + magvar);
        const headwind = windComponents[0];

        this.headwind.set(headwind, this.unitsSettingsManager.speedUnits.get());
        this.headwindAbs.set(Math.abs(headwind), this.unitsSettingsManager.speedUnits.get());
      }
    });
  }

  /**
   * Gets the unit setting of the Baro.
   * @returns Unit Type that is selected in the system.
   */
  private getBaroSetting(): Subject<Unit<UnitFamily.Pressure>> {
    if (this.generalSettingsManager.getSetting('baroHpa')) {
      this.baroUnit.set(UnitType.IN_HG);
      return this.baroUnit;
    } else {
      //will need to be changed
      this.baroUnit.set(UnitType.IN_HG);
      return this.baroUnit;
    }
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div ref={this.el} class="page aux-page hide-element">
        <div class='aux-page-header' />
        <div class='aux-table-header'>DENSITY ALT / TAS / WINDS</div>

        <div class="aux-table-labels cyan" style="padding-bottom: 2px;">
          <div><span>IND ALT</span></div>
          <div><span>CAS</span></div>
          <div><span>BARO</span></div>
        </div>

        <div class='aux-table datw-table'>
          <div class="datw-table-cell">
            <GNSNumberUnitInput
              data={this.indAlt as unknown as NumberUnitSubject<UnitFamily.Distance>}
              displayUnit={this.unitsSettingsManager.altitudeUnits}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value));
                digitValues[1].set(Math.floor((value % 10000)));
                digitValues[2].set(Math.floor((value % 1000)));
                digitValues[3].set(Math.floor((value % 100)));
                digitValues[4].set(Math.floor((value % 10)));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => {
                return this.renderInactiveValue(value.toFixed(0), this.unitsSettingsManager.altitudeUnits);
              }}
              onInputAccepted={(v): void => {
                this.indAlt.set(v, this.unitsSettingsManager.altitudeUnits.get());
              }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.altitudeUnits} />
            </GNSNumberUnitInput>
          </div>

          <div class="datw-table-cell" id="trip-planning-gs">
            <GNSNumberUnitInput
              data={this.cas as unknown as NumberUnitSubject<UnitFamily.Speed>}
              displayUnit={this.unitsSettingsManager.speedUnits}
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
                this.cas.set(v, this.unitsSettingsManager.speedUnits.get());
              }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.speedUnits} />
            </GNSNumberUnitInput>
          </div>

          <div class="datw-table-cell">
            <GNSNumberUnitInput
              data={this.baro as unknown as NumberUnitSubject<UnitFamily.Pressure>}
              displayUnit={this.getBaroSetting()}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value / 1_000) * 1_000);
                digitValues[1].set(Math.floor(((value % 1000) / 100) * 100));
                digitValues[2].set(Math.floor(((value % 100) / 10) * 10));
                digitValues[3].set(Math.floor((value % 10)));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => {
                const valueStr = value.toString();
                const a = valueStr.substring(0, 2);
                const b = valueStr.substring(2, 4);

                return this.renderInactiveValue(`${a}.${b}`, this.getBaroSetting());
              }}
              onInputAccepted={(v): void => {
                const baroUnit = this.baroUnit.get();

                if (baroUnit === UnitType.IN_HG) {
                  const clampedValue = Math.max(2600, Math.min(3400, v));

                  this.baro.set(clampedValue, baroUnit);
                } else {
                  const clampedValue = Math.max(880.5, Math.min(1151, v));

                  this.baro.set(clampedValue, baroUnit);
                }
              }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <span>.</span>
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.baroUnit} />
            </GNSNumberUnitInput>
          </div>

          <div class="datw-table-cell">
            <GNSNumberUnitInput
              data={this.tat as unknown as NumberUnitSubject<UnitFamily.Temperature>}
              displayUnit={this.unitsSettingsManager.temperatureUnits}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[2].set(Math.floor((value)));
                digitValues[2].set(Math.floor((value % 100)));
                digitValues[2].set(Math.floor((value % 10)));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => {
                return this.renderInactiveValue(value.toFixed(0), this.unitsSettingsManager.temperatureUnits);
              }}
              onInputAccepted={(v): void => {
                this.tat.set(v, this.unitsSettingsManager.temperatureUnits.get());
              }}
            >
              <GNSSignInput sign={Subject.create<1 | -1>(1)} /> {/* FIXME this is not how it works IRL, but I will adapt the digit component later to support a negative sign */}
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.unitsSettingsManager.temperatureUnits} />
            </GNSNumberUnitInput>
          </div>

          <div class="datw-table-cell">
            <GNSNumberUnitInput
              data={this.hdg as unknown as NumberUnitSubject<UnitFamily.Angle>}
              displayUnit={this.angleUnit}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value / 10) * 10);
                digitValues[1].set(Math.floor(value % 10));
              }}
              editOnActivate={false}
              activateOnClr={true}
              class=''
              renderInactiveValue={(value): VNode => (
                <div>
                  {value.toFixed(0).padStart(3, '0')}
                  <GNSVerticalUnitDisplay unit={this.angleUnit} />
                </div>
              )}
              onInputAccepted={(v): void => {
                this.hdg.set(v, this.angleUnit.get());
              }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={36} increment={1} scale={10} wrap={true} formatter={(v) => v.toString().padStart(2, '0')} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={this.angleUnit} />
            </GNSNumberUnitInput>
          </div>
        </div>

        <div class="aux-table-labels cyan" style="padding-bottom: 3px; padding-top: 2px;">
          <div><span>TAT</span></div>
          <div><span>HDG</span></div>
          <div><span></span></div>
        </div>

        <div class="aux-table-labels cyan" style="padding-top: 3px; padding-bottom: 2px;">
          <div><span>DEN ALT</span></div>
          <div><span>TAS</span></div>
        </div>

        <div class='aux-table datw-table'>
          <div class="datw-table-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ forceSign: true, precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
              value={this.denAlt}
              displayUnit={this.unitsSettingsManager.altitudeUnits}
            />
          </div>

          <div class="datw-table-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
              value={this.tas}
              displayUnit={this.unitsSettingsManager.speedUnits}
            />
          </div>

          <div class="datw-table-cell"></div>

          <div class="datw-table-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
              value={this.windDirectionOut}
              displayUnit={UnitType.DEGREE}
            />

            <span class="datw-table-at">at</span>
          </div>

          <div class="datw-table-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
              value={this.windSpeedOut}
              displayUnit={this.unitsSettingsManager.speedUnits}
            />
          </div>

          <div class="datw-table-cell">
            <GNSNumberUnitDisplay
              formatter={NumberFormatter.create({ precision: -1, forceDecimalZeroes: true, maxDigits: 3, nanString: '___' })}
              value={this.headwindAbs}
              displayUnit={this.unitsSettingsManager.speedUnits}
            />
          </div>
        </div>

        <div class="aux-table-labels cyan" style="padding-bottom: 10px; padding-top:2px;">
          <div style="grid-column: span 2;">
            <span>WIND</span>
          </div>
          <div>
            <span>{this.headwind.map((value) => value.number >= 0 ? 'HEAD WIND' : 'TAIL WIND')}</span>
          </div>
        </div>
      </div>
    );
  }
}
