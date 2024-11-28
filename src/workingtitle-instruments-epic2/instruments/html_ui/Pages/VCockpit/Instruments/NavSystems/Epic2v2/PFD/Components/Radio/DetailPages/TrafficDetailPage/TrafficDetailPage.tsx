import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { TcasVerticalRange, TcasRelativeAbsoluteMode, TcasOperatingModeSetting } from '@microsoft/msfs-epic2-shared';
import { BaseDetailPageProps, BaseDetailPage } from '../BaseDetailPage';
import { DetailPageOptionRow, DetailPageTextRow, RadioSubWindowDetailPage } from '../DetailPagesController';

import './TrafficDetailPage.css';

/** The properties for the {@link TrafficDetailPage} component. */
type TrafficDetailPageProps = BaseDetailPageProps;

/** The TrafficDetailPage component. */
export class TrafficDetailPage extends BaseDetailPage<TrafficDetailPageProps> {

  protected override SELECTABLE_VALUES = [
    [TcasOperatingModeSetting.On, TcasOperatingModeSetting.Standby, TcasOperatingModeSetting.TAOnly, TcasOperatingModeSetting.TA_RA],
    [TcasVerticalRange.AboveBelow, TcasVerticalRange.Norm],
    [TcasRelativeAbsoluteMode.ABS, TcasRelativeAbsoluteMode.REL],
  ];

  protected override SELECTED_VALUES = [...this.props.controller.currentTcasModes];

  protected override ROWS = [
    {
      rowTitle: 'XPDR TCAS',
      rowOptions: [
        {
          label: 'ON',
          value: TcasOperatingModeSetting.On,
        },
        {
          label: 'ALT',
          value: TcasOperatingModeSetting.Standby,
        },
        {
          label: 'TA',
          value: TcasOperatingModeSetting.TAOnly,
        },
        {
          label: 'TA/RA',
          value: TcasOperatingModeSetting.TA_RA,
        },
      ],
      selectedValue: this.SELECTED_VALUES[0],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[0].findIndex((item) => item === this.SELECTED_VALUES[0].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[0] as Subject<TcasOperatingModeSetting>).set(this.SELECTABLE_VALUES[0][nextIndex] as TcasOperatingModeSetting);
        }
      },
    },
    {
      rowTitle: 'VERT RNG',
      rowOptions: [
        {
          label: 'AB+BW',
          value: TcasVerticalRange.AboveBelow,
        },
        {
          label: 'NORM',
          value: TcasVerticalRange.Norm,
        },
      ],
      selectedValue: this.SELECTED_VALUES[1],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[1].findIndex((item) => item === this.SELECTED_VALUES[1].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[1].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[1] as Subject<TcasVerticalRange>).set(this.SELECTABLE_VALUES[1][nextIndex] as TcasVerticalRange);
        }
      },
    },
    {
      rowTitle: 'REL ABS',
      rowOptions: [
        {
          label: 'ABS',
          value: TcasRelativeAbsoluteMode.ABS,
        },
        {
          label: 'REL',
          value: TcasRelativeAbsoluteMode.REL,
        },
      ],
      selectedValue: this.SELECTED_VALUES[2],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[2].findIndex((item) => item === this.SELECTED_VALUES[2].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[2].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[2] as Subject<TcasRelativeAbsoluteMode>).set(this.SELECTABLE_VALUES[2][nextIndex] as TcasRelativeAbsoluteMode);
        }
      },
    },
    {
      rowTitle: 'TCAS TEST',
      rowText: 'OFF   ',
      rowCallback: () => { },
    },
    {
      rowTitle: 'XPDR',
      rowText: 'Go To XPDR Detail',
      rowCallback: () => { this.props.controller.currentPage.set(RadioSubWindowDetailPage.XPDR); },
    }
  ];

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <div ref={this.props.ref} class="epic2-traffic-detail-page">
        {this.renderOptionRow(this.ROWS[0] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 0))}
        {this.renderOptionRow(this.ROWS[1] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 1))}
        {this.renderOptionRow(this.ROWS[2] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 2))}
        {this.renderTextRow(this.ROWS[3] as DetailPageTextRow, this.props.controller.currentRowIndex.map((index) => index === 3))}
        {this.renderTextRow(this.ROWS[4] as DetailPageTextRow, this.props.controller.currentRowIndex.map((index) => index === 4))}
      </div>
    );
  }
}
