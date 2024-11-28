import { FSComponent, HardwareUiControl, Subscribable, VNode } from '@microsoft/msfs-sdk';
import { FmsUiControlEvents, G1000UiControl, G1000UiControlProps } from '@microsoft/msfs-wtg1000';

/** Component props for the {@link NextChecklistControl} component */
export interface NextChecklistControlProps extends G1000UiControlProps {
  /** Whether this is the last checklist. */
  isLast: Subscribable<boolean>;
}

/** A control to display the next checklist label. */
export class NextChecklistControl extends G1000UiControl<NextChecklistControlProps> {
  private readonly labelRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.props.isLast.sub(isLast => {
      this.setDisabled(isLast);
    }, true);
  }

  /** @inheritDoc */
  protected onFocused(source: HardwareUiControl<FmsUiControlEvents>): void {
    super.onFocused(source);
    this.labelRef.instance.classList.add('highlight-select');
  }

  /** @inheritDoc */
  protected onBlurred(source: HardwareUiControl<FmsUiControlEvents>): void {
    super.onBlurred(source);
    this.labelRef.instance.classList.remove('highlight-select');
  }

  /** @inheritDoc */
  protected onDisabled(source: HardwareUiControl<FmsUiControlEvents>): void {
    super.onDisabled(source);
    this.labelRef.instance.classList.add('disabled');
  }

  /** @inheritDoc */
  protected onEnabled(source: HardwareUiControl<FmsUiControlEvents>): void {
    super.onEnabled(source);
    this.labelRef.instance.classList.remove('disabled');
  }

  /** @inheritDoc */
  public render(): VNode {
    return <div class="sr22t-next-checklist-label" ref={this.labelRef}>
      Go to Next Checklist?
    </div>;
  }
}
