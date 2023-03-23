import { ComponentProps, DisplayComponent, FSComponent, NumberFormatter, NumberUnitSubject, OneWayRunway, RunwayUtils, SetSubject, Subject, Subscribable, Subscription, Unit, UnitFamily, UnitType, VNode } from '@microsoft/msfs-sdk';
import { AirportWaypoint, NumberUnitDisplay } from '@microsoft/msfs-garminsdk';
import { GtcWaypointDisplay } from '../../Components/Waypoint/GtcWaypointDisplay';

import './GtcToldOriginDestDisplay.css';

/**
 * Component props for GtcToldOriginDestDisplay.
 */
export interface GtcToldOriginDestDisplayProps extends ComponentProps {
  /** The selected airport. */
  selectedAirport: Subscribable<AirportWaypoint | null>;

  /** The selected runway. */
  selectedRunway: Subscribable<OneWayRunway | null>;

  /** The unit type in which to display the selected runway length. */
  runwayLengthDisplayUnit: Subscribable<Unit<UnitFamily.Distance>>;

  /** Whether to include the displaced threshold in the length of the runway. */
  includeDisplacedThreshold: boolean;
}

/**
 * Displays information about a GTC TOLD (takeoff/landing) page origin/destination, including the selected airport,
 * runway, and usable runway length.
 */
export class GtcToldOriginDestDisplay extends DisplayComponent<GtcToldOriginDestDisplayProps> {
  private static readonly LENGTH_FORMATTER = NumberFormatter.create({ precision: 1 });

  private readonly waypointRef = FSComponent.createRef<GtcWaypointDisplay>();
  private readonly runwayLengthRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly runwayLengthCssClass = SetSubject.create(['told-origin-dest-display-runway-length']);
  private readonly runwayLengthNullCssClass = SetSubject.create(['told-origin-dest-display-runway-length-null']);

  private readonly runwayText = Subject.create('');
  private readonly runwayLength = NumberUnitSubject.create(UnitType.METER.createNumber(NaN));

  private runwaySub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.runwaySub = this.props.selectedRunway.sub(runway => {
      if (runway === null) {
        this.runwayText.set('––––');
        this.runwayLengthCssClass.add('hidden');
        this.runwayLengthNullCssClass.delete('hidden');
      } else {
        this.runwayText.set(RunwayUtils.getRunwayNameString(runway.direction, runway.runwayDesignator, true, 'Rwy '));

        const length = runway.length - (this.props.includeDisplacedThreshold ? 0 : runway.startThresholdLength);
        this.runwayLength.set(length);

        this.runwayLengthNullCssClass.add('hidden');
        this.runwayLengthCssClass.delete('hidden');
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='told-origin-dest-display'>
        <GtcWaypointDisplay
          ref={this.waypointRef}
          waypoint={this.props.selectedAirport}
          nullIdent='––––'
          class='told-origin-dest-display-airport'
        />
        <div class='told-origin-dest-display-runway'>{this.runwayText}</div>
        <NumberUnitDisplay
          ref={this.runwayLengthRef}
          value={this.runwayLength}
          displayUnit={this.props.runwayLengthDisplayUnit}
          formatter={GtcToldOriginDestDisplay.LENGTH_FORMATTER}
          class={this.runwayLengthCssClass}
        />
        <div class={this.runwayLengthNullCssClass}>––––</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.waypointRef.getOrDefault()?.destroy();
    this.runwayLengthRef.getOrDefault()?.destroy();

    this.runwaySub?.destroy();

    super.destroy();
  }
}