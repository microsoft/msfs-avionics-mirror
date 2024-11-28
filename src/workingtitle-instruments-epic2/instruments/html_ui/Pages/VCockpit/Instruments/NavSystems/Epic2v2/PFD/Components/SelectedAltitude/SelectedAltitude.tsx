import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, Subscribable, SubscribableMapFunctions, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider, Epic2ApVerticalMode, PfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

import './SelectedAltitude.css';

/** The display color of the selected altitude. */
export enum SelectedAltitudeColor {
  WHITE,
  CYAN,
  AMBER,
  MAGENTA
}

/** The selected altitude props. */
export interface SelectedAltitudeProps extends ComponentProps {
  /** A provider of auto pilot data. */
  autopilotDataProvider: AutopilotDataProvider;

  /** A provider of altitude data. */
  altitudeDataProvider: AltitudeDataProvider;

  /** A manager for PFD settings. */
  pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The selected altitude component. */
export class SelectedAltitude extends DisplayComponent<SelectedAltitudeProps> {
  private readonly metricPfdSetting = this.props.pfdSettingsManager.getSetting('altMetric');

  private readonly selectedAltitudeColor = MappedSubject.create(
    ([selectedAlt, currentAlt, verticalMode]) => {
      if (currentAlt === null || selectedAlt === null) { return SelectedAltitudeColor.WHITE; }
      const altDif = Math.abs(currentAlt - selectedAlt);

      switch (verticalMode) {
        case Epic2ApVerticalMode.AltitudeSelect:
        case Epic2ApVerticalMode.VnavAltitudeSelect:
          return SelectedAltitudeColor.MAGENTA;
        case Epic2ApVerticalMode.AltitudeHold:
        case Epic2ApVerticalMode.VnavAltitudeHold:
          if (altDif < 200) {
            return SelectedAltitudeColor.MAGENTA;
          }
          return SelectedAltitudeColor.AMBER;
        case Epic2ApVerticalMode.VnavFlightLevelChange:
        case Epic2ApVerticalMode.VnavPath:
        case Epic2ApVerticalMode.VnavSpeed:
          if (altDif < 200) {
            return SelectedAltitudeColor.CYAN;
          }
          break;
        default:
          if (altDif < 1000) {
            return SelectedAltitudeColor.AMBER;
          }
      }
      return SelectedAltitudeColor.WHITE;
    },
    this.props.autopilotDataProvider.selectedAltitude,
    this.props.altitudeDataProvider.altitude,
    this.props.autopilotDataProvider.verticalActive,
  );

  private readonly selectedAltitudeTensSubject = this.props.autopilotDataProvider.selectedAltitude.map(feetAlt =>
    feetAlt !== null ? `${feetAlt % 100}`.padEnd(2, '0') : '---'
  ).pause();

  private readonly selectedAltitudeHundredsSubject = this.props.autopilotDataProvider.selectedAltitude.map(feetAlt =>
    feetAlt !== null ? `${Math.floor(feetAlt / 100)}` : ''
  ).pause();

  private readonly metricAltSubject = this.props.autopilotDataProvider.selectedAltitude.map(feetAlt =>
    feetAlt !== null ? `${MathUtils.round(UnitType.FOOT.convertTo(feetAlt, UnitType.METER), 50)}` : '---'
  ).pause();

  private readonly isHidden = MappedSubject.create(SubscribableMapFunctions.or(), this.props.declutter, this.props.autopilotDataProvider.selectedAltitude.map(v => v === null));

  /** @inheritdoc */
  public onAfterRender(): void {
    this.metricPfdSetting.sub(metric => {
      if (metric) {
        this.selectedAltitudeTensSubject.pause();
        this.selectedAltitudeHundredsSubject.pause();
        this.metricAltSubject.resume();
      } else {
        this.metricAltSubject.pause();
        this.selectedAltitudeTensSubject.resume();
        this.selectedAltitudeHundredsSubject.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div
        class={{
          'selected-altitude-container': true,
          'border-box': true,
          'shaded-box': true,
          'hidden': this.isHidden
        }}
      >
        <div
          class={{
            'selected-alt-value-container': true,
            'magenta': this.selectedAltitudeColor.map(v => v === SelectedAltitudeColor.MAGENTA),
            'amber': this.selectedAltitudeColor.map(v => v === SelectedAltitudeColor.AMBER),
            'cyan': this.selectedAltitudeColor.map(v => v === SelectedAltitudeColor.CYAN)
          }}
        >
          <span
            class={{
              'metric': true,
              'hidden': this.metricPfdSetting.map(v => !v),
              'invalid': this.metricAltSubject.map(v => v === '---')
            }}
          >
            {this.metricAltSubject}
            <span class="selected-alt-unit">M</span>
          </span>
          <span
            class={{
              'selected-alt-thousands': true,
              'hidden': this.metricPfdSetting
            }}
          >
            {this.selectedAltitudeHundredsSubject}
          </span>
          <span
            class={{
              'selected-alt-tens': true,
              'hidden': this.metricPfdSetting
            }}
          >
            {this.selectedAltitudeTensSubject}
          </span>
        </div>
      </div>
    );
  }
}
