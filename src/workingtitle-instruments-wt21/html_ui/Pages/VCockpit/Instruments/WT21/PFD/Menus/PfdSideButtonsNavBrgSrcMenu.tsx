import { ArraySubject, EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { FloatingRadioList } from '../../Shared/Menus/Components/FloatingRadioList';
import { FloatingRadioItem } from '../../Shared/Menus/Components/FloatingRadioItem';
import { PopupSubMenu } from '../../Shared/Menus/Components/PopupSubMenu';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';
import { WT21BearingPointerControlEvents, WT21CourseNeedleNavIndicator, WT21NavIndicator, WT21NavSource } from '../../Shared/Navigation/WT21NavIndicators';

import './PfdSideButtonsNavBrgSrcMenu.css';

/**
 * Props for {@link PfdSideButtonsNavBrgSrcMenu}
 */
export interface PfdSideButtonsNavBrgSrcMenuProps extends GuiDialogProps {
  /** The event bus */
  bus: EventBus,

  /** Used to sync bearing pointer indicator. */
  bearingPointerIndicator1: WT21NavIndicator,

  /** Used to sync bearing pointer indicator. */
  bearingPointerIndicator2: WT21NavIndicator,

  /** Used to sync if isLocalizer. */
  nav1Source: WT21NavSource,

  /** Used to sync if isLocalizer. */
  nav2Source: WT21NavSource,

  /** Used to sync ADF frequency. */
  adfSource: WT21NavSource,

  /** Used to sync active nav source. */
  courseNeedle: WT21CourseNeedleNavIndicator;
}

/**
 * PFD (side button layout) NAV/BRG SRC menu
 */
export class PfdSideButtonsNavBrgSrcMenu extends GuiDialog<PfdSideButtonsNavBrgSrcMenuProps> {
  private static readonly BEARING_POINTER_1_PATH = 'M -8 5 L 0 -9 L 8 5 M 0 -16.335 L 0 8';

  private static readonly BEARING_POINTER_2_PATH = 'M -8.0438 3.7125 L 0 -6.1875 L 8.0438 3.7125 L 0 -6.1875 M -4.3313 -0.6188 L -4.3313 12.1375 M 4.3313 -0.6188 L 4.3313 12.1375';

  private readonly nav1RadioBox = FSComponent.createRef<FloatingRadioItem>();
  private readonly nav2RadioBox = FSComponent.createRef<FloatingRadioItem>();
  private readonly bearingPointer1Option = Subject.create<number>(0);
  private readonly bearingPointer2Option = Subject.create<number>(0);
  private readonly sources1 = [null, 'FMS1', 'NAV1', 'ADF'] as const;
  private readonly sources2 = [null, 'FMS2', 'NAV2', 'ADF'] as const;
  private readonly nav1Label = Subject.create('');
  private readonly nav2Label = Subject.create('');
  private readonly adfLabel = Subject.create('');

  private readonly navSourcesOrder = ['FMS1', 'NAV1', 'NAV2'] as const;
  private readonly navSources = ArraySubject.create<string>(['FMS1', 'VOR1', 'VOR2']);
  private readonly navSrcOption = Subject.create<number>(0);
  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.linkNavIndicators();
    this.linkNavSource();
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkNavIndicators(): void {
    this.bearingPointer1Option.sub(x => {
      const newSourceName = this.sources1[x];
      this.props.bus.getPublisher<WT21BearingPointerControlEvents>()
        .pub('nav_ind_bearingPointer1_set_source', newSourceName, true);
    });
    this.bearingPointer2Option.sub(x => {
      const newSourceName = this.sources2[x];
      this.props.bus.getPublisher<WT21BearingPointerControlEvents>()
        .pub('nav_ind_bearingPointer2_set_source', newSourceName, true);
    });

    this.props.bearingPointerIndicator1.source.sub(x => {
      this.bearingPointer1Option.set(x === null ? 0 : this.sources1.indexOf(x.name as typeof this.sources1[number]));
    }, true);
    this.props.bearingPointerIndicator2.source.sub(x => {
      this.bearingPointer2Option.set(x === null ? 0 : this.sources2.indexOf(x.name as typeof this.sources2[number]));
    }, true);

    this.props.nav1Source.isLocalizer.sub(this.updateNav1Label, true);
    this.props.nav1Source.isLocalizer.sub(x => this.nav1RadioBox.instance.setIsEnabled(!x), true);
    this.props.nav1Source.activeFrequency.sub(this.updateNav1Label, true);

    this.props.nav2Source.isLocalizer.sub(this.updateNav2Label, true);
    this.props.nav2Source.isLocalizer.sub(x => this.nav2RadioBox.instance.setIsEnabled(!x), true);
    this.props.nav2Source.activeFrequency.sub(this.updateNav2Label, true);

    this.props.adfSource.activeFrequency.sub(this.updateAdfLabel, true);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private linkNavSource(): void {
    this.navSrcOption.sub(x => {
      const newSourceName = this.navSourcesOrder[x];
      this.props.courseNeedle.setNewSource(newSourceName);
    });

    this.props.courseNeedle.source.sub(x => {
      if (!x) {
        return;
      }

      this.navSrcOption.set(this.navSourcesOrder.indexOf(x.name as typeof this.navSourcesOrder[number]));
    }, true);

    this.props.courseNeedle.isLocalizer.sub(x => {
      if (x) {
        this.navSources.set(['FMS1', 'LOC1', 'LOC2']);
      } else {
        this.navSources.set(['FMS1', 'VOR1', 'VOR2']);
      }
    }, true);
  }

  private readonly updateNavLabel = (index: 1 | 2, source: WT21NavSource, label: Subject<string>) => (): void => {
    const name = source.isLocalizer.get() ? `LOC${index}` : `VOR${index}`;
    const freq = source.activeFrequency.get()?.toFixed(2);
    const newLabel = `${name} ${freq}`;
    label.set(newLabel);
  };
  private readonly updateNav1Label = this.updateNavLabel(1, this.props.nav1Source, this.nav1Label);
  private readonly updateNav2Label = this.updateNavLabel(2, this.props.nav2Source, this.nav2Label);

  private readonly updateAdfLabel = (): void => {
    const freq = this.props.adfSource.activeFrequency.get()?.toFixed(1);
    const newLabel = `ADF~~${freq}`;
    this.adfLabel.set(newLabel);
  };

  /** @inheritDoc */
  public onSoftkey1L(): boolean {
    this.navSrcOption.set((this.navSrcOption.get() + 1) % 3);
    return true;
  }

  /** @inheritDoc */
  public onSoftkey1R(): boolean {
    this.bearingPointer1Option.set((this.bearingPointer1Option.get() + 1) % 3);
    return true;
  }

  /** @inheritDoc */
  public onSoftkey3R(): boolean {
    this.bearingPointer2Option.set((this.bearingPointer2Option.get() + 1) % 2);
    return true;
  }

  /** @inheritDoc */
  public override render(): VNode {
    return (
      <div>
        <PopupSubMenu label={'NAV\nSOURCE'} class="pfd-popup-nav-src-overlay" showBorder={false}>
          <FloatingRadioList dataRef={this.navSrcOption} orientation="left">
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-magenta)">FMS</FloatingRadioItem>
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-green)">VOR1</FloatingRadioItem>
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-yellow)">VOR2</FloatingRadioItem>
          </FloatingRadioList>
        </PopupSubMenu>

        <PopupSubMenu label={'BRG\nSOURCE'} class="pfd-popup-brg-src-overlay" showBorder={false}>
          <svg class="pfd-popup-brg-src-arrow" style={{ top: '73px', left: '-7px' }}>
            <path
              stroke-width={1.5}
              stroke="var(--wt21-colors-magenta)"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
              d={PfdSideButtonsNavBrgSrcMenu.BEARING_POINTER_1_PATH}
            />
          </svg>

          <svg class="pfd-popup-brg-src-arrow" style={{ top: '260px', left: '-8px' }}>
            <path
              stroke-width={1.5}
              stroke="var(--wt21-colors-teal)"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
              d={PfdSideButtonsNavBrgSrcMenu.BEARING_POINTER_2_PATH}
            />
          </svg>

          <FloatingRadioList dataRef={this.bearingPointer1Option} orientation="right">
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-teal)">OFF</FloatingRadioItem>
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-magenta)">FMS</FloatingRadioItem>
            <FloatingRadioItem ref={this.nav1RadioBox} name="terwx" selectedColor="var(--wt21-colors-green)">VOR1</FloatingRadioItem>
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-magenta)">ADF1</FloatingRadioItem>
          </FloatingRadioList>

          <FloatingRadioList class="pfd-popup-brg-src-overlay-bottom" dataRef={this.bearingPointer2Option} orientation="right">
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-teal)">OFF</FloatingRadioItem>
            <FloatingRadioItem name="terwx" selectedColor="var(--wt21-colors-magenta)">FMS</FloatingRadioItem>
            <FloatingRadioItem ref={this.nav2RadioBox} name="terwx" selectedColor="var(--wt21-colors-yellow)">VOR2</FloatingRadioItem>
          </FloatingRadioList>
        </PopupSubMenu>
      </div>
    );
  }
}
