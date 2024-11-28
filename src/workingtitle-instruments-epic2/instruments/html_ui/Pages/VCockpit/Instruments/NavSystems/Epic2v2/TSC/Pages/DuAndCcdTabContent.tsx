import { EventBus, FSComponent, SetSubject, SimVarValueType, Subscription, VNode } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, Epic2DuControlHEvents, Epic2DuControlLocalVars, Epic2DuHEvents } from '@microsoft/msfs-epic2-shared';

import { DuAndCcdSelectManager } from '../Components';
import { TscTabContent, TscTabContentProps } from '../Components/TscTabContent';
import { TscButton } from '../Shared';

import './DuAndCcdTabContent.css';

/** The DuAndCcd Tab Content props. */
interface DuAndCcdTabContentProps extends TscTabContentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}
/** The DuAndCcd Tab Content. */
export class DuAndCcdTabContent extends TscTabContent<DuAndCcdTabContentProps> {
  private readonly selectManager = new DuAndCcdSelectManager(this.props.bus);
  private readonly selectedDisplay = this.selectManager.selectedDu;
  private readonly selectedDisplayClass = SetSubject.create(['display-buttons', 'pilot-pfd']);

  private selectedDisplaySub: Subscription | undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    super.onAfterRender();
    this.selectedDisplaySub = this.selectedDisplay.sub((disp) => {
      this.selectedDisplayClass.toggle('pilot-pfd', disp === DisplayUnitIndices.PfdLeft);
      this.selectedDisplayClass.toggle('upper-mfd', disp === DisplayUnitIndices.MfdUpper);
      this.selectedDisplayClass.toggle('lower-mfd', disp === DisplayUnitIndices.MfdLower);
      this.selectedDisplayClass.toggle('copilot-pfd', disp === DisplayUnitIndices.PfdRight);
    });
  }

  /** Handler for when the page button is pressed */
  private pagePressed(): void {
    this.sendHEvent(Epic2DuControlHEvents.Page);
  }

  /**
   * Send an HTML event.
   * @param event The HTML event name.
   */
  private sendHEvent(event: Epic2DuHEvents): void {
    SimVar.SetSimVarValue(`H:${event}`, 'number', 0);
  }

  /**
   * Handler for when a display button is pressed
   * @param display The selected display unit index.
   */
  private onPressed(display: DisplayUnitIndices): void {
    SimVar.SetSimVarValue(Epic2DuControlLocalVars.SelectedDisplayUnit, SimVarValueType.Number, display);
  }

  /** @inheritdoc */
  public render(): VNode {
    return <div class="tsc-du-ccd-tab-content" ref={this.rootRef}>
      <div class={this.selectedDisplayClass}>
        <TscButton class="display-button pilot-pfd-button" label={'Pilot<br>PFD'} variant='base' onPressed={() => this.onPressed(DisplayUnitIndices.PfdLeft)}>
          <div class="radio" />
        </TscButton>
        <TscButton class="display-button upper-mfd-button" label={'Upper<br>MFD'} variant='base' onPressed={() => this.onPressed(DisplayUnitIndices.MfdUpper)}>
          <div class="radio" />
        </TscButton>
        <TscButton class="display-button lower-mfd-button" label={'Lower<br>MFD'} variant='base' onPressed={() => this.onPressed(DisplayUnitIndices.MfdLower)}>
          <div class="radio" />
        </TscButton>
        <TscButton class="display-button copilot-pfd-button" label={'Copilot<br>PFD'} variant='base' onPressed={() => this.onPressed(DisplayUnitIndices.PfdRight)}>
          <div class="radio" />
        </TscButton>
        <TscButton class={'display-button page-button'} label={'Page'} variant='base' onPressed={() => this.pagePressed()} />
      </div>
    </div>;
  }

  /** @inheritdoc */
  public destroy(): void {
    this.selectedDisplaySub?.destroy();
    this.selectManager.destroy();
    super.destroy();
  }
}
