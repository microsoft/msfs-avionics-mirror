import { ArraySubject, Facility, FacilityLoader, FacilitySearchType, FacilityType, FSComponent, ICAO, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';

import {
  Epic2List, InputField, KeyboardInputButton, ListItem, Modal, ModalKey, ModalProps, RadioButton, Regions, TouchButton, UppercaseTextInputFormat
} from '@microsoft/msfs-epic2-shared';

import { Epic2ChartAirportListType } from '../Epic2ChartTypes';

import './ChartAirportSearchDialog.css';

/** Properties for the {@link ChartsAirportSearch} class */
interface ChartsAirportSearchProps extends ModalProps {
  /** The facility loader */
  facLoader: FacilityLoader
}

/** Modal used for the airport search dialog for charts */
export class ChartsAirportSearch extends Modal<ChartsAirportSearchProps> {
  protected readonly cssClassSet = SetSubject.create(['airport-chart-search-dialog']);

  private readonly searchText = Subject.create<string | null>(null);
  public readonly selectedAirport = Subject.create<Facility | null>(null);
  private readonly airportList = ArraySubject.create<Epic2ChartAirportListType>([]);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.searchText.sub(async (v) => {
      if (v) {
        const searchedIcaos = await this.props.facLoader.searchByIdentWithIcaoStructs(FacilitySearchType.Airport, v, 23);
        const facilities = await this.props.facLoader.getFacilitiesOfType(FacilityType.Airport, searchedIcaos);

        this.airportList.set(facilities.filter((airport) => airport !== null).map((airport) => {
          return {
            airport
          } as Epic2ChartAirportListType;
        }));
      }
    });
  }

  /** @inheritdoc */
  public onPause(): void {
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.cssClassSet}>
        <div class="header">
          <p class="title">Search Aprt</p>
          <div class="center-title">
            <p>Search Results for</p>
            <p class="search">{this.searchText.map((v) => v ?? '------------------')}</p>
          </div>
          <KeyboardInputButton bus={this.props.bus} classes='keyboard-button' />
          <TouchButton variant="bar" label="X" class="close-button" onPressed={() => this.close()} />
        </div>
        <div class="list-title-row">
          <p>ICAO</p>
          <p style="margin-left: 10px;">Airport Name</p>
          <p style="margin-left: 194px;">City</p>
          <p style="margin-left: 158px">Country</p>
        </div>
        <Epic2List
          bus={this.props.bus}
          data={this.airportList}
          scrollbarStyle='outside'
          listItemHeightPx={25}
          heightPx={575}
          renderItem={({ airport }) => <ListItem>
            <TouchButton
              variant='list-button'
              isHighlighted={this.selectedAirport.map((selected) => selected ? ICAO.valueEquals(airport.icaoStruct, selected?.icaoStruct) : false)}
              onPressed={() => { this.selectedAirport.set(airport); this.props.modalService.close(ModalKey.ChartAirportSearch); }}
              label={<div class="airport-row">
                <p style="width: 52px; text-align: left">{airport.icaoStruct.ident}</p>
                <p style="width: 312px; text-align: left">{Utils.Translate(airport.name)}</p>
                <p style="width: 42px; text-align: left">{Utils.Translate(airport.city.split(', ')[0])}</p>
                <p style="margin-left: auto; text-align: right;">{Regions.getName(airport.icaoStruct.region)}</p>
              </div>
              }
            />
          </ListItem>
          } />
        <div class="radio-row">
          <RadioButton selectedValue={Subject.create(0)} value={0} label={'ICAO'} />
          <RadioButton isDisabled={true} selectedValue={Subject.create(0)} value={1} label={'Airport Name'} />
          <RadioButton isDisabled={true} selectedValue={Subject.create(0)} value={2} label={'City'} />
          <RadioButton isDisabled={true} selectedValue={Subject.create(0)} value={3} label={'Country'} />
        </div>
        <div>
          <TouchButton
            class={'delete-button'}
            variant={'bar-menu'}
            label={'Clear<br/>Search'}
            isEnabled={false}
            onPressed={() => { this.close(); }}
          />
          <InputField class='search-field' bus={this.props.bus} bind={this.searchText} formatter={new UppercaseTextInputFormat('------------------', 15)} blurOnEnter={true} tscConnected={true} tscDisplayLabel={'Airport Chart Search'} />
        </div>
      </div >
    );
  }
}
