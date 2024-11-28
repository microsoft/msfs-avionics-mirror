import { DisplayComponent, FSComponent, MappedSubject, NavSourceType, NumberFormatter, Subject, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { HeadingDataProvider, NavigationSourceDataProvider } from '@microsoft/msfs-epic2-shared';

import { HsiMode } from './CDI';

import './BearingPointer.css';

/** The type definition for pointer type */
export type PointerType = 'primary' | 'secondary';

/** The Bearing Pointer Paths type definition */
type BearingPointerPaths = {
  /** The bearing pointer head SVG path */
  head: VNode[],
  /** The bearing pointer tail SVG path */
  tail: VNode[],
}

/** The properties for the Bearing Pointer component. */
interface BearingPointerProps {
  /** The HSI mode. */
  hsiMode: HsiMode;
  /** The bearing pointer type. */
  pointerType: PointerType;
  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;
  /** The navigation source data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
}

/** The Bearing Pointer component. */
export class BearingPointer extends DisplayComponent<BearingPointerProps> {

  /** The pointer source. */
  private readonly pointerSource = this.props.pointerType === 'primary' ?
    this.props.navigationSourceDataProvider.bearingPointer1.get() :
    this.props.navigationSourceDataProvider.bearingPointer2.get();

  /** The heading that the bearing pointer is pointing towards. [magnetic heading, degrees] */
  private readonly bearing = this.pointerSource.bearing.map(bearing => bearing);

  /** Bearing Pointer SVG ref */
  private readonly pointerRef = FSComponent.createRef<SVGElement>();

  /** The needle paths for full, partial, primary, and secondary modes */
  private readonly fullPrimary: BearingPointerPaths = {
    head: [
      <circle cx="130" cy="66.753" r="7.5" />,
      <path d="m130 11.093.00011 48.16" />,
      <path d="m130 74.253-.00011 13.312" />,
    ],
    tail: [
      <path d="m130 196.47-.00011 52.124" />,
    ],
  };
  private readonly partialPrimary: BearingPointerPaths = {
    head: [
      <path d="m130-84.422v47.588" />,
      <circle cx="130" cy="-29.334" r="7.5" />,
      <path d="m130-21.834-.00011 110.88" />,
    ],
    tail: [
      <path d="m130 192.34v151.94" />,
    ],
  };
  private readonly fullSecondary: BearingPointerPaths = {
    head: [
      <path d="m130.13 10.624-.12998 28.639" />,
      <path d="m138 86.544v-38.714l-7.9966-8.5668-7.8666 8.4276v38.714" />,
      <path d="m138 47.83-7.9966 6.8434-7.8666-6.9827" />,
    ],
    tail: [
      <path d="m137.87 183.37v35.974h-15.733v-35.974" />,
      <path d="m130 219.34v30.627" />,
    ],
  };
  private readonly partialSecondary: BearingPointerPaths = {
    head: [
      <path d="m130-84.423v27.269" />,
      <path d="m122.13 90.32v-139.05l7.8666-8.4276 7.8666 8.4276v139.05" />,
      <path d="m137.87-48.726-7.8666 6.9827-7.8666-6.9827" />,
    ],
    tail: [
      <path d="m137.87 180.66v136.35h-15.733v-136.35" />,
      <path d="m130 317.01v27.269" />,
    ],
  };

  private readonly needlePaths: BearingPointerPaths = this.props.hsiMode === 'full' ?
    this.props.pointerType === 'primary' ? this.fullPrimary : this.fullSecondary :
    this.props.pointerType === 'primary' ? this.partialPrimary : this.partialSecondary;

  /**
   * The angle by which to rotate the bearing pointer about the center of the compass.
   * = 0 degrees: 12 o'clock (or straight ahead) position
   * > 0 degrees: clockwise
   * < 0 degrees: counterclockwise
   */
  private readonly pointerScreenRotationAngle = MappedSubject.create(
    ([bearing, magneticHeading]): number | null => {
      if (
        bearing === undefined ||
        bearing === null ||
        magneticHeading === null
      ) { return null; }
      let angle = bearing - magneticHeading;
      // Limit angle range: -180 to 180 degrees
      if (angle > 180) { angle -= 360; }
      if (angle < -180) { angle += 360; }
      return angle;
    },
    this.bearing,
    this.props.headingDataProvider.magneticHeading,
  );

  private readonly isHidden = Subject.create(true);
  private readonly isHiddenPipe = SubscribableUtils.pipeOptionalMappedSource(this.pointerSource.source, this.isHidden, () => true, (source) => source?.isLocalizer);

  /** @inheritdoc */
  public onAfterRender(): void {

    // Set bearing pointer center of rotation
    this.pointerRef.instance.style.transformOrigin = '50% 50%';

    // Update bearing pointer rotation
    this.pointerScreenRotationAngle.sub((angle) => {
      if (angle === null) { angle = 0; }  // point to top top of screen
      this.pointerRef.instance.style.transform = `rotate3d(0, 0, 1, ${angle}deg)`;
    }, true);

    this.isHidden.sub((isHidden) => {
      if (isHidden) {
        this.pointerScreenRotationAngle.pause();
      } else {
        this.pointerScreenRotationAngle.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={{
        'bearing-pointer-container': true,
        'hidden': this.isHidden,
      }}>
        <svg
          ref={this.pointerRef}
          width={260}
          height={260}
          viewBox={'0 0 260 260'}
        >
          <g class={{ hidden: this.pointerScreenRotationAngle.map(angle => angle === null ? true : false) }} >
            {this.needlePaths.head}
            {this.needlePaths.tail}
          </g>
        </svg>
      </div>
    );
  }
}

/** The Bearing Pointer Sources Display component props. */
export interface BearingPointerSourcesDisplayProps {
  /** The navigation source data provider to use. */
  navigationSourceDataProvider: NavigationSourceDataProvider;
}

/** The Bearing Pointer Sources Display component. */
export class BearingPointerSourcesDisplay extends DisplayComponent<BearingPointerSourcesDisplayProps> {

  /** The number formatter for the DME */
  protected static readonly DME_FORMATTER = NumberFormatter.create({ precision: 0.1, pad: 1, maxDigits: 4, nanString: '' });

  private readonly primaryPointerSource = this.props.navigationSourceDataProvider.bearingPointer1.get().sourceLabel.map(
    source => source ?? ''
  );

  private readonly primaryPointerDme = this.props.navigationSourceDataProvider.bearingPointer1.get().distance.map(
    distance => distance === null ? '' : BearingPointerSourcesDisplay.DME_FORMATTER(distance)
  );

  private readonly primaryPointerDmeNM = this.props.navigationSourceDataProvider.bearingPointer1.get().distance.map(
    distance => distance === null ? '' : 'NM'
  );

  private readonly secondaryPointerSource = this.props.navigationSourceDataProvider.bearingPointer2.get().sourceLabel.map(
    source => source ?? ''
  );

  private readonly secondaryPointerDme = this.props.navigationSourceDataProvider.bearingPointer2.get().distance.map(
    distance => distance === null ? '' : BearingPointerSourcesDisplay.DME_FORMATTER(distance)
  );

  private readonly secondaryPointerDmeNM = this.props.navigationSourceDataProvider.bearingPointer2.get().distance.map(
    distance => distance === null ? '' : 'NM'
  );

  private readonly isPrimaryDistanceHidden = this.props.navigationSourceDataProvider.bearingPointer1.get().source.map(
    src => src?.getType() === NavSourceType.Gps
  );

  private readonly isSecondaryDistanceHidden = this.props.navigationSourceDataProvider.bearingPointer2.get().source.map(
    src => src?.getType() === NavSourceType.Gps
  );


  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class="pointer-sources-display">
        <div>
          <div>{this.primaryPointerSource}</div>
          <svg
            width={20}
            height={16}
            viewBox="0 0 20 16"
            class={{ hidden: this.primaryPointerSource.map(name => name === '' ? true : false) }}
          >
            <circle cx="9.3248" cy="8" r="5.2" />
          </svg>

        </div>
        <div class={{
          'primary-pointer-dme': true,
          'hidden-pointer-distance': this.isPrimaryDistanceHidden
        }}>{this.primaryPointerDme}<span class="pointer-dme-span">{this.primaryPointerDmeNM}</span></div>
        <div>
          <div>{this.secondaryPointerSource}</div>
          <svg
            width={18}
            height={14}
            viewBox="0 0 18 14"
            class={{ hidden: this.secondaryPointerSource.map(name => name === '' ? true : false) }}
          >
            <rect transform="rotate(-45)" x="-3.6" y="6.3" width="9" height="9" />
          </svg>
        </div>
        <div class={{
          'hidden-pointer-distance': this.isSecondaryDistanceHidden
        }}>{this.secondaryPointerDme}<span class="pointer-dme-span">{this.secondaryPointerDmeNM}</span></div>
      </div>
    );
  }
}
