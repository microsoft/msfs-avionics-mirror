import { ComponentProps, DisplayComponent, FSComponent, Subject, Subscribable, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { TouchButton } from '../TouchButton';
import { Tab } from './TabTypes';

import './Tabs.css';

/** The properties for the {@link Tabs} component. */
interface TabsProps extends ComponentProps {
  /** The active tab.*/
  readonly activeTab: Subject<Tab>,
  /** Array of tab names to be displayed on each tab. Must have at least 1 element. */
  readonly tabs: readonly Tab[];
  /** The css class to append to the root element class. */
  readonly class: string;
  /** What styling type to use. 'style-a' is like folder tabs with spac between the tabs. */
  readonly style: 'style-a';
}

/** The Tabs component. */
export class Tabs extends DisplayComponent<TabsProps> {
  /** @inheritdoc */
  public render(): VNode {
    const { tabs } = this.props;

    return (
      <div class={'epic-tabby-tabs ' + this.props.style + ' ' + this.props.class}>
        {tabs.map(tab => {
          const isDisabled: Subscribable<boolean> = SubscribableUtils.toSubscribable(tab.isDisabled ?? false, true);
          return (
            <TouchButton
              variant={'bar-tab'}
              label={tab.renderLabel()}
              onPressed={() => this.props.activeTab.set(tab)}
              isActive={this.props.activeTab.map(x => x === tab)}
              isEnabled={isDisabled.map(x => !x)}
            />
          );
        })}
      </div>
    );
  }
}
