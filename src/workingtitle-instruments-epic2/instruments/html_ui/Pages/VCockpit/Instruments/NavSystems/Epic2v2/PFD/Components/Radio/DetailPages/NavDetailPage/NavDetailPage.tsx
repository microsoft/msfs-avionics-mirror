import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { BaseDetailPage, BaseDetailPageProps } from '../BaseDetailPage/BaseDetailPage';
import { DetailPageOptionRow, DetailPageTextRow, RadioSubWindowDetailPage } from '../DetailPagesController';
import { NavMode } from '@microsoft/msfs-epic2-shared';
import { AbstractDetailPage } from '../AbstractDetailPage';

import './NavDetailPage.css';

/** The properties for the {@link NavDetailPage} component. */
interface NavDetailPageProps extends BaseDetailPageProps {
  /** NAV radio index. */
  index: 1 | 2;
}

/** The NavDetailPage component. */
export class NavDetailPage extends BaseDetailPage<NavDetailPageProps> implements AbstractDetailPage<NavDetailPageProps> {

  protected override SELECTABLE_VALUES = [
    [NavMode.BRG, NavMode.RAD, NavMode.STBY],
    [NavMode.BRG, NavMode.RAD, NavMode.STBY],
  ];

  protected override SELECTED_VALUES = [...this.props.controller.currentNavModes];

  protected override ROWS = [
    {
      rowTitle: 'NAV1 MODE',
      rowOptions: [
        {
          label: 'BRG',
          value: NavMode.BRG,
        },
        {
          label: 'RAD',
          value: NavMode.RAD,
        },
        {
          label: 'STBY',
          value: NavMode.STBY,
        }
      ],
      selectedValue: this.SELECTED_VALUES[0],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[0].findIndex((item) => item === this.SELECTED_VALUES[0].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[0].length - 1 ? 0 : currentIndex + 1;
          this.SELECTED_VALUES[0].set(this.SELECTABLE_VALUES[0][nextIndex]);
        }
      },
    },
    {
      rowTitle: 'NAV2 MODE',
      rowOptions: [
        {
          label: 'BRG',
          value: NavMode.BRG,
        },
        {
          label: 'RAD',
          value: NavMode.RAD,
        },
        {
          label: 'STBY',
          value: NavMode.STBY,
        }
      ],
      selectedValue: this.SELECTED_VALUES[1],
      rowCallback: () => {
        const currentIndex = this.SELECTABLE_VALUES[1].findIndex((item) => item === this.SELECTED_VALUES[1].get());
        if (currentIndex >= 0) {
          const nextIndex = currentIndex === this.SELECTABLE_VALUES[1].length - 1 ? 0 : currentIndex + 1;
          this.SELECTED_VALUES[1].set(this.SELECTABLE_VALUES[1][nextIndex]);
        }
      },
    },
    {
      rowTitle: 'DME',
      rowText: 'Go To DME Detail',
      rowCallback: () => { this.props.controller.currentPage.set(RadioSubWindowDetailPage.DME); },
    }
  ];

  /** @inheritdoc */
  public override renderVNodeRow(): VNode {
    return (<></>);
  }

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <div ref={this.props.ref} class="epic2-nav-detail-page">
        {this.renderOptionRow(this.ROWS[0] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 0))}
        {this.renderOptionRow(this.ROWS[1] as DetailPageOptionRow, this.props.controller.currentRowIndex.map((index) => index === 1))}
        {this.renderTextRow(this.ROWS[2] as DetailPageTextRow, this.props.controller.currentRowIndex.map((index) => index === 2))}
      </div>
    );
  }
}
