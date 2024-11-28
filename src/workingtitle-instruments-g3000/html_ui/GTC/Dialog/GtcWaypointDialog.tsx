import {
  ArrayUtils, DebounceTimer, Facility, FacilitySearchType, FacilityType, FSComponent, ICAO, IcaoValue,
  IntersectionFacilityUtils, MappedSubject, NodeReference, SearchTypeMap, Subject, VNode
} from '@microsoft/msfs-sdk';

import { Fms, GarminFacilityWaypointCache, Regions } from '@microsoft/msfs-garminsdk';

import { G3000FacilityUtils, G3000WaypointSearchType } from '@microsoft/msfs-wtg3000-common';

import { CharInput } from '../Components/CharInput/CharInput';
import { CharInputSlot } from '../Components/CharInput/CharInputSlot';
import { GtcWaypointIcon } from '../Components/GtcWaypointIcon/GtcWaypointIcon';
import { Keyboard } from '../Components/Keyboard/Keyboard';
import { GtcHardwareControlEvent, GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { GtcDuplicateWaypointDialog } from './GtcDuplicateWaypointDialog';
import { GtcFindWaypointDialog } from './GtcFindWaypointDialog';

import './GtcWaypointDialog.css';

/**
 * A request input for {@link GtcWaypointDialog}.
 */
export interface GtcWaypointDialogInput<T extends G3000WaypointSearchType> {
  /** The type of waypoint to search for. */
  searchType: T;

  /** The initial label text to display when the dialog's identifier input is empty. */
  emptyLabelText: string;

  /** The waypoint value initially loaded into the dialog at the start of the request. */
  initialValue?: SearchTypeMap[T] | null;
}

/**
 * Component props for GtcWaypointDialog.
 */
export interface GtcWaypointDialogProps extends GtcViewProps {
  /** The Fms instance to use. */
  fms: Fms;
}

/**
 * An entry for a single character input slot.
 */
type CharInputSlotEntry = {
  /** A reference to the input slot. */
  ref: NodeReference<CharInputSlot>;

  /** The input slot's default character value. */
  defaultCharValue: Subject<string>;
};

/**
 * A search result.
 */
interface SearchResult {
  /** The ICAO. */
  readonly icao: IcaoValue;

  /** The ident. */
  readonly ident: string;
}

/**
 * A search result, also with a facility.
 */
interface SearchResultWithFacility extends SearchResult {
  /** The facility. */
  readonly facility: Facility;
}

/**
 * Results of a facility search.
 */
interface SearchResults {
  /** Matches where the ident exactly matches the current user input. */
  readonly exactMatches?: readonly SearchResultWithFacility[];

  /** The first suggested partial match given the current user input. */
  readonly suggestedMatch?: SearchResultWithFacility;
}

/**
 * A dialog which allows the user to select a waypoint.
 */
export class GtcWaypointDialog extends GtcView<GtcWaypointDialogProps>
  implements GtcDialogView<GtcWaypointDialogInput<G3000WaypointSearchType>, Facility> {

  private static readonly CHAR_ARRAY = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ''
  ];

  private thisNode?: VNode;

  private readonly inputRef = FSComponent.createRef<CharInput>();
  private readonly keyboardRef = FSComponent.createRef<Keyboard>();

  private readonly inputSlotEntries: CharInputSlotEntry[] = ArrayUtils.create(6, () => {
    return {
      ref: FSComponent.createRef<CharInputSlot>(),
      defaultCharValue: Subject.create('')
    };
  });

  private readonly inputText = Subject.create('');
  private readonly inputTextSub = this.inputText.sub(this.onInputTextChanged.bind(this, true), false, true);

  private readonly autocompleteText = Subject.create('');
  private readonly autocompleteTextSub = MappedSubject.create(
    this.inputText,
    this.autocompleteText
  ).sub(this.updateAutocomplete.bind(this), false, true);

  private readonly inputLabelText = Subject.create('');

  private readonly selectedFacility = Subject.create<Facility | null>(null);
  private readonly waypoint = this.selectedFacility
    .map(x => x ? GarminFacilityWaypointCache.getCache(this.bus).get(x) : null);

  private facilityMatches?: readonly SearchResultWithFacility[];

  private readonly searchDebounce = new DebounceTimer();

  private searchOpId = 0;

  private facilitySearchType?: G3000WaypointSearchType;

  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<Facility> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._sidebarState.slot5.set('enterEnabled');
    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');
  }

  /** @inheritDoc */
  public request<T extends G3000WaypointSearchType>(input: GtcWaypointDialogInput<T>): Promise<GtcDialogResult<SearchTypeMap[T]>> {
    return new Promise<GtcDialogResult<SearchTypeMap[T]>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.facilitySearchType = input.searchType;

      if (input.initialValue) {
        this.inputRef.instance.setValue(input.initialValue.icaoStruct.ident);
        this.selectedFacility.set(input.initialValue);
        this.inputLabelText.set(this.getFacilityLabel(input.initialValue));
      } else {
        this.inputRef.instance.setValue('');
        this.selectedFacility.set(null);
        this.inputLabelText.set(input.emptyLabelText);
      }

      this.autocompleteText.set('');

      this.inputRef.instance.deactivateEditing();
      this.inputRef.instance.refresh();

      this._sidebarState.slot1.set(null);
      this.keyboardRef.instance.setShowNumpad(false);

      this.inputTextSub.resume();
      this.autocompleteTextSub.resume(true);
    });
  }

  /** @inheritdoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcHardwareControlEvent.InnerKnobInc:
        this.inputRef.instance.changeSlotValue(1, true);
        return true;
      case GtcHardwareControlEvent.InnerKnobDec:
        this.inputRef.instance.changeSlotValue(-1, true);
        return true;
      case GtcHardwareControlEvent.OuterKnobInc:
        this.inputRef.instance.moveCursor(1, true);
        return true;
      case GtcHardwareControlEvent.OuterKnobDec:
        this.inputRef.instance.moveCursor(-1, true);
        return true;
      case GtcHardwareControlEvent.InnerKnobPush:
      case GtcHardwareControlEvent.InnerKnobPushLong:
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.resolve();
        return true;
      default:
        return false;
    }
  }

  private readonly updateSearchHandler = this.updateSearch.bind(this);

  /**
   * A callback called when the search input box is updated.
   * @param debounce Whether to debounce the call to update autocomplete.
   */
  private onInputTextChanged(debounce = false): void {
    this._sidebarState.slot1.set('cancel');

    if (this.facilitySearchType === undefined) {
      return;
    }

    this.searchDebounce.clear();

    if (this.inputText.get() === '') {
      this.facilityMatches = undefined;

      this.inputLabelText.set('No matches found');
      this.selectedFacility.set(null);
      this.autocompleteText.set('');
    } else {
      this.facilityMatches = undefined;

      this.inputLabelText.set('Searching...');
      this.selectedFacility.set(null);
      this.autocompleteText.set('');

      if (debounce) {
        ++this.searchOpId;
        this.searchDebounce.schedule(this.updateSearchHandler, 250);
      } else {
        this.updateSearch();
      }
    }
  }

  /**
   * Checks for matches with current input, and updates the label and suggested text.
   */
  private async updateSearch(): Promise<void> {
    const opId = ++this.searchOpId;

    const { exactMatches, suggestedMatch } = await this.searchFacilities(this.inputText.get(), opId);

    if (opId !== this.searchOpId) {
      return;
    }

    if (exactMatches) {
      this.facilityMatches = exactMatches;

      if (exactMatches.length === 1) {
        this.inputLabelText.set(this.getFacilityLabel(exactMatches[0].facility));
        this.selectedFacility.set(exactMatches[0].facility);
      } else if (exactMatches.length > 1) {
        this.inputLabelText.set('Duplicates found');
        this.selectedFacility.set(null);
      }

      this.autocompleteText.set('');

    } else if (suggestedMatch) {
      this.facilityMatches = undefined;

      this.inputLabelText.set(this.getFacilityLabel(suggestedMatch.facility));
      this.selectedFacility.set(suggestedMatch.facility);
      this.autocompleteText.set(suggestedMatch.ident);
    } else {
      this.facilityMatches = undefined;

      this.inputLabelText.set('No matches found');
      this.selectedFacility.set(null);
      this.autocompleteText.set('');
    }
  }

  /**
   * Searches facilities with a given ident and returns matches.
   * @param searchString The ident to search.
   * @param opId The search operation ID.
   * @returns A Promise which will be fulfilled with the results of the facility search.
   */
  private async searchFacilities(searchString: string, opId: number): Promise<SearchResults> {
    if (this.facilitySearchType === undefined) {
      throw new Error('facility search type is required keyboard param when searching facilities.');
    }

    let allMatches = await this.props.fms.facLoader.searchByIdentWithIcaoStructs(this.facilitySearchType, searchString, 20);

    if (opId !== this.searchOpId) {
      return {};
    }

    if (this.facilitySearchType === FacilitySearchType.AllExceptVisual || this.facilitySearchType === FacilitySearchType.User) {
      // Filter user facilities by scope.
      allMatches = allMatches.filter(icao => {
        return !ICAO.isValueFacility(icao, FacilityType.USR)
          || icao.airport === G3000FacilityUtils.USER_FACILITY_SCOPE;
      });
    }

    const exactMatches = allMatches.filter(match => match.ident === searchString);

    // Try to return a list of exact matches.
    if (exactMatches.length > 0) {
      const exactMatchesWithFacilities = (await Promise.all(
        // Filter out any terminal intersections that are duplicates of non-terminal intersection matches.
        IntersectionFacilityUtils.filterDuplicates(exactMatches)
          .map<Promise<SearchResultWithFacility | null>>(async match => {
            const facility = await this.props.fms.facLoader.tryGetFacility(ICAO.getFacilityTypeFromValue(match), match);

            if (facility) {
              return {
                icao: match,
                ident: match.ident,
                facility
              };
            } else {
              return null;
            }
          })
      )).filter(result => !!result) as SearchResultWithFacility[];

      if (exactMatches.length > 0) {
        return {
          exactMatches: exactMatchesWithFacilities
        };
      }
    }

    // If no exact matches could be returned, then try to return a suggested match.
    if (allMatches.length > 0) {
      let firstMatch = allMatches[0];

      // Check if the first match is a terminal duplicate of a non-terminal intersection match. If it is, replace it
      // with the non-terminal version.
      if (ICAO.isValueFacility(firstMatch, FacilityType.Intersection) && IntersectionFacilityUtils.isTerminal(firstMatch)) {
        const nonTerminalIcao = IntersectionFacilityUtils.getNonTerminalIcaoValue(firstMatch);
        if (allMatches.find(icao => ICAO.valueEquals(icao, nonTerminalIcao))) {
          firstMatch = nonTerminalIcao;
        }
      }

      const facility = await this.props.fms.facLoader.tryGetFacility(ICAO.getFacilityTypeFromValue(firstMatch), firstMatch);

      if (facility) {
        return {
          suggestedMatch: {
            icao: firstMatch,
            ident: firstMatch.ident,
            facility,
          }
        };
      }
    }

    // If neither exact nor suggested matches could be returned, then return an empty match.
    return {};
  }

  /**
   * Get the label text to display for a facility.
   * @param facility The facility for which to get label text.
   * @returns The label text to display for the specified facility.
   */
  private getFacilityLabel(facility: Facility): string {
    const facilityType = ICAO.getFacilityTypeFromValue(facility.icaoStruct);

    if (facilityType === FacilityType.Airport) {
      return Utils.Translate(facility.name);
    } else {
      if (facility.city.length > 0) {
        const separatedCity = facility.city.split(', ');
        const city = separatedCity.length > 1 ? Utils.Translate(separatedCity[0]) + ', ' + Utils.Translate(separatedCity[1]) : Utils.Translate(facility.city);
        if (city) {
          return city;
        }
      }

      const regionCode = facility.icaoStruct.region;
      if (regionCode) {
        return Regions.getName(regionCode);
      }

      const name = Utils.Translate(facility.name);
      if (name) {
        return name;
      }

      return `${facility.lat.toFixed(4)}, ${facility.lon.toFixed(4)}`;
    }
  }

  /**
   * Updates the default character values of this dialog's character input to match the current autocomplete state.
   * @param root0 The current autocomplete state.
   * @param root0."0" The current input text.
   * @param root0."1" The current autocomplete text.
   */
  private updateAutocomplete([inputText, autocompleteText]: readonly [string, string]): void {
    let endIndex = autocompleteText.length;

    if (autocompleteText === '' || autocompleteText.length < inputText.length || !autocompleteText.startsWith(inputText)) {
      endIndex = 0;
    }

    for (let i = 0; i < this.inputSlotEntries.length; i++) {
      if (i < endIndex) {
        this.inputSlotEntries[i].defaultCharValue.set(autocompleteText[i]);
      } else {
        this.inputSlotEntries[i].defaultCharValue.set('');
      }
    }
  }

  /**
   * Attempts to resolve the current request.
   *
   * If this dialog searches for facilities, then the currently selected facility will be returned if one exists. If
   * there is no selected facility, duplicate matches will attempted to be resolved if they exist. If neither a
   * selected facility or duplicate matches exist, the request will be cancelled.
   *
   * If this dialog does not search for facilities, the current input text is returned.
   */
  private resolve(): void {
    if (this.facilitySearchType === undefined) {
      return;
    }

    const facility = this.selectedFacility.get();
    if (facility) {
      this.resultObject = {
        wasCancelled: false,
        payload: facility
      };

      this.props.gtcService.goBack();
    } else if (this.facilityMatches !== undefined) {
      this.resolveDuplicates(this.facilityMatches);
    } else {
      this.props.gtcService.goBack();
    }
  }

  /**
   * Attempts to resolve duplicate matched facilities. Opens the duplicate waypoint dialog to allow the user to
   * select one of the duplicates. If the user selects a duplicate, the current request will be resolved with the
   * selected facility and this dialog will be closed. If the user does not select a duplicate, the current request
   * will remain unresolved and this dialog will remain open.
   * @param matches The search results of the duplicate matched facilities.
   */
  private async resolveDuplicates(matches: readonly SearchResultWithFacility[]): Promise<void> {
    const result = await this.props.gtcService
      .openPopup<GtcDuplicateWaypointDialog>(GtcViewKeys.DuplicateWaypointDialog, 'normal', 'hide')
      .ref.request({ ident: matches[0].ident, duplicates: matches.map(match => match.facility) });

    if (!result.wasCancelled) {
      this.resultObject = {
        wasCancelled: false,
        payload: result.payload
      };

      this.props.gtcService.goBack();
    }
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    ++this.searchOpId;

    this.inputTextSub.pause();
    this.autocompleteTextSub.pause();
    this.facilitySearchType = undefined;
    this.facilityMatches = undefined;

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's character keys is pressed.
   * @param char The character of the key that was pressed.
   */
  private onKeyPressed(char: string): void {
    this.inputRef.instance.setSlotCharacterValue(char);
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  private onBackspacePressed(): void {
    this.inputRef.instance.backspace();
  }

  /**
   * Responds to when this dialog's Find button is pressed.
   */
  private async onFindPressed(): Promise<void> {
    if (this.facilitySearchType === undefined) {
      return;
    }

    const result = await this.gtcService.openPopup<GtcFindWaypointDialog>(GtcViewKeys.FindWaypointDialog)
      .ref.request(this.facilitySearchType);

    if (!result.wasCancelled) {
      this.selectedFacility.set(result.payload.facility.get());
      this.resolve();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wpt-dialog'>
        <div class='wpt-dialog-top-section'>
          <CharInput
            ref={this.inputRef}
            value={this.inputText}
            renderInactiveValue={
              <div
                class={{
                  'wpt-dialog-input-inactive-value-text': true,
                  'wpt-dialog-input-inactive-value-text-empty': this.inputText.map(text => text === '')
                }}
              >
                {this.inputText.map(text => text === '' ? '______' : text)}
              </div>
            }
            class='wpt-dialog-input'
          >
            {this.inputSlotEntries.map(entry => {
              return (
                <CharInputSlot
                  ref={entry.ref}
                  charArray={GtcWaypointDialog.CHAR_ARRAY}
                  defaultCharValue={entry.defaultCharValue}
                  wrap
                  class={{
                    'wpt-dialog-input-slot-autocomplete': entry.defaultCharValue.map(value => value !== '')
                  }}
                />
              );
            })}
          </CharInput>
          <div class='wpt-dialog-input-label'>
            {this.inputLabelText}
          </div>
          <div class={{ 'wpt-dialog-input-icon': true, 'hidden': this.waypoint.map(waypoint => waypoint === null) }}>
            <GtcWaypointIcon waypoint={this.waypoint} />
          </div>
        </div>
        <Keyboard
          ref={this.keyboardRef}
          isSpaceButtonEnabled={false}
          showFindButton={true}
          onKeyPressed={this.onKeyPressed.bind(this)}
          onBackspacePressed={this.onBackspacePressed.bind(this)}
          onFindPressed={this.onFindPressed.bind(this)}
          class='wpt-dialog-keyboard'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cleanupRequest();

    this.searchDebounce.clear();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}