import { ComSpacing, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { BaseDetailPage, BaseDetailPageProps } from '../BaseDetailPage/BaseDetailPage';
import { AbstractDetailPage } from '../AbstractDetailPage';

import './ComDetailPage.css';

/** The properties for the {@link ComDetailPage} component. */
interface ComDetailPageProps extends BaseDetailPageProps {
  /** COM radio index. */
  index: 1 | 2;
}

/** The ComDetailPage component. */
export class ComDetailPage extends BaseDetailPage<ComDetailPageProps> implements AbstractDetailPage<ComDetailPageProps> {

  protected override SELECTABLE_VALUES = [
    [ComSpacing.Spacing25Khz, ComSpacing.Spacing833Khz]
  ];

  protected override SELECTED_VALUES = [
    this.props.controller.currentComSpacings[this.props.index - 1]
  ];

  protected override ROWS = [
    {
      rowTitle: 'COM FREQ',
      rowOptions: [
        {
          label: '25',
          labelSuffix: 'kHz',
          value: ComSpacing.Spacing25Khz,
        },
        {
          label: '8.33',
          labelSuffix: 'kHz',
          value: ComSpacing.Spacing833Khz,
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
      <div ref={this.props.ref} class="epic2-com-detail-page">
        {this.renderOptionRow(this.ROWS[0], this.props.controller.currentRowIndex.map((index) => index === 0))}
      </div>
    );
  }
}
