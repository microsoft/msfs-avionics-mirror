import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { TabbedContentContainer } from '@microsoft/msfs-epic2-shared';

import { TscService } from '../TscService';
import { Keyboard } from './Keyboard';
import { TscWindowMenu } from './TscWindowMenu';

import './TscWindow.css';

/** TSC Window Props */
export interface TscWindowProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** TSC Service. */
  tscService: TscService;
}

/** The TSC Window component. */
export class TscWindow extends DisplayComponent<TscWindowProps> {

  /** @inheritdoc  */
  public render(): VNode | null {
    return (
      <div class='tsc-config-window'>
        <TscWindowMenu
          bus={this.props.bus}
          tabs={this.props.tscService.tabs}
          activeTab={this.props.tscService.activeTab}
          lastViewedTab={this.props.tscService.lastViewedTab}
        />
        <TabbedContentContainer
          bus={this.props.bus}
          tabs={Object.values(this.props.tscService.tabs)}
          activeTab={this.props.tscService.activeTab}
          className="tsc-tabbed-content-container"
        />
        <Keyboard bus={this.props.bus} tscService={this.props.tscService} />
      </div>
    );
  }
}
