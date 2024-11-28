import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { BaseDetailPage, BaseDetailPageProps } from '../BaseDetailPage/BaseDetailPage';
import { AdfMode } from '@microsoft/msfs-epic2-shared';
import { AbstractDetailPage } from '../AbstractDetailPage';

import './AdfDetailPage.css';

/** The properties for the {@link AdfDetailPage} component. */
type AdfDetailPageProps = BaseDetailPageProps;

/** The AdfDetailPage component. */
export class AdfDetailPage extends BaseDetailPage<AdfDetailPageProps> implements AbstractDetailPage<AdfDetailPageProps> {

  protected override SELECTABLE_VALUES = [
    [AdfMode.BFO, AdfMode.ANT, AdfMode.ADF]
  ];

  protected override SELECTED_VALUES = [
    this.props.controller.currentAdfModes[0]
  ];

  protected override ROWS = [
    {
      rowTitle: 'ADF MODE',
      rowOptions: [
        {
          label: 'BFO',
          value: AdfMode.BFO,
        },
        {
          label: 'ANT',
          value: AdfMode.ANT,
        },
        {
          label: 'ADF',
          value: AdfMode.ADF,
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
    }
  ];

  /** @inheritdoc */
  public override renderTextRow(): VNode {
    return (<></>);
  }

  /** @inheritdoc */
  public override renderVNodeRow(): VNode {
    return (<></>);
  }

  /** @inheritdoc */
  public override render(): VNode {
    return (
      <div ref={this.props.ref} class="epic2-adf-detail-page">
        {this.renderOptionRow(this.ROWS[0], this.props.controller.currentRowIndex.map((index) => index === 0))}
      </div>
    );
  }
}
