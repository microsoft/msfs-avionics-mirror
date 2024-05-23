import { FSComponent, VNode } from '@microsoft/msfs-sdk';
import { G3XGaugeValueText } from '../../Elements/G3XGaugeValueText';
import { G3XLabel } from '../../Elements/G3XLabel';
import { G3XHorizontalSingleValueHeader } from '../../Horizontal/Elements/G3XHorizontalSingleValueHeader';

/** Controller for the display of the text value for a single-value gauge. */
export class G3XVerticalSingleValueHeader extends G3XHorizontalSingleValueHeader {

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class='text-frame'
        style={{
          color: this.textColorSubject,
          background: this.backgroundColorSubject,
          animation: this.animationSubject,
        }}
      >
        <G3XLabel
          label={this.props.label}
          unit={this.props.unit}
        />
        <G3XGaugeValueText
          valueSubject={this.props.valueSubject}
          textIncrement={this.props.style?.textIncrement}
          valuePrecision={this.props.style?.valuePrecision}
          displayPlus={this.props.style?.displayPlus}
        />
      </div>
    );
  }
}