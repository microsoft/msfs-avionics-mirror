import {
  FocusPosition, FSComponent, NumberUnitSubject, Subject, Subscribable, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { GeneralUserSettingsManager, SurfaceTypeOption } from '../../../../Settings/GeneralSettingsProvider';
import { GNSDigitInput } from '../../../Controls/GNSDigitInput';
import { GNSVerticalUnitDisplay } from '../../../Controls/GNSNumberUnitDisplay';
import { GNSNumberUnitInput } from '../../../Controls/GNSNumberUnitInput';
import { OptionDialog } from '../../../Controls/OptionDialog';
import { SelectableText } from '../../../Controls/SelectableText';
import { MenuDefinition, MenuEntry, ViewService } from '../../Pages';
import { AuxPage } from '../AuxPages';

import './NearestAirportCriteria.css';

/**
 * DISPLAY BACKLIGHT page menu
 */
class NearestAirportCriteriaMenu extends MenuDefinition {
  /**
   * Ctor
   *
   * @param page the display backlight page instance
   */
  constructor(private readonly page: NearestAirportCriteria) {
    super();
  }

  public readonly entries: readonly MenuEntry[] = [
    {
      label: 'Reset Defaults?',
      disabled: Subject.create<boolean>(false),
      action: (): void => {
        this.page.resetDefaults();
        ViewService.back();
      },
    },
  ];

  /** @inheritDoc */
  updateEntries(): void {
    // noop
  }
}

const SURFACE_TYPE_OPTION_NAME_LIST = {
  [SurfaceTypeOption.Any]: 'Any',
  [SurfaceTypeOption.HardOnly]: 'Hard Only',
  [SurfaceTypeOption.HardOrSoft]: 'Hard/Soft',
  [SurfaceTypeOption.Water]: 'Water',
};

/**
 * NEAREST AIRPORT CRITERIA page
 */
export class NearestAirportCriteria extends AuxPage {
  protected readonly menu = new NearestAirportCriteriaMenu(this);

  private readonly dialogRef = FSComponent.createRef<OptionDialog>();

  private readonly generalSettingsManager = GeneralUserSettingsManager.getManager(this.props.bus);

  private readonly surfaceTypeSetting = this.generalSettingsManager.getSetting('nearest_airport_criteria_surface_type');
  private readonly minimumLengthSetting = this.generalSettingsManager.getSetting('nearest_airport_criteria_min_length');

  private readonly minimumLengthNumberUnitSub = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  /**
   * Resets settings to default
   */
  resetDefaults(): void {
    this.surfaceTypeSetting.set(SurfaceTypeOption.Any);
    this.minimumLengthSetting.set(0);
  }

  /**
   * handles opening the popup
   *
   * @returns true
   */
  private handleOpenPopup(): boolean {
    this.dialogRef.instance.openPopout(0);
    this.dialogRef.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * handles opening the popup
   *
   * @returns true
   */
  private handleClosePopup(): boolean {
    this.dialogRef.instance.closePopout();
    this.dialogRef.instance.blur();
    return true;
  }

  /**
   * Handles a surface type being selected in the dialog
   *
   * @param index the surface type, index of {@link SurfaceTypeOption}
   */
  private handleSelectSurfaceType(index: number): void {
    this.surfaceTypeSetting.set(index);

    this.handleClosePopup();
  }

  /**
   * Handles a minimum length being input
   *
   * @param length the minimum length
   */
  private handleSelectMinimumLength(length: number): void {
    this.minimumLengthSetting.set(length);

    this.handleClosePopup();
  }

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

    this.dialogRef.instance.setItems(Object.values(SURFACE_TYPE_OPTION_NAME_LIST));

    this.minimumLengthSetting.sub((value) => this.minimumLengthNumberUnitSub.set(value));
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class="page aux-page hide-element" ref={this.el}>
        <div class='aux-page-header'>
        </div>
        <div class='aux-table-header'>
          NEAREST AIRPORT CRITERIA
        </div>

        <div class="nearest-airport-criteria-container">
          <div class="nearest-airport-criteria-side-title cyan">RUNWAY SURFACE</div>
          <div class="aux-table nearest-airport-criteria-table">
            <SelectableText
              class="aux-entry nearest-airport-criteria-surface"
              data={this.surfaceTypeSetting.map((it) => SURFACE_TYPE_OPTION_NAME_LIST[it])}
              onRightInnerInc={this.handleOpenPopup.bind(this)}
              onRightInnerDec={this.handleOpenPopup.bind(this)}
            />
            <OptionDialog
              ref={this.dialogRef}
              class="nearest-airport-criteria-option-dialog"
              label="SURFACE TYPE"
              onSelected={(index): void => this.handleSelectSurfaceType(index)}
            />
          </div>
          <div></div>
          <div></div>
          <div class="nearest-airport-criteria-side-title cyan">MINIMUM LENGTH</div>
          <div class="aux-table nearest-airport-criteria-table">
            <GNSNumberUnitInput
              class="aux-entry nearest-airport-criteria-surface"
              data={this.minimumLengthNumberUnitSub as unknown as NumberUnitSubject<UnitFamily.Distance>}
              displayUnit={Subject.create(UnitType.FOOT)}
              digitizer={(value, signValues, digitValues): void => {
                digitValues[0].set(Math.floor(value / 10000) * 10000);
                digitValues[1].set(Math.floor(value / 1000) % 10 * 1000);
                digitValues[2].set(Math.floor(value / 100) % 10 * 100);
                digitValues[3].set(Math.floor(value / 10) % 10 * 10);
                digitValues[4].set(value % 10);
              }}
              editOnActivate={false}
              activateOnClr={true}
              renderInactiveValue={(value): VNode => {
                return this.renderInactiveValue(value.toFixed(0), Subject.create(UnitType.FOOT));
              }}
              onInputAccepted={(value): void => {
                this.handleSelectMinimumLength(value);
              }}
            >
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1000} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={100} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={10} wrap={true} />
              <GNSDigitInput value={Subject.create(0)} minValue={0} maxValue={10} increment={1} scale={1} wrap={true} />
              <GNSVerticalUnitDisplay unit={UnitType.FOOT} />
            </GNSNumberUnitInput>
          </div>
        </div>
      </div>
    );
  }
}
