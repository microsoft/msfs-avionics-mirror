import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApLateralMode } from '../../Instruments/AutopilotDataProvider';
import { HeadingDataProvider } from '../../Instruments/HeadingDataProvider';
import { Epic2Colors } from '../../Misc/Epic2Colors';

import './HeadingBug.css';

/** The properties for the heading bug component. */
interface HeadingBugProps extends ComponentProps {
  /** The radius of the compass. [pixels] */
  compassRadius: number;
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
  /** The autopilot data provider to use. */
  autopilotDataProvider: AutopilotDataProvider;
  /** The allowed +/- deviation from present heading. When outside this limit, the heading bug is hidden. [degrees] */
  screenAngleLimit?: number,
}

/** The HSI heading bug component. */
export class HeadingBug extends DisplayComponent<HeadingBugProps> {
  private static TRK_PATH = 'M-1 5.2l0 .6a1 .6 0 001 .6l11.7 0a2.9 2.6 0 012 .6l7.7 6.5a2 1.3 0 002.9 0l7.7-6.5a2.9 2.6 0 012-.6l11.7 0a1 .6 0 001-.6l0-.6';
  private static HDG_PATH = 'm2.2 5.1v11.4h40.6v-11.4h-9.5l-9.6 8.7c-.7.6-1.9.6-2.6 0l-9.6-8.7z';

  /** HDG bug ref */
  private hdgBugRef = FSComponent.createRef<SVGElement>();

  /** Y distance from top of HDG bug SVG to compass center [pixels] */
  private readonly rotationRadius = 20 - 2 + this.props.compassRadius;

  /**
   * The angle by which to rotate the HDG bug about the center of the compass.
   * = 0 degrees: 12 o'clock (or straight ahead) position
   * > 0 degrees: clockwise
   * < 0 degrees: counterclockwise
   */
  private readonly screenBugRotationAngle = MappedSubject.create(
    ([selectedHeading, magneticHeading]): number | null => {
      if (
        selectedHeading !== undefined &&
        selectedHeading !== null &&
        magneticHeading !== null
      ) {
        let angle = selectedHeading - magneticHeading;
        // Limit angle range: -180 to 180 degrees
        if (angle > 180) { angle -= 360; }
        if (angle < -180) { angle += 360; }
        return angle;
      } else {
        return null;
      }
    },
    this.props.autopilotDataProvider.selectedHeadingOrTrack,
    this.props.headingDataProvider.magneticHeading,
  );

  /** Whether or not the heading bug is hidden. */
  private readonly _hidden = Subject.create(false);
  /** Whether or not the heading bug is hidden. */
  public readonly hidden: Subscribable<boolean> = this._hidden;

  /** The direction of the heading bug relative to present heading. (left or right) */
  public readonly direction: Subscribable<null | 'left' | 'right'> = this.screenBugRotationAngle.map(
    angle => angle === null ? null : angle < 0 ? 'left' : 'right'
  );

  /** The color of the heading bug. */
  private readonly _color = this.props.autopilotDataProvider.lateralActive.map((lateralActive): string => {
    if (lateralActive === Epic2ApLateralMode.HeadingSelect || lateralActive === Epic2ApLateralMode.TrackSelect) {
      return Epic2Colors.magenta;
    } else {
      return Epic2Colors.white;
    }
  });

  /** The color of the heading bug. */
  public readonly color: Subscribable<Epic2Colors> = this._color;

  /** @inheritdoc */
  public onAfterRender(): void {

    // Set HDG bug center of rotation
    this.hdgBugRef.instance.style.transformOrigin = '50% ' + this.rotationRadius + 'px';

    // Update HDG bug position
    this.screenBugRotationAngle.sub(angle => {
      if (this.hdgBugRef.instance !== null || this.hdgBugRef.instance !== undefined) {
        if (angle !== null &&
          (this.props.screenAngleLimit === undefined ||
            (-this.props.screenAngleLimit <= angle && angle <= this.props.screenAngleLimit))
        ) {
          // Show HDG bug and rotate to correct position if valid and within range
          this._hidden.set(false);
          this.hdgBugRef.instance.classList.remove('hidden');
          this.hdgBugRef.instance.style.transform = `rotate(${angle}deg)`;
        } else {
          // Else hide
          this._hidden.set(true);
          this.hdgBugRef.instance.classList.add('hidden');
        }
      }
    }, true);

    // Switch shape of the bug depending on TRK / HDG mode
    this.props.autopilotDataProvider.isTrackModeSelected.sub((trkModeOn) => {
      const path = this.hdgBugRef.instance.firstChild as SVGPathElement | null;
      if (!path) {
        return null;
      }
      path.setAttribute('d', trkModeOn ? HeadingBug.TRK_PATH : HeadingBug.HDG_PATH);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='heading-bug-container'>
        <svg
          ref={this.hdgBugRef}
          style={{
            fill: this._color,
            stroke: this._color,
          }}
          width="60"
          height="20"
          viewBox="0 0 45 20"
        >
          <path d={HeadingBug.HDG_PATH} />
        </svg>
      </div>
    );
  }
}

/** The properties for the heading bug arrow component. */
interface HeadingBugArrowProps extends ComponentProps {
  /** Position of this arrow with respect to the center of the compass. */
  arrowPosition: 'left' | 'right';
  /** Direction of this heading bug arrow. */
  arrowDirection: 'left' | 'right' | 'down';
  /** Whether or not the heading bug is hidden. */
  headingBugHidden: Subscribable<boolean>;
  /** The direction of the heading bug relative to present heading. (left or right) */
  headingBugDirection: Subscribable<null | 'left' | 'right'>;
  /** The color of the heading bug. */
  headingBugColor: Subscribable<Epic2Colors>;
}

/** The HSI heading bug arrow component. */
export class HeadingBugArrow extends DisplayComponent<HeadingBugArrowProps> {

  /** Whether or not to hide the arrow. */
  private readonly hideArrow = MappedSubject.create(
    ([headingBugHidden, headingBugDirection]): boolean => {
      return headingBugHidden && (headingBugDirection === this.props.arrowPosition) ? false : true;
    },
    this.props.headingBugHidden,
    this.props.headingBugDirection,
  );

  /** The color of this arrow. */
  private readonly arrowColor = this.props.headingBugColor.map(color => color as string);

  /**
   * Renders an arrow path for provided direction.
   * @param direction Direction of this heading bug arrow.
   * @throws When provided direction is other than "down" | "left" | "right"
   * @returns Path element
   */
  private renderPath(direction: HeadingBugArrowProps['arrowDirection']): VNode[] {
    let exhaustiveCheck: never;
    switch (direction) {
      case 'down':
        return [<path d="m10 0L10 22M7 18 10 22 13 18" />];
      case 'left':
        return [<path d="m21.125 2.625-17.25 14.75 8.125-1.25" />, <path d="m3.875 17.375 2.4822-7.8369" />];
      case 'right':
        return [<path d="m3.875 2.625 17.25 14.75-8.125-1.25" />, <path d="m21.125 17.375-2.4822-7.8369" />];
      default:
        exhaustiveCheck = direction;
        throw new Error(`${exhaustiveCheck} direction is not supported`);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'heading-bug-arrow': true,
        'heading-bug-arrow-left': this.props.arrowPosition === 'left' ? true : false,
        'heading-bug-arrow-right': this.props.arrowPosition === 'right' ? true : false,
        hidden: this.hideArrow,
      }}>
        <svg width="25" height="30" viewBox="0 0 25 20" style={{ stroke: this.arrowColor }}>
          {this.renderPath(this.props.arrowDirection)}
        </svg>
      </div>
    );
  }
}
