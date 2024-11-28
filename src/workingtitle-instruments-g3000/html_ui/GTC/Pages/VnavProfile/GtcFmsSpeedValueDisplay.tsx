import { ComponentProps, DisplayComponent, FSComponent, NumberUnitSubject, SetSubject, SpeedUnit, Subject, Subscribable, SubscribableSet, SubscribableUtils, Subscription, UnitType, VNode } from '@microsoft/msfs-sdk';
import { FmsSpeedValue, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

/**
 * Component props for GtcFmsSpeedValueDisplay.
 */
export interface GtcFmsSpeedValueDisplayProps extends ComponentProps {
  /** The speed value to display. */
  value: FmsSpeedValue | Subscribable<FmsSpeedValue>;

  /** The text to display when the speed value is not defined (when its numeric value is negative). Defaults to `'___'`. */
  nullString?: string;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays an FMS speed value.
 */
export class GtcFmsSpeedValueDisplay extends DisplayComponent<GtcFmsSpeedValueDisplayProps> {
  private static readonly ROOT_CSS_CLASSES = ['fms-speed'];
  private static readonly RESERVED_CSS_CLASSES = ['fms-speed'];

  private static readonly IAS_CSS_CLASSES = ['fms-speed-ias'];
  private static readonly MACH_CSS_CLASSES = ['fms-speed-mach'];
  private static readonly NULL_CSS_CLASSES = ['fms-speed-null'];

  private static readonly DEFAULT_NULL_STRING = '___';

  private readonly iasCssClass = SetSubject.create<string>(GtcFmsSpeedValueDisplay.IAS_CSS_CLASSES);
  private readonly machCssClass = SetSubject.create<string>(GtcFmsSpeedValueDisplay.MACH_CSS_CLASSES);
  private readonly nullCssClass = SetSubject.create<string>(GtcFmsSpeedValueDisplay.NULL_CSS_CLASSES);

  private readonly value = SubscribableUtils.toSubscribable(this.props.value, true);

  private readonly iasValue = NumberUnitSubject.create(UnitType.KNOT.createNumber(0));

  private readonly machText = Subject.create('');

  private cssClassSub?: Subscription;
  private valueSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.valueSub = this.value.sub(value => {
      if (value.value < 0) {
        this.iasCssClass.add('hidden');
        this.machCssClass.add('hidden');
        this.nullCssClass.delete('hidden');
      } else {
        this.nullCssClass.add('hidden');

        if (value.unit === SpeedUnit.IAS) {
          this.machCssClass.add('hidden');
          this.iasCssClass.delete('hidden');

          this.iasValue.set(value.value);
        } else {
          this.iasCssClass.add('hidden');
          this.machCssClass.delete('hidden');

          this.machText.set(`M${Math.min(value.value, 0.999).toFixed(3)}`);
        }
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    let rootCssClass: string | SetSubject<string>;

    if (typeof this.props.class === 'object') {
      rootCssClass = SetSubject.create(GtcFmsSpeedValueDisplay.ROOT_CSS_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(rootCssClass, this.props.class, GtcFmsSpeedValueDisplay.RESERVED_CSS_CLASSES);
    } else {
      rootCssClass = GtcFmsSpeedValueDisplay.ROOT_CSS_CLASSES.join(' ');

      if (this.props.class !== undefined && this.props.class.length > 0) {
        rootCssClass += ' '
          + FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcFmsSpeedValueDisplay.RESERVED_CSS_CLASSES.includes(cssClass))
            .join(' ');
      }
    }

    return (
      <div class={rootCssClass}>
        <NumberUnitDisplay
          value={this.iasValue}
          displayUnit={null}
          formatter={value => value.toFixed(0)}
          class={this.iasCssClass}
        />
        <div class={this.machCssClass}>{this.machText}</div>
        <div class={this.nullCssClass}>{this.props.nullString ?? GtcFmsSpeedValueDisplay.DEFAULT_NULL_STRING}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cssClassSub?.destroy();
    this.valueSub?.destroy();

    super.destroy();
  }
}