import {
  ComponentProps, ComputedSubject, DisplayComponent, EventBus, FSComponent, GeoPoint, GeoPointSubject, GNSSEvents, MagVar, NavProcSimVars,
  NavRadioIndex, NumberUnitSubject, RunwayUtils, Subject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { GNSNumberUnitDisplay } from './Controls/GNSNumberUnitDisplay';

import './NavInfoPane.css';

/**
 * Props on theNavInfoPane component.
 */
interface NavInfoPaneProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The unit's nav radio index. */
  radioIndex: NavRadioIndex;
}

/**
 * A component that displays the nav radio navigational details.
 */
export class NavInfoPane extends DisplayComponent<NavInfoPaneProps> {
  private readonly radialEl = FSComponent.createRef<HTMLElement>();
  private readonly distanceEl = FSComponent.createRef<HTMLElement>();
  private readonly airportEl = FSComponent.createRef<HTMLElement>();
  private readonly runwayEl = FSComponent.createRef<HTMLElement>();

  private readonly radioType = Subject.create('VOR');
  private readonly ident = Subject.create('____');
  private readonly radial = ComputedSubject.create<number | undefined, string>(0, this.formatRadial.bind(this));
  private readonly distance = NumberUnitSubject.create(UnitType.NMILE.createNumber(0));

  private readonly airport = Subject.create('');
  private readonly runwayDesignator = Subject.create('');
  private readonly runwayNumber = Subject.create('');

  private readonly radioPosition = GeoPointSubject.create(new GeoPoint(0, 0));
  private readonly dmePosition = GeoPointSubject.create(new GeoPoint(0, 0));
  private readonly ppos = GeoPointSubject.create(new GeoPoint(0, 0));

  private readonly invalidPos = new GeoPoint(0, 0);

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<NavProcSimVars & GNSSEvents>();
    sub.on(`nav_lla_${this.props.radioIndex}`).handle(pos => this.radioPosition.set(pos.lat, pos.long));
    sub.on(`nav_dme_lla_${this.props.radioIndex}`).handle(pos => this.dmePosition.set(pos.lat, pos.long));
    sub.on(`nav_ident_${this.props.radioIndex}`).handle(ident => this.ident.set(ident !== '' ? ident : '____'));
    sub.on(`nav_loc_airport_ident_${this.props.radioIndex}`).whenChanged().handle(ident => this.airport.set(ident));
    sub.on(`nav_loc_runway_designator_${this.props.radioIndex}`).whenChanged()
      .handle(designator => this.runwayDesignator.set(RunwayUtils.getDesignatorLetter(designator)));
    sub.on(`nav_loc_runway_number_${this.props.radioIndex}`).whenChanged().handle(number => this.runwayNumber.set(number.toFixed(0)));
    sub.on('gps-position').handle(pos => this.ppos.set(pos.lat, pos.long));

    this.radioPosition.sub(this.onRadioPositionChanged.bind(this));
    this.dmePosition.sub(this.onRadioPositionChanged.bind(this));
    this.ppos.sub(this.onRadioPositionChanged.bind(this));

    this.runwayDesignator.sub(this.onRadioTypeChanged.bind(this));
    this.runwayNumber.sub(this.onRadioTypeChanged.bind(this));

    this.onRadioTypeChanged();
  }

  /**
   * A callback called when either the radio or present position changes.
   */
  private onRadioPositionChanged(): void {
    const radioValid = !this.radioPosition.get().equals(this.invalidPos);
    const dmeValid = !this.dmePosition.get().equals(this.invalidPos);

    if (radioValid) {
      const distance = UnitType.GA_RADIAN.convertTo(this.radioPosition.get().distance(this.ppos.get()), UnitType.NMILE);
      const radial = this.radioPosition.get().bearingTo(this.ppos.get());
      const radialWithMagVar = MagVar.trueToMagnetic(radial, this.radioPosition.get());

      this.distance.set(distance);
      this.radial.set(Math.round(radialWithMagVar));
    } else if (dmeValid) {
      const distance = UnitType.GA_RADIAN.convertTo(this.dmePosition.get().distance(this.ppos.get()), UnitType.NMILE);
      const radial = this.dmePosition.get().bearingTo(this.ppos.get());
      const radialWithMagVar = MagVar.trueToMagnetic(radial, this.dmePosition.get());


      this.distance.set(distance);
      this.radial.set(Math.round(radialWithMagVar));
    } else {
      this.distance.set(0);
      this.radial.set(undefined);
    }
  }

  /**
   * Handles when the tuned radio station type changes.
   */
  private onRadioTypeChanged(): void {
    const isLoc = this.runwayNumber.get() !== '0' && this.runwayNumber.get() !== '';
    if (isLoc) {
      this.airportEl.instance.classList.remove('hide-element');
      this.runwayEl.instance.classList.remove('hide-element');

      this.radialEl.instance.classList.add('hide-element');
      this.distanceEl.instance.classList.add('hide-element');

      this.radioType.set('LOC');
    } else {
      this.airportEl.instance.classList.add('hide-element');
      this.runwayEl.instance.classList.add('hide-element');

      this.radialEl.instance.classList.remove('hide-element');
      this.distanceEl.instance.classList.remove('hide-element');

      this.radioType.set('VOR');
    }
  }

  /**
   * Formats the nav station radial.
   * @param radial The radial to format.
   * @returns The formatted radial.
   */
  private formatRadial(radial: number | undefined): string {
    if (radial === undefined) {
      return '___°';
    } else {
      return `${radial.toFixed(0).padStart(3, '0')}°`;
    }
  }

  /**
   * Formats the radio nav station distance.
   * @param distance The distance to the nav station.
   * @returns The formatted distance string.
   */
  private formatDistance(distance: number): string {
    if (distance === 0) {
      return '__._';
    } else if (distance < 100) {
      return distance.toFixed(1);
    } else {
      return distance.toFixed(0);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='com-pane navinfo-pane'>
        <div class='navinfo-ident'>
          <label>{this.radioType}</label>
          <div>{this.ident}</div>
        </div>
        <div class='navinfo-radial' ref={this.radialEl}>
          <label>RAD</label>
          <div>{this.radial}</div>
        </div>
        <div class='navinfo-airport' ref={this.airportEl}>{this.airport}</div>
        <hr />
        <div class='navinfo-distance' ref={this.distanceEl}>
          <label>DIS</label>
          <GNSNumberUnitDisplay value={this.distance} displayUnit={Subject.create(this.distance.get().unit)}
            formatter={this.formatDistance.bind(this)} />
        </div>
        <div class='navinfo-runway' ref={this.runwayEl}>ILS <span>{this.runwayNumber}</span><span>{this.runwayDesignator}</span></div>
      </div>
    );
  }
}