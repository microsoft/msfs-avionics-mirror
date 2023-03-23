import {
  DisplayComponent, FSComponent, MinimumsMode, NumberFormatter, NumberUnitSubject, SetSubject, Subscribable, Subscription, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { TouchButtonProps } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { TouchButton } from '../TouchButton/TouchButton';

import './GtcMinimumsTouchButton.css';

/**
 * Component props for GtcMinimumsTouchButton.
 */
export interface GtcMinimumsTouchButtonProps extends Omit<TouchButtonProps, 'label'> {
  /** The currently active minimums mode. */
  minimumsMode: Subscribable<MinimumsMode>;

  /** The active minimums value, in feet, or `null` if no such value exists. */
  minimumsValue: Subscribable<number | null>;

  /** The unit type with which to display the minimums value. */
  displayUnit: Subscribable<Unit<UnitFamily.Distance>>;
}

/**
 * A touchscreen button which displays the currently active minimums mode and value.
 *
 * The root element of the button contains the `touch-button-minimums` CSS class by default, in addition to all
 * root-element classes used by {@link TouchButton}.
 */
export class GtcMinimumsTouchButton extends DisplayComponent<GtcMinimumsTouchButtonProps> {
  private static readonly RESERVED_CSS_CLASSES = ['touch-button-minimums'];

  private static readonly MODE_TEXT = {
    [MinimumsMode.OFF]: 'Off',
    [MinimumsMode.BARO]: 'Baro',
    [MinimumsMode.TEMP_COMP_BARO]: 'Temp Comp',
    [MinimumsMode.RA]: 'Radio Alt'
  };

  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____' });

  private readonly buttonRef = FSComponent.createRef<TouchButton>();
  private readonly valueRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly cssClassSet = SetSubject.create(['touch-button-minimums']);

  private readonly modeText = this.props.minimumsMode.map(mode => GtcMinimumsTouchButton.MODE_TEXT[mode] ?? '');
  private readonly value = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private cssClassSub?: Subscription;
  private valuePipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.valuePipe = this.props.minimumsValue.pipe(this.value, value => value ?? NaN);
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = GtcMinimumsTouchButton.RESERVED_CSS_CLASSES;

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.includes(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <TouchButton
        ref={this.buttonRef}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        onPressed={this.props.onPressed}
        inhibitOnDrag={this.props.inhibitOnDrag}
        dragThresholdPx={this.props.dragThresholdPx}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        class={this.cssClassSet}
      >
        <div class='touch-button-minimums-label'>Minimums</div>
        <div class='touch-button-minimums-mode'>{this.modeText}</div>
        <NumberUnitDisplay
          ref={this.valueRef}
          value={this.value}
          displayUnit={this.props.displayUnit}
          formatter={GtcMinimumsTouchButton.FORMATTER}
          class='touch-button-minimums-value'
        />
      </TouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.valueRef.getOrDefault()?.destroy();
    this.buttonRef.getOrDefault()?.destroy();

    this.modeText.destroy();

    this.cssClassSub?.destroy();
    this.valuePipe?.destroy();

    super.destroy();
  }
}