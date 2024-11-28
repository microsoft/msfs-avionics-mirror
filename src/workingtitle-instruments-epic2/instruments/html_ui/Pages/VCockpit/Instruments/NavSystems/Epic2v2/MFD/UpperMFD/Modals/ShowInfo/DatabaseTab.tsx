import {
  AirportFacility, AirportPrivateType, AirportRunway, AirportUtils, ArraySubject, DisplayComponent, DmsFormatter2, Facility, FacilityFrequency,
  FacilityFrequencyType, FacilitySearchType, FacilityType, FSComponent, ICAO, MagVar, NdbFacility, OneWayRunway, RunwaySurfaceType, RunwayUtils, Subject,
  Subscription, UnitType, VNode, VorClass, VorFacility, VorType
} from '@microsoft/msfs-sdk';

import {
  ButtonBoxArrow, ButtonMenu, DynamicListData, Epic2Fms, Epic2List, Regions, TabContent, TabContentProps, TouchButton
} from '@microsoft/msfs-epic2-shared';

const RunwayDesignatorToString = {
  [RunwayDesignator.RUNWAY_DESIGNATOR_A]: 'A',
  [RunwayDesignator.RUNWAY_DESIGNATOR_B]: 'B',
  [RunwayDesignator.RUNWAY_DESIGNATOR_CENTER]: 'C',
  [RunwayDesignator.RUNWAY_DESIGNATOR_LEFT]: 'L',
  [RunwayDesignator.RUNWAY_DESIGNATOR_RIGHT]: 'R',
  [RunwayDesignator.RUNWAY_DESIGNATOR_NONE]: '',
  [RunwayDesignator.RUNWAY_DESIGNATOR_WATER]: ''
};

/** Props for DatabaseTab. */
interface DatabaseTabProps extends TabContentProps {
  /** The FMS. */
  readonly fms: Epic2Fms;
  /** The subject being displayed */
  readonly facility: Subject<Facility | undefined>
}

/** Class used to show VHF navaid data */
class VHFDialog extends DisplayComponent<DatabaseTabProps> {
  private name = Subject.create<string>('');
  private latLong = Subject.create<string>('');
  private vorClass = Subject.create<string>('');
  private frequency = Subject.create<string>('');
  private country = Subject.create<string>('');
  private magvar = Subject.create<string>('');

  private subs: Subscription[] = [];
  private ref = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.props.facility.sub((fac) => {
      if (fac) {
        const facility = fac as VorFacility;
        const magvar = 360 - facility.magneticVariation;

        let vorClass;
        switch (facility.vorClass) {
          case VorClass.HighAlt:
            vorClass = 'HA';
            break;
          case VorClass.LowAlt:
            vorClass = 'LA';
            break;
          case VorClass.Terminal:
            vorClass = 'T';
            break;
          case VorClass.ILS:
            vorClass = 'ILS';
            break;
          default:
            vorClass = 'UR';
            break;
        }

        this.name.set(fac?.name ?? 'NULL VOR');
        this.latLong.set(`${DatabaseTab.LAT_FORMATTER(fac?.lat ?? 0)} ${DatabaseTab.LON_FORMATTER(fac?.lon ?? 0)}`);
        this.vorClass.set(`${VorType[facility.type]}/${vorClass}`);
        this.frequency.set(facility.freqMHz.toFixed(3));
        this.country.set(Regions.getName(facility.region));
        this.magvar.set(`${Math.abs(magvar).toFixed(0)}°${Math.sign(magvar) > 0 ? 'E' : 'W'}`);
      }
    }, true));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (<div ref={this.ref}>
      <TouchButton isEnabled={false} label={'General'} variant={'bar'} class={'database-mode-button'} />
      <div class='main-database-container'>
        <p class='variable'>{this.name}</p>
        <p class='variable'>{this.latLong}</p>
        <div class='database-container'>
          <p>Type/Class: <span class='variable'>{this.vorClass}</span></p>
          <p>Frequency: <span class='variable'>{this.frequency}</span></p>
          <p>Country: <span class='variable'>{this.country}</span></p>
          <p>Mag Dec: <span class='variable'>{this.magvar}</span></p>
        </div>
      </div>
    </div >);
  }

  /** @inheritdoc */
  public destroy(): void {
    FSComponent.remove(this.ref.getOrDefault());
    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/** Class used to show NDB data */
class NDBDialog extends DisplayComponent<DatabaseTabProps> {
  private name = Subject.create<string>('');
  private latLong = Subject.create<string>('');
  private country = Subject.create<string>('');
  private frequency = Subject.create<string>('');
  private magvar = Subject.create<string>('');

  private subs: Subscription[] = [];
  private ref = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.props.facility.sub((fac) => {
      if (fac) {
        const facility = fac as NdbFacility;
        const magvar = MagVar.get(facility.lat, facility.lon);

        this.name.set(fac?.name ?? 'NULL NDB');
        this.latLong.set(`${DatabaseTab.LAT_FORMATTER(fac?.lat ?? 0)} ${DatabaseTab.LON_FORMATTER(fac?.lon ?? 0)}`);
        this.frequency.set(facility.freqMHz.toFixed(0));
        this.country.set(Regions.getName(facility.region));
        this.magvar.set(`${Math.abs(magvar).toFixed(0)}°${Math.sign(magvar) > 0 ? 'E' : 'W'}`);
      }
    }, true));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (<div ref={this.ref}>
      <TouchButton isEnabled={false} label={'General'} variant={'bar'} class={'database-mode-button'} />
      <div class='main-database-container'>
        <p class='variable'>{this.name}</p>
        <p class='variable'>{this.latLong}</p>
        <div class='database-container'>
          <p>Type: <span class='variable'>NDB</span></p>
          <p>Country: <span class='variable'>{this.country}</span></p>
          <p>Frequency: <span class='variable'>{this.frequency}</span></p>
          <p>Mag Dec: <span class='variable'>{this.magvar}</span></p>
        </div>
      </div>
    </div>);
  }

  /** @inheritdoc */
  public destroy(): void {
    FSComponent.remove(this.ref.getOrDefault());
    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/** Data used for displaying the frequencies */
export interface FrequencyListData extends DynamicListData {
  /** A group of frequencies */
  frequencyGroup: FacilityFrequency[]
}

/** Class used to show ILS navaid data */
class AirportDialog extends DisplayComponent<DatabaseTabProps> {
  private name = Subject.create<string>('');
  private city = Subject.create<string>('');
  private state = Subject.create<string>('');
  private airportType = Subject.create<string>('');
  private latLong = Subject.create<string>('');
  private longestRwy = Subject.create<string>('');
  private elevation = Subject.create<string>('');
  private magvar = Subject.create<string>('');

  private rwyLatLong = Subject.create<string>('');
  private rwyHeading = Subject.create<string>('');
  private rwyLength = Subject.create<string>('');
  private rwyWidth = Subject.create<string>('');
  private rwyStopway = Subject.create<string>('');
  private rwyDisplacedThreshold = Subject.create<string>('');
  private rwyIlsGlideslope = Subject.create<string>('');
  private rwyElevation = Subject.create<string>('');
  private rwyMagVar = Subject.create<string>('');
  private rwySlope = Subject.create<string>('');
  private rwyMaterial = Subject.create<string>('');

  private readonly selectedOption = Subject.create<string>('General');
  private readonly menuOptions = ([
    'General',
    'Runway',
    'VHF'
  ]).map(
    (option) => {
      return (
        <TouchButton
          variant={'bar-menu'}
          label={option}
          onPressed={() => this.handleMainMenuItemClick(option)}
        />
      );
    },
  );

  private readonly runwayMenuContainer = FSComponent.createRef<HTMLDivElement>();
  private readonly selectedRunway = Subject.create<string>('General');
  private runwayOptions: TouchButton[] = [];


  private readonly frequencyGroups = ArraySubject.create<FrequencyListData>([]);

  private ref = FSComponent.createRef<HTMLDivElement>();
  private subs: Subscription[] = [];

  /**
   * Handles when a main menu item is called
   * @param option The selected option
   */
  private handleMainMenuItemClick(option: string): void {
    this.selectedOption.set(option);
  }

  /**
   * Handles when a runway menu item is called
   * @param runway The selected runway
   */
  private handleRunwayItemClick(runway: OneWayRunway): void {
    this.selectedRunway.set(`RW${runway.designation}`);
    const magvar = MagVar.get(runway.latitude, runway.longitude);

    this.rwyLatLong.set(`${DatabaseTab.LAT_FORMATTER(runway.latitude)} ${DatabaseTab.LON_FORMATTER(runway.longitude)}`);
    this.rwyHeading.set(`${MagVar.trueToMagnetic(runway.course, runway.latitude, runway.longitude).toFixed(0)}°`);
    this.rwyLength.set(`${UnitType.METER.convertTo(runway.length, UnitType.FOOT).toFixed(0)} ft`);
    this.rwyWidth.set(`${UnitType.METER.convertTo(runway.width, UnitType.FOOT).toFixed(1)} ft`);
    this.rwyStopway.set(`${UnitType.METER.convertTo(runway.endThresholdLength, UnitType.FOOT).toFixed(1)} ft`);
    this.rwyDisplacedThreshold.set(`${UnitType.METER.convertTo(runway.startThresholdLength, UnitType.FOOT).toFixed(1)} ft`);
    this.rwyIlsGlideslope.set(runway.ilsFrequency ? `${runway.ilsFrequency.glideslopeAngle.toFixed(1)}°` : 'No ILS');
    this.rwyElevation.set(`${UnitType.METER.convertTo(runway.elevation, UnitType.FOOT).toFixed(0)} ft`);
    this.rwyMagVar.set(`${Math.abs(magvar).toFixed(0)}°${Math.sign(magvar) > 0 ? 'E' : 'W'}`);
    this.rwySlope.set(`${runway.gradient.toFixed(1)}%`);
    this.rwyMaterial.set(RunwaySurfaceType[runway.surface].replace(/([a-z])([A-Z])/g, '$1 $2'));
  }

  /** Gets the runway designation from a runway object
   * @param runway The runway
   * @returns The formatted runway designation
   */
  private getRunwayDesignation(runway: AirportRunway): string {
    const [primary, secondary] = runway.designation.split('-');

    return `${primary}${RunwayDesignatorToString[runway.designatorCharPrimary]}/${secondary}${RunwayDesignatorToString[runway.designatorCharSecondary]}`;
  }

  /**
   * Sets the runway option items from a list of one way runways
   * @param runways The runways
   */
  private setRunwayOptions(runways: OneWayRunway[]): void {
    this.runwayOptions = [];
    this.selectedRunway.set(`RW${runways[0].designation}`);

    for (const runway of runways) {
      this.runwayOptions.push(<TouchButton
        variant={'bar-menu'}
        label={`RW${runway.designation}`}
        onPressed={() => this.handleRunwayItemClick(runway)}
      />);
    }

    // The ButtonMenu class doesn't allow for the buttons to be changed dynamically,
    // so we just destroy and re-create it once the button options are set
    while (this.runwayMenuContainer.instance.lastChild) {
      this.runwayMenuContainer.instance.removeChild(this.runwayMenuContainer.instance.lastChild);
    }

    FSComponent.render(<ButtonMenu buttons={this.runwayOptions} position={'bottom'} maxButtonsPerColumn={8}>
      <ButtonBoxArrow label={this.selectedRunway} width={100} />
    </ButtonMenu>, this.runwayMenuContainer.instance);
  }

  /**
   * Renders the airport VHF frequencies
   * @param frequencies A list of VHF frequencies
   */
  private renderFrequencies(frequencies: readonly FacilityFrequency[]): void {
    const filteredFrequencies = frequencies.filter((freq) => freq.type !== FacilityFrequencyType.None).sort((a, b) => a.type - b.type);
    const groupedFrequencies: FacilityFrequency[][] = [];

    for (const freq of filteredFrequencies) {
      const groupIndex = groupedFrequencies.findIndex((group) => group[0].type === freq.type);

      if (groupIndex !== -1) {
        groupedFrequencies[groupIndex].push(freq);
      } else {
        groupedFrequencies.push([freq]);
      }
    }

    this.frequencyGroups.set(groupedFrequencies.map((frequencyGroup): FrequencyListData => {
      return {
        frequencyGroup
      };
    }));
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.props.facility.sub(async (fac) => {
      if (fac) {
        let airportFacility: AirportFacility;
        if (ICAO.getFacilityType(fac.icao) === FacilityType.RWY) {
          const airportIcao = (await this.props.fms.facLoader.searchByIdent(FacilitySearchType.Airport, ICAO.getAssociatedAirportIdent(fac.icao)))[0];
          airportFacility = await this.props.fms.facLoader.getFacility(FacilityType.Airport, airportIcao);
        } else {
          airportFacility = fac as AirportFacility;
        }

        const magvar = MagVar.get(airportFacility.lat, airportFacility.lon);
        const longestRunway = AirportUtils.getLongestRunway(airportFacility);
        const [city, state] = airportFacility.city.split(', ');

        this.name.set(Utils.Translate(airportFacility.name));
        this.city.set(Utils.Translate(city));
        this.state.set(`${state ? `${Utils.Translate(state)} / ` : ''}${Regions.getName(ICAO.getIdent(airportFacility.icao).slice(0, 2))}`);
        this.airportType.set(`${AirportPrivateType[airportFacility.airportPrivateType]} Airport`);
        this.latLong.set(`${DatabaseTab.LAT_FORMATTER(fac?.lat ?? 0)} ${DatabaseTab.LON_FORMATTER(fac?.lon ?? 0)}`);
        this.longestRwy.set(`${longestRunway ? this.getRunwayDesignation(longestRunway) : ''} (${UnitType.METER.convertTo(longestRunway?.length ?? 0, UnitType.FOOT).toFixed(0)}ft)`);
        this.elevation.set(`${AirportUtils.getElevation(airportFacility)?.toFixed(0)} ft`);
        this.magvar.set(`${Math.abs(magvar).toFixed(0)}°${Math.sign(magvar) > 0 ? 'E' : 'W'}`);

        const runways = RunwayUtils.getOneWayRunwaysFromAirport(airportFacility);
        this.setRunwayOptions(runways);
        this.selectedOption.set('General');
        this.handleRunwayItemClick(runways[0]);
        this.renderFrequencies(airportFacility.frequencies);
      }
    }, true));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (<div ref={this.ref}>
      <div class="database-item-menu">
        <ButtonMenu buttons={this.menuOptions} position={'bottom'}>
          <ButtonBoxArrow label={this.selectedOption} width={120} />
        </ButtonMenu>
      </div>
      <div class={{ 'runway-menu': true, 'hidden': this.selectedOption.map((option) => option !== 'Runway') }} ref={this.runwayMenuContainer}>

      </div>
      <div class={{ 'main-database-container': true, 'hidden': this.selectedOption.map((option) => option !== 'General') }}>
        <p>{this.name}</p>
        <p>{this.city}</p>
        <p>{this.state}</p>
        <p>{this.airportType}</p>
        <p class={'variable'}>{this.latLong}</p>
        <hr />
        <div class='database-container'>
          <p>Max Rwy: <span class='variable'>{this.longestRwy}</span></p>
          <p>Elevation: <span class='variable'>{this.elevation}</span></p>
          <p>Mag Var: <span class='variable'>{this.magvar}</span></p>
        </div>
      </div>
      <div class={{ 'main-database-container': true, 'hidden': this.selectedOption.map((option) => option !== 'Runway') }}>
        <p class={'variable'}>{this.rwyLatLong}</p>
        <div class='database-container'>
          <p>Rwy Hdg: <span class='variable'>{this.rwyHeading}</span></p>
          <p>Length: <span class='variable'>{this.rwyLength}</span></p>
          <p>Width: <span class='variable'>{this.rwyWidth}</span></p>
          <p>Stopway: <span class='variable'>{this.rwyStopway}</span></p>
          <p>Disp Thr: <span class='variable'>{this.rwyDisplacedThreshold}</span></p>
          <p>ILS GS: <span class='variable'>{this.rwyIlsGlideslope}</span></p>
          <p>Elevation: <span class='variable'>{this.rwyElevation}</span></p>
          <p>Mag Var: <span class='variable'>{this.rwyMagVar}</span></p>
          <p>Slope: <span class='variable'>{this.rwySlope}</span></p>
          <p>Material: <span class='variable'>{this.rwyMaterial}</span></p>
        </div>
      </div>
      <div class={{ 'main-database-container': true, 'hidden': this.selectedOption.map((option) => option !== 'VHF') }}>
        <Epic2List<FrequencyListData> bus={this.props.bus} scrollbarStyle='inside' listItemHeightPx={65} heightPx={256} data={this.frequencyGroups} renderItem={(data) => {
          return (<div class="frequency">
            <p>{FacilityFrequencyType[data.frequencyGroup[0].type]}</p>
            <p>{data.frequencyGroup[0].name}</p>
            <p>{data.frequencyGroup.map((freq) => freq.freqMHz.toFixed(3)).join(' ')}</p>
          </div>);
        }} />
      </div>
    </div>);
  }

  /** @inheritdoc */
  public destroy(): void {
    FSComponent.remove(this.ref.getOrDefault());
    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/** Class used to show ILS navaid data */
class WaypointDialog extends DisplayComponent<DatabaseTabProps> {
  private latLong = Subject.create<string>('');
  private type = Subject.create<string>('');
  private country = Subject.create<string>('');
  private magvar = Subject.create<string>('');

  private subs: Subscription[] = [];
  private ref = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.subs.push(this.props.facility.sub((facility) => {
      if (facility) {
        const magvar = MagVar.get(facility.lat, facility.lon);

        this.latLong.set(`${DatabaseTab.LAT_FORMATTER(facility.lat)} ${DatabaseTab.LON_FORMATTER(facility.lon)}`);
        this.type.set(ICAO.getFacilityType(facility.icao) === FacilityType.Intersection ? 'Named Wpt' : 'Temporary Wpt');
        this.country.set(Regions.getName(facility.region));
        this.magvar.set(`${Math.abs(magvar).toFixed(0)}°${Math.sign(magvar) > 0 ? 'E' : 'W'}`);
      }
    }, true));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (<div ref={this.ref}>
      <TouchButton isEnabled={false} label={'General'} variant={'bar'} class={'database-mode-button'} />
      <div class='main-database-container'>
        <p class='variable'>{this.latLong}</p>
        <div class='database-container'>
          <p>Type: <span class='variable'>{this.type}</span></p>
          <p>Country: <span class='variable'>{this.country}</span></p>
          <p>Mag Dec: <span class='variable'>{this.magvar}</span></p>
        </div>
      </div>
    </div>);
  }

  /** @inheritdoc */
  public destroy(): void {
    FSComponent.remove(this.ref.getOrDefault());
    this.subs.forEach(sub => { sub.destroy(); });

    super.destroy();
  }
}

/** The DatabaseTab component. */
export class DatabaseTab extends TabContent<DatabaseTabProps> {
  public static readonly LAT_FORMATTER = DmsFormatter2.create('{+[N]-[S]}{dd}°{mm.mm}', UnitType.DEGREE, 0, 'N--°--.--');
  public static readonly LON_FORMATTER = DmsFormatter2.create('{+[E]-[W]}{ddd}°{mm.mm}', UnitType.DEGREE, 0, 'E---°--.--');

  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  private readonly renderedNode = FSComponent.createRef<DisplayComponent<DatabaseTabProps>>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.facility.sub((fac) => {
      if (this.renderedNode.getOrDefault()) {
        this.renderedNode.getOrDefault()?.destroy();
      }

      if (fac) {
        const facilityType = fac && ICAO.getFacilityType(fac.icao);

        switch (facilityType) {
          case FacilityType.VOR:
            return FSComponent.render(<VHFDialog ref={this.renderedNode} fms={this.props.fms} facility={this.props.facility} bus={this.props.bus} />, this.containerRef.instance);
          case FacilityType.NDB:
            return FSComponent.render(<NDBDialog ref={this.renderedNode} fms={this.props.fms} facility={this.props.facility} bus={this.props.bus} />, this.containerRef.instance);
          case FacilityType.RWY:
          case FacilityType.Airport:
            return FSComponent.render(<AirportDialog ref={this.renderedNode} fms={this.props.fms} facility={this.props.facility} bus={this.props.bus} />,
              this.containerRef.instance);
          default:
            FSComponent.render(<WaypointDialog ref={this.renderedNode} fms={this.props.fms} facility={this.props.facility} bus={this.props.bus} />, this.containerRef.instance);
        }
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.containerRef}>
      </div>
    );
  }
}
