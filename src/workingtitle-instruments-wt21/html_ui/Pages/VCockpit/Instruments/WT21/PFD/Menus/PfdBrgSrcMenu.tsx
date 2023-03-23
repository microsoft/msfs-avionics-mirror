/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EventBus, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { PopupMenuSection } from '../../Shared/Menus/Components/PopupMenuSection';
import { PopupSubMenu } from '../../Shared/Menus/Components/PopupSubMenu';
import { RadioBox } from '../../Shared/Menus/Components/Radiobox';
import { RadioList } from '../../Shared/Menus/Components/RadioList';
import { WT21BearingPointerControlEvents, WT21NavIndicator, WT21NavSource } from '../../Shared/Navigation/WT21NavIndicators';
import { GuiDialog, GuiDialogProps } from '../../Shared/UI/GuiDialog';

import './PfdBrgSrcMenu.css';

/** @inheritdoc */
interface PfdBrgSrcMenuProps extends GuiDialogProps {
  /** The event bus. */
  bus: EventBus;
  /** Used to sync bearing pointer indicator. */
  bearingPointerIndicator1: WT21NavIndicator;
  /** Used to sync bearing pointer indicator. */
  bearingPointerIndicator2: WT21NavIndicator;
  /** Used to sync if isLocalizer. */
  nav1Source: WT21NavSource;
  /** Used to sync if isLocalizer. */
  nav2Source: WT21NavSource;
  /** Used to sync ADF frequency. */
  adfSource: WT21NavSource;
}

/** The PfdBrgSrcMenu component. */
export class PfdBrgSrcMenu extends GuiDialog<PfdBrgSrcMenuProps> {
  private readonly nav1RadioBox = FSComponent.createRef<RadioBox>();
  private readonly nav2RadioBox = FSComponent.createRef<RadioBox>();
  private readonly bearingPointer1Option = Subject.create<number>(0);
  private readonly bearingPointer2Option = Subject.create<number>(0);
  private readonly sources1 = [null, 'FMS1', 'NAV1', 'ADF'] as const;
  private readonly sources2 = [null, 'FMS2', 'NAV2', 'ADF'] as const;
  private readonly nav1Label = Subject.create('');
  private readonly nav2Label = Subject.create('');
  private readonly adfLabel = Subject.create('');

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.linkNavIndicators();
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

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <PopupSubMenu label='PFD MENU' sublabel='BRG SRC' class="pfd-popup-menu-brgsrc">
          <PopupMenuSection label='BRG PTR 1'>
            <RadioList dataRef={this.bearingPointer1Option}>
              <RadioBox name='brgptr1' label='OFF'></RadioBox>
              <RadioBox name='brgptr1' label='FMS1'></RadioBox>
              <RadioBox name='brgptr1' label={this.nav1Label} ref={this.nav1RadioBox}></RadioBox>
              <RadioBox name='brgptr1' label={this.adfLabel}></RadioBox>
            </RadioList>
            <svg class="pfd-brg-src-menu-pntr-symbol-1">
              <path
                d="M -14 8 L 0 -10 L 14 8 M 0 -24 L 0 67"
                stroke="var(--wt21-colors-cyan)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
          </PopupMenuSection>
          <PopupMenuSection label='BRG PTR 2'>
            <RadioList dataRef={this.bearingPointer2Option}>
              <RadioBox name='brgptr2' label='OFF'></RadioBox>
              <RadioBox name='brgptr2' label='FMS2'></RadioBox>
              <RadioBox name='brgptr2' label={this.nav2Label} ref={this.nav2RadioBox}></RadioBox>
              <RadioBox name='brgptr2' label={this.adfLabel}></RadioBox>
            </RadioList>
            <svg class="pfd-brg-src-menu-pntr-symbol-2">
              <path
                d="M -14 8 L 0 -10 L 14 8 M 0 -24 L 0 -10 M -7 -1 L -7 67 M 7 -1 L 7 67"
                stroke="var(--wt21-colors-white)"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </svg>
          </PopupMenuSection>
        </PopupSubMenu>
      </>
    );
  }
}
