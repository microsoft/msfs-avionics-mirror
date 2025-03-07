import { ComponentProps, DisplayComponent, EventBus, FSComponent, HEvent, NodeReference, ObjectUtils, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { DisplayUnitIndices, Epic2BezelButtonEvents, Epic2DuControlEvents, Epic2PfdControlRadioEvents } from '@microsoft/msfs-epic2-shared';

import { AdfRadioSubWindow } from './AdfRadioSubWindow';
import { ComRadioSubWindow } from './ComRadioSubWindow';
import { DetailPagesController, RadioSubWindowDetailPage } from './DetailPages';
import { NavRadioSubWindow } from './NavRadioSubWindow';
import { RadioSubWindow, RadioSubWindowControlEventTopics } from './RadioSubWindow';
import { XpdrRadioSubWindow } from './XpdrRadioSubWindow';

import './RadioTuningWindow.css';

enum RadioSubWindowKey {
  Com1 = 'Com1',
  Com2 = 'Com2',
  Nav1 = 'Nav1',
  Nav2 = 'Nav2',
  Adf = 'Adf',
  Xpdr = 'Xpdr',
}

/** RadioTuningWindowProps */
export interface RadioTuningWindowProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** Display unit index. */
  duIndex: DisplayUnitIndices;
  /** Which side of the DU the radio window is on. */
  duSide: 'left' | 'right',
  /** Controls which Radio Management Detail Page to show in the subwindow and its display data. */
  detailPagesController: DetailPagesController;
}

/** A RadioTuningWindow */
export class RadioTuningWindow extends DisplayComponent<RadioTuningWindowProps> {
  private static readonly BEZEL_LSK_TO_SUBWINDOW_MAP: Record<RadioTuningWindowProps['duSide'], Map<Epic2BezelButtonEvents, RadioSubWindowKey>> = {
    'left': new Map([
      [Epic2BezelButtonEvents.LSK_L7, RadioSubWindowKey.Com1],
      [Epic2BezelButtonEvents.LSK_L8, RadioSubWindowKey.Com2],
      [Epic2BezelButtonEvents.LSK_L9, RadioSubWindowKey.Nav1],
      [Epic2BezelButtonEvents.LSK_L10, RadioSubWindowKey.Nav2],
      [Epic2BezelButtonEvents.LSK_L11, RadioSubWindowKey.Adf],
      [Epic2BezelButtonEvents.LSK_L12, RadioSubWindowKey.Xpdr],
    ]),
    'right': new Map([
      [Epic2BezelButtonEvents.LSK_R7, RadioSubWindowKey.Com1],
      [Epic2BezelButtonEvents.LSK_R8, RadioSubWindowKey.Com2],
      [Epic2BezelButtonEvents.LSK_R9, RadioSubWindowKey.Nav1],
      [Epic2BezelButtonEvents.LSK_R10, RadioSubWindowKey.Nav2],
      [Epic2BezelButtonEvents.LSK_R11, RadioSubWindowKey.Adf],
      [Epic2BezelButtonEvents.LSK_R12, RadioSubWindowKey.Xpdr],
    ]),
  };

  private static readonly SUB_WINDOW_KEYS = [
    RadioSubWindowKey.Com1, RadioSubWindowKey.Com2, RadioSubWindowKey.Nav1, RadioSubWindowKey.Nav2, RadioSubWindowKey.Adf, RadioSubWindowKey.Xpdr
  ];

  private isPaused = true;

  private pausables: Subscription[] = [];

  private readonly subWindowRefs: Record<RadioSubWindowKey, NodeReference<RadioSubWindow>> = ObjectUtils.fromEntries(
    RadioTuningWindow.SUB_WINDOW_KEYS.map((index) => [index, FSComponent.createRef<RadioSubWindow>()])
  );

  private readonly selectedSubWindowKey = Subject.create(RadioSubWindowKey.Com1);

  private lastSelectedComSubWindowIndex = RadioSubWindowKey.Com1;
  private lastSelectedNavSubWindowIndex = RadioSubWindowKey.Nav1;

  /**
   * Gets the selected radio sub-window.
   * @returns The instance of the selected radio sub-window.
   */
  get selectedRadioSubWindow(): RadioSubWindow {
    return this.subWindowRefs[this.selectedSubWindowKey.get()].instance;
  }

  /**
   * Gets the currently selected radio sub-window's radio control event handler.
   * @returns A radio control event handler.
   */
  get selectedRadioControlEventHander(): (topic: RadioSubWindowControlEventTopics) => void {
    return this.selectedRadioSubWindow.handleRadioControlEvents;
  }

  /**
   * Checks if the index is a com subwindow
   * @param index The subwindow index to check.
   * @returns true if com subwindow.
   */
  private isComSubWindowIndex(index: RadioSubWindowKey): boolean {
    return index === RadioSubWindowKey.Com1 || index === RadioSubWindowKey.Com2;
  }

  /**
   * Checks if the index is a nav subwindow
   * @param index The subwindow index to check.
   * @returns true if nav subwindow.
   */
  private isNavSubWindowIndex(index: RadioSubWindowKey): boolean {
    return index === RadioSubWindowKey.Nav1 || index === RadioSubWindowKey.Nav2;
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(this.handleBezelButton);

    this.selectedSubWindowKey.sub((selectedIndex) => {
      for (const key of Object.keys(this.subWindowRefs) as Iterable<RadioSubWindowKey>) {
        this.subWindowRefs[key].instance.isSelected.set(key === selectedIndex);
      }
      if (this.isComSubWindowIndex(selectedIndex)) {
        this.lastSelectedComSubWindowIndex = selectedIndex;
      } else if (this.isNavSubWindowIndex(selectedIndex)) {
        this.lastSelectedNavSubWindowIndex = selectedIndex;
      }
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

    // MFD controller events
    if (this.props.duIndex === DisplayUnitIndices.PfdLeft) {
      this.pausables.push(
        this.props.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_du_com_button')
          .handle(() => {
            if (this.isComSubWindowIndex(this.selectedSubWindowKey.get())) {
              this.selectedRadioControlEventHander('epic2_du_com_button');
            } else {
              this.selectedSubWindowKey.set(this.lastSelectedComSubWindowIndex);
            }
          }, true),
        this.props.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_du_nav_button')
          .handle(() => {
            if (this.isNavSubWindowIndex(this.selectedSubWindowKey.get())) {
              this.selectedRadioControlEventHander('epic2_du_nav_button');
            } else {
              this.selectedSubWindowKey.set(this.lastSelectedNavSubWindowIndex);
            }
          }, true),
        this.props.bus.getSubscriber<Epic2DuControlEvents>().on('epic2_du_xpdr_button')
          .handle(() => {
            if (this.selectedSubWindowKey.get() === RadioSubWindowKey.Xpdr) {
              this.selectedRadioControlEventHander('epic2_du_xpdr_button');
            } else {
              this.selectedSubWindowKey.set(RadioSubWindowKey.Xpdr);
            }
          }, true),
      );
    }

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

    const subWindowKey = RadioTuningWindow.BEZEL_LSK_TO_SUBWINDOW_MAP[this.props.duSide].get(event as Epic2BezelButtonEvents);
    if (subWindowKey) {
      if (this.selectedSubWindowKey.get() !== subWindowKey) {
        this.selectedSubWindowKey.set(subWindowKey);
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
          duIndex={this.props.duIndex}
          detailPagesController={this.props.detailPagesController}
          ref={this.subWindowRefs[RadioSubWindowKey.Com1]}
          setSelected={() => this.selectedSubWindowKey.set(RadioSubWindowKey.Com1)}
        />
        <ComRadioSubWindow
          bus={this.props.bus}
          index={2}
          duIndex={this.props.duIndex}
          detailPagesController={this.props.detailPagesController}
          ref={this.subWindowRefs[RadioSubWindowKey.Com2]}
          setSelected={() => this.selectedSubWindowKey.set(RadioSubWindowKey.Com2)}
        />
        <NavRadioSubWindow
          bus={this.props.bus}
          index={1}
          duIndex={this.props.duIndex}
          detailPagesController={this.props.detailPagesController}
          ref={this.subWindowRefs[RadioSubWindowKey.Nav1]}
          setSelected={() => this.selectedSubWindowKey.set(RadioSubWindowKey.Nav1)}
        />
        <NavRadioSubWindow
          bus={this.props.bus}
          index={2}
          duIndex={this.props.duIndex}
          detailPagesController={this.props.detailPagesController}
          ref={this.subWindowRefs[RadioSubWindowKey.Nav2]}
          setSelected={() => this.selectedSubWindowKey.set(RadioSubWindowKey.Nav2)}
          fullWidthSeparator
        />
        <AdfRadioSubWindow
          bus={this.props.bus}
          duIndex={this.props.duIndex}
          detailPagesController={this.props.detailPagesController}
          ref={this.subWindowRefs[RadioSubWindowKey.Adf]}
          setSelected={() => this.selectedSubWindowKey.set(RadioSubWindowKey.Adf)}
        />
        <XpdrRadioSubWindow
          bus={this.props.bus}
          duIndex={this.props.duIndex}
          detailPagesController={this.props.detailPagesController}
          ref={this.subWindowRefs[RadioSubWindowKey.Xpdr]}
          setSelected={() => this.selectedSubWindowKey.set(RadioSubWindowKey.Xpdr)}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.pausables.map(sub => sub.destroy());
  }
}
