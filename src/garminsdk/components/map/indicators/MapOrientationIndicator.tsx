import { ComponentProps, DisplayComponent, FSComponent, ObjectSubject, Subscribable, Subscription, VNode } from 'msfssdk';

import { MapOrientation } from '../modules/MapOrientationModule';

/**
 * Component props for MapOrientationIndicator.
 */
export interface MapOrientationIndicatorProps extends ComponentProps {
  /** A subscribable which provides the orientation mode. */
  orientation: Subscribable<MapOrientation>;

  /** The text to display for each orientation mode. */
  text: Partial<Record<MapOrientation, string>>;

  /** A subscribable which provides whether the indicator should be visible. */
  isVisible: Subscribable<boolean>;
}

/**
 * Displays a map orientation indication.
 */
export class MapOrientationIndicator extends DisplayComponent<MapOrientationIndicatorProps> {
  private readonly text = this.props.orientation.map(mode => {
    return this.props.text[mode] ?? '';
  });

  private readonly rootStyle = ObjectSubject.create({ visibility: '' });

  private isVisibleSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.isVisibleSub = this.props.isVisible.sub(isVisible => {
      this.rootStyle.set('visibility', isVisible ? '' : 'hidden');
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div style={this.rootStyle} class='map-orientation'>{this.text}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.text.destroy();
    this.isVisibleSub?.destroy();
  }
}