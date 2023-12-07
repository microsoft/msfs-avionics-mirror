/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DebounceTimer, Facility, FacilityType, FSComponent, ICAO, IntersectionFacilityUtils, StringUtils, Subject, VNode } from '@microsoft/msfs-sdk';

import { Fms, GarminFacilityWaypointCache, Regions, TouchButton } from '@microsoft/msfs-garminsdk';
import { G3000WaypointSearchType } from '@microsoft/msfs-wtg3000-common';

import { GtcWaypointIcon } from '../Components/GtcWaypointIcon/GtcWaypointIcon';
import { GtcHardwareControlEvent, GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcViewKeys } from '../GtcService/GtcViewKeys';
import { GtcPositionHeadingDataProvider } from '../Navigation/GtcPositionHeadingDataProvider';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { GtcDuplicateWaypointDialog } from './GtcDuplicateWaypointDialog';
import { GtcFindWaypointDialog } from './GtcFindWaypointDialog';

import './GtcKeyboardDialog.css';

/** Results of a waypoint search. */
interface SearchResults {
  /** Matches where the ident exactly matches the current user input. */
  readonly exactMatches?: readonly SearchResultWithFacility[];
  /** The first suggested partial match given the current user input. */
  readonly suggestedMatch?: SearchResultWithFacility;
}

/** A search result. */
interface SearchResult {
  /** The ICAO. */
  readonly icao: string;
  /** The ident. */
  readonly ident: string;
}

/** A search result, also with a facility. */
interface SearchResultWithFacility extends SearchResult {
  /** The facility. */
  readonly facility: Facility;
}

/** The parameters needed to construct a list dialog */
export type GtcKeyboardDialogParams = {
  /** The type of facility to search for. If not provided, then the input will be normal text. */
  facilitySearchType?: G3000WaypointSearchType,
  /** The initial input label. */
  label: string,
  /** Whether or not to allow spaces to be input. */
  allowSpaces: boolean,
  /** Max number of characters to allow. */
  maxLength: number,
  /** The initial input text to populate the input box with. */
  initialInputText?: string,
}

/** GtcKeyboardDialog props. */
export interface GtcKeyboardDialogProps extends GtcViewProps {
  /** The Fms instance to use. */
  fms: Fms;

  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/** Allows user to input text using an alphanumeric keyboard. */
export class GtcKeyboardDialog<T extends Facility | string> extends GtcView<GtcKeyboardDialogProps>
  implements GtcDialogView<GtcKeyboardDialogParams, Facility | string> {

  private thisNode?: VNode;

  private readonly keyboardDialogRef = FSComponent.createRef<HTMLDivElement>();
  private readonly inputBoxRef = FSComponent.createRef<HTMLDivElement>();
  private readonly inputTextRef = FSComponent.createRef<HTMLDivElement>();
  private readonly inputCursorRef = FSComponent.createRef<HTMLDivElement>();
  private readonly inputIconRef = FSComponent.createRef<HTMLDivElement>();

  /** -1 When it should highlight the whole input. */
  private readonly cursorPosition = Subject.create(-1);
  private readonly inputText = Subject.create('');
  private readonly suggestedText = Subject.create('');
  private readonly inputLabel = Subject.create('Waypoint Identifier Lookup');

  private readonly selectedFacility = Subject.create<Facility | null>(null);
  private readonly waypoint = this.selectedFacility
    .map(x => x ? GarminFacilityWaypointCache.getCache(this.bus).get(x) : null);

  private facilityMatches?: readonly SearchResultWithFacility[];

  private readonly isTopSpaceButtonVisible = Subject.create(false);
  private readonly isBottomRightSpaceButtonVisible = Subject.create(true);
  private readonly isSpaceButtonEnabled = Subject.create(false);
  private readonly isFindButtonVisible = Subject.create(true);

  private readonly maxInputLength = Subject.create(6);
  private readonly showNumpad = Subject.create(false);
  private readonly underscoreWidth = this.gtcService.isHorizontal ? 31 : 16;
  private readonly cursorStartX = this.gtcService.isHorizontal ? 78 : 17;
  private readonly cursorExtraWidth = this.gtcService.isHorizontal ? 2 : 1;
  private readonly cursorThinWidth = this.gtcService.isHorizontal ? 7 : 4;
  private readonly characterMap: string[] = [
    '', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
    'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' '];

  private readonly searchDebounce = new DebounceTimer();
  private readonly cursorDebounce = new DebounceTimer();

  private searchOpId = 0;

  private inputArray = [] as VNode[];

  private resolveFunction?: (value: GtcDialogResult<T>) => void;
  private resultObject: GtcDialogResult<T> = {
    wasCancelled: true,
  };

  private facilitySearchType?: G3000WaypointSearchType;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._sidebarState.slot5.set('enterEnabled');
    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnter');

    this.waypoint.sub(waypoint => {
      this.inputIconRef.instance.classList.toggle('hidden', !waypoint);
    }, true);

    this.maxInputLength.sub(() => {
      this.inputArray = [];
      this.updateInputDom();
      this.debounceCursorUpdate();
      this.onSearchUpdated();
    });

    this.showNumpad.sub(showNumpad => {
      this.keyboardDialogRef.instance.classList.toggle('alpha', !showNumpad);
      this.keyboardDialogRef.instance.classList.toggle('numpad', showNumpad);
    }, true);

    this.inputText.sub(this.updateInputDom);
    this.suggestedText.sub(this.updateInputDom);
    this.cursorPosition.sub(this.updateInputDom);
    this.updateInputDom();

    this.inputText.sub(this.debounceCursorUpdate);
    this.suggestedText.sub(this.debounceCursorUpdate);
    this.cursorPosition.sub(this.debounceCursorUpdate);
    this.debounceCursorUpdate();

    this.onSearchUpdated();
  }

  /** @inheritdoc */
  public onOpen(wasPreviouslyOpened: boolean): void {
    super.onOpen(wasPreviouslyOpened);
    this._sidebarState.slot1.set(null);
    this.selectedFacility.set(null);
    this.cursorPosition.set(-1);
    this.inputText.set('');
    this.inputLabel.set('');
    this.showNumpad.set(false);
    this.updateInputDom();
    this.onSearchUpdated();
  }

  /** @inheritdoc */
  public onClose(): void {
    super.onClose();

    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcHardwareControlEvent.InnerKnobInc: this.rotateCharacter(1); return true;
      case GtcHardwareControlEvent.InnerKnobDec: this.rotateCharacter(-1); return true;
      case GtcHardwareControlEvent.OuterKnobInc: this.moveCursorRight(); return true;
      case GtcHardwareControlEvent.OuterKnobDec: this.moveCursorLeft(); return true;
      case GtcHardwareControlEvent.InnerKnobPush: this.resolve(); return true;
      case GtcHardwareControlEvent.InnerKnobPushLong: this.resolve(); return true;
      case GtcInteractionEvent.ButtonBarEnterPressed: this.resolve(); return true;
      default: return false;
    }
  }

  /** @inheritdoc */
  public request(params: GtcKeyboardDialogParams): Promise<GtcDialogResult<T>> {
    return new Promise<GtcDialogResult<T>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.facilitySearchType = params.facilitySearchType;

      this.inputLabel.set(params.label);
      this.isFindButtonVisible.set(params.facilitySearchType !== undefined);
      this.isTopSpaceButtonVisible.set(!this.isFindButtonVisible.get());
      this.isBottomRightSpaceButtonVisible.set(this.isFindButtonVisible.get());
      this.isSpaceButtonEnabled.set(params.allowSpaces);
      // TODO Limiting to 16 until we implement horizontal scrolling
      this.maxInputLength.set(Math.min(16, params.maxLength));

      // TODO Input box needs to scroll horizontally when text gets too big
      this.inputBoxRef.instance.style.width = (this.maxInputLength.get() * this.underscoreWidth + 30) + 'px';

      if (params.initialInputText) {
        // TODO Need to hide underscores and make cursor surround initial text
        this.inputText.set(params.initialInputText);
        this.onSearchUpdated();
      }

      if (params.allowSpaces && this.characterMap[this.characterMap.length - 1] !== ' ') {
        this.characterMap.push(' ');
      } else if (!params.allowSpaces && this.characterMap[this.characterMap.length - 1] === ' ') {
        this.characterMap.pop();
      }

      this._sidebarState.slot1.set(null);
    });
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
    if (this.facilitySearchType !== undefined) {
      const facility = this.selectedFacility.get();
      if (facility) {
        this.resultObject = {
          wasCancelled: false,
          payload: facility as T,
        };

        this.props.gtcService.goBack();
      } else if (this.facilityMatches !== undefined) {
        this.resolveDuplicates(this.facilityMatches);
      } else {
        this.props.gtcService.goBack();
      }
    } else {
      this.resultObject = {
        wasCancelled: false,
        payload: this.inputText.get() as T,
      };

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
        payload: result.payload as T
      };

      this.props.gtcService.goBack();
    }
  }

  /**
   * Rotates through character selection at cursor position.
   * @param direction Direction to go in.
   */
  private rotateCharacter(direction: 1 | -1): void {
    let newChar: string;
    if (this.cursorPosition.get() === -1) {
      this.cursorPosition.set(0);
      // TODO This should be based on nearest airport
      // TODO Waiting for Matt to move NearestContext.ts to the SDK
      newChar = 'K';
    } else {
      const cursorPosition = this.cursorPosition.get();
      const currentCharacter = this.inputText.get()[cursorPosition] ?? '';
      let newCharacterIndex = this.characterMap.indexOf(currentCharacter) + direction;
      if (newCharacterIndex > (this.characterMap.length - 1)) {
        newCharacterIndex = 0;
      } else if (newCharacterIndex < 0) {
        newCharacterIndex = (this.characterMap.length - 1);
      }
      newChar = this.characterMap[newCharacterIndex];
    }

    this.setInputCharAtCursor(newChar, true);
    this.onSearchUpdated(true);
  }

  /**
   * Replaces character at index in the input text.
   * @param char The character to use.
   * @param deleteAfter Whether to delete characters after the cursor. Defaults to false.
   */
  private setInputCharAtCursor(char: string, deleteAfter = false): void {
    const inputText = this.inputText.get();
    const index = this.cursorPosition.get();
    const newInput = inputText.substring(0, index) + char + (deleteAfter ? '' : inputText.substring(index + 1));
    this.inputText.set(newInput);
  }

  /**
   * Handles a letter/number button being pressed.
   * @param character The character that was pressed.
   * @returns A handler for the given character.
   */
  private readonly onAlphaNumPressed = (character: string) => (): void => {
    if (this.cursorPosition.get() === this.maxInputLength.get()) {
      return;
    }
    if (this.cursorPosition.get() === -1) {
      this.cursorPosition.set(0);
      this.setInputCharAtCursor(character, true);
    } else {
      this.setInputCharAtCursor(character);
    }
    this.onSearchUpdated();
    this.moveCursorRight();
  };

  /** Removes character at cursor position. */
  private readonly onBackspaceButtonPressed = (): void => {
    const cursorPosition = this.cursorPosition.get();
    // TODO Clear input on long press
    if (cursorPosition === -1) {
      this.cursorPosition.set(0);
      this.inputText.set('');
      this.onSearchUpdated();
    } else if (cursorPosition === 0) {
      // This causes the blink animation to restart
      this.cursorPosition.notify();
    } else {
      const input = this.inputText.get();
      const newInput = input.slice(0, cursorPosition - 1) + input.slice(cursorPosition);
      this.inputText.set(newInput);
      this.onSearchUpdated();
      this.moveCursorLeft();
    }
  };

  /** Moves the cursor right, if possible. */
  private readonly moveCursorRight = (): void => {
    if (this.cursorPosition.get() < 0) {
      this.cursorPosition.set(0);
      return;
    }
    // Don't allow moving cursor past empty characters
    const currentCharacter = this.inputText.get()[this.cursorPosition.get()];
    if (currentCharacter === undefined) {
      // This causes the blink animation to restart
      this.cursorPosition.notify();
    } else if (this.cursorPosition.get() >= this.maxInputLength.get()) {
      this.cursorPosition.set(this.maxInputLength.get());
    } else {
      this.cursorPosition.set(this.cursorPosition.get() + 1);
    }
  };

  /** Moves the cursor left, if possible. */
  private readonly moveCursorLeft = (): void => {
    if (this.cursorPosition.get() === 0) {
      // This causes the blink animation to restart
      this.cursorPosition.notify();
    } else if (this.cursorPosition.get() < 0) {
      this.cursorPosition.set(0);
    } else {
      this.cursorPosition.set(this.cursorPosition.get() - 1);
    }
  };

  /** Delays the cursor update to the next frame,
   * so that we can wait for the character elements to be updated,
   * and get the correct position and widths. */
  private readonly debounceCursorUpdate = (): void => {
    this._sidebarState.slot1.set('cancel');

    this.inputCursorRef.instance.classList.remove('blink');

    this.cursorDebounce.schedule(this.handleCursorChanged, 0);
  };

  /** Moves the cursor to the correct position. */
  private readonly handleCursorChanged = (): void => {
    const position = this.cursorPosition.get();
    if (position < 0) {
      let cursorWidth: number;
      const inputLength = this.inputText.get().length;
      if (inputLength === 0) {
        cursorWidth = this.underscoreWidth * this.maxInputLength.get();
      } else {
        const lastCharPosition = inputLength - 1;
        const pos = this.inputTextRef.instance.childNodes.item(lastCharPosition) as HTMLDivElement;
        cursorWidth = pos.offsetLeft + pos.offsetWidth;
      }
      this.inputCursorRef.instance.style.transform = `translate3d(${this.cursorStartX}px, 0px, 0px)`;
      this.inputCursorRef.instance.style.width = (cursorWidth) + 'px';
      this.inputCursorRef.instance.classList.remove('blink');
    } else if (position < this.maxInputLength.get()) {
      const pos = this.inputTextRef.instance.childNodes.item(position) as HTMLDivElement;
      const rect = pos.getBoundingClientRect();
      this.inputCursorRef.instance.style.transform = `translate3d(${rect.x}px, 0px, 0px)`;
      this.inputCursorRef.instance.style.width = (rect.width + this.cursorExtraWidth) + 'px';
      this.inputCursorRef.instance.classList.add('blink');
    } else {
      const pos = this.inputTextRef.instance.childNodes.item(position - 1) as HTMLDivElement;
      const rect = pos.getBoundingClientRect();
      this.inputCursorRef.instance.style.transform = `translate3d(${rect.x + rect.width + 2}px, 0px, 0px)`;
      this.inputCursorRef.instance.style.width = this.cursorThinWidth + 'px';
      this.inputCursorRef.instance.classList.add('blink');
    }
  };

  /** Rerenders all the input text. */
  private readonly updateInputDom = (): void => {
    const typedChars = this.inputText.get().split('');
    const suggestedChars = this.suggestedText.get().split('');
    const cursorPosition = this.cursorPosition.get();
    const length = cursorPosition === -1 && typedChars.length > 0 ? typedChars.length : this.maxInputLength.get();
    const typedClass = cursorPosition === -1 ? 'suggested' : 'typed';

    for (let i = 0; i < this.maxInputLength.get(); i++) {
      if (i >= length) {
        this.inputArray[i] = <div />;
        continue;
      }
      const highlight = cursorPosition === i
        ? ' blink'
        : cursorPosition < 0
          ? ' highlight'
          : '';
      if (typedChars[i] !== undefined) {
        this.inputArray[i] = <div class={typedClass + highlight}>{StringUtils.useZeroSlash(typedChars[i])}</div>;
      } else if (suggestedChars[i] !== undefined) {
        this.inputArray[i] = <div class="suggested">{StringUtils.useZeroSlash(suggestedChars[i])}</div>;
      } else {
        this.inputArray[i] = <div class={'underscore' + highlight} />;
      }
    }

    this.inputTextRef.instance.innerHTML = '';
    FSComponent.render(<>{this.inputArray}</>, this.inputTextRef.instance);
  };

  /**
   * A callback called when the search input box is updated.
   * @param debounce Whether to debounce the call to update autocomplete.
   */
  private onSearchUpdated(debounce = false): void {
    if (this.facilitySearchType === undefined) { return; }

    this.searchDebounce.clear();

    if (this.inputText.get() === '') {
      this.inputLabel.set('No matches found');
      this.selectedFacility.set(null);
      this.suggestedText.set('');
    } else {
      if (debounce) {
        this.searchDebounce.schedule(this.updateAutocomplete, 250);
      } else {
        this.updateAutocomplete();
      }
    }
  }

  /** Checks for matches with current input, and updates the label and suggested text. */
  private readonly updateAutocomplete = async (): Promise<void> => {
    const opId = ++this.searchOpId;

    const { exactMatches, suggestedMatch } = await this.searchFacilities(this.inputText.get(), opId);

    if (opId !== this.searchOpId) {
      return;
    }

    if (exactMatches) {
      this.facilityMatches = exactMatches;

      if (exactMatches.length === 1) {
        this.inputLabel.set(this.getFacilityString(exactMatches[0].facility));
        this.selectedFacility.set(exactMatches[0].facility);
      } else if (exactMatches.length > 1) {
        this.inputLabel.set('Duplicates found');
        this.selectedFacility.set(null);
      }

      this.suggestedText.set('');
    } else if (suggestedMatch) {
      this.facilityMatches = undefined;

      this.inputLabel.set(this.getFacilityString(suggestedMatch.facility));
      this.selectedFacility.set(suggestedMatch.facility);
      this.suggestedText.set(suggestedMatch.ident);
    } else {
      this.inputLabel.set('No matches found');
      this.selectedFacility.set(null);
      this.suggestedText.set('');
    }
  };

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
            .map<Promise<SearchResultWithFacility>>(async match => {
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
   * Get the facility string for the facility item.
   * @param facility The facility.
   * @returns The facility string for the facility.
   */
  private getFacilityString(facility: Facility): string {
    const facilityType = ICAO.getFacilityType(facility.icao);

    const separatedCity = facility.city.split(', ');
    const city = separatedCity.length > 1 ? Utils.Translate(separatedCity[0]) + ', ' + Utils.Translate(separatedCity[1]) : Utils.Translate(facility.city);
    const name = Utils.Translate(facility.name);
    const region = Utils.Translate(facility.region);

    if (facilityType === FacilityType.Airport) {
      return name;
    } else {
      if (city) {
        return city;
      }

      if (region) {
        return Regions.getName(region);
      }

      if (name) {
        return name;
      }

      return `${facility.lat.toFixed(4)}, ${facility.lon.toFixed(4)}`;
    }
  }

  /** Swaps the input mode between alpha and numeric. */
  private readonly onModeButtonPressed = (): void => {
    this.showNumpad.set(!this.showNumpad.get());
  };

  /** Opens the Find dialog. */
  private readonly onFindButtonPressed = async (): Promise<void> => {
    if (this.facilitySearchType === undefined) { return; }
    const result = await this.gtcService.openPopup<GtcFindWaypointDialog>(GtcViewKeys.FindWaypointDialog)
      .ref.request(this.facilitySearchType);
    if (!result.wasCancelled) {
      this.selectedFacility.set(result.payload.facility.get());
      this.resolve();
    }
  };

  /**
   * Renders the backspace button.
   * @returns The backpspace button.
   */
  private readonly renderBackspaceButton = (): VNode => (
    <TouchButton class="backspace wide" onPressed={this.onBackspaceButtonPressed}>
      <div class="backspace-label">Backspace</div>
      <img class="backspace-icon"
        src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_backspace_long.png' />
    </TouchButton>
  );

  /**
   * Clears this dialog's pending request and fulfills the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.keyboardDialogRef} class="keyboard-dialog">
        <div class="top-section">
          <div ref={this.inputBoxRef} class="input-box">
            <div ref={this.inputCursorRef} class="input-cursor" />
            <div ref={this.inputTextRef} class="input-text" />
          </div>
          <div class="input-label">
            {this.inputLabel}
          </div>
          <div ref={this.inputIconRef} class="input-icon">
            <GtcWaypointIcon waypoint={this.waypoint} />
          </div>
        </div>
        <div class="keyboard keyboard-alpha">
          <div class="row">
            {['A', 'B'].map(letter => (
              <TouchButton class="alpha" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
            ))}
            <TouchButton
              class="space"
              label="SPC"
              onPressed={this.onAlphaNumPressed(' ')}
              isVisible={this.isTopSpaceButtonVisible}
              isEnabled={this.isSpaceButtonEnabled}
            />
            <TouchButton
              class="find"
              onPressed={this.onFindButtonPressed}
              isVisible={this.isFindButtonVisible}
            >
              <img class="find-icon" src='coui://html_ui/Pages/VCockpit/Instruments/NavSystems/WTG3000/Assets/Images/GTC/icon_find.png' />
              <div class="find-label">Find</div>
            </TouchButton>
            <TouchButton
              class="mode-button wide"
              label={this.showNumpad.map(x => x ? 'ABC...' : '123...')}
              onPressed={this.onModeButtonPressed}
            />
            {this.renderBackspaceButton()}
          </div>
          <div class="row">
            {['C', 'D', 'E', 'F', 'G', 'H'].map(letter => (
              <TouchButton class="alpha" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
            ))}
          </div>
          <div class="row">
            {['I', 'J', 'K', 'L', 'M', 'N'].map(letter => (
              <TouchButton class="alpha" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
            ))}
          </div>
          <div class="row">
            {['O', 'P', 'Q', 'R', 'S', 'T'].map(letter => (
              <TouchButton class="alpha" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
            ))}
          </div>
          <div class="row">
            {['U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
              <TouchButton class="alpha" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
            ))}
          </div>
        </div>
        <div class="keyboard keyboard-numpad">
          <div class="column">
            {['N', 'S', 'E', 'W'].map(letter => (
              <TouchButton class="numpad" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
            ))}
          </div>
          <div class="numpad-group">
            <div class="row numpad-row">
              {['1', '2', '3'].map(letter => (
                <TouchButton class="numpad" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
              ))}
            </div>
            <div class="row numpad-row">
              {['4', '5', '6'].map(letter => (
                <TouchButton class="numpad" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
              ))}
            </div>
            <div class="row numpad-row">
              {['7', '8', '9'].map(letter => (
                <TouchButton class="numpad" label={letter} onPressed={this.onAlphaNumPressed(letter)} />
              ))}
            </div>
            <div class="row numpad-row">
              <TouchButton class="numpad" label={'0̸'} onPressed={this.onAlphaNumPressed('0')} />
            </div>
          </div>
          <TouchButton
            class="space numpad"
            label="SPC"
            onPressed={this.onAlphaNumPressed(' ')}
            isVisible={this.isBottomRightSpaceButtonVisible}
            isEnabled={this.isSpaceButtonEnabled}
          />
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.cleanupRequest();

    this.searchDebounce.clear();
    this.cursorDebounce.clear();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}