import { DisplayComponent, FSComponent, SetSubject, Subscription, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { TouchButtonProps } from '@microsoft/msfs-garminsdk';

import { DisplayPaneSettings, DisplayPaneViewKeys, G3000FilePaths, PfdMapLayoutSettingMode, PfdMapLayoutUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';

import './GtcPfdTrafficMapButton.css';

/**
 * Component props for GtcPfdTrafficMapButton.
 */
export interface GtcPfdTrafficMapButtonProps extends Omit<TouchButtonProps, 'label' | 'onPressed'> {
  /** The button's label. Defaults to `'Traffic Map'`. */
  label?: string;

  /** A manager for PFD map layout settings. */
  pfdMapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>;

  /** A manager for PFD display pane settings. */
  pfdDisplayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;
}

/**
 * A touchscreen button which allows the user to activate the PFD traffic inset map, or the traffic map pane if the
 * PFD is in split mode.
 */
export class GtcPfdTrafficMapButton extends DisplayComponent<GtcPfdTrafficMapButtonProps> {
  private static readonly RESERVED_CSS_CLASSES = new Set(['gtc-pfd-traffic-map-button', 'gtc-pfd-traffic-map-button-notoggle']);

  private readonly buttonRef = FSComponent.createRef<ToggleTouchButton<any>>();

  private readonly cssClassSet = SetSubject.create(['gtc-pfd-traffic-map-button']);

  private readonly pfdMapLayoutSetting = this.props.pfdMapLayoutSettingManager.getSetting('pfdMapLayout');
  private readonly isTrafficInsetMapActive = this.pfdMapLayoutSetting.map(mode => mode === PfdMapLayoutSettingMode.Traffic);

  private readonly isPfdInSplitMode = this.props.pfdDisplayPaneSettingManager.getSetting('displayPaneVisible');
  private readonly pfdPaneDesignatedViewSetting = this.props.pfdDisplayPaneSettingManager.getSetting('displayPaneDesignatedView');
  private readonly pfdPaneViewSetting = this.props.pfdDisplayPaneSettingManager.getSetting('displayPaneView');

  private lastPfdNonTrafficInsetMapMode = PfdMapLayoutSettingMode.Off;

  private cssClassSub?: Subscription;
  private mapLayoutSub?: Subscription;
  private splitModeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.mapLayoutSub = this.pfdMapLayoutSetting.sub(mode => {
      if (mode !== PfdMapLayoutSettingMode.Traffic) {
        this.lastPfdNonTrafficInsetMapMode = mode;
      }
    }, true);

    this.splitModeSub = this.isPfdInSplitMode.sub(isInSplitMode => {
      this.cssClassSet.toggle('gtc-pfd-traffic-map-button-notoggle', isInSplitMode);
    }, true);
  }

  /**
   * Responds to when this button is pressed.
   */
  private onPressed(): void {
    if (this.isPfdInSplitMode.get()) {
      this.pfdPaneDesignatedViewSetting.value = DisplayPaneViewKeys.TrafficMap;
      this.pfdPaneViewSetting.value = DisplayPaneViewKeys.TrafficMap;
    } else {
      if (this.isTrafficInsetMapActive.get()) {
        this.pfdMapLayoutSetting.value = this.lastPfdNonTrafficInsetMapMode === PfdMapLayoutSettingMode.Hsi
          ? PfdMapLayoutSettingMode.Off
          : this.lastPfdNonTrafficInsetMapMode;
      } else {
        this.pfdMapLayoutSetting.value = PfdMapLayoutSettingMode.Traffic;
      }
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = GtcPfdTrafficMapButton.RESERVED_CSS_CLASSES;

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <ToggleTouchButton
        state={this.isTrafficInsetMapActive}
        label={this.props.label ?? 'Traffic Map'}
        onPressed={this.onPressed.bind(this)}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        class={this.cssClassSet}
      >
        <img src={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_traffic_map_home.png`} class='gtc-pfd-traffic-map-button-img' />
      </ToggleTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    this.isTrafficInsetMapActive.destroy();

    this.cssClassSub?.destroy();
    this.mapLayoutSub?.destroy();
    this.splitModeSub?.destroy();

    super.destroy();
  }
}
