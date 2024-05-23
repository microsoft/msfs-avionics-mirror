import {
  FSComponent, NumberFormatter, NumberUnitSubject, RunwaySurfaceCategory, Subject, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { G3XNumberUnitDisplay } from '../../../../Shared/Components/Common/G3XNumberUnitDisplay';
import { CombinedTouchButton } from '../../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiSetValueTouchButton } from '../../../../Shared/Components/TouchButton/UiSetValueTouchButton';
import { UiToggleTouchButton } from '../../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiValueTouchButton } from '../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { G3XNearestAirportUserSettings } from '../../../../Shared/Settings/G3XNearestAirportUserSettings';
import { G3XUnitsUserSettings } from '../../../../Shared/Settings/G3XUnitsUserSettings';
import { AbstractUiView } from '../../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../../Components/TouchButton/UiListSelectTouchButton';
import { UiGenericNumberUnitDialog } from '../../../Dialogs/UiGenericNumberUnitDialog';

import './MfdNrstAirportOptionsPopup.css';

/**
 * An MFD nearest airport options menu.
 */
export class MfdNrstAirportOptionsPopup extends AbstractUiView {
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '____' });

  private thisNode?: VNode;

  private readonly nearestSettingManager = G3XNearestAirportUserSettings.getManager(this.props.uiService.bus);
  private readonly unitsSettingManager = G3XUnitsUserSettings.getManager(this.props.uiService.bus);

  private readonly minRunwayLength = NumberUnitSubject.create(UnitType.FOOT.createNumber(NaN));

  // TODO: Fix GDU470 (portrait) values.
  private readonly selectionListItemHeight = this.props.uiService.gduFormat ? 78 : 40;
  private readonly selectionListItemSpacing = this.props.uiService.gduFormat ? 2 : 1;

  private minRunwayLengthPipe?: Subscription;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.focusController.setActive(true);

    this.focusController.knobLabelState.pipe(this._knobLabelState);

    this.minRunwayLengthPipe = this.nearestSettingManager.getSetting('nearestAptRunwayLength').pipe(this.minRunwayLength);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.focusController.clearRecentFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MainMenu, true, {
        popupType: 'slideout-bottom-full',
        backgroundOcclusion: 'hide'
      });
      return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-nrst-airport-options-popup ui-view-panel'>
        <div class='mfd-nrst-airport-options-popup-title'>Nearest Airport Criteria</div>
        <div class='mfd-nrst-airport-options-popup-main'>
          <div class='mfd-nrst-airport-options-popup-runway-view-box ui-view-box'>
            <div class='ui-view-box-title'>Runway</div>
            <UiListSelectTouchButton
              uiService={this.props.uiService}
              listDialogLayer={UiViewStackLayer.Overlay}
              listDialogKey={UiViewKeys.ListDialog1}
              openDialogAsPositioned
              containerRef={this.props.containerRef}
              label={'Surface'}
              state={this.nearestSettingManager.getSetting('nearestAptRunwaySurfaceTypes')}
              renderValue={filter => {
                switch (filter) {
                  case RunwaySurfaceCategory.Hard:
                    return 'Hard Only';
                  case RunwaySurfaceCategory.Hard | RunwaySurfaceCategory.Soft:
                    return 'Hard/Soft';
                  case RunwaySurfaceCategory.Water:
                    return 'Water Only';
                  case ~0:
                    return 'Any';
                  default:
                    return '';
                }
              }}
              listParams={{
                selectedValue: this.nearestSettingManager.getSetting('nearestAptRunwaySurfaceTypes'),
                inputData: [
                  {
                    value: RunwaySurfaceCategory.Hard,
                    labelRenderer: () => 'Hard Only'
                  },
                  {
                    value: RunwaySurfaceCategory.Hard | RunwaySurfaceCategory.Soft,
                    labelRenderer: () => 'Hard/Soft'
                  },
                  {
                    value: RunwaySurfaceCategory.Water,
                    labelRenderer: () => 'Water Only'
                  },
                  {
                    value: ~0,
                    labelRenderer: () => 'Any'
                  }
                ],
                listItemHeightPx: this.selectionListItemHeight,
                listItemSpacingPx: this.selectionListItemSpacing,
                itemsPerPage: 4,
                autoDisableOverscroll: true,
                class: 'mfd-nrst-airport-options-popup-list-dialog'
              }}
              focusController={this.focusController}
              hideDropdownArrow
              class='mfd-nrst-airport-options-popup-runway-surface'
            />
            <UiValueTouchButton
              state={this.nearestSettingManager.getSetting('nearestAptRunwayLength')}
              label='Min Length'
              renderValue={
                <G3XNumberUnitDisplay
                  value={this.minRunwayLength}
                  displayUnit={this.unitsSettingManager.distanceUnitsSmall}
                  formatter={MfdNrstAirportOptionsPopup.DISTANCE_FORMATTER}
                />
              }
              onPressed={async (button, state) => {
                const result = await this.props.uiService
                  .openMfdPopup<UiGenericNumberUnitDialog>(UiViewStackLayer.Overlay, UiViewKeys.GenericNumberUnitDialog1)
                  .ref.request({
                    unitType: UnitType.FOOT,
                    initialValue: state.value,
                    initialUnit: UnitType.FOOT,
                    minimumValue: 0,
                    maximumValue: 10000,
                    decimalCount: 0,
                    title: 'Min Runway Length',
                    innerKnobLabel: 'Select Runway Length',
                    outerKnobLabel: 'Select Runway Length',
                  });

                if (!result.wasCancelled) {
                  state.value = UnitType.FOOT.convertFrom(result.payload.value, result.payload.unit);
                }
              }}
              focusController={this.focusController}
              class='mfd-nrst-airport-options-popup-runway-length'
            />
          </div>
          <div class='mfd-nrst-airport-options-popup-types-row'>
            <UiToggleTouchButton
              state={Subject.create(true)}
              label={'Private\nAirports'}
              isEnabled={false}
            />
            <UiToggleTouchButton
              state={Subject.create(false)}
              label={'Heliports'}
              isEnabled={false}
            />
          </div>
          <CombinedTouchButton
            orientation='row'
            isFocusable
            canBeFocused
            focusSelfOnTouch
            onUiInteractionEvent={event => {
              switch (event) {
                case UiInteractionEvent.SingleKnobPress:
                case UiInteractionEvent.LeftKnobPress:
                case UiInteractionEvent.RightKnobPress: {
                  const setting = this.nearestSettingManager.getSetting('nearestAptShowCity');
                  setting.value = !setting.value;
                  return true;
                }
                default:
                  return false;
              }
            }}
            focusController={this.focusController}
            class='mfd-nrst-airport-options-popup-names'
          >
            <UiSetValueTouchButton
              state={this.nearestSettingManager.getSetting('nearestAptShowCity')}
              setValue={true}
              label={'City\nNames'}
            />
            <UiSetValueTouchButton
              state={this.nearestSettingManager.getSetting('nearestAptShowCity')}
              setValue={false}
              label={'Facility\nNames'}
            />
          </CombinedTouchButton>
        </div>
        <div class='mfd-nrst-airport-options-popup-main-menu-msg'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='mfd-nrst-airport-options-popup-main-menu-icon' /> for Main Menu
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.minRunwayLengthPipe?.destroy();

    super.destroy();
  }
}