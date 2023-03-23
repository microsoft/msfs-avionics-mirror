import {
  ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, SetSubject, Subscribable, SubscribableMapFunctions, Subscription,
  UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { SpeedInfoDataProvider } from './SpeedInfoDataProvider';

import './SpeedInfo.css';

/**
 * Component props for SpeedInfo.
 */
export interface SpeedInfoProps extends ComponentProps {
  /** A data provider for the display. */
  dataProvider: SpeedInfoDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 speed information display. Displays true airspeed and ground speed.
 */
export class SpeedInfo extends DisplayComponent<SpeedInfoProps> {
  private static readonly FORMATTER = NumberFormatter.create({ precision: 1, nanString: '___' });

  private readonly tasRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();
  private readonly gsRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Speed>>();

  private readonly rootCssClass = SetSubject.create(['speed-info']);

  private readonly precision = this.props.unitsSettingManager.speedUnits.map(unit => unit.convertTo(1, UnitType.KNOT));

  private readonly tas = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));
  private readonly gs = NumberUnitSubject.create(UnitType.KNOT.createNumber(NaN));

  private tasPipe?: Subscription;
  private gsPipe?: Subscription;
  private isAirDataFailedSub?: Subscription;
  private isGpsDataFailedSub?: Subscription;
  private isGpsDeadReckoningSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const tasPipe = this.tasPipe = this.props.dataProvider.tasKnots.pipe(this.tas, SubscribableMapFunctions.withPrecision(this.precision), true);
    const gsPipe = this.gsPipe = this.props.dataProvider.gsKnots.pipe(this.gs, SubscribableMapFunctions.withPrecision(this.precision), true);

    const airDataFailedSub = this.isAirDataFailedSub = this.props.dataProvider.isAirDataFailed.sub(isFailed => {
      if (isFailed) {
        tasPipe.pause();
        this.tas.set(NaN);
      } else {
        tasPipe.resume(true);
      }
    }, false, true);

    const gpsDataFailedSub = this.isGpsDataFailedSub = this.props.dataProvider.isGpsDataFailed.sub(isFailed => {
      if (isFailed) {
        gsPipe.pause();
        this.gs.set(NaN);
      } else {
        gsPipe.resume(true);
      }
    }, false, true);

    const gpsDeadReckoningSub = this.isGpsDeadReckoningSub = this.props.dataProvider.isGpsDeadReckoning.sub(isDr => {
      this.rootCssClass.toggle('dead-reckoning', isDr);
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootCssClass.add('hidden');

        airDataFailedSub.pause();
        tasPipe.pause();
        gpsDataFailedSub.pause();
        gsPipe.pause();
        gpsDeadReckoningSub.pause();
      } else {
        this.rootCssClass.delete('hidden');

        airDataFailedSub.resume(true);
        gpsDataFailedSub.resume(true);
        gpsDeadReckoningSub.resume(true);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='speed-info-row speed-info-tas'>
          <div class='speed-info-title'>TAS</div>
          <NumberUnitDisplay
            ref={this.tasRef}
            value={this.tas}
            displayUnit={this.props.unitsSettingManager.speedUnits}
            formatter={SpeedInfo.FORMATTER}
          />
        </div>
        <div class='speed-info-row speed-info-gs'>
          <div class='speed-info-title'>GS</div>
          <NumberUnitDisplay
            ref={this.gsRef}
            value={this.gs}
            displayUnit={this.props.unitsSettingManager.speedUnits}
            formatter={SpeedInfo.FORMATTER}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.tasRef.getOrDefault()?.destroy();
    this.gsRef.getOrDefault()?.destroy();

    this.tasPipe?.destroy();
    this.gsPipe?.destroy();
    this.isAirDataFailedSub?.destroy();
    this.isGpsDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}