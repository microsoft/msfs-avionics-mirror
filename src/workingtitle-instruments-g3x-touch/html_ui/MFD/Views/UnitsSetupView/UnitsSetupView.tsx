import { FSComponent, MutableSubscribable, UnitType, VNode } from '@microsoft/msfs-sdk';

import { UnitsFuelSettingMode, UnitsTemperatureSettingMode, UnitsWeightSettingMode } from '@microsoft/msfs-garminsdk';

import { G3XUnitsFuelType, UnitsConfig } from '../../../Shared/AvionicsConfig/UnitsConfig';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XUnitType } from '../../../Shared/Math/G3XUnitType';
import { G3XUnitsBaroPressureSettingMode, G3XUnitsFuelEconomySettingMode, G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';

import './UnitsSetupView.css';

/**
 * Component props for {@link UnitsSetupView}.
 */
export interface UnitsSetupViewProps extends UiViewProps {
  /** A configuration object defining options for measurement units. */
  unitsConfig: UnitsConfig;
}

/**
 * A units setup menu.
 */
export class UnitsSetupView extends AbstractUiView<UnitsSetupViewProps> {
  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 96 : 50;
  private readonly listItemSpacingPx = this.props.uiService.gduFormat === '460' ? 8 : 4;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.listRef.instance.scrollToIndex(0, 0, true, false);
  }

  /** @inheritDoc */
  public onClose(): void {
    this.listRef.instance.clearRecentFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Gets the available fuel setting options.
   * @returns The available fuel setting options, as an object whose keys are the options from which the user can
   * select and whose values are the text to display for each option.
   */
  private getFuelSettingOptions(): Partial<Record<UnitsFuelSettingMode, string>> {
    switch (this.props.unitsConfig.fuelType) {
      case G3XUnitsFuelType.JetA:
        return {
          [UnitsFuelSettingMode.GallonsJetA]: 'Gallons (US)',
          [UnitsFuelSettingMode.LitersJetA]: 'Liters',
          [UnitsFuelSettingMode.Pounds]: 'Pounds (lbs)\nJet',
          [UnitsFuelSettingMode.Kilograms]: 'Kilograms (kg)\nJet',
        };
      case G3XUnitsFuelType.OneHundredLL:
        return {
          [UnitsFuelSettingMode.Gallons100LL]: 'Gallons (US)',
          [UnitsFuelSettingMode.Liters100LL]: 'Liters',
          [UnitsFuelSettingMode.Pounds]: 'Pounds (lbs)\nAvgas',
          [UnitsFuelSettingMode.Kilograms]: 'Kilograms (kg)\nAvgas',
        };
      case G3XUnitsFuelType.Autogas:
        return {
          [UnitsFuelSettingMode.GallonsAutogas]: 'Gallons (US)',
          [UnitsFuelSettingMode.LitersAutogas]: 'Liters',
          [UnitsFuelSettingMode.Pounds]: 'Pounds (lbs)\nAutogas',
          [UnitsFuelSettingMode.Kilograms]: 'Kilograms (kg)\nAutogas',
        };
      case G3XUnitsFuelType.Sim:
      default: {
        const fuelName = G3XUnitType.GALLON_SIM_FUEL.convertTo(1, UnitType.POUND) < 6.1 ? 'Avgas' : 'Jet';
        return {
          [UnitsFuelSettingMode.GallonsSim]: 'Gallons (US)',
          [UnitsFuelSettingMode.LitersSim]: 'Liters',
          [UnitsFuelSettingMode.Pounds]: `Pounds (lbs)\n${fuelName}`,
          [UnitsFuelSettingMode.Kilograms]: `Kilograms (kg)\n${fuelName}`,
        };
      }
    }
  }

  /**
   * Gets the available fuel economy setting options.
   * @returns The available fuel economy setting options, as an object whose keys are the options from which the user
   * can select and whose values are the text to display for each option.
   */
  private getFuelEconomySettingOptions(): Partial<Record<G3XUnitsFuelEconomySettingMode, string>> {
    switch (this.props.unitsConfig.fuelType) {
      case G3XUnitsFuelType.JetA:
        return {
          [G3XUnitsFuelEconomySettingMode.NauticalJetA]: 'Nautical (nm/US gal)',
          [G3XUnitsFuelEconomySettingMode.StatuteJetA]: 'Statute (mi/US gal)',
          [G3XUnitsFuelEconomySettingMode.MetricKmPerLJetA]: 'Metric (km/L)',
          [G3XUnitsFuelEconomySettingMode.MetricLPer100KmJetA]: 'Metric (L/100km)',
        };
      case G3XUnitsFuelType.OneHundredLL:
        return {
          [G3XUnitsFuelEconomySettingMode.Nautical100LL]: 'Nautical (nm/US gal)',
          [G3XUnitsFuelEconomySettingMode.Statute100LL]: 'Statute (mi/US gal)',
          [G3XUnitsFuelEconomySettingMode.MetricKmPerL100LL]: 'Metric (km/L)',
          [G3XUnitsFuelEconomySettingMode.MetricLPer100Km100LL]: 'Metric (L/100km)',
        };
      case G3XUnitsFuelType.Autogas:
        return {
          [G3XUnitsFuelEconomySettingMode.NauticalAutogas]: 'Nautical (nm/US gal)',
          [G3XUnitsFuelEconomySettingMode.StatuteAutogas]: 'Statute (mi/US gal)',
          [G3XUnitsFuelEconomySettingMode.MetricKmPerLAutogas]: 'Metric (km/L)',
          [G3XUnitsFuelEconomySettingMode.MetricLPer100KmAutogas]: 'Metric (L/100km)',
        };
      case G3XUnitsFuelType.Sim:
      default: {
        return {
          [G3XUnitsFuelEconomySettingMode.NauticalSim]: 'Nautical (nm/US gal)',
          [G3XUnitsFuelEconomySettingMode.StatuteSim]: 'Statute (mi/US gal)',
          [G3XUnitsFuelEconomySettingMode.MetricKmPerLSim]: 'Metric (km/L)',
          [G3XUnitsFuelEconomySettingMode.MetricLPer100KmSim]: 'Metric (L/100km)',
        };
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    const settingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

    return (
      <div class='units-setup-view ui-titled-view'>
        <div class='units-setup-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_units_setup.png`} class='ui-view-title-icon' />
          <div>Units Setup</div>
        </div>
        <div class='units-setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={6}
            autoDisableOverscroll
            class='units-setup-view-list'
          >
            <UiListItem>
              <div class='units-setup-view-row-left'>Air Temperature</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  settingManager.getSetting('unitsTemperature'),
                  {
                    [UnitsTemperatureSettingMode.Fahrenheit]: 'Fahrenheit (°F)',
                    [UnitsTemperatureSettingMode.Celsius]: 'Celsius (°C)'
                  },
                  'units-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='units-setup-view-row-left'>Baro Pressure</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  settingManager.getSetting('unitsBaroPressure'),
                  {
                    [G3XUnitsBaroPressureSettingMode.InHg]: 'Inches (Hg)',
                    [G3XUnitsBaroPressureSettingMode.Millibars]: 'Millibars',
                    [G3XUnitsBaroPressureSettingMode.Hectopascals]: 'Hectopascals'
                  },
                  'units-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='units-setup-view-row-left'>Weight</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  settingManager.getSetting('unitsWeight'),
                  {
                    [UnitsWeightSettingMode.Pounds]: 'Pounds (lbs)',
                    [UnitsWeightSettingMode.Kilograms]: 'Kilograms (Kg)'
                  },
                  'units-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='units-setup-view-row-left'>Fuel Calculator</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  settingManager.getSetting('unitsFuel'),
                  this.getFuelSettingOptions(),
                  'units-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
            <UiListItem>
              <div class='units-setup-view-row-left'>Fuel Economy</div>
              <UiListFocusable>
                {this.renderListSelectButton(
                  settingManager.getSetting('unitsFuelEconomy'),
                  this.getFuelEconomySettingOptions(),
                  'units-setup-view-row-right'
                )}
              </UiListFocusable>
            </UiListItem>
          </UiList>
        </div>
      </div>
    );
  }

  /**
   * Renders a button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog.
   * @param state The state to which to bind the button.
   * @param options An object whose keys are the options from which the user can select and whose values are the text
   * to display for each option.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @param hideDropdownArrow Whether to hide the button's dropdown arrow. Defaults to `false`.
   * @returns A button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog, as a VNode.
   */
  private renderListSelectButton<T extends string | number>(
    state: MutableSubscribable<T>,
    options?: Partial<Readonly<Record<T, string>>>,
    cssClass?: string,
    hideDropdownArrow?: boolean
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 84 : 42;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const renderValue = (value: T): string => options?.[value] ?? '';

    let listParams: UiListDialogParams<T>;

    if (options === undefined) {
      listParams = { inputData: [] };
    } else {
      const values = Object.keys(options) as T[];

      listParams = {
        selectedValue: state,
        inputData: values.map(value => {
          return {
            value,
            labelRenderer: renderValue.bind(undefined, value),
          };
        }),
        itemsPerPage: Math.min(values.length, 5),
        listItemHeightPx: defaultListItemHeight,
        listItemSpacingPx: defaultListItemSpacing,
        autoDisableOverscroll: true,
        class: 'units-setup-view-select-list'
      };
    }

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        isEnabled={options !== undefined}
        state={state}
        renderValue={renderValue}
        listParams={listParams}
        hideDropdownArrow={hideDropdownArrow}
        isInList
        class={cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}