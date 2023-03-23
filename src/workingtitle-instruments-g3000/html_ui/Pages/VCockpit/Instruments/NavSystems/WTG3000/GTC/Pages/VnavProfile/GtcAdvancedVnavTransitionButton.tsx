import { DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscription, UnitFamily, UnitType, VNode } from '@microsoft/msfs-sdk';
import { NumberUnitDisplay, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { GtcTouchButton, GtcTouchButtonProps } from '../../Components/TouchButton/GtcTouchButton';
import { GtcService } from '../../GtcService/GtcService';

import './GtcAdvancedVnavSpeedButton.css';
import './GtcAdvancedVnavTransitionButton.css';

/**
 * Component props for GtcAdvancedVnavTransitionButton.
 */
export interface GtcAdvancedVnavTransitionButtonProps extends Omit<GtcTouchButtonProps, 'label' | 'onPressed' | 'gtcOrientation'> {
  /** The GTC service. */
  gtcService: GtcService;

  /** A manager for display unit user settings. */
  unitSettingManager: UnitsUserSettingManager;
}

/**
 * A GTC touchscreen button which displays a VNAV transition altitude and when pressed, opens a dialog to allow the
 * user to change the transition altitude.
 */
export class GtcAdvancedVnavTransitionButton extends DisplayComponent<GtcAdvancedVnavTransitionButtonProps> {
  private static readonly ROOT_CSS_CLASSES = ['advanced-vnav-speed-button', 'advanced-vnav-transition-button'];
  private static readonly RESERVED_CSS_CLASSES: string[] = [];

  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private static readonly MAXIMUM_FEET = 99999;
  private static readonly MAXIMUM_METERS = 30479;

  private readonly speedLimitRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();
  private readonly ceilingRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly value = NumberUnitSubject.create(UnitType.FOOT.createNumber(18000));

  private cssClassSub?: Subscription;

  /**
   * Responds to when this button is pressed.
   */
  private onPressed(): void {
    // TODO
  }

  /** @inheritdoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcAdvancedVnavTransitionButton.ROOT_CSS_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcAdvancedVnavTransitionButton.RESERVED_CSS_CLASSES);
    } else {
      rootCssClass = GtcAdvancedVnavTransitionButton.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcAdvancedVnavTransitionButton.RESERVED_CSS_CLASSES.includes(cssClass))
            .join(' ');
      }
    }

    return (
      <GtcTouchButton
        onPressed={this.onPressed.bind(this)}
        isEnabled={this.props.isEnabled}
        isVisible={this.props.isVisible}
        isHighlighted={this.props.isHighlighted}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcService.orientation}
        class={rootCssClass}
      >
        <div class='advanced-vnav-speed-button-label'>Transition Altitude</div>
        <NumberUnitDisplay
          ref={this.speedLimitRef}
          value={this.value}
          displayUnit={this.props.unitSettingManager.altitudeUnits}
          formatter={GtcAdvancedVnavTransitionButton.FORMATTER}
          class='advanced-vnav-speed-button-value'
        />
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.speedLimitRef.getOrDefault()?.destroy();
    this.ceilingRef.getOrDefault()?.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}