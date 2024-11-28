import { ComponentProps, DisplayComponent, EventBus, FSComponent, SetSubject, Subscribable, SubscribableSet, Subscription, VNode } from '@microsoft/msfs-sdk';

import './Annunciator.css';

/** The properties for the {@link Annunciators} component. */
interface AnnunciatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** If label should be hidden. */
  hideLabel: boolean | Subscribable<boolean>;
  /** Label to be hide/shown. */
  label: string | Subscribable<string>;
  /** Main title. */
  mainTitle: string;
  /** Annunciator title. */
  subTitle: string;
  /** CSS class(es) to apply to the button's root element. */
  class?: string | SubscribableSet<string>;
}

/** The HsiDisplay component. */
export class Annunciator extends DisplayComponent<AnnunciatorProps> {
  protected static readonly RESERVED_CSS_CLASSES = new Set([
    'annunciator-container',
    'annunciator-main-title',
    'annunciator-sub-title',
    'annunciator-label',
  ]);
  protected readonly cssClassSet = SetSubject.create(['annunciator-container']);
  protected cssClassSub?: Subscription;
  /**
   * Gets the CSS classes that are reserved for this Annunciator's root element.
   * @returns The CSS classes that are reserved for this Annunciator's root element.
   */
  protected getReservedCssClasses(): ReadonlySet<string> {
    return Annunciator.RESERVED_CSS_CLASSES;
  }

  /** @inheritdoc */
  public render(): VNode {
    const reservedClasses = this.getReservedCssClasses();

    if (typeof this.props.class === 'object') {
      this.cssClassSub = FSComponent.bindCssClassSet(this.cssClassSet, this.props.class, reservedClasses);
    } else if (this.props.class !== undefined && this.props.class.length > 0) {
      for (const cssClassToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !reservedClasses.has(cssClass))) {
        this.cssClassSet.add(cssClassToAdd);
      }
    }

    return (
      <div class={this.cssClassSet}>
        <div class="annunciator-main-title"><span>{this.props.mainTitle}</span></div>

        <div class="annunciator-sub-title">
          <div>{this.props.subTitle}</div>
          <div class={{ 'annunciator-label': true, 'hidden': this.props.hideLabel }}>{this.props.label}</div>
        </div>

        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cssClassSub?.destroy();
    super.destroy();
  }
}
