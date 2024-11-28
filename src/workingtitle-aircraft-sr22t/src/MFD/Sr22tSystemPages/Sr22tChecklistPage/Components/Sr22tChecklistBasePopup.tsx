import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { FmsHEvent, G1000UiControl, SoftKeyMenuSystem, UiView, UiViewProps } from '@microsoft/msfs-wtg1000';

import { Sr22tChecklistRepository } from '../../../../Shared/ChecklistSystem';

/** Component props for the {@link Sr22tChecklistBasePopup} component */
export interface Sr22tChecklistPopupProps extends UiViewProps {
  /** The soft key menu system. */
  menuSystem: SoftKeyMenuSystem;
  /** The checklist repository */
  repo: Sr22tChecklistRepository;
}

/** A base popup for selecting a checklist/category. */
export class Sr22tChecklistBasePopup<R = any, I = any> extends UiView<Sr22tChecklistPopupProps, R, I> {
  protected readonly controlRef = FSComponent.createRef<G1000UiControl>();
  protected readonly scrollContainer = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    if (evt === FmsHEvent.CLR || evt === FmsHEvent.UPPER_PUSH) {
      this.close();
      return true;
    }
    return this.controlRef.instance.onInteractionEvent(evt);
  }

  /** @inheritDoc */
  protected onViewOpened(): void {
    this.props.menuSystem.pushMenu('empty');
    super.onViewOpened();
  }

  /** @inheritDoc */
  protected onViewClosed(): void {
    this.props.menuSystem.back();
    super.onViewClosed();
  }

  /** @inheritDoc */
  public render(): VNode {
    return <></>;
  }
}
