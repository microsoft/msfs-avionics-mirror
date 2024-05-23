import { Subscribable, DisplayComponent, FSComponent, VNode, Subject } from '@microsoft/msfs-sdk';
import { G3XLabel } from '../../Elements/G3XLabel';
import { G3XPeakingGaugeProps } from '../../../../G3XGaugesConfigFactory/Gauges/G3XPeakingGaugeProps';

/** Properties for the display of the value text for a single-value gauge. */
interface SingleValueProps {
  /** The subject to semaphore alerting. */
  alertSubject: Subscribable<boolean>;
  /** Title for header. */
  label: Subscribable<string>;
  /** Show visuals related to peak mode. */
  showPeakVisuals: Subscribable<boolean>;
}

/** Controller for the display of the text value for a single-value gauge. */
export class G3XHorizontalTitleOnlyHeader extends DisplayComponent<Partial<G3XPeakingGaugeProps> & SingleValueProps> {
  static readonly DEFAULT_ZONE_COLOR = 'var(--g3x-color-white)';
  static readonly PEAK_FONT_COLOR = 'var(--g3x-color-cyan)';

  private readonly textColorSubject = this.props.showPeakVisuals.map(
    (showPeakVisuals) =>
      (showPeakVisuals && this.props.reflectPeakModeInHeader)
        ? G3XHorizontalTitleOnlyHeader.PEAK_FONT_COLOR
        : G3XHorizontalTitleOnlyHeader.DEFAULT_ZONE_COLOR,
  );

  private readonly animationSubject = this.props.alertSubject.map((alerting) => {
    if (alerting) {
      return 'gauge-alert-blink-red 1s infinite step-end';
    } else {
      return '';
    }
  });

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div
        class='text-frame'
        style={{
          color: this.textColorSubject,
          animation: this.animationSubject,
        }}
      >
        <G3XLabel
          label={Subject.create(this.props.title ?? '')}
          unit={this.props.unit}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.textColorSubject.destroy();
    this.animationSubject.destroy();
  }
}