import { CombinedSubject, ComponentProps, DisplayComponent, FSComponent, NumberUnitInterface, ObjectSubject, Subject, Subscribable, SubscribableSet, SubscribableUtils, Unit, UnitFamily, VNode } from '@microsoft/msfs-sdk';
import { MapRangeValueDisplay } from './MapRangeValueDisplay';

/**
 * Component props for MapRangeSettingDisplay.
 */
export interface MapRangeSettingDisplayProps extends ComponentProps {
  /** The index of the displayed range. */
  rangeIndex: number | Subscribable<number>;

  /** The map range array. */
  rangeArray: Subscribable<readonly NumberUnitInterface<UnitFamily.Distance>[]>;

  /** The displayed unit type. */
  displayUnit: Subscribable<Unit<UnitFamily.Distance> | null>;

  /** CSS class(es) to apply to the display's root element. */
  class?: string | SubscribableSet<string>;
}

/**
 * A component which displays a map range setting value.
 *
 * Displays the distance value for non-negative range indexes and `Off` for negative indexes.
 */
export class MapRangeSettingDisplay extends DisplayComponent<MapRangeSettingDisplayProps> {
  private readonly displayRef = FSComponent.createRef<MapRangeValueDisplay>();

  private readonly displayStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly offStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rangeIndex = Subject.create(0);

  private readonly rangeState = CombinedSubject.create(
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
          <MapRangeValueDisplay
            ref={this.displayRef}
            rangeIndex={this.rangeIndex}
            rangeArray={this.props.rangeArray}
            displayUnit={this.props.displayUnit}
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