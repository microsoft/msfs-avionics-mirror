import { DisplayComponent, FSComponent, NavAngleUnit, VNode } from '@microsoft/msfs-sdk';

import { BearingDisplayProps } from '@microsoft/msfs-garminsdk';

import { G3XSpecialChar } from '../../Graphics/Text/G3XSpecialChar';
import { BearingDisplay } from './BearingDisplay';

/**
 * Component props for G3XBearingDisplay.
 */
export interface G3XBearingDisplayProps extends BearingDisplayProps {
  /**
   * Whether to use basic unit text formatting instead of G3X-style unit text formatting. Ignored if `unitFormatter` is
   * defined. Defaults to `false`.
   */
  useBasicUnitFormat?: boolean;
}

/**
 * A G3X Touch component which displays a bearing value.
 */
export class G3XBearingDisplay extends DisplayComponent<G3XBearingDisplayProps> {

  /**
   * A function which formats units to default G3X-style text for G3XBearingDisplay.
   * @param out The 2-tuple to which to write the formatted text, as `[bigText, smallText]`.
   * @param unit The unit to format.
   */
  public static readonly DEFAULT_G3X_UNIT_FORMATTER = (out: [string, string], unit: NavAngleUnit): void => {
    out[0] = unit.isMagnetic() ? G3XSpecialChar.DegreeMagnetic : G3XSpecialChar.DegreeTrue;
  };

  /**
   * A function which formats units to default basic-style text for G3XBearingDisplay.
   * @param out The 2-tuple to which to write the formatted text, as `[bigText, smallText]`.
   * @param unit The unit to format.
   */
  public static readonly DEFAULT_BASIC_UNIT_FORMATTER = (out: [string, string], unit: NavAngleUnit): void => {
    out[0] = '°';
    out[1] = unit.isMagnetic() ? 'M' : 'T';
  };

  private readonly ref = FSComponent.createRef<BearingDisplay>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <BearingDisplay
        ref={this.ref}
        value={this.props.value}
        displayUnit={this.props.displayUnit}
        formatter={this.props.formatter}
        unitFormatter={this.props.unitFormatter ?? (
          this.props.useBasicUnitFormat
            ? G3XBearingDisplay.DEFAULT_BASIC_UNIT_FORMATTER
            : G3XBearingDisplay.DEFAULT_G3X_UNIT_FORMATTER
        )}
        use360={this.props.use360}
        hideDegreeSymbolWhenNan={this.props.hideDegreeSymbolWhenNan}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }
}