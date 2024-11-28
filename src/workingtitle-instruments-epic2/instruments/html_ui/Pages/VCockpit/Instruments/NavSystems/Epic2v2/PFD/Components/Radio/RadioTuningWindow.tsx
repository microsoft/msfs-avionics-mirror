import { ComponentProps, DisplayComponent, EventBus, FSComponent, HEvent, NodeReference, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, Epic2BezelButtonEvents, Epic2DuControlEvents, Epic2DuController, Epic2PfdControlRadioEvents } from '@microsoft/msfs-epic2-shared';

import { AdfRadioSubWindow } from './AdfRadioSubWindow';
import { ComRadioSubWindow } from './ComRadioSubWindow';
import { DetailPagesController, RadioSubWindowDetailPage } from './DetailPages';
import { NavRadioSubWindow } from './NavRadioSubWindow';
import { RadioSubWindow, RadioSubWindowControlEventTopics } from './RadioSubWindow';
import { XpdrRadioSubWindow } from './XpdrRadioSubWindow';

import './RadioTuningWindow.css';

/** RadioTuningWindowProps */
export interface RadioTuningWindowProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Display unit index. */
  index: DisplayUnitIndices;
  /** Controls which Radio Management Detail Page to show in the subwindow and its display data. */
  detailPagesController: DetailPagesController;
}

/** A RadioTuningWindow */
export class RadioTuningWindow extends DisplayComponent<RadioTuningWindowProps> {

  private isPaused = true;

  private pausables: Subscription[] = [];

  private readonly subWindowRefs: NodeReference<RadioSubWindow>[] =
    Array.from({ length: 6 }, () => FSComponent.createRef<RadioSubWindow>());

  private readonly selectedSubWindowIndex = Subject.create<number>(0);

  private readonly subWindowIsSelected: Subject<boolean>[] =
    Array.from({ length: 6 }, () => Subject.create<boolean>(false));

  /**
   * Gets the selected radio sub-window.
   * @returns The instance of the selected radio sub-window.
   */
  get selectedRadioSubWindow(): RadioSubWindow {
    return this.subWindowRefs[this.selectedSubWindowIndex.get()].instance;
  }

  /**
   * Gets the currently selected radio sub-window's radio control event handler.
   * @returns A radio control event handler.
   */
  get selectedRadioControlEventHander(): (topic: RadioSubWindowControlEventTopics) => void {
    return this.selectedRadioSubWindow.handleRadioControlEvents;
  }

  private readonly lskNameStrings: Epic2BezelButtonEvents[] =
    this.props.index === DisplayUnitIndices.PfdLeft ? [
      Epic2BezelButtonEvents.LSK_R7,
      Epic2BezelButtonEvents.LSK_R8,
      Epic2BezelButtonEvents.LSK_R9,
      Epic2BezelButtonEvents.LSK_R10,
      Epic2BezelButtonEvents.LSK_R11,
      Epic2BezelButtonEvents.LSK_R12,
    ] : [
      Epic2BezelButtonEvents.LSK_L7,
      Epic2BezelButtonEvents.LSK_L8,
      Epic2BezelButtonEvents.LSK_L9,
      Epic2BezelButtonEvents.LSK_L10,
      Epic2BezelButtonEvents.LSK_L11,
      Epic2BezelButtonEvents.LSK_L12,
    ];

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(this.handleBezelButton);

    this.selectedSubWindowIndex.sub(index => {
      this.subWindowIsSelected.forEach((subject: Subject<boolean>) => subject.set(false));
      this.subWindowIsSelected[index].set(true);
    }, true);

    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_detail_push')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_detail_push'));
    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_dme_push')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_dme_push'));
    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_vfr_push')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_vfr_push'));
    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_ident_push')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_ident_push'));
    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_volume_increment')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_volume_increment'));
    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_volume_decrement')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_volume_decrement'));
    this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_volume_push')
      .handle(() => this.selectedRadioControlEventHander('pfd_control_volume_push'));

    this.pausables = [
      this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_coarse_decrement')
        .handle(() => this.selectedRadioControlEventHander('pfd_control_sel_coarse_decrement'), true),
      this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_coarse_increment')
        .handle(() => this.selectedRadioControlEventHander('pfd_control_sel_coarse_increment'), true),
      this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_fine_decrement')
        .handle(() => this.selectedRadioControlEventHander('pfd_control_sel_fine_decrement'), true),
      this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_fine_increment')
        .handle(() => this.selectedRadioControlEventHander('pfd_control_sel_fine_increment'), true),
      this.props.bus.getSubscriber<Epic2PfdControlRadioEvents>().on('pfd_control_sel_push')
        .handle(() => this.selectedRadioControlEventHander('pfd_control_sel_push'), true),
      this.props.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_du_frequency_swap_button')
        .handle(() => this.selectedRadioControlEventHander('epic2_du_frequency_swap_button'), true),
    ];

    this.props.detailPagesController.currentPage.sub((page: RadioSubWindowDetailPage) => {
      if (page !== RadioSubWindowDetailPage.NONE) {
        this.pause();
      } else {
        this.resume();
      }
    }, true);
  }

  private handleBezelButton = (event: string): void => {
    // Disable this HEvent handler if a Detail Page is being displayed.
    if (this.props.detailPagesController.currentPage.get() !== RadioSubWindowDetailPage.NONE) {
      return;
    }

    let index: number | undefined;

    switch (event) {
      case this.lskNameStrings[0]:
      case this.lskNameStrings[1]:
      case this.lskNameStrings[2]:
      case this.lskNameStrings[3]:
      case this.lskNameStrings[4]:
      case this.lskNameStrings[5]:
        index = Epic2DuController.getSoftKeyIndexFromSoftKeyHEvent(event) - 7;
        break;
    }

    if (typeof index === 'number' && isFinite(index)) {
      if (this.selectedSubWindowIndex.get() !== index) {
        this.selectedSubWindowIndex.set(index);
      } else {
        this.selectedRadioControlEventHander('BEZEL_BUTTON');
      }
    }
  };

  /** Resumes this component. When the component is resumed, it will update its rendering. */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.isPaused = false;

    this.pausables.map(sub => sub.resume());
  }

  /** Pauses this component. When the component is paused, it will not update its rendering. */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.isPaused = true;

    this.pausables.map(sub => sub.pause());
  }

  // TODO Update publisher with new H event names

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class="radio-tuning-window" ref={this.props.ref}>
        <ComRadioSubWindow
          bus={this.props.bus}
          index={1}
          detailPagesController={this.props.detailPagesController}
          isSelected={this.subWindowIsSelected[0]}
          lskString={this.lskNameStrings[0]}
          ref={this.subWindowRefs[0]}
        />
        <ComRadioSubWindow
          bus={this.props.bus}
          index={2}
          detailPagesController={this.props.detailPagesController}
          isSelected={this.subWindowIsSelected[1]}
          lskString={this.lskNameStrings[1]}
          ref={this.subWindowRefs[1]}
        />
        <NavRadioSubWindow
          bus={this.props.bus}
          index={1}
          detailPagesController={this.props.detailPagesController}
          isSelected={this.subWindowIsSelected[2]}
          lskString={this.lskNameStrings[2]}
          ref={this.subWindowRefs[2]}
        />
        <NavRadioSubWindow
          bus={this.props.bus}
          index={2}
          detailPagesController={this.props.detailPagesController}
          isSelected={this.subWindowIsSelected[3]}
          lskString={this.lskNameStrings[3]}
          ref={this.subWindowRefs[3]}
          fullWidthSeparator
        />
        <AdfRadioSubWindow
          bus={this.props.bus}
          detailPagesController={this.props.detailPagesController}
          isSelected={this.subWindowIsSelected[4]}
          lskString={this.lskNameStrings[4]}
          ref={this.subWindowRefs[4]}
        />
        <XpdrRadioSubWindow
          bus={this.props.bus}
          detailPagesController={this.props.detailPagesController}
          isSelected={this.subWindowIsSelected[5]}
          lskString={this.lskNameStrings[5]}
          ref={this.subWindowRefs[5]}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.pausables.map(sub => sub.destroy());
  }
}
