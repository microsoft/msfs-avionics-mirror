import { ComponentProps, DisplayComponent, EventBus, FSComponent, MappedSubject, SetSubject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  AirGroundDataProvider, AirspeedDataProvider, HeadingDataProvider, InertialDataProvider, NavigationSourceDataProvider, PfdAliasedUserSettingTypes, WindFormat
} from '@microsoft/msfs-epic2-shared';

import './PfdInfo.css';

/** The state of the wind data. */
enum WindDataState {
  Blank,
  Dashed,
  Active
}

/** The PFD horizon section props. */
interface PfdInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** A manager for PFD settings. */
  pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;

  /** The air/ground system data provider to use. */
  airGroundDataProvider: AirGroundDataProvider;

  /** The airspeed data provider to use. */
  airspeedDataProvider: AirspeedDataProvider;

  /** The intertial data provider to use. */
  inertialDataProvider: InertialDataProvider;

  /** The heading data provider to use. */
  headingDataProvider: HeadingDataProvider;

  /** The navigation source data provider to use. */
  navSourceDataProvider: NavigationSourceDataProvider;
}

/** The PFD horizon section container. */
export class PfdInfo extends DisplayComponent<PfdInfoProps> {
  private readonly windXyValueRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windXyArrowContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windXArrowRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windYArrowRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windVectorRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windVectorArrowContainerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windVectorArrowRef = FSComponent.createRef<HTMLDivElement>();
  private readonly windLabelRef = FSComponent.createRef<HTMLDivElement>();

  private readonly tasValueClasses = SetSubject.create(['info-box-value', 'invalid']);
  private readonly satValueClasses = SetSubject.create(['info-box-value', 'invalid']);
  private readonly gspdValueClasses = SetSubject.create(['info-box-value', 'invalid']);

  private readonly filteredWindSpeed = this.props.inertialDataProvider.filteredWindSpeed;
  private readonly filteredWindDirection = this.props.inertialDataProvider.filteredWindDirection;
  private readonly filteredWindSpeedX = this.props.inertialDataProvider.filteredWindSpeedX;
  private readonly filteredWindSpeedY = this.props.inertialDataProvider.filteredWindSpeedY;
  private readonly filteredTasValue = this.props.airspeedDataProvider.filteredTas;
  private readonly groundSpeed = this.props.inertialDataProvider.groundSpeed;
  private readonly satValue = this.props.airspeedDataProvider.sat;
  private readonly rnpValue = this.props.navSourceDataProvider.rnp;

  private readonly windFormat = this.props.pfdSettingsManager.getSetting('windFormat');

  private inFlight = false;

  private readonly currentWindDisplayState = MappedSubject.create(
    ([tas, onGround]) => {
      const tasOverForty = tas !== null && tas > 40;

      if (this.inFlight) {
        if (onGround) {
          if (tasOverForty) {
            return WindDataState.Active;
          } else {
            this.inFlight = false;
            return WindDataState.Blank;
          }
        } else {
          return WindDataState.Active;
        }
      } else {
        if (onGround) {
          if (tasOverForty) {
            return WindDataState.Dashed;
          } else {
            return WindDataState.Blank;
          }
        } else {
          this.inFlight = true;
          return WindDataState.Active;
        }
      }
    },
    this.filteredTasValue,
    this.props.airGroundDataProvider.isOnGround,
  );

  private readonly windVectorText = MappedSubject.create(
    ([windDataState, windSpeed, trueHeading]) => {
      return windDataState === WindDataState.Dashed
        || windSpeed === null
        || trueHeading === null ? '---' : windSpeed.toFixed(0);
    },
    this.currentWindDisplayState,
    this.filteredWindSpeed,
    this.props.headingDataProvider.trueHeading
  );

  private readonly windXText = MappedSubject.create(
    ([windDataState, windSpeedX, trueHeading]) => {
      return windDataState === WindDataState.Dashed
        || windSpeedX === null
        || trueHeading === null ? '---' : Math.abs(windSpeedX).toFixed(0);
    },
    this.currentWindDisplayState,
    this.filteredWindSpeedX,
    this.props.headingDataProvider.trueHeading
  );

  private readonly windYText = MappedSubject.create(
    ([windDataState, windSpeedY, trueHeading]) => {
      return windDataState === WindDataState.Dashed
        || windSpeedY === null
        || trueHeading === null ? '---' : Math.abs(windSpeedY).toFixed(0);
    },
    this.currentWindDisplayState,
    this.filteredWindSpeedY,
    this.props.headingDataProvider.trueHeading
  );

  private readonly windVectorArrowValue = MappedSubject.create(
    ([windDataState, windSpeed, windDirection, trueHeading]) => {
      if (!this.isWindValueValid(windDataState, windSpeed)
        || windDirection === null
        || trueHeading === null
      ) {
        return null;
      } else {
        return (windDirection - trueHeading + 180) % 360;
      }
    },
    this.currentWindDisplayState,
    this.filteredWindSpeed,
    this.filteredWindDirection,
    this.props.headingDataProvider.trueHeading
  );

  private readonly windXArrowValue = MappedSubject.create(
    ([windDataState, windSpeedX]) => {
      if (!this.isWindValueValid(windDataState, windSpeedX)
      ) {
        return null;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return windSpeedX! > 0;
      }
    },
    this.currentWindDisplayState,
    this.filteredWindSpeedX,
  );

  private readonly windYArrowValue = MappedSubject.create(
    ([windDataState, windSpeedY]) => {
      if (!this.isWindValueValid(windDataState, windSpeedY)
      ) {
        return null;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return windSpeedY! > 0;
      }
    },
    this.currentWindDisplayState,
    this.filteredWindSpeedY,
  );

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onAfterRender(node: VNode): void {
    this.filteredTasValue.sub(tas => {
      this.tasValueClasses.toggle('invalid', tas === null);
    }, true);

    this.satValue.sub(sat => {
      this.satValueClasses.toggle('invalid', sat === null);
    }, true);

    this.groundSpeed.sub(gspd => {
      this.gspdValueClasses.toggle('invalid', gspd === null);
    }, true);

    this.currentWindDisplayState.sub(this.windDisplayStateChanged.bind(this), true);
    this.windFormat.sub(this.windFormatChanged.bind(this), true);
    this.windVectorArrowValue.sub(this.onVectorArrowValueChanged.bind(this), true);
    this.windXArrowValue.sub(this.onXArrowValueChanged.bind(this), true);
    this.windYArrowValue.sub(this.onYArrowValueChanged.bind(this), true);
  }

  /**
   * This is a method that sets X arrow visibility and rotates the arrow svg.
   * @param value A boolean indicating if the arrow should be pointing to the left(A crosswind from the right).
   */
  private onXArrowValueChanged(value: boolean | null): void {
    this.windXArrowRef.instance.style.visibility = value === null ? 'hidden' : 'visible';
    if (value === null) { return; }
    this.windXArrowRef.instance.style.transform = value === true ? `rotateZ(90deg)  scale(${0.35})` : `rotateZ(-90deg)  scale(${0.35})`;
  }

  /**
   * This is a method that sets Y arrow visibility and rotates the arrow svg.
   * @param value A boolean indicating if the arrow should be pointing up(A tailwind).
   */
  private onYArrowValueChanged(value: boolean | null): void {
    this.windYArrowRef.instance.style.visibility = value === null ? 'hidden' : 'visible';
    if (value === null) { return; }
    this.windYArrowRef.instance.style.transform = value === true ? `scale(${0.35})` : `rotateZ(180deg)  scale(${0.35})`;
  }

  /**
   * This is a method that sets vector arrow visibility and rotates the arrow svg.
   * @param value A number indicating the desired arrow direction.
   */
  private onVectorArrowValueChanged(value: number | null): void {
    this.windVectorArrowRef.instance.style.visibility = value === null ? 'hidden' : 'visible';
    if (value === null) { return; }
    this.windVectorArrowRef.instance.style.transform = `rotateZ(${value}deg) scale(${0.4}`;
  }

  /**
   * This is a method that changes the visibility of the wind components based on display state.
   * @param state The wind data state.
   */
  private windDisplayStateChanged(state: WindDataState): void {
    this.windLabelRef.instance.style.visibility = (state === WindDataState.Blank) ? 'hidden' : 'visible';
    this.windVectorRef.instance.style.visibility = (state === WindDataState.Blank) ? 'hidden' : 'visible';
    this.windXyValueRef.instance.style.visibility = (state === WindDataState.Blank) ? 'hidden' : 'visible';
    this.windVectorRef.instance.classList.toggle('invalid', state === WindDataState.Dashed);
    this.windXyValueRef.instance.classList.toggle('invalid', state === WindDataState.Dashed);
  }

  /**
   * This is a method that changes which style of wind info is displayed based on the wind format.
   * @param format The wind format style.
   */
  private windFormatChanged(format: WindFormat): void {
    this.windVectorRef.instance.style.display = (format === WindFormat.Vector) ? 'block' : 'none';
    this.windVectorArrowContainerRef.instance.style.display = (format === WindFormat.Vector) ? 'block' : 'none';
    this.windXyValueRef.instance.style.display = (format === WindFormat.Xy) ? 'block' : 'none';
    this.windXyArrowContainerRef.instance.style.display = (format === WindFormat.Xy) ? 'block' : 'none';

    this.pauseXySubjects(format === WindFormat.Vector);
    this.pauseVectorSubjects(format === WindFormat.Xy);
  }

  /**
   * This is a method that pauses and resumes xy wind subjects.
   * @param pause A boolean indicating if the subjects should be paused.
   */
  private pauseXySubjects(pause: boolean): void {
    if (pause) {
      this.windXArrowValue.pause();
      this.windYArrowValue.pause();
      this.windXText.pause();
      this.windYText.pause();
    } else {
      this.windXArrowValue.resume();
      this.windYArrowValue.resume();
      this.windXText.resume();
      this.windYText.resume();
    }
  }

  /**
   * This is a method that pauses and resumes vector wind subjects.
   * @param pause A boolean indicating if the subjects should be paused.
   */
  private pauseVectorSubjects(pause: boolean): void {
    if (pause) {
      this.windVectorArrowValue.pause();
      this.windVectorText.pause();
    } else {
      this.windVectorArrowValue.resume();
      this.windVectorText.resume();
    }
  }

  /**
   * This is a method that checks whether the wind value is valid or not.
   * @param windDataState The wind data state.
   * @param windSpeed The wind speed.
   * @returns A boolean.
   */
  private isWindValueValid(windDataState: WindDataState, windSpeed: number | null): boolean {
    return windDataState === WindDataState.Active
      && windSpeed !== null
      && Math.abs(windSpeed) >= 0.5;
  }

  /** @inheritdoc */
  public render(): VNode | null {
    const windArrowXSvg = <svg viewBox="0 0 40 70">
      <path d="m 20 10 l 13 22 l -9 0 l 0 30 l -8 0 l 0 -30 l -9 0 z"></path>
    </svg>;

    const windArrowYSvg = <svg viewBox="0 0 40 70">
      <path d="m 20 10 l 13 22 l -9 0 l 0 30 l -8 0 l 0 -30 l -9 0 z"></path>
    </svg>;

    const windVectorArrowSvg = <svg viewBox="0 0 40 70">
      <path d="m 20 10 l 13 22 l -9 0 l 0 22 l -9 0 l 0 -22 l -9 0 z"></path>
    </svg>;

    return (
      <div class="pfd-info-box-grid container">
        <div class="wind-label label" ref={this.windLabelRef}>WIND</div>

        <div ref={this.windXyValueRef}>
          <div class="wind-value">{this.windXText}</div>
          <div class="wind-value">{this.windYText}</div>
        </div>

        <div class="wind-arrow-container" ref={this.windXyArrowContainerRef}>
          <div class="wind-value-arrow-x" ref={this.windXArrowRef}>{windArrowXSvg}</div>
          <div class="wind-value-arrow-y" ref={this.windYArrowRef}>{windArrowYSvg}</div>
        </div>

        <div class="wind-value-vector" ref={this.windVectorRef}>{this.windVectorText}</div>
        <div class="wind-arrow-container-vector" ref={this.windVectorArrowContainerRef}>
          <div class="wind-value-arrow-vector" ref={this.windVectorArrowRef}>{windVectorArrowSvg}</div>
        </div>

        <div class="label">GSPD</div>
        <div class={this.gspdValueClasses}>{this.groundSpeed.map(v => v === null ? '---' : v)}</div>
        <div class="label">KTS</div>

        <div class="label">TAS</div>
        <div class={this.tasValueClasses}>{this.filteredTasValue.map(v => v === null ? '---' : v)}</div>
        <div class="label">KTS</div>

        <div class="label">SAT</div>
        <div class={this.satValueClasses}>{this.satValue.map(v => v === null ? '---' : v.toFixed(0))}</div>
        <div class="label">°C</div>

        <div class="label">RNP</div>
        <div
          class={{
            'invalid': this.rnpValue.map((v) => v === null),
            'info-box-value': true,
          }}
        >
          {this.rnpValue.map(v => v === null ? '---' : (v >= 10 ? v.toFixed(1) : v.toFixed(2)))}
        </div>
        <div class="label">NM</div>
      </div>
    );
  }
}
