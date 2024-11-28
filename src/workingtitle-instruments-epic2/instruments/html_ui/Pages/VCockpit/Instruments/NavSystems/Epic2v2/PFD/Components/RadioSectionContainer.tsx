import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, NavComUserSettingManager } from '@microsoft/msfs-epic2-shared';

import { RadioTuningWindow } from './Radio/RadioTuningWindow';
import { DetailPagesController, RadioDetailWindow, RadioSubWindowDetailPage } from './Radio/DetailPages';

/** The PFD systems section props. */
interface RadioSectionContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Display unit index. */
  index: DisplayUnitIndices;
  /** A manager for NavCom user settings. */
  navComSettingsManager: NavComUserSettingManager;
}

/** The PFD systems section container. */
export class RadioSectionContainer extends DisplayComponent<RadioSectionContainerProps> {

  private readonly radioTuningWindowRef = FSComponent.createRef<HTMLDivElement>();
  private readonly radioDetailWindowRef = FSComponent.createRef<HTMLDivElement>();

  private readonly style = {
    position: 'relative',
    height: '100%',
    'margin-left': '4px',
    'margin-top': '9.5%',
  };

  private readonly detailPagesController = new DetailPagesController(
    this.props.bus,
    this.props.index,
    this.props.navComSettingsManager
  );

  /** @inheritdoc */
  public onBeforeRender(): void {
    super.onBeforeRender();

    this.detailPagesController.currentPage.set(RadioSubWindowDetailPage.NONE);
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.detailPagesController.currentPage.sub(this.handleDetailPageSelected.bind(this), true);
  }

  /**
   * Handle Detail Pages (un)selection.
   * @param page The Radio Detail Page.
   */
  private handleDetailPageSelected(page: RadioSubWindowDetailPage): void {
    this.radioTuningWindowRef.instance.classList.toggle('hidden', page !== RadioSubWindowDetailPage.NONE);
    this.radioDetailWindowRef.instance.classList.toggle('hidden', page === RadioSubWindowDetailPage.NONE);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="radio-section-container" style={this.style}>
        <RadioTuningWindow
          bus={this.props.bus}
          index={this.props.index}
          detailPagesController={this.detailPagesController}
          ref={this.radioTuningWindowRef}
        />
        <RadioDetailWindow
          bus={this.props.bus}
          index={this.props.index}
          detailPagesController={this.detailPagesController}
          ref={this.radioDetailWindowRef}
          settings={this.props.navComSettingsManager}
        />
      </div>
    );
  }

}
