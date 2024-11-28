import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { XpdrSelectMode } from '@microsoft/msfs-epic2-shared';

import { BaseDetailPage, BaseDetailPageProps } from '../BaseDetailPage/BaseDetailPage';
import { AdsBroadcastOutMode, DetailPageOptionRow, DetailPageTextRow, DetailPageVNodeRow, RadioSubWindowDetailPage } from '../DetailPagesController';
import { VfrCodeRow } from './VfrCodeRow';

import './XpdrDetailPage.css';

/** The properties for the {@link XpdrDetailPage} component. */
type XpdrDetailPageProps = BaseDetailPageProps

/** The XpdrDetailPage component. */
export class XpdrDetailPage extends BaseDetailPage<XpdrDetailPageProps> {
  protected override isXpdrDetailPage = true;

  protected override SELECTABLE_VALUES = [
    [XpdrSelectMode.XPDR2, XpdrSelectMode.XPDR1],
    [AdsBroadcastOutMode.ON, AdsBroadcastOutMode.OFF],
  ];

  protected override SELECTED_VALUES = [...this.props.controller.currentXpdrModes];

  protected override ROWS = [
    {
      rowTitle: 'VFR CODE',
      vnode: (
        <VfrCodeRow
          bus={this.props.bus}
          vfrCode={this.props.settings.getSetting('vfrCode')}
          isSelected={this.isVfrCodeEditable}
        />
      ),
    },
    {
      rowTitle: 'XPDR SEL',
      rowOptions: [
        {
          label: 'XPDR2',
          value: XpdrSelectMode.XPDR2,
        },
        {
          label: 'XPDR1',
          value: XpdrSelectMode.XPDR1,
        },
      ],
      selectedValue: this.SELECTED_VALUES[0],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[0].findIndex((item) => item === this.SELECTED_VALUES[0].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[0] as Subject<XpdrSelectMode>).set(this.SELECTABLE_VALUES[0][nextIndex] as XpdrSelectMode);
        }
      },
    },
    {
      rowTitle: 'ADS-B OUT',
      rowOptions: [
        {
          label: 'ON',
          value: AdsBroadcastOutMode.ON,
        },
        {
          label: 'OFF',
          value: AdsBroadcastOutMode.OFF,
        },
      ],
      selectedValue: this.SELECTED_VALUES[1],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[1].findIndex((item) => item === this.SELECTED_VALUES[1].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[1] as Subject<AdsBroadcastOutMode>).set(this.SELECTABLE_VALUES[1][nextIndex] as AdsBroadcastOutMode);
        }
      },
    },
    {
      rowTitle: 'TRFC',
      rowText: 'Go To Traffic Detail',
      rowCallback: () => { this.props.controller.currentPage.set(RadioSubWindowDetailPage.TCAS); },
    }
  ];

  /** @inheritdoc */
  public override onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.pausables.push(
      this.props.controller.currentRowIndex.sub((index) => {
        this.isVfrCodeEditable.set(index === 0);
      }, true, false),
    );
  }

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <div ref={this.props.ref} class="epic2-xpdr-detail-page">
        {this.renderVNodeRow(this.ROWS[0] as DetailPageVNodeRow, this.props.controller.currentRowIndex.map((index) => index === 0))}
        {this.renderOptionRow(this.ROWS[1] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 1))}
        {this.renderOptionRow(this.ROWS[2] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 2))}
        {this.renderTextRow(this.ROWS[3] as DetailPageTextRow, this.props.controller.currentRowIndex.map((index) => index === 3))}
      </div>
    );
  }
}
