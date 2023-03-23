import { ComponentProps, DisplayComponent, FSComponent, SetSubject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';

/**
 * Component props for MapBannerIndicator.
 */
export interface MapBannerIndicatorProps extends ComponentProps {
  /** A subscribable which provides the declutter mode. */
  show: Subscribable<boolean>;

  /** CSS class(es) to apply to the root of the banner. */
  class?: string | SubscribableSet<string>;
}

/**
 * Displays a map banner message.
 */
export class MapBannerIndicator extends DisplayComponent<MapBannerIndicatorProps> {
  private static readonly RESERVED_CLASSES = ['map-banner', 'map-banner-on', 'map-banner-off'];

  private readonly cssClassSet = SetSubject.create(['map-banner']);

  private showSub?: Subscription;
  private classSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.showSub = this.props.show.sub(show => {
      if (show) {
        this.cssClassSet.add('map-banner-on');
        this.cssClassSet.delete('map-banner-off');
      } else {
        this.cssClassSet.delete('map-banner-on');
        this.cssClassSet.add('map-banner-off');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    if (this.props.class !== undefined) {
      if (typeof this.props.class === 'object') {
        this.classSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, MapBannerIndicator.RESERVED_CLASSES);
      } else {
        const classesToAdd = FSComponent.parseCssClassesFromString(this.props.class).filter(val => !MapBannerIndicator.RESERVED_CLASSES.includes(val));
        for (const cssClass of classesToAdd) {
          this.cssClassSet.add(cssClass);
        }
      }
    }

    return (
      <div class={this.cssClassSet}>{this.props.children}</div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    super.destroy();

    this.showSub?.destroy();
    this.classSub?.destroy();
  }
}