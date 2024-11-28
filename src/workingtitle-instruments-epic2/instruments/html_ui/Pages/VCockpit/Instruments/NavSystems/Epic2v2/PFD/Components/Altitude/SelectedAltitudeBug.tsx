import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, AutopilotDataProvider, Epic2ApVerticalMode } from '@microsoft/msfs-epic2-shared';

import { AltitudeBugComponent } from './AltitudeTape';

import './SelectedAltitudeBug.css';

/** The display color of the selected altitude. */
export enum SelectedAltitudeBugColor {
  WHITE,
  CYAN,
  AMBER,
  MAGENTA
}

/** Props for the selected altitude bug. */
export interface SelectedAltitudeBugProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider;

  /** A provider of altitude data. */
  altitudeDataProvider: AltitudeDataProvider;

  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** Selected altitude bug. */
export class SelectedAltitudeBug extends DisplayComponent<SelectedAltitudeBugProps> implements AltitudeBugComponent<SelectedAltitudeBugProps> {
  public readonly bugAltitude = this.props.autopilotDataProvider.selectedAltitude;
  public readonly parksAtBottom = true;
  public readonly parksAtTop = true;

  private readonly selectedAltitudeBugColor = MappedSubject.create(
    ([selectedAlt, currentAlt, verticalMode]) => {
      if (currentAlt === null || selectedAlt === null) { return SelectedAltitudeBugColor.WHITE; }
      const altDif = Math.abs(currentAlt - selectedAlt);

      switch (verticalMode) {
        case Epic2ApVerticalMode.AltitudeSelect:
        case Epic2ApVerticalMode.VnavAltitudeSelect:
          return SelectedAltitudeBugColor.MAGENTA;
        case Epic2ApVerticalMode.AltitudeHold:
        case Epic2ApVerticalMode.VnavAltitudeHold:
          if (altDif < 200) {
            return SelectedAltitudeBugColor.MAGENTA;
          }
          return SelectedAltitudeBugColor.AMBER;
        case Epic2ApVerticalMode.VnavFlightLevelChange:
        case Epic2ApVerticalMode.VnavPath:
        case Epic2ApVerticalMode.VnavSpeed:
          if (altDif < 200) {
            return SelectedAltitudeBugColor.CYAN;
          }
          break;
        default:
          if (altDif < 1000) {
            return SelectedAltitudeBugColor.AMBER;
          }
      }
      return SelectedAltitudeBugColor.WHITE;
    },
    this.props.autopilotDataProvider.selectedAltitude,
    this.props.altitudeDataProvider.altitude,
    this.props.autopilotDataProvider.verticalActive,
  );

  private readonly isHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.declutter,
    this.props.autopilotDataProvider.selectedAltitude.map(v => v === null)
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <svg
      class={{
        'selected-altitude-bug': true,
        'magenta': this.selectedAltitudeBugColor.map(v => v === SelectedAltitudeBugColor.MAGENTA),
        'amber': this.selectedAltitudeBugColor.map(v => v === SelectedAltitudeBugColor.AMBER),
        'cyan': this.selectedAltitudeBugColor.map(v => v === SelectedAltitudeBugColor.CYAN),
        'hidden': this.isHidden
      }}
      viewBox="-2 -18 24 36"
      style="width: 24px; height: 36px; position: absolute; top: -18px; left: 0"
    >
      <path class="shadow" d="M 12 0 l 8 -8 l 0 -8 l -20 0 l 0 32 l 20 0 l 0 -8 z" />
      <path d="M 12 0 l 8 -8 l 0 -8 l -20 0 l 0 32 l 20 0 l 0 -8 z" />
    </svg>;
  }
}
