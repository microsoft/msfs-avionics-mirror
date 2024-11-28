import {
  ComponentProps, DisplayComponent, FSComponent,
  MappedSubject, NumberUnitInterface, SetSubject, Subscribable,
  Subscription, UnitFamily, UnitType, VNode,
} from '@microsoft/msfs-sdk';
import { AltitudeConstraintDisplay } from './AltitudeConstraintDisplay';
import './SimpleAltitudeConstraintDisplay.css';

/** The props for {@link SimpleAltitudeConstraintDisplay}. */
export interface SimpleAltitudeConstraintDisplayProps extends ComponentProps {
  /** Altitude 1. */
  altitude1: Subscribable<NumberUnitInterface<UnitFamily.Distance>>;
  /** Whether the altitude 1 should be displayed as a flight level. */
  displayAltitude1AsFlightLevel: Subscribable<boolean>;
}

/** Displays an altitude constraint, simply. */
export class SimpleAltitudeConstraintDisplay extends DisplayComponent<SimpleAltitudeConstraintDisplayProps> {
  private readonly altitude1Feet = this.props.altitude1.map(x => x.asUnit(UnitType.FOOT));

  private readonly line1Content = MappedSubject.create(([altitude1Feet, isFlightLevel]) => {
    return AltitudeConstraintDisplay.formatAltitude(altitude1Feet, isFlightLevel);
  }, this.altitude1Feet, this.props.displayAltitude1AsFlightLevel);

  private readonly classList = SetSubject.create(['simple-altitude-constraint-display']);

  private readonly subs = [] as Subscription[];

  /** @inheritdoc */
  public override onAfterRender(): void {
    this.subs.push(this.props.displayAltitude1AsFlightLevel.sub(isFlightLevel => {
      this.classList.toggle('FL', isFlightLevel);
    }, true));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.classList}>
        <span>{this.line1Content}</span><span class="FT">FT</span>
      </div>
    );
  }

  /** @inheritdoc */
  public override destroy(): void {
    super.destroy();

    this.altitude1Feet.destroy();
    this.line1Content.destroy();

    this.subs.forEach(x => x.destroy());
  }
}