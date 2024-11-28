import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, NumberUnitInterface, ObjectSubject, Subject,
  Subscribable, SubscribableSet, SubscribableUtils, Unit, UnitFamily, VNode
} from '@microsoft/msfs-sdk';

import { G3XMapRangeValueDisplay } from './G3XMapRangeValueDisplay';

/**
 * Component props for G3XMapRangeSettingDisplay.
 */
export interface G3XMapRangeSettingDisplayProps extends ComponentProps {
  /** The index of the displayed range. */
  rangeIndex: number | Subscribable<number>;

  /** The map range array. */
  rangeArray: Subscribable<readonly NumberUnitInterface<UnitFamily.Distance>[]>;

  /** The displayed unit type. */
  displayUnit: Unit<UnitFamily.Distance> | null | Subscribable<Unit<UnitFamily.Distance> | null>;

  /**
   * Whether to use basic unit text formatting instead of G3X-style unit text formatting. Ignored if `unitFormatter` is
   * defined. Defaults to `false`.
   */
  useBasicUnitFormat?: boolean;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays a map range setting value.
 *
 * Displays the distance value for non-negative range indexes and `Off` for negative indexes.
 */
export class G3XMapRangeSettingDisplay extends DisplayComponent<G3XMapRangeSettingDisplayProps> {
  private readonly displayRef = FSComponent.createRef<G3XMapRangeValueDisplay>();

  private readonly displayStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly offStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rangeIndex = Subject.create(0);

  private readonly rangeState = MappedSubject.create(
    this.props.rangeArray,
    SubscribableUtils.toSubscribable(this.props.rangeIndex, true)
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.rangeState.sub(([rangeArray, rangeIndex]): void => {
      if (rangeIndex < 0) {
        this.displayStyle.set('display', 'none');
        this.offStyle.set('display', '');
      } else {
        this.offStyle.set('display', 'none');
        this.displayStyle.set('display', '');

        this.rangeIndex.set(Math.min(rangeIndex, rangeArray.length - 1));
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.props.class ?? ''}>
        <div style={this.displayStyle}>
          <G3XMapRangeValueDisplay
            ref={this.displayRef}
            rangeIndex={this.rangeIndex}
            rangeArray={this.props.rangeArray}
            displayUnit={this.props.displayUnit}
            useBasicUnitFormat={this.props.useBasicUnitFormat}
          />
        </div>
        <div style={this.offStyle}>Off</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.displayRef.getOrDefault()?.destroy();

    this.rangeState.destroy();

    super.destroy();
  }
}