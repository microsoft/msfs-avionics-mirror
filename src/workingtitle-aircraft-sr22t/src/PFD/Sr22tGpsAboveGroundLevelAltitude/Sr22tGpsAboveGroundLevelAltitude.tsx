import {
  ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, GNSSEvents, InstrumentEvents, MappedSubject, Subject, Subscription, VNode
} from '@microsoft/msfs-sdk';

import { UnitsAltitudeSettingMode, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import './Sr22tGpsAboveGroundLevelAltitude.css';

/** The properties for the {@link Sr22tGpsAboveGroundLevelAltitude} component. */
interface Sr22tGpsAboveGroundLevelAltitudeProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;
}

/** The GpsAboveGroundLevelAltitude component. */
export class Sr22tGpsAboveGroundLevelAltitude extends DisplayComponent<Sr22tGpsAboveGroundLevelAltitudeProps> {

  private readonly subscriber = this.props.bus.getSubscriber<InstrumentEvents & GNSSEvents>();

  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly textEffectRef = FSComponent.createRef<HTMLDivElement>();

  private readonly screenState = ConsumerSubject.create(
    this.subscriber.on('vc_screen_state').whenChanged(),
    { current: ScreenState.OFF, previous: undefined }
  );

  private readonly aboveGroundLevelAlt = Subject.create<number>(-1);
  private readonly altitudeUnit = UnitsUserSettings.getManager(this.props.bus)
    .getSetting('unitsAltitude')
    .map((unit: UnitsAltitudeSettingMode) => {
      if (unit === UnitsAltitudeSettingMode.Feet) {
        return 'FT';
      } else if (unit === UnitsAltitudeSettingMode.Meters) {
        return 'M';
      }

      return '';
    });

  private readonly isHidden = MappedSubject.create(
    ([screenState, aboveGroundLevelAlt]): boolean =>
      (![ScreenState.REVERSIONARY, ScreenState.ON].includes(screenState.current) || aboveGroundLevelAlt < 0),
    this.screenState,
    this.aboveGroundLevelAlt
  );

  private subscriptions: Subscription[] = [];

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subscriptions = [
      this.subscriber.on('above_ground_height').handle(this.formatAglAltDisplay.bind(this)),
      this.isHidden.sub((isHidden) => this.containerRef.instance.classList.toggle('hidden', isHidden), true)
    ];
  }

  /**
   * Sets the display effects for Above Ground Level Altitude display field
   * according to display conditions specified:
   * - Normal display for values less than 200.
   * - For values larger than 200, display with effects, and,
   * - Display only in increments of 20.
   * @param _alt The current GPS Above Ground Level altitude value.
   */
  private formatAglAltDisplay(_alt: number): void {
    const alt = Math.round(_alt);
    if (alt < 200 || alt % 20 === 0) {
      this.aboveGroundLevelAlt.set(alt);
    }

    // toggle display black text on white background
    this.textEffectRef.instance.classList.toggle('highlight-black', alt >= 200 && alt <= 600);
    // toggle display purple text on black background
    this.textEffectRef.instance.classList.toggle('highlight-purple', alt > 600);
  }


  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="gps-agl-altitude-container" ref={this.containerRef}>
        <div class="gps-agl-alt-title size16">GAGL</div>
        <div class="gps-agl-alt-readout" ref={this.textEffectRef}>
          <span class="gps-agl-alt-value size20">{this.aboveGroundLevelAlt}</span>
          <span class="gps-agl-alt-unit size16">{this.altitudeUnit}</span>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.subscriptions.map((sub) => sub.destroy());
  }
}
