import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, MinimumsMode, NumberFormatter, NumberUnitSubject,
  ObjectSubject, SetSubject, Subscribable, Subscription, UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { MinimumsDataProvider } from '../../../minimums/MinimumsDataProvider';
import { UnitsUserSettingManager } from '../../../settings';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { MinimumsAlertState } from './MinimumsAlerter';

/**
 * Component props for MinimumsDisplay.
 */
export interface MinimumsDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A data provider for the display. */
  dataProvider: MinimumsDataProvider;

  /** The current minimums alert state. */
  minimumsAlertState: Subscribable<MinimumsAlertState>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the indicator should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A next-generation (NXi, G3000, etc) Garmin PFD minimums display.
 */
export class MinimumsDisplay extends DisplayComponent<MinimumsDisplayProps> {
  private readonly valueRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['minimums']);

  private readonly modeText = this.props.dataProvider.mode.map(mode => {
    switch (mode) {
      case MinimumsMode.BARO:
        return 'BARO';
      case MinimumsMode.RA:
        return 'RA';
      default:
        return '';
    }
  });

  private readonly minimumsValue = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private modeSub?: Subscription;
  private minimumsPipe?: Subscription;
  private minimumsAlertSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const minimumsAlertSub = this.minimumsAlertSub = this.props.minimumsAlertState.sub(state => {
      switch (state) {
        case MinimumsAlertState.Within100:
          this.rootCssClass.delete('minimums-alert-atorbelow');
          this.rootCssClass.add('minimums-alert-within100');
          break;
        case MinimumsAlertState.AtOrBelow:
          this.rootCssClass.delete('minimums-alert-within100');
          this.rootCssClass.add('minimums-alert-atorbelow');
          break;
        default:
          this.rootCssClass.delete('minimums-alert-within100');
          this.rootCssClass.delete('minimums-alert-atorbelow');
      }
    }, false, true);

    const minimumsPipe = this.minimumsPipe = this.props.dataProvider.minimums.pipe(this.minimumsValue, minimums => minimums ?? 0, true);

    const modeSub = this.modeSub = this.props.dataProvider.mode.sub(mode => {
      if (mode === MinimumsMode.OFF) {
        this.modeText.pause();
        minimumsPipe.pause();
        minimumsAlertSub.pause();

        this.rootStyle.set('display', 'none');
      } else {
        this.rootStyle.set('display', '');

        this.modeText.resume();
        minimumsPipe.resume(true);
        minimumsAlertSub.resume(true);
      }
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        modeSub.pause();

        this.modeText.pause();
        minimumsPipe.pause();
        minimumsAlertSub.pause();

        this.rootStyle.set('display', 'none');
      } else {
        modeSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='minimums-title'>
          <div class='minimums-mode'>{this.modeText}</div>
          <div class='minimums-min'>MIN</div>
        </div>
        <NumberUnitDisplay
          ref={this.valueRef}
          value={this.minimumsValue}
          displayUnit={this.props.unitsSettingManager.altitudeUnits}
          formatter={NumberFormatter.create({ precision: 1 })}
          class='minimums-value'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.valueRef.getOrDefault()?.destroy();

    this.modeSub?.destroy();
    this.modeText.destroy();
    this.minimumsPipe?.destroy();
    this.minimumsAlertSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}