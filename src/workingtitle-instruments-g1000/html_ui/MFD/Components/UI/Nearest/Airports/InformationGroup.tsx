import { AirportFacility, FSComponent, ICAO, NumberFormatter, NumberUnitSubject, Subject, UnitType, VNode } from '@microsoft/msfs-sdk';

import { Regions } from '@microsoft/msfs-garminsdk';

import { NumberUnitDisplay } from '../../../../../Shared/UI/Common/NumberUnitDisplay';
import { G1000UiControl, G1000UiControlProps } from '../../../../../Shared/UI/G1000UiControl';
import { UnitsUserSettingManager } from '../../../../../Shared/Units/UnitsUserSettings';
import { GroupBox } from '../../GroupBox';

import './InformationGroup.css';

/**
 * Component props for InformationGroup.
 */
export interface NearestAirportInformationGroupProps extends G1000UiControlProps {
  /** A user setting manager for measurement units. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * A component that displays airport location information on the
 * MFD nearest airports page.
 */
export class NearestAirportInformationGroup extends G1000UiControl<NearestAirportInformationGroupProps> {

  private readonly name = Subject.create<string>('');
  private readonly location = Subject.create<string>('');
  private readonly elevation = NumberUnitSubject.createFromNumberUnit(UnitType.METER.createNumber(NaN));

  private readonly content = FSComponent.createRef<HTMLDivElement>();
  private data: AirportFacility | null = null;

  /**
   * Sets the subscription for the information display.
   * @param airport The airport data to subscribe to.
   */
  public set(airport: AirportFacility | null): void {
    this.onChanged(airport);
    this.data = airport;
  }

  /**
   * A callback fired when the data changes in the nearest airport
   * subscription.
   * @param facility The airport data that was changed.
   */
  private onChanged = (facility: AirportFacility | null): void => {
    if (facility !== null) {
      this.content.instance.classList.remove('hidden-element');

      this.name.set(Utils.Translate(facility.name));
      this.location.set(this.getLocation(facility));
      this.elevation.set(facility.altitude);
    } else {
      this.content.instance.classList.add('hidden-element');

      this.name.set('');
      this.location.set('');
      this.elevation.set(NaN);
    }
  };

  /**
   * Gets a location string from airport facility data.
   * @param facility The facility to get the location string from.
   * @returns The built airport location string for display.
   */
  private getLocation(facility: AirportFacility): string {
    const ident = ICAO.getIdent(facility.icao).trim();
    let location = ident.length === 4 ? Regions.getName(ident.substr(0, 2)) : '';

    if (location === '' && facility.city !== '') {
      location = facility.city.split(', ').map(name => Utils.Translate(name)).join(', ');
    }

    return location;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <GroupBox title='Information'>
        <div class="mfd-nearest-airport-info" ref={this.content}>
          <div class='mfd-nearest-airport-info-name'>{this.name}</div>
          <div class='mfd-nearest-airport-info-location'>{this.location}</div>
          <NumberUnitDisplay
            value={this.elevation}
            displayUnit={this.props.unitsSettingManager.altitudeUnits}
            formatter={NumberFormatter.create({ precision: 1, nanString: '______' })}
            class='mfd-nearest-airport-info-elevation'
          />
        </div>
      </GroupBox>
    );
  }
}