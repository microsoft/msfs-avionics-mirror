import { ComponentProps, ConsumerSubject, DisplayComponent, FSComponent, GNSSEvents, Subscribable, UserSetting, VNode } from '@microsoft/msfs-sdk';
import {
  MagVarDisplay, UnitsAltitudeSettingMode, UnitsDistanceSettingMode, UnitsFuelSettingMode, UnitsNavAngleSettingMode,
  UnitsTemperatureSettingMode, UnitsUserSettings, UnitsUserSettingTypes, UnitsWeightSettingMode,
} from '@microsoft/msfs-garminsdk';
import { GtcList } from '../../Components/List/GtcList';
import { GtcListItem } from '../../Components/List/GtcListItem';
import { GtcListSelectTouchButton } from '../../Components/TouchButton/GtcListSelectTouchButton';
import { GtcInteractionEvent } from '../../GtcService/GtcInteractionEvent';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { SidebarState } from '../../GtcService/Sidebar';
import { GtcAvionicsSettingsPageTabContent } from './GtcAvionicsSettingsPageTabContent';

/**
 * Component props for GtcAvionicsSettingsPageUnitsList.
 */
export interface GtcAvionicsSettingsPageUnitsListProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The height of each list item, in pixels. */
  listItemHeight: number;

  /** The spacing between each list item, in pixels. */
  listItemSpacing: number;

  /** The SidebarState to use. */
  sidebarState?: SidebarState | Subscribable<SidebarState | null>;
}

/**
 * A GTC avionics setting page units settings list.
 */
export class GtcAvionicsSettingsPageUnitsList extends DisplayComponent<GtcAvionicsSettingsPageUnitsListProps> implements GtcAvionicsSettingsPageTabContent {
  private readonly listRef = FSComponent.createRef<GtcList<any>>();

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.gtcService.bus);

  private readonly magVar = ConsumerSubject.create(this.props.gtcService.bus.getSubscriber<GNSSEvents>().on('magvar'), 0).pause();

  /**
   * Coerce the weight unit to equal the fuel unit, if the fuel unit selected is weight-based rather than volumetric.
   * @param value The fuel unit selected.
   * @param state The current fuel unit.
   */
  private coerceWeightUnitToFuelUnit = (
    value: UnitsFuelSettingMode,
    state: UserSetting<NonNullable<UnitsUserSettingTypes['unitsFuel']>>
  ): void => {
    state.set(value);
    const weightUnit = this.unitsSettingManager.getSetting('unitsWeight');
    if (value === UnitsFuelSettingMode.Kilograms && weightUnit.get() === UnitsWeightSettingMode.Pounds) {
      weightUnit.set(UnitsWeightSettingMode.Kilograms);
    }
    if (value === UnitsFuelSettingMode.Pounds && weightUnit.get() === UnitsWeightSettingMode.Kilograms) {
      weightUnit.set(UnitsWeightSettingMode.Pounds);
    }
  };

  /**
   * Coerce the fuel unit to equal the weight unit, even when the current weight unit is reselected.
   * @param value The weight unit selected.
   * @param state The current weight unit.
   */
  private coerceFuelUnitToWeightUnit = (
    value: UnitsWeightSettingMode,
    state: UserSetting<NonNullable<UnitsUserSettingTypes['unitsWeight']>>
  ): void => {
    state.set(value);
    this.unitsSettingManager.getSetting('unitsFuel')
      .set(value === UnitsWeightSettingMode.Pounds ? UnitsFuelSettingMode.Pounds : UnitsFuelSettingMode.Kilograms);
  };

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    return this.listRef.instance.onGtcInteractionEvent(event);
  }

  /** @inheritdoc */
  public onPause(): void {
    this.magVar.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    this.magVar.resume();
  }

  /** @inheritdoc */
  public render(): VNode {
    const renderNavAngle = (value: UnitsNavAngleSettingMode): string | VNode => {
      switch (value) {
        case UnitsNavAngleSettingMode.Magnetic:
          return (
            <div>Magnetic( ° )</div>
          );
        case UnitsNavAngleSettingMode.True:
          return (
            <div>True( °<span class='avionics-settings-page-small-text'>T</span> )</div>
          );
        default:
          return '';
      }
    };

    const renderDistance = (value: UnitsDistanceSettingMode): string | VNode => {
      switch (value) {
        case UnitsDistanceSettingMode.Metric:
          return (
            <div>
              Metric<br />
              (<span class='avionics-settings-page-small-text'>KM</span>, <span class='avionics-settings-page-small-text'>KH</span>)
            </div>
          );
        case UnitsDistanceSettingMode.Nautical:
          return (
            <div>
              Nautical<br />
              (<span class='avionics-settings-page-small-text'>NM</span>, <span class='avionics-settings-page-small-text'>KT</span>)
            </div>
          );
        default:
          return '';
      }
    };

    const renderAltitude = (value: UnitsAltitudeSettingMode): string | VNode => {
      switch (value) {
        case UnitsAltitudeSettingMode.Feet:
          return (
            <div>
              Feet<br />
              (<span class='avionics-settings-page-small-text'>FT</span>, <span class='avionics-settings-page-small-text'>FPM</span>)
            </div>
          );
        case UnitsAltitudeSettingMode.Meters:
          return (
            <div>
              Meters<br />
              (<span class='avionics-settings-page-small-text'>M</span>, <span class='avionics-settings-page-small-text'>MPM</span>)
            </div>
          );
        default:
          return '';
      }
    };

    const renderTemperature = (value: UnitsTemperatureSettingMode): string | VNode => {
      switch (value) {
        case UnitsTemperatureSettingMode.Celsius:
          return (
            <div>Celsius ( °<span class='avionics-settings-page-small-text'>C</span> )</div>
          );
        case UnitsTemperatureSettingMode.Fahrenheit:
          return (
            <div>Fahrenheit<br />( °<span class='avionics-settings-page-small-text'>F</span> )</div>
          );
        default:
          return '';
      }
    };

    const renderFuel = (value: UnitsFuelSettingMode): string | VNode => {
      switch (value) {
        case UnitsFuelSettingMode.Gallons:
          return (
            <div>
              Gallons<br />
              (<span class='avionics-settings-page-small-text'>GAL</span>, <span class='avionics-settings-page-small-text'>GAL/HR</span>)
            </div>
          );
        case UnitsFuelSettingMode.ImpGal:
          return (
            <div>
              Imp Gallons<br />
              (<span class='avionics-settings-page-small-text'>IG</span>, <span class='avionics-settings-page-small-text'>IG/HR</span>)
            </div>
          );
        case UnitsFuelSettingMode.Kilograms:
          return (
            <div>
              Kilograms<br />
              (<span class='avionics-settings-page-small-text'>KG</span>, <span class='avionics-settings-page-small-text'>KG/HR</span>)
            </div>
          );
        case UnitsFuelSettingMode.Liters:
          return (
            <div>
              Liters<br />
              (<span class='avionics-settings-page-small-text'>LT</span>, <span class='avionics-settings-page-small-text'>LT/HR</span>)
            </div>
          );
        case UnitsFuelSettingMode.Pounds:
          return (
            <div>
              Pounds<br />
              (<span class='avionics-settings-page-small-text'>LB</span>, <span class='avionics-settings-page-small-text'>LB/HR</span>)
            </div>
          );
        default:
          return '';
      }
    };

    const renderWeight = (value: UnitsWeightSettingMode): string | VNode => {
      switch (value) {
        case UnitsWeightSettingMode.Kilograms:
          return (
            <div>Kilograms (<span class='avionics-settings-page-small-text'>KG</span>)</div>
          );
        case UnitsWeightSettingMode.Pounds:
          return (
            <div>Pounds (<span class='avionics-settings-page-small-text'>LB</span>)</div>
          );
        default:
          return '';
      }
    };

    return (
      <GtcList
        ref={this.listRef}
        bus={this.props.gtcService.bus}
        itemsPerPage={4}
        listItemHeightPx={this.props.listItemHeight}
        listItemSpacingPx={this.props.listItemSpacing}
        sidebarState={this.props.sidebarState}
        class='avionics-settings-page-tab-list'
      >
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Nav Angle
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.unitsSettingManager.getSetting('unitsNavAngle')}
            renderValue={renderNavAngle}
            listParams={{
              title: 'Select Heading Type',
              inputData: [
                {
                  value: UnitsNavAngleSettingMode.Magnetic,
                  labelRenderer: () => renderNavAngle(UnitsNavAngleSettingMode.Magnetic)
                },
                {
                  value: UnitsNavAngleSettingMode.True,
                  labelRenderer: () => renderNavAngle(UnitsNavAngleSettingMode.True)
                }
              ],
              selectedValue: this.unitsSettingManager.getSetting('unitsNavAngle')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Magnetic Variance
          </div>
          <MagVarDisplay
            magvar={this.magVar}
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Distance/Speed
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.unitsSettingManager.getSetting('unitsDistance')}
            renderValue={renderDistance}
            listParams={{
              title: 'Select Distance Units',
              inputData: [
                {
                  value: UnitsDistanceSettingMode.Metric,
                  labelRenderer: () => renderDistance(UnitsDistanceSettingMode.Metric)
                },
                {
                  value: UnitsDistanceSettingMode.Nautical,
                  labelRenderer: () => renderDistance(UnitsDistanceSettingMode.Nautical)
                }
              ],
              selectedValue: this.unitsSettingManager.getSetting('unitsDistance')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>Altitude/Vertical<br />Speed</div>
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.unitsSettingManager.getSetting('unitsAltitude')}
            renderValue={renderAltitude}
            listParams={{
              title: 'Select Altitude Units',
              inputData: [
                {
                  value: UnitsAltitudeSettingMode.Feet,
                  labelRenderer: () => renderAltitude(UnitsAltitudeSettingMode.Feet)
                },
                {
                  value: UnitsAltitudeSettingMode.Meters,
                  labelRenderer: () => renderAltitude(UnitsAltitudeSettingMode.Meters)
                }
              ],
              selectedValue: this.unitsSettingManager.getSetting('unitsAltitude')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>External<br />Temperature</div>
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.unitsSettingManager.getSetting('unitsTemperature')}
            renderValue={renderTemperature}
            listParams={{
              title: 'Select External Temperature Units',
              inputData: [
                {
                  value: UnitsTemperatureSettingMode.Celsius,
                  labelRenderer: () => renderTemperature(UnitsTemperatureSettingMode.Celsius)
                },
                {
                  value: UnitsTemperatureSettingMode.Fahrenheit,
                  labelRenderer: () => renderTemperature(UnitsTemperatureSettingMode.Fahrenheit)
                }
              ],
              selectedValue: this.unitsSettingManager.getSetting('unitsTemperature')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            <div>Cockpit/Cabin<br />Temperature</div>
          </div>
          <div class='avionics-settings-page-row-right'>
            <div>Fahrenheit<br />( °<span class='avionics-settings-page-small-text'>F</span> )</div>
          </div>
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Fuel
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.unitsSettingManager.getSetting('unitsFuel')}
            onSelected={this.coerceWeightUnitToFuelUnit}
            renderValue={renderFuel}
            listParams={{
              title: 'Select Fuel Flow Units',
              inputData: [
                {
                  value: UnitsFuelSettingMode.Gallons,
                  labelRenderer: () => renderFuel(UnitsFuelSettingMode.Gallons)
                },
                {
                  value: UnitsFuelSettingMode.ImpGal,
                  labelRenderer: () => renderFuel(UnitsFuelSettingMode.ImpGal)
                },
                {
                  value: UnitsFuelSettingMode.Kilograms,
                  labelRenderer: () => renderFuel(UnitsFuelSettingMode.Kilograms)
                },
                {
                  value: UnitsFuelSettingMode.Liters,
                  labelRenderer: () => renderFuel(UnitsFuelSettingMode.Liters)
                },
                {
                  value: UnitsFuelSettingMode.Pounds,
                  labelRenderer: () => renderFuel(UnitsFuelSettingMode.Pounds)
                }
              ],
              selectedValue: this.unitsSettingManager.getSetting('unitsFuel')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
        <GtcListItem class='avionics-settings-page-row'>
          <div class='avionics-settings-page-row-left'>
            Weight
          </div>
          <GtcListSelectTouchButton
            gtcService={this.props.gtcService}
            listDialogKey={GtcViewKeys.ListDialog1}
            state={this.unitsSettingManager.getSetting('unitsWeight')}
            onSelected={this.coerceFuelUnitToWeightUnit}
            renderValue={renderWeight}
            listParams={{
              title: 'Select Weight Units',
              inputData: [
                {
                  value: UnitsWeightSettingMode.Kilograms,
                  labelRenderer: () => renderWeight(UnitsWeightSettingMode.Kilograms)
                },
                {
                  value: UnitsWeightSettingMode.Pounds,
                  labelRenderer: () => renderWeight(UnitsWeightSettingMode.Pounds)
                }
              ],
              selectedValue: this.unitsSettingManager.getSetting('unitsWeight')
            }}
            isInList
            class='avionics-settings-page-row-right'
          />
        </GtcListItem>
      </GtcList>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    this.magVar.destroy();

    super.destroy();
  }
}