import {
  BitFlags, ComponentProps, DisplayComponent, FixTypeFlags, FlightPlanUtils, FSComponent, LegDefinition,
  LegDefinitionFlags, LegTurnDirection, LegType, MagVar, MappedSubject, NumberFormatter, NumberUnitSubject, ObjectSubject, Subject,
  UnitFamily, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { UnitsNavAngleSettingMode, UnitsUserSettingManager } from '../../../settings';
import { NumberUnitDisplay } from '../../common/NumberUnitDisplay';
import { NavStatusBoxDataProvider, NavStatusTrackedLegs } from './NavStatusBoxDataProvider';
import { NavStatusBoxDtkAlert } from './NavStatusBoxDtkAlert';
import { NavStatusBoxLegArrow } from './NavStatusBoxLegArrow';

/**
 * Component props for NavStatusBoxLegDisplay.
 */
export interface NavStatusBoxLegDisplayProps extends ComponentProps {
  /** A data provider for the display. */
  dataProvider: NavStatusBoxDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * A next-generation (NXi, G3000, etc) navigation status box flight plan leg display.
 */
export class NavStatusBoxLegDisplay extends DisplayComponent<NavStatusBoxLegDisplayProps> {
  private static readonly HEADING_FORMATTER = (heading: number, isMagnetic: boolean): string => {
    const rounded = Math.round(heading);
    return `${rounded === 0 ? '360' : rounded.toString().padStart(3, '0')}°${isMagnetic ? '' : 'ᴛ'}`;
  };
  private static readonly ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1 });
  private static readonly DISTANCE_FORMATTER = NumberFormatter.create({ precision: 0.1, maxDigits: 3 });

  private readonly legArrowRef = FSComponent.createRef<NavStatusBoxLegArrow>();
  private readonly fromLegDistanceRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();
  private readonly alertRef = FSComponent.createRef<NavStatusBoxDtkAlert>();

  private readonly baseStyle = ObjectSubject.create({
    display: ''
  });

  private readonly fromLegStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly fromLegTextStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly fromLegAltitudeStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly fromLegDistanceStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly fromLegProcLeftStyle = ObjectSubject.create({
    display: 'none',
    width: '30px',
    height: '12px'
  });
  private readonly fromLegProcRightStyle = ObjectSubject.create({
    display: 'none',
    width: '30px',
    height: '12px'
  });

  private readonly toLegStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly toLegTextStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly toLegAltitudeStyle = ObjectSubject.create({
    display: 'none'
  });
  private readonly toLegProcLeftStyle = ObjectSubject.create({
    display: 'none',
    width: '30px',
    height: '12px'
  });
  private readonly toLegProcRightStyle = ObjectSubject.create({
    display: 'none',
    width: '30px',
    height: '12px'
  });

  private readonly toLeg = this.props.dataProvider.trackedLegs.map(legs => legs.toLeg);

  private readonly fromLegState = MappedSubject.create(
    this.props.dataProvider.trackedLegs,
    this.props.dataProvider.obsCourse
  );

  private readonly fromLegText = Subject.create('');
  private readonly toLegText = Subject.create('');

  private readonly fromLegAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));
  private readonly toLegAltitude = NumberUnitSubject.create(UnitType.FOOT.createNumber(0));

  private readonly fromLegDistance = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));

  private readonly useMagnetic = this.props.unitsSettingManager.getSetting('unitsNavAngle').map(mode => mode !== UnitsNavAngleSettingMode.True);

  private readonly isAlertActive = Subject.create(false);

  private isPaused = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.toLeg.sub(toLeg => {
      this.updateToLeg(toLeg);
    }, true);

    this.fromLegState.sub(([trackedLegs, obsCourse]) => {
      this.updateFromLeg(trackedLegs, obsCourse);
    }, true);

    this.isAlertActive.sub(isActive => {
      this.baseStyle.set('display', isActive ? 'none' : '');
    }, true);

    this.useMagnetic.sub(() => {
      this.updateFromLeg(this.props.dataProvider.trackedLegs.get(), this.props.dataProvider.obsCourse.get());
      this.updateToLeg(this.toLeg.get());
    });

    if (!this.isPaused) {
      this.alertRef.instance.resume();
    }
  }

  /**
   * Resumes this display. Once resumed, this display will automatically update.
   */
  public resume(): void {
    if (!this.isPaused) {
      return;
    }

    this.toLeg.resume();
    this.fromLegState.resume();
    this.useMagnetic.resume();

    this.alertRef.getOrDefault()?.resume();
  }

  /**
   * Pauses this display. This display will not update while it is paused.
   */
  public pause(): void {
    if (this.isPaused) {
      return;
    }

    this.toLeg.pause();
    this.fromLegState.pause();
    this.useMagnetic.pause();

    this.alertRef.getOrDefault()?.pause();
  }

  /**
   * Updates the to leg display.
   * @param toLeg The current to leg.
   */
  private updateToLeg(toLeg: LegDefinition | null): void {
    if (toLeg === null) {
      this.toLegStyle.set('display', 'none');
    } else {
      this.toLegStyle.set('display', '');

      if (toLeg.leg.type === LegType.PI) {
        this.toLegTextStyle.set('display', 'none');
        this.toLegAltitudeStyle.set('display', 'none');

        if (toLeg.leg.turnDirection === LegTurnDirection.Left) {
          this.toLegProcRightStyle.set('display', 'none');
          this.toLegProcLeftStyle.set('display', '');
        } else {
          this.toLegProcLeftStyle.set('display', 'none');
          this.toLegProcRightStyle.set('display', '');
        }
      } else if (toLeg.leg.type === LegType.CA || toLeg.leg.type === LegType.VA) {
        this.toLegProcLeftStyle.set('display', 'none');
        this.toLegProcRightStyle.set('display', 'none');
        this.toLegTextStyle.set('display', 'none');
        this.toLegAltitudeStyle.set('display', '');

        this.toLegAltitude.set(toLeg.leg.altitude1, UnitType.METER);
      } else {
        this.toLegProcLeftStyle.set('display', 'none');
        this.toLegProcRightStyle.set('display', 'none');
        this.toLegAltitudeStyle.set('display', 'none');
        this.toLegTextStyle.set('display', '');

        let name: string;

        switch (toLeg.leg.type) {
          case LegType.CI:
          case LegType.VI:
            name = 'intrcpt';
            break;
          case LegType.FM:
          case LegType.VM:
            name = 'man seq';
            break;
          default:
            name = `${toLeg.name ?? ''}${this.getFixTypeSuffix(toLeg)}`;
        }

        this.toLegText.set(name);
      }
    }
  }

  /**
   * Updates the from leg display.
   * @param trackedLegs The legs currently tracked by LNAV.
   * @param obsCourse The active OBS course, or `null` if OBS is inactive.
   */
  private updateFromLeg(trackedLegs: NavStatusTrackedLegs, obsCourse: number | null): void {
    if (trackedLegs.toLeg === null) {
      this.fromLegStyle.set('display', 'none');
    } else {
      if (obsCourse === null) {
        if (BitFlags.isAny(trackedLegs.toLeg.flags, LegDefinitionFlags.VectorsToFinalFaf)) {
          this.fromLegStyle.set('display', '');

          let course = trackedLegs.toLeg.leg.course;
          const useMagnetic = this.useMagnetic.get();
          if (!useMagnetic && trackedLegs.toLeg.calculated?.endLat !== undefined && trackedLegs.toLeg.calculated?.endLon !== undefined) {
            course = MagVar.magneticToTrue(course, trackedLegs.toLeg.calculated.endLat, trackedLegs.toLeg.calculated.endLon);
          }

          this.setFromLegText(`vtf ${NavStatusBoxLegDisplay.HEADING_FORMATTER(course, useMagnetic)}`);
        } else {
          switch (trackedLegs.toLeg.leg.type) {
            case LegType.CF: {
              const fromLegType = trackedLegs.fromLeg?.leg.type;

              if (
                fromLegType !== undefined
                && !FlightPlanUtils.isDiscontinuityLeg(fromLegType)
                && !FlightPlanUtils.isManualDiscontinuityLeg(fromLegType)
              ) {
                break;
              }
            }
            // eslint-disable-next-line no-fallthrough
            case LegType.CD:
            case LegType.CR:
            case LegType.CI:
            case LegType.CA: {
              this.fromLegStyle.set('display', '');

              let course = trackedLegs.toLeg.leg.course;
              const isCourseMagnetic = !trackedLegs.toLeg.leg.trueDegrees;
              const useMagnetic = this.useMagnetic.get();
              if (isCourseMagnetic !== useMagnetic && trackedLegs.toLeg.calculated?.endLat !== undefined && trackedLegs.toLeg.calculated?.endLon !== undefined) {
                course = useMagnetic
                  ? MagVar.trueToMagnetic(course, trackedLegs.toLeg.calculated.endLat, trackedLegs.toLeg.calculated.endLon)
                  : MagVar.magneticToTrue(course, trackedLegs.toLeg.calculated.endLat, trackedLegs.toLeg.calculated.endLon);
              }

              this.setFromLegText(`crs ${NavStatusBoxLegDisplay.HEADING_FORMATTER(course, useMagnetic)}`);
              return;
            }
            case LegType.VR:
            case LegType.VD:
            case LegType.VI:
            case LegType.VA:
            case LegType.VM: {
              this.fromLegStyle.set('display', '');

              let course = trackedLegs.toLeg.leg.course;
              const isCourseMagnetic = !trackedLegs.toLeg.leg.trueDegrees;
              const useMagnetic = this.useMagnetic.get();
              if (isCourseMagnetic !== useMagnetic && trackedLegs.toLeg.calculated?.endLat !== undefined && trackedLegs.toLeg.calculated?.endLon !== undefined) {
                course = useMagnetic
                  ? MagVar.trueToMagnetic(course, trackedLegs.toLeg.calculated.endLat, trackedLegs.toLeg.calculated.endLon)
                  : MagVar.magneticToTrue(course, trackedLegs.toLeg.calculated.endLat, trackedLegs.toLeg.calculated.endLon);
              }

              this.setFromLegText(`hdg ${NavStatusBoxLegDisplay.HEADING_FORMATTER(course, useMagnetic)}`);
              return;
            }
            case LegType.HF:
            case LegType.HA:
            case LegType.HM:
              this.fromLegStyle.set('display', '');

              if (trackedLegs.toLeg.leg.distanceMinutes) {
                const seconds = Math.round(trackedLegs.toLeg.leg.distance * 60);

                const minutesPart = Math.floor(seconds / 60);
                const secondsPart = seconds - minutesPart * 60;

                this.setFromLegText(`${minutesPart.toString().padStart(2, '0')}:${secondsPart.toString().padStart(2, '0')}`);
              } else {
                this.fromLegTextStyle.set('display', 'none');
                this.fromLegProcLeftStyle.set('display', 'none');
                this.fromLegProcRightStyle.set('display', 'none');
                this.fromLegAltitudeStyle.set('display', 'none');
                this.fromLegDistanceStyle.set('display', '');

                this.fromLegDistance.set(trackedLegs.toLeg.leg.distance, UnitType.METER);
              }
              return;
          }

          if (trackedLegs.fromLeg === null) {
            this.fromLegStyle.set('display', 'none');
          } else {
            this.fromLegStyle.set('display', '');

            switch (trackedLegs.fromLeg.leg.type) {
              case LegType.PI:
                this.fromLegTextStyle.set('display', 'none');
                this.fromLegAltitudeStyle.set('display', 'none');
                this.fromLegDistanceStyle.set('display', 'none');

                if (trackedLegs.fromLeg.leg.turnDirection === LegTurnDirection.Left) {
                  this.fromLegProcRightStyle.set('display', 'none');
                  this.fromLegProcLeftStyle.set('display', '');
                } else {
                  this.fromLegProcLeftStyle.set('display', 'none');
                  this.fromLegProcRightStyle.set('display', '');
                }
                break;
              case LegType.CA:
              case LegType.VA:
                this.fromLegTextStyle.set('display', 'none');
                this.fromLegProcLeftStyle.set('display', 'none');
                this.fromLegProcRightStyle.set('display', 'none');
                this.fromLegDistanceStyle.set('display', 'none');
                this.fromLegAltitudeStyle.set('display', '');

                this.fromLegAltitude.set(trackedLegs.fromLeg.leg.altitude1, UnitType.METER);
                break;
              default:
                this.setFromLegText(`${trackedLegs.fromLeg.name ?? ''}${this.getFixTypeSuffix(trackedLegs.fromLeg)}`);
            }
          }
        }
      } else {
        this.fromLegStyle.set('display', '');

        let course = obsCourse;
        const useMagnetic = this.useMagnetic.get();
        if (!useMagnetic && trackedLegs.toLeg.calculated?.endLat !== undefined && trackedLegs.toLeg.calculated?.endLon !== undefined) {
          course = MagVar.magneticToTrue(course, trackedLegs.toLeg.calculated.endLat, trackedLegs.toLeg.calculated.endLon);
        }

        this.setFromLegText(`obs ${NavStatusBoxLegDisplay.HEADING_FORMATTER(course, useMagnetic)}`);
      }
    }
  }

  /**
   * Sets and displays the text of the from leg display.
   * @param text The text to set.
   */
  private setFromLegText(text: string): void {
    this.fromLegProcLeftStyle.set('display', 'none');
    this.fromLegProcRightStyle.set('display', 'none');
    this.fromLegAltitudeStyle.set('display', 'none');
    this.fromLegDistanceStyle.set('display', 'none');
    this.fromLegTextStyle.set('display', '');

    this.fromLegText.set(text);
  }

  /**
   * Gets the fix type suffix for a flight plan leg.
   * @param leg A flight plan leg.
   * @returns The fix type suffix for the specified flight plan leg.
   */
  private getFixTypeSuffix(leg: LegDefinition): string {
    switch (leg.leg.fixTypeFlags) {
      case FixTypeFlags.FAF:
        return ' faf';
      case FixTypeFlags.IAF:
        return ' iaf';
      case FixTypeFlags.MAP:
        return ' map';
      case FixTypeFlags.MAHP:
        return ' mahp';
      default:
        return '';
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='nav-status-leg'>
        <div class='nav-status-leg-base' style={this.baseStyle}>
          <div class='nav-status-leg-from' style={this.fromLegStyle}>
            <div class='nav-status-leg-text' style={this.fromLegTextStyle}>{this.fromLegText}</div>
            <div class='nav-status-leg-altitude' style={this.fromLegAltitudeStyle}>
              <NumberUnitDisplay
                value={this.fromLegAltitude}
                displayUnit={null}
                formatter={NavStatusBoxLegDisplay.ALTITUDE_FORMATTER}
              />
            </div>
            <div class='nav-status-leg-distance' style={this.fromLegDistanceStyle}>
              <NumberUnitDisplay
                value={this.fromLegDistance}
                displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                formatter={NavStatusBoxLegDisplay.DISTANCE_FORMATTER}
              />
            </div>
            <svg viewBox='0 0 30 12' style={this.fromLegProcLeftStyle}>
              <path d='M 0 2 l 3 0 m 0 -1 l 2 0 m 0 1 l 25 0 M 0 3 l 3 0 m 0 1 l 2 0 m 0 -1 l 10 0 l 7 7 a 1.41 1.41 0 0 0 4 -4 l -3 -3 l -8 0' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
            </svg>
            <svg viewBox='0 0 30 12' style={this.fromLegProcRightStyle}>
              <path d='M 0 10 l 3 0 m 0 1 l 2 0 m 0 -1 l 25 0 M 0 9 l 3 0 m 0 -1 l 2 0 m 0 1 l 10 0 l 7 -7 a 1.41 1.41 90 0 1 4 4 l -3 3 l -8 0' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
            </svg>
          </div>
          <NavStatusBoxLegArrow
            ref={this.legArrowRef}
            toLeg={this.toLeg}
          />
          <div class='nav-status-leg-to' style={this.toLegStyle}>
            <div class='nav-status-leg-text' style={this.toLegTextStyle}>{this.toLegText}</div>
            <div class='nav-status-leg-altitude' style={this.toLegAltitudeStyle}>
              <NumberUnitDisplay
                value={this.toLegAltitude}
                displayUnit={null}
                formatter={NavStatusBoxLegDisplay.ALTITUDE_FORMATTER}
              />
            </div>
            <svg viewBox='0 0 30 12' style={this.toLegProcLeftStyle}>
              <path d='M 0 2 l 3 0 m 0 -1 l 2 0 m 0 1 l 25 0 M 0 3 l 3 0 m 0 1 l 2 0 m 0 -1 l 10 0 l 7 7 a 1.41 1.41 0 0 0 4 -4 l -3 -3 l -8 0' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
            </svg>
            <svg viewBox='0 0 30 12' style={this.toLegProcRightStyle}>
              <path d='M 0 10 l 3 0 m 0 1 l 2 0 m 0 -1 l 25 0 M 0 9 l 3 0 m 0 -1 l 2 0 m 0 1 l 10 0 l 7 -7 a 1.41 1.41 90 0 1 4 4 l -3 3 l -8 0' fill='none' stroke='var(--nav-status-icon-color)' stroke-width='2' />
            </svg>
          </div>
        </div>
        <NavStatusBoxDtkAlert
          ref={this.alertRef}
          dataProvider={this.props.dataProvider}
          useMagnetic={this.useMagnetic}
          isActive={this.isAlertActive}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.fromLegDistanceRef.getOrDefault()?.destroy();
    this.legArrowRef.getOrDefault()?.destroy();
    this.alertRef.getOrDefault()?.destroy();

    this.toLeg.destroy();
    this.useMagnetic.destroy();

    super.destroy();
  }
}