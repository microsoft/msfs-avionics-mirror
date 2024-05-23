import {
  ArrayUtils, DebounceTimer, Facility, FacilitySearchType, FacilityType, FacilityWaypoint, FSComponent, ICAO, IntersectionFacilityUtils, MappedSubject, NodeReference, Subject,
  VNode
} from '@microsoft/msfs-sdk';

import { GarminFacilityWaypointCache, Regions } from '@microsoft/msfs-garminsdk';

import { CharInput } from '../../../Shared/Components/CharInput/CharInput';
import { CharInputSlot } from '../../../Shared/Components/CharInput/CharInputSlot';
import { ImgTouchButton } from '../../../Shared/Components/TouchButton/ImgTouchButton';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiWaypointIcon } from '../../../Shared/Components/Waypoint/UiWaypointIcon';
import { G3XFms } from '../../../Shared/FlightPlan/G3XFms';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XSpecialChar } from '../../../Shared/Graphics/Text/G3XSpecialChar';
import { G3XWaypointSearchType, G3XWaypointSearchTypeMap } from '../../../Shared/Navigation/G3XWaypointSearchTypes';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { DuplicateWaypointDialog } from './DuplicateWaypointDialog';

import './WaypointDialog.css';

/**
 * A request input for {@link WaypointDialog}.
 */
export interface WaypointDialogInput<T extends G3XWaypointSearchType> {
  /** The type of waypoint to search for. */
  searchType: T;

  /** The waypoint value initially loaded into the dialog at the start of the request. */
  initialValue?: G3XWaypointSearchTypeMap[T] | null;
}

/** Props for {@link WaypointDialog} */
export interface WaypointDialogProps extends UiViewProps {
  /** The Fms instance to use. */
  fms: G3XFms;
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
type SearchResult = {
  /** The facility ICAO. */
  readonly icao: string;

  /** The facility ident. */
  readonly ident: string;

  /** The facility. */
  readonly facility: Facility;
};

/**
 * Results of a facility search.
 */
type SearchResults = {
  /** Matches where the ident exactly matches the current user input. */
  readonly exactMatches?: readonly SearchResult[];

  /** The first suggested partial match given the current user input. */
  readonly suggestedMatch?: SearchResult;
};

/**
 * A dialog which allows the user to select a waypoint.
 */
export class WaypointDialog extends AbstractUiView<WaypointDialogProps>
  implements UiDialogView<WaypointDialogInput<G3XWaypointSearchType>, FacilityWaypoint> {

  private static readonly CHAR_ARRAY = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', ''
  ];

  private static readonly KEYS = [
    'A', 'B', 'C', 'D', 'E', '1', '2', '3',
    'F', 'G', 'H', 'I', 'J', '4', '5', '6',
    'K', 'L', 'M', 'N', 'O', '7', '8', '9',
    'P', 'Q', 'R', 'S', 'T', null, '0', null,
    'U', 'V', 'W', 'X', 'Y', 'Z', ' ',
  ];

  private thisNode?: VNode;

  private readonly inputRef = FSComponent.createRef<CharInput>();

  private readonly inputSlotEntries: CharInputSlotEntry[] = ArrayUtils.create(6, () => {
    return {
      ref: FSComponent.createRef<CharInputSlot>(),
      defaultCharValue: Subject.create('')
    };
  });

  private readonly titleText = Subject.create('');

  private readonly inputText = Subject.create('');
  private readonly inputTextSub = this.inputText.sub(this.onInputTextChanged.bind(this, true), false, true);

  private readonly autocompleteText = Subject.create('');
  private readonly autocompleteTextSub = MappedSubject.create(
    this.inputText,
    this.autocompleteText
  ).sub(this.updateAutocomplete.bind(this), false, true);

  private readonly inputLabelText = Subject.create('');

  private readonly waypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private readonly selectedFacility = Subject.create<Facility | null>(null);
  private readonly selectedWaypoint = this.selectedFacility.map(x => x ? this.waypointCache.get(x) : null);

  private facilityMatches?: readonly SearchResult[];

  private readonly enterButtonEnabled = Subject.create(false);

  private readonly searchDebounce = new DebounceTimer();

  private searchOpId = 0;

  private facilitySearchType?: G3XWaypointSearchType;

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<FacilityWaypoint> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public override onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Cursor Position'],
      [UiKnobId.LeftOuter, 'Cursor Position'],
      [UiKnobId.RightOuter, 'Cursor Position'],
      [UiKnobId.SingleInner, 'Change Character'],
      [UiKnobId.LeftInner, 'Change Character'],
      [UiKnobId.RightInner, 'Change Character'],
    ]);

    this.focusController.setActive(true);
  }

  /** @inheritDoc */
  public request<T extends G3XWaypointSearchType>(input: WaypointDialogInput<T>): Promise<UiDialogResult<G3XWaypointSearchTypeMap[T]>> {
    return new Promise<UiDialogResult<G3XWaypointSearchTypeMap[T]>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.facilitySearchType = input.searchType;

      switch (this.facilitySearchType) {
        case FacilitySearchType.AllExceptVisual:
          this.titleText.set('Waypoint Identifier');
          break;
        case FacilitySearchType.Airport:
          this.titleText.set('Airport Identifier');
          break;
        case FacilitySearchType.Vor:
          this.titleText.set('VOR Identifier');
          break;
        case FacilitySearchType.Ndb:
          this.titleText.set('NDB Identifier');
          break;
        case FacilitySearchType.Intersection:
          this.titleText.set('Intersection Identifier');
          break;
        case FacilitySearchType.User:
          this.titleText.set('User Waypoint Identifier');
          break;
      }

      if (input.initialValue) {
        const facility = input.initialValue.facility.get();
        this.inputRef.instance.setValue(ICAO.getIdent(facility.icao));
        this.selectedFacility.set(facility);
        this.enterButtonEnabled.set(true);
      } else {
        this.inputRef.instance.setValue('');
        this.selectedFacility.set(null);
        this.enterButtonEnabled.set(false);
      }

      this.autocompleteText.set('');

      this.inputRef.instance.deactivateEditing();
      this.inputRef.instance.refresh();

      this.inputTextSub.resume();
      this.autocompleteTextSub.resume(true);
    });
  }

  /** @inheritdoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /** @inheritdoc */
  public onClose(): void {
    this.focusController.clearRecentFocus();
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.SingleKnobInnerInc:
      case UiInteractionEvent.LeftKnobInnerInc:
      case UiInteractionEvent.RightKnobInnerInc:
        this.inputRef.instance.changeSlotValue(1, true);
        return true;
      case UiInteractionEvent.SingleKnobInnerDec:
      case UiInteractionEvent.LeftKnobInnerDec:
      case UiInteractionEvent.RightKnobInnerDec:
        this.inputRef.instance.changeSlotValue(-1, true);
        return true;
      case UiInteractionEvent.SingleKnobOuterInc:
      case UiInteractionEvent.LeftKnobOuterInc:
      case UiInteractionEvent.RightKnobOuterInc:
        this.inputRef.instance.moveCursor(1, true);
        return true;
      case UiInteractionEvent.SingleKnobOuterDec:
      case UiInteractionEvent.LeftKnobOuterDec:
      case UiInteractionEvent.RightKnobOuterDec:
        this.inputRef.instance.moveCursor(-1, true);
        return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  private readonly updateSearchHandler = this.updateSearch.bind(this);

  /**
   * A callback called when the search input box is updated.
   * @param debounce Whether to debounce the call to update autocomplete.
   */
  private onInputTextChanged(debounce = false): void {
    if (this.facilitySearchType === undefined) {
      return;
    }

    this.searchDebounce.clear();

    if (this.inputText.get() === '') {
      this.inputLabelText.set('No matches found');
      this.selectedFacility.set(null);
      this.autocompleteText.set('');
      this.enterButtonEnabled.set(false);
    } else {
      if (debounce) {
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

      this.enterButtonEnabled.set(true);
    } else if (suggestedMatch) {
      this.facilityMatches = undefined;

      this.inputLabelText.set(this.getFacilityLabel(suggestedMatch.facility));
      this.selectedFacility.set(suggestedMatch.facility);
      this.autocompleteText.set(suggestedMatch.ident);

      this.enterButtonEnabled.set(true);
    } else {
      this.inputLabelText.set('No matches found');
      this.selectedFacility.set(null);
      this.autocompleteText.set('');
      this.enterButtonEnabled.set(false);
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

    const allMatches = await this.props.fms.facLoader.searchByIdent(this.facilitySearchType, searchString, 20);

    if (opId !== this.searchOpId) {
      return {};
    }

    const exactMatches = allMatches.filter(match => ICAO.getIdent(match) === searchString);
    if (exactMatches.length > 0) {
      return {
        exactMatches: await Promise.all(
          // Filter out any terminal intersections that are duplicates of non-terminal intersection matches.
          IntersectionFacilityUtils.filterDuplicates(exactMatches)
            .map<Promise<SearchResult>>(async match => {
              return {
                icao: match,
                ident: ICAO.getIdent(match),
                facility: await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(match), match) as Facility,
              };
            })
        )
      };
    } else if (allMatches.length > 0) {
      let firstMatch = allMatches[0];

      // Check if the first match is a terminal duplicate of a non-terminal intersection match. If it is, replace it
      // with the non-terminal version.
      if (ICAO.isFacility(firstMatch, FacilityType.Intersection) && IntersectionFacilityUtils.isTerminal(firstMatch)) {
        const nonTerminalIcao = IntersectionFacilityUtils.getNonTerminalICAO(firstMatch);
        if (allMatches.includes(nonTerminalIcao)) {
          firstMatch = nonTerminalIcao;
        }
      }

      return {
        suggestedMatch: {
          icao: firstMatch,
          ident: ICAO.getIdent(firstMatch),
          facility: await this.props.fms.facLoader.getFacility(ICAO.getFacilityType(firstMatch), firstMatch) as Facility,
        }
      };
    } else {
      return {};
    }
  }

  /**
   * Get the label text to display for a facility.
   * @param facility The facility for which to get label text.
   * @returns The label text to display for the specified facility.
   */
  private getFacilityLabel(facility: Facility): string {
    const facilityType = ICAO.getFacilityType(facility.icao);

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

      const regionCode = ICAO.getRegionCode(facility.icao);
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

    const waypoint = this.selectedWaypoint.get();
    if (waypoint) {
      this.resultObject = {
        wasCancelled: false,
        payload: waypoint
      };

      this.props.uiService.goBackMfd();
    } else if (this.facilityMatches !== undefined) {
      this.resolveDuplicates(this.facilityMatches);
    } else {
      this.props.uiService.goBackMfd();
    }
  }

  /**
   * Attempts to resolve duplicate matched facilities. Opens the duplicate waypoint dialog to allow the user to
   * select one of the duplicates. If the user selects a duplicate, the current request will be resolved with the
   * selected facility and this dialog will be closed. If the user does not select a duplicate, the current request
   * will remain unresolved and this dialog will remain open.
   * @param matches The search results of the duplicate matched facilities.
   */
  private async resolveDuplicates(matches: readonly SearchResult[]): Promise<void> {
    const result = await this.props.uiService
      .openMfdPopup<DuplicateWaypointDialog>(UiViewStackLayer.Overlay, UiViewKeys.DuplicateWaypointDialog)
      .ref.request({
        waypoints: matches.map(match => this.waypointCache.get(match.facility))
      });

    if (!result.wasCancelled) {
      this.resultObject = {
        wasCancelled: false,
        payload: result.payload
      };

      this.props.uiService.goBackMfd();
    }
  }

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
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
   * Responds to when this dialog's cancel button is pressed.
   */
  private onCancelPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public override render(): VNode | null {
    return (
      <div class='wpt-dialog ui-view-panel'>
        <div class='wpt-dialog-title'>{this.titleText}</div>

        <div class='wpt-dialog-top-row'>
          <ImgTouchButton class='ui-nav-button wpt-dialog-find' label='Find' isEnabled={false} />

          <div class='wpt-dialog-input-container'>
            <div class='wpt-dialog-input-box'>
              <CharInput
                ref={this.inputRef}
                value={this.inputText}
                renderInactiveValue={
                  <div
                    class={{
                      'wpt-dialog-input-inactive-value-text': true,
                      'wpt-dialog-input-inactive-value-text-highlight': this.inputText.map(text => text !== '')
                    }}
                  >
                    {this.inputText.map(text => text === '' ? 'Enter Identifier' : text)}
                  </div>
                }
                class='wpt-dialog-input'
              >
                {this.inputSlotEntries.map(entry => {
                  return (
                    <CharInputSlot
                      ref={entry.ref}
                      charArray={WaypointDialog.CHAR_ARRAY}
                      defaultCharValue={entry.defaultCharValue}
                      wrap
                      class={{
                        'wpt-dialog-input-slot-autocomplete': entry.defaultCharValue.map(value => value !== '')
                      }}
                    />
                  );
                })}
              </CharInput>
              <UiWaypointIcon
                waypoint={this.selectedWaypoint}
                class='wpt-dialog-input-icon'
              />
            </div>
            <div class='wpt-dialog-input-label'>{this.inputLabelText}</div>
          </div>

          <ImgTouchButton
            label='Backspace'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_backspace.png`}
            onPressed={this.onBackspacePressed.bind(this)}
            class='ui-nav-button wpt-dialog-backspace'
          />
        </div>

        <div class='wpt-dialog-key-grid'>
          {WaypointDialog.KEYS.map(this.renderKey.bind(this))}
        </div>

        <div class='wpt-dialog-bottom-row'>
          <UiImgTouchButton
            label='Cancel'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_cancel.png`}
            onPressed={this.onCancelPressed.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
          <UiImgTouchButton
            label='Symbol'
            isEnabled={false}
            class='ui-nav-button'
          />
          <UiImgTouchButton
            label='Enter'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_enter.png`}
            isEnabled={this.enterButtonEnabled}
            onPressed={this.resolve.bind(this)}
            focusController={this.focusController}
            class='ui-nav-button'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders a character key.
   * @param char The character of the key to render, or `null` if a spacer should be rendered instead.
   * @returns A rendered key for the specified character or a spacer, as a VNode.
   */
  private renderKey(char: string | null): VNode {
    if (char === null) {
      return (
        <div class='wpt-dialog-key-spacer' />
      );
    }

    let cssClass = 'wpt-dialog-key';

    if (char === ' ') {
      cssClass += ' wpt-dialog-key-wide';
    } else if (isFinite(Number(char))) {
      cssClass += ' numpad-touch-button';
    }

    return (
      <UiTouchButton
        label={char === ' ' ? G3XSpecialChar.SpaceBar : char}
        onPressed={this.onKeyPressed.bind(this, char)}
        class={cssClass}
      />
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
