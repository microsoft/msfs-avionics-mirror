import {
  ComponentProps, DisplayComponent, FSComponent, SetSubject, SubscribableSet, Subscription, ToggleableClassNameRecord,
  VNode
} from '@microsoft/msfs-sdk';

import { G3XTouchFilePaths } from '../../G3XTouchFilePaths';

import './G3XLoadingIcon.css';

/**
 * Component props for {@link G3XLoadingIcon}.
 */
export interface G3XLoadingIconProps extends ComponentProps {
  /** CSS class(es) to apply to the icon's root element. */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;
}

/**
 * A rotating loading icon.
 * 
 * The `loading-icon` CSS class will be applied to the icon's root element.
 */
export class G3XLoadingIcon extends DisplayComponent<G3XLoadingIconProps> {
  private static readonly RESERVED_CSS_CLASSES = ['loading-icon'];

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;
    if (typeof this.props.class === 'object') {
      cssClass = SetSubject.create();
      cssClass.add('loading-icon');
      const sub = FSComponent.bindCssClassSet(cssClass, this.props.class, G3XLoadingIcon.RESERVED_CSS_CLASSES);
      if (Array.isArray(sub)) {
        this.subscriptions.push(...sub);
      } else {
        this.subscriptions.push(sub);
      }
    } else {
      cssClass = 'loading-icon';
      if (this.props.class) {
        const classesToAdd = FSComponent.parseCssClassesFromString(this.props.class, classToFilter => !G3XLoadingIcon.RESERVED_CSS_CLASSES.includes(classToFilter));
        cssClass += ` ${classesToAdd.join(' ')}`;
      }
    }

    return (
      <img
        src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/loading_icon.png`}
        class={cssClass}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
