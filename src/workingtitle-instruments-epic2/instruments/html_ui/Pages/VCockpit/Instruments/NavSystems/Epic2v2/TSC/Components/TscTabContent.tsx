import { Epic2CockpitEvents, TabContent, TabContentProps } from '@microsoft/msfs-epic2-shared';
import { FSComponent, Subscription } from '@microsoft/msfs-sdk';

import { TscService } from '../TscService';

/** TscTabContentProps */
export interface TscTabContentProps extends TabContentProps {
  /** tsc service */
  tscService: TscService;
}

/** TscTabContent */
export class TscTabContent<T extends TscTabContentProps> extends TabContent<T> {
  protected readonly rootRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly subscriber = this.props.bus.getSubscriber<Epic2CockpitEvents>();

  protected subs: Subscription[] = [];

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.subs = [
      this.subscriber.on('tsc_keyboard_active_input_id').handle((id) => {
        this.rootRef.instance.classList.toggle('hidden', id !== undefined);
      }),
    ];
  }

  /** @inheritdoc */
  public override destroy(): void {
    this.subs.map((sub) => sub.destroy());
  }
}
