import { DisplayComponent, NumberFormatter, Subscribable } from '@microsoft/msfs-sdk';

/** Props for an AbstractEngineIndicator */
export interface AbstractEngineIndicatorProps {
  /** The value to display in the middle. */
  value: Subscribable<number | null>,
  /** See {@link NumberFormatterOptions.precision}, defaults to 1. */
  precision?: number,
}

/** An abstract engine indicator. */
export abstract class AbstractEngineIndicator<P extends AbstractEngineIndicatorProps = AbstractEngineIndicatorProps> extends DisplayComponent<P> {

  protected readonly DISPLAY_VALUE_FORMATTER = NumberFormatter.create({ precision: this.props.precision ?? 1, round: -1 });

  protected readonly valueDisp = this.props.value.map((val: number | null): string =>
    val === null ? '---' : this.DISPLAY_VALUE_FORMATTER(val));
}
