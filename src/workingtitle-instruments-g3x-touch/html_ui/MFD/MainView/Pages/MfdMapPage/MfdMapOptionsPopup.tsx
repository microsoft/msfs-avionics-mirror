import { FSComponent, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { MapDeclutterSettingMode, MapTerrainSettingMode } from '@microsoft/msfs-garminsdk';

import { CombinedTouchButton } from '../../../../Shared/Components/TouchButton/CombinedTouchButton';
import { UiSetValueTouchButton } from '../../../../Shared/Components/TouchButton/UiSetValueTouchButton';
import { UiToggleTouchButton } from '../../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { TouchSlider } from '../../../../Shared/Components/TouchSlider/TouchSlider';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { MapUserSettings } from '../../../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';

import './MfdMapOptionsPopup.css';

/**
 * Component props for MfdMapOptionsPopup.
 */
export interface MfdMapOptionsPopupProps extends UiViewProps {
  /** Whether the map controlled by the popup supports the display of traffic. */
  supportTraffic: boolean;
}

/**
 * An MFD map options menu.
 */
export class MfdMapOptionsPopup extends AbstractUiView<MfdMapOptionsPopupProps> {
  private static readonly DETAIL_SLIDER_STOPS: Record<MapDeclutterSettingMode, number> = {
    [MapDeclutterSettingMode.All]: 1,
    [MapDeclutterSettingMode.Level3]: 2 / 3,
    [MapDeclutterSettingMode.Level2]: 1 / 3,
    [MapDeclutterSettingMode.Level1]: 0
  };

  private thisNode?: VNode;

  private readonly mapSettingManager = MapUserSettings.getStandardManager(this.props.uiService.bus);

  private readonly detailSliderState = Subject.create(0);

  private readonly subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Move Selector'],
      [UiKnobId.SingleInner, 'Move Selector'],
      [UiKnobId.LeftOuter, 'Move Selector'],
      [UiKnobId.LeftInner, 'Move Selector'],
      [UiKnobId.RightOuter, 'Move Selector'],
      [UiKnobId.RightInner, 'Move Selector']
    ]);

    const declutterSetting = this.mapSettingManager.getSetting('mapDeclutter');

    this.subscriptions.push(
      declutterSetting.pipe(this.detailSliderState, mode => MfdMapOptionsPopup.DETAIL_SLIDER_STOPS[mode] ?? 1),

      this.detailSliderState.sub(value => {
        let modeToWrite: MapDeclutterSettingMode | undefined = undefined;

        for (const mode in MfdMapOptionsPopup.DETAIL_SLIDER_STOPS) {
          if (MfdMapOptionsPopup.DETAIL_SLIDER_STOPS[mode as MapDeclutterSettingMode] === value) {
            modeToWrite = mode as MapDeclutterSettingMode;
            break;
          }
        }

        if (modeToWrite !== undefined) {
          declutterSetting.value = modeToWrite;
        }
      })
    );
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MainMenu, true, {
        popupType: 'slideout-bottom-full',
        backgroundOcclusion: 'hide'
      });
      return true;
    }

    return false;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='mfd-map-options-popup ui-view-panel'>
        <div class='mfd-map-options-popup-title'>Map Options</div>
        <div class='mfd-map-options-popup-main'>
          <div class='mfd-map-options-popup-col mfd-map-options-popup-col-1'>
            <CombinedTouchButton
              orientation='row'
              class='mfd-map-options-popup-vfr-ifr'
            >
              <UiToggleTouchButton
                label='VFR'
                state={Subject.create(true)}
                isEnabled={false}
              />
              <UiToggleTouchButton
                label='IFR'
                state={Subject.create(false)}
                isEnabled={false}
              />
            </CombinedTouchButton>

            <div class='mfd-map-options-popup-col-1-row'>
              <UiSetValueTouchButton
                label='Terrain'
                state={this.mapSettingManager.getSetting('mapTerrainMode')}
                setValue={MapTerrainSettingMode.Relative}
                onPressed={(button, state) => {
                  if (state.get() === MapTerrainSettingMode.Relative) {
                    state.set(MapTerrainSettingMode.Absolute);
                  } else {
                    state.set(MapTerrainSettingMode.Relative);
                  }
                }}
              />
              <UiToggleTouchButton
                label={'Topo\nShading'}
                state={Subject.create(false)}
                isEnabled={false}
              />
            </div>

            <div class='mfd-map-options-popup-col-1-row'>
              <UiToggleTouchButton
                label='Weather'
                state={this.mapSettingManager.getSetting('mapWeatherShow')}
              />
              <UiToggleTouchButton
                label={'Animate\nWeather'}
                state={Subject.create(false)}
                isEnabled={false}
              />
            </div>

            <div class='mfd-map-options-popup-col-1-row'>
              <UiToggleTouchButton
                label='Traffic'
                state={this.props.supportTraffic ? this.mapSettingManager.getSetting('mapTrafficShow') : Subject.create(false)}
                isEnabled={this.props.supportTraffic}
              />
              <UiToggleTouchButton
                label={'Profile\nView'}
                state={Subject.create(false)}
                isEnabled={false}
              />
            </div>
          </div>
          <div class='mfd-map-options-popup-buttons-divider' />
          <div class='mfd-map-options-popup-col mfd-map-options-popup-col-2'>
            <UiTouchButton
              label={'Set Up\nMap...'}
              onPressed={() => { this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MapSetup, true, { popupType: 'slideout-bottom-full', backgroundOcclusion: 'hide' }); }}
            />
            <div class='mfd-map-options-popup-col-2-spacer' />
            <UiTouchButton
              label={'Weather\nLegend'}
              isEnabled={false}
            />
            <UiTouchButton
              label={'Measure\nDistance'}
              isEnabled={false}
            />
          </div>
          <div class='mfd-map-options-popup-detail-container'>
            <div class='mfd-map-options-popup-detail-title'>Map<br />Detail</div>
            <div class='mfd-map-options-popup-detail-slider-label mfd-map-options-popup-detail-slider-most'>Most</div>
            <TouchSlider
              bus={this.props.uiService.bus}
              orientation='to-top'
              state={this.detailSliderState}
              stops={Object.values(MfdMapOptionsPopup.DETAIL_SLIDER_STOPS)}
              foreground={
                <div class='mfd-map-options-popup-detail-slider-foreground' />
              }
              inset={
                <div class='mfd-map-options-popup-detail-slider-inset'>
                  <div class='mfd-map-options-popup-detail-slider-section'>-1</div>
                  <div class='mfd-map-options-popup-detail-slider-stop' />
                  <div class='mfd-map-options-popup-detail-slider-section'>-2</div>
                  <div class='mfd-map-options-popup-detail-slider-stop' />
                  <div class='mfd-map-options-popup-detail-slider-section'>-3</div>
                </div>
              }
              changeValueOnDrag
              lockFocusOnDrag
              dragLockFocusThresholdPx={this.props.uiService.gduFormat === '460' ? 10 : 5}
              class='mfd-map-options-popup-detail-slider'
            >
            </TouchSlider>
            <div class='mfd-map-options-popup-detail-slider-label mfd-map-options-popup-detail-slider-least'>Least</div>
          </div>
        </div>
        <div class='mfd-map-options-popup-main-menu-msg'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='mfd-map-options-popup-main-menu-icon' /> for Main Menu
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}