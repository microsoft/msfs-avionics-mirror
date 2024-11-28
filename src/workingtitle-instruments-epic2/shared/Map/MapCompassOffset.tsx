import { ComponentProps, DisplayComponent, FSComponent, ObjectSubject, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

/** Props for MapCompassOffset.*/
export interface MapCompassOffsetProps extends ComponentProps {
  /** The compass svg size. Defaults to 100%. */
  compassSvgSize?: number;
  /** The target projected offset y value. */
  targetProjectedOffsetY: number | Subscribable<number>;
}

/** Creates a div with the given compass svg size, and translates it to match the map projection offset. */
export class MapCompassOffset extends DisplayComponent<MapCompassOffsetProps> {
  private readonly targetProjectedOffsetY = SubscribableUtils.toSubscribable(this.props.targetProjectedOffsetY, true);

  private readonly mapOffsetContainerStyles = ObjectSubject.create({
    'position': 'absolute',
    'display': 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'width': this.props.compassSvgSize ? (this.props.compassSvgSize + 'px') : '100%',
    'height': this.props.compassSvgSize ? (this.props.compassSvgSize + 'px') : '100%',
    'transform': `translate(0, ${this.targetProjectedOffsetY.get()}px)`,
  });

  /** @inheritdoc */
  public onAfterRender(): void {
    this.targetProjectedOffsetY.sub(offsetY => {
      this.mapOffsetContainerStyles.set('transform', `translate(0, ${offsetY}px)`);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="map-compass-offset" style={this.mapOffsetContainerStyles}>
        {this.props.children}
      </div>
    );
  }
}
