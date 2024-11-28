import { DisplayComponent, FSComponent, Unit, VNode } from '@microsoft/msfs-sdk';

import { NumberUnitDisplayProps } from '@microsoft/msfs-garminsdk';

import { G3XSpecialChar } from '../../Graphics/Text/G3XSpecialChar';
import { G3XUnitFormatter } from '../../Graphics/Text/G3XUnitFormatter';
import { NumberUnitDisplay } from './NumberUnitDisplay';

/**
 * Component props for G3XNumberUnitDisplay.
 */
export interface G3XNumberUnitDisplayProps<F extends string> extends NumberUnitDisplayProps<F> {
  /**
   * Whether to use basic unit text formatting instead of G3X-style unit text formatting. Ignored if `unitFormatter` is
   * defined. Defaults to `false`.
   */
  useBasicUnitFormat?: boolean;

  /**
   * Whether to format unit text with up and down vertical speed arrows for supported unit types. Ignored if
   * `unitFormatter` is defined or `useStandardUnitFormat` is `true`. Defaults to `false`.
   */
  useVsArrows?: boolean;
}

/**
 * A G3X Touch component which displays a number with units.
 */
export class G3XNumberUnitDisplay<F extends string> extends DisplayComponent<G3XNumberUnitDisplayProps<F>> {

  private static readonly BASIC_UNIT_TEXT_MAP = G3XNumberUnitDisplay.createBasicUnitTextMap();

  private static readonly G3X_UNIT_FORMATTER_FUNC = G3XUnitFormatter.create();
  private static readonly G3X_VS_ARROWS_TEXT: Partial<Record<string, [string, string]>> = {
    [G3XSpecialChar.FootPerMinute]: [G3XSpecialChar.FootPerMinutePos, G3XSpecialChar.FootPerMinuteNeg],
  };

  /**
   * A function which formats units to default basic text for G3XNumberUnitDisplay.
   * @param out The 2-tuple to which to write the formatted text, as `[bigText, smallText]`.
   * @param unit The unit to format.
   */
  public static readonly DEFAULT_BASIC_UNIT_FORMATTER = (out: [string, string], unit: Unit<any>): void => {
    const text = G3XNumberUnitDisplay.BASIC_UNIT_TEXT_MAP[unit.family]?.[unit.name];

    if (text) {
      out[0] = text[0];
      out[1] = text[1];
    }
  };

  /**
   * A function which formats units to default G3X-style text for G3XNumberUnitDisplay.
   * @param out The 2-tuple to which to write the formatted text, as `[bigText, smallText]`.
   * @param unit The unit to format.
   */
  public static readonly DEFAULT_G3X_UNIT_FORMATTER = (out: [string, string], unit: Unit<any>): void => {
    out[0] = G3XNumberUnitDisplay.G3X_UNIT_FORMATTER_FUNC(unit);
  };

  /**
   * A function which formats units to default G3X-style text with vertical speed arrows for G3XNumberUnitDisplay.
   * @param out The 2-tuple to which to write the formatted text, as `[bigText, smallText]`.
   * @param unit The unit to format.
   * @param number The numeric value that is displayed.
   */
  public static readonly DEFAULT_G3X_VS_ARROW_UNIT_FORMATTER = (out: [string, string], unit: Unit<any>, number: number): void => {
    const text = G3XNumberUnitDisplay.G3X_UNIT_FORMATTER_FUNC(unit);
    const arrowText = G3XNumberUnitDisplay.G3X_VS_ARROWS_TEXT[text];

    if (arrowText) {
      out[0] = arrowText[number >= 0 ? 0 : 1];
    } else {
      out[0] = text;
    }
  };

  private readonly ref = FSComponent.createRef<NumberUnitDisplay<F>>();

  /** @inheritdoc */
  public render(): VNode {
    return (
      <NumberUnitDisplay
        ref={this.ref}
        value={this.props.value}
        displayUnit={this.props.displayUnit}
        formatter={this.props.formatter}
        unitFormatter={this.props.unitFormatter ?? (
          this.props.useBasicUnitFormat
            ? G3XNumberUnitDisplay.DEFAULT_BASIC_UNIT_FORMATTER
            : this.props.useVsArrows ? G3XNumberUnitDisplay.DEFAULT_G3X_VS_ARROW_UNIT_FORMATTER : G3XNumberUnitDisplay.DEFAULT_G3X_UNIT_FORMATTER
        )}
        hideUnitWhenNaN={this.props.hideUnitWhenNaN}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    super.destroy();
  }

  /**
   * Creates the standard mapping from unit to displayed text.
   * @returns The standard mapping from unit to displayed text.
   */
  private static createBasicUnitTextMap(): Partial<Record<string, Partial<Record<string, [string, string]>>>> {
    const originalMap = G3XUnitFormatter.getBasicUnitTextMap();

    const map = {} as Record<string, Record<string, [string, string]>>;
    for (const family in originalMap) {
      const nameMap = map[family] = {} as Record<string, [string, string]>;

      const originalNameMap = originalMap[family] as Readonly<Partial<Record<string, string>>>;
      for (const name in originalNameMap) {
        const text = nameMap[name] = ['', ''];

        const originalText = originalNameMap[name] as string;

        if (originalText[0] === '°') {
          text[0] = originalText;
        } else {
          text[1] = originalText;
        }
      }
    }

    return map;
  }
}