import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscribable,
  SubscribableSet, Subscription, ToggleableClassNameRecord, Unit, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { NumberUnitDisplay } from '../Common/NumberUnitDisplay';

import './WeightBalancePaneViewLoadStation.css';

/**
 * Component props for {@link WeightBalancePaneViewLoadStation}.
 */
export interface WeightBalancePaneViewLoadStationProps extends ComponentProps {
  /** Whether to show the display. */
  show: Subscribable<boolean>;

  /** The display's label. */
  label: string;

  /** The load weight of the display's station, in pounds. */
  loadWeight: Subscribable<number>;

  /** The unit type in which to display the station's load weight. */
  weightDisplayUnit: Subscribable<Unit<UnitFamily.Weight>>;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A weight and balance pane load station display.
 */
export class WeightBalancePaneViewLoadStation extends DisplayComponent<WeightBalancePaneViewLoadStationProps> {
  private static readonly RESERVED_CLASSES = ['weight-balance-pane-load-station', 'hidden'];

  private static readonly WEIGHT_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly rootCssClass = SetSubject.create(['weight-balance-pane-load-station']);

  private readonly weightRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Weight>>();
  private readonly weightValue = NumberUnitSubject.create(UnitType.POUND.createNumber(0));

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    const loadWeightPipe = this.props.loadWeight.pipe(this.weightValue);

    this.subscriptions.push(
      loadWeightPipe,
      this.props.show.sub(show => { this.rootCssClass.toggle('hidden', !show); }, true)
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    if (typeof this.props.class === 'object') {
      const cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, WeightBalancePaneViewLoadStation.RESERVED_CLASSES);
      if (Array.isArray(cssClassSub)) {
        this.subscriptions.push(...cssClassSub);
      } else {
        this.subscriptions.push(cssClassSub);
      }
    } else if (this.props.class) {
      const classesToAdd = FSComponent.parseCssClassesFromString(
        this.props.class,
        classToFilter => !WeightBalancePaneViewLoadStation.RESERVED_CLASSES.includes(classToFilter)
      );
      for (const classToAdd of classesToAdd) {
        this.rootCssClass.add(classToAdd);
      }
    }

    return (
      <div class={this.rootCssClass}>
        <div class='weight-balance-pane-load-station-title'>
          {this.props.label}
        </div>
        <div class='weight-balance-pane-load-station-weight'>
          <NumberUnitDisplay
            value={this.weightValue}
            displayUnit={this.props.weightDisplayUnit}
            formatter={WeightBalancePaneViewLoadStation.WEIGHT_FORMATTER}
            class='weight-balance-pane-load-station-weight-value'
          />
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.weightRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}