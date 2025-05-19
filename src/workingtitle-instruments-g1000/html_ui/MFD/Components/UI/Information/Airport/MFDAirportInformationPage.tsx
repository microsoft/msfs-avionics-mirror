import {
  AirportFacility, FacilityType, FacilityWaypoint, FSComponent, GeoPoint, GeoPointSubject, LatLonDisplay, NumberFormatter, NumberUnitSubject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { NumberUnitDisplay } from '../../../../../Shared/UI/Common/NumberUnitDisplay';
import { NearestAirportFrequenciesGroup, NearestAirportRunwaysGroup } from '../../Nearest/Airports';
import { FacilityGroup } from '../FacilityGroup';
import { MFDInformationPage } from '../MFDInformationPage';

import './MFDAirportInformationPage.css';

/**
 * A component that displays a page of information about an airport facility.
 */
export class MFDAirportInformationPage extends MFDInformationPage {
  private readonly runwaysGroup = FSComponent.createRef<NearestAirportRunwaysGroup>();
  private readonly frequenciesGroup = FSComponent.createRef<NearestAirportFrequenciesGroup>();

  private readonly elevation = NumberUnitSubject.createFromNumberUnit(UnitType.METER.createNumber(NaN));
  private readonly location = GeoPointSubject.createFromGeoPoint(new GeoPoint(NaN, NaN));

  /** @inheritdoc */
  protected getDefaultRangeIndex(): number {
    return 14; // 7.5 NM/15 KM
  }

  /**
   * A callback called when a waypoint is selected for information display.
   * @param waypoint The waypoint that was selected.
   */
  private onSelected(waypoint: FacilityWaypoint<AirportFacility> | null): void {
    if (waypoint !== null) {
      const airport = waypoint.facility.get();

      this.runwaysGroup.instance.set(airport);
      this.frequenciesGroup.instance.set(airport);

      this.runwaysGroup.instance.setDisabled(false);
      this.frequenciesGroup.instance.setDisabled(false);

      this.elevation.set(airport.altitude);
      this.location.set(airport.lat, airport.lon);
    } else {
      this.runwaysGroup.instance.set(null);
      this.frequenciesGroup.instance.set(null);

      this.runwaysGroup.instance.setDisabled(true);
      this.frequenciesGroup.instance.setDisabled(true);

      this.elevation.set(NaN);
      this.location.set(NaN, NaN);
    }

    this.waypoint.set(waypoint);
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    super.onViewOpened();

    if (this.waypoint.get() === null) {
      this.runwaysGroup.instance.setDisabled(true);
      this.frequenciesGroup.instance.setDisabled(true);
    }
  }

  /** @inheritdoc */
  protected renderGroups(): VNode {
    return (
      <>
        <FacilityGroup onSelected={this.onSelected.bind(this)} bus={this.props.bus} facilityType={FacilityType.Airport}
          facilityLoader={this.props.facilityLoader} viewService={this.props.viewService} title='Airport' ref={this.facilityGroup}>
          <div class='mfd-airport-information-apt'>
            <LatLonDisplay class='mfd-airport-information-location' location={this.location} />
            <NumberUnitDisplay class='mfd-airport-information-elevation'
              value={this.elevation}
              displayUnit={this.unitsSettingManager.altitudeUnits}
              formatter={NumberFormatter.create({ precision: 1, nanString: '______' })}
            />
          </div>
        </FacilityGroup>
        <NearestAirportRunwaysGroup ref={this.runwaysGroup} unitsSettingManager={this.unitsSettingManager} innerScrollOnly />
        <NearestAirportFrequenciesGroup ref={this.frequenciesGroup} controlPublisher={this.props.controlPublisher} />
      </>
    );
  }

  /** @inheritdoc */
  protected getPageClass(): string {
    return 'mfd-airport-information';
  }
}