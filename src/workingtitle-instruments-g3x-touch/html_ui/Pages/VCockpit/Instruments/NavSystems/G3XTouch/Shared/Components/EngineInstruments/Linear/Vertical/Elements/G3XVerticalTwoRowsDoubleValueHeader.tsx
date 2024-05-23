import {FSComponent, VNode} from '@microsoft/msfs-sdk';
import {G3XGaugeValueText} from '../../Elements/G3XGaugeValueText';
import {G3XLabel} from '../../Elements/G3XLabel';
import {G3XHorizontalOneRowDoubleValueHeader} from '../../Horizontal/Elements/G3XHorizontalOneRowDoubleValueHeader';

/** Controller for the display of the text value and label in 2 rows for a two value gauge. */
export class G3XVerticalTwoRowsDoubleValueHeader extends G3XHorizontalOneRowDoubleValueHeader {

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class="text-frame"
        style={{
          animation: this.animationSubject,
        }}
      >
        <div
          style={{
            color: this.titleColorSubject,
          }}
        >
          <G3XLabel
            label={this.props.label}
            unit={this.props.unit}
          />
        </div>
        <div
          class="values-text-row"
        >
          <div
            style={{
              color: this.leftTextColorSubject,
              background: this.leftBackgroundColorSubject,
            }}
          >
            <G3XGaugeValueText
              valueSubject={this.props.leftValue}
              textIncrement={this.props.style?.textIncrement}
              valuePrecision={this.props.style?.valuePrecision}
              displayPlus={this.props.style?.displayPlus}
            />
          </div>
          <div
            style={{
              color: this.rightTextColorSubject,
              background: this.rightBackgroundColorSubject,
            }}
          >
            <G3XGaugeValueText
              valueSubject={this.props.rightValue}
              textIncrement={this.props.style?.textIncrement}
              valuePrecision={this.props.style?.valuePrecision}
              displayPlus={this.props.style?.displayPlus}
            />
          </div>
        </div>
      </div>
    );
  }
}
