import { FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { BaseDetailPage, BaseDetailPageProps } from '../BaseDetailPage/BaseDetailPage';
import { DmeHoldMode, DmePairMode } from '../DetailPagesController';

import './DmeDetailPage.css';

/** The properties for the {@link DmeDetailPage} component. */
type DmeDetailPageProps = BaseDetailPageProps;

/** The DmeDetailPage component. */
export class DmeDetailPage extends BaseDetailPage<DmeDetailPageProps> {

  protected override SELECTABLE_VALUES = [
    [DmePairMode.NAV1, DmePairMode.NAV2],
    [DmeHoldMode.ON, DmeHoldMode.OFF],
    [DmePairMode.NAV1, DmePairMode.NAV2],
    [DmeHoldMode.ON, DmeHoldMode.OFF],
  ];

  protected override SELECTED_VALUES = [...this.props.controller.currentDmeModes];

  protected override ROWS = [
    {
      rowTitle: 'DME1 PAIR',
      rowOptions: [
        {
          label: 'NAV1',
          value: DmePairMode.NAV1,
        },
        {
          label: 'NAV2',
          value: DmePairMode.NAV2,
        },
      ],
      selectedValue: this.SELECTED_VALUES[0],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[0].findIndex((item) => item === this.SELECTED_VALUES[0].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[0] as Subject<DmePairMode>).set(this.SELECTABLE_VALUES[0][nextIndex] as DmePairMode);
        }
      },
    },
    {
      rowTitle: 'DME1 HOLD',
      rowOptions: [
        {
          label: 'ON',
          value: DmeHoldMode.ON,
        },
        {
          label: 'OFF',
          value: DmeHoldMode.OFF,
        },
      ],
      selectedValue: this.SELECTED_VALUES[1],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[1].findIndex((item) => item === this.SELECTED_VALUES[1].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[1] as Subject<DmeHoldMode>).set(this.SELECTABLE_VALUES[1][nextIndex] as DmeHoldMode);
        }
      },
    },
    {
      rowTitle: 'DME2 PAIR',
      rowOptions: [
        {
          label: 'NAV1',
          value: DmePairMode.NAV1,
        },
        {
          label: 'NAV2',
          value: DmePairMode.NAV2,
        },
      ],
      selectedValue: this.SELECTED_VALUES[2],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[2].findIndex((item) => item === this.SELECTED_VALUES[2].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[2] as Subject<DmePairMode>).set(this.SELECTABLE_VALUES[2][nextIndex] as DmePairMode);
        }
      },
    },
    {
      rowTitle: 'DME2 HOLD',
      rowOptions: [
        {
          label: 'ON',
          value: DmeHoldMode.ON,
        },
        {
          label: 'OFF',
          value: DmeHoldMode.OFF,
        },
      ],
      selectedValue: this.SELECTED_VALUES[3],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[3].findIndex((item) => item === this.SELECTED_VALUES[3].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          (this.SELECTED_VALUES[3] as Subject<DmeHoldMode>).set(this.SELECTABLE_VALUES[3][nextIndex] as DmeHoldMode);
        }
      },
    },
  ];

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <div ref={this.props.ref} class="epic2-dme-detail-page">
        {this.ROWS.map((row, index) => this.renderOptionRow(
          row,
          this.props.controller.currentRowIndex.map((_index) => _index === index)
        ))}
      </div>
    );
  }
}
