import { FSComponent, LatLonInterface, NodeReference, SetSubject, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { LatLonDisplayFormat } from '@microsoft/msfs-garminsdk';

import { G3000FilePaths } from '@microsoft/msfs-wtg3000-common';

import { NumberPad } from '../Components/NumberPad/NumberPad';
import { GtcImgTouchButton } from '../Components/TouchButton/GtcImgTouchButton';
import { GtcInteractionEvent } from '../GtcService/GtcInteractionEvent';
import { GtcView } from '../GtcService/GtcView';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';
import { G3000LatLonDisplayFormat, LatLonInput } from '../Components/LatLonInput/LatLonInput';
import { GtcDialogs } from './GtcDialogs';
import { GtcTouchButton } from '../Components';

import './GtcLatLonDialog.css';

/**
 * A request input for {@link GtcLatLonDialog}.
 */
export type GtcLatLonDialogInput = {
  /** The input format type to use. */
  format: G3000LatLonDisplayFormat;

  /** The latitude/longitude coordinates initially loaded into the dialog at the start of the request. */
  initialValue: LatLonInterface;

  /** The GTC view title to display while the request is active. */
  title?: string;
};

/**
 * A latitude/longitude input context.
 */
type GtcLatLonDialogContext = {
  /** A reference to the latitude/longitude input. */
  readonly inputRef: NodeReference<LatLonInput>;

  /** CSS classes for the latitude/longitude input. */
  readonly cssClass: SetSubject<string>;

  /** The latitude/longitude value. */
  readonly latLon: Subject<LatLonInterface>;

  /** The index of the longitude prefix character position. */
  readonly lonPrefixIndex: number;

  /** The message to display for an invalid latitude value. */
  readonly invalidLatMessage: string;

  /** The message to display for an invalid longitude value. */
  readonly invalidLonMessage: string;

  /** A subscription to the latitude/longitude input's editing state. */
  editingSub?: Subscription;
}

/**
 * A GTC dialog view which allows the user to select a set of latitude/longitude coordinates.
 */
export class GtcLatLonDialog extends GtcView implements GtcDialogView<GtcLatLonDialogInput, Readonly<LatLonInterface>> {
  private static readonly LATLON_EQUALS = (a: LatLonInterface, b: LatLonInterface): boolean => a.lat === b.lat && a.lon === b.lon;
  private static readonly LATLON_MUTATOR = (oldVal: LatLonInterface, newVal: LatLonInterface): void => {
    oldVal.lat = newVal.lat;
    oldVal.lon = newVal.lon;
  };

  private readonly contexts: Record<G3000LatLonDisplayFormat, GtcLatLonDialogContext> = {
    [LatLonDisplayFormat.HDDD_MMmm]: {
      inputRef: FSComponent.createRef<LatLonInput>(),
      cssClass: SetSubject.create(['latlon-dialog-input', 'latlon-dialog-input-dddmm', 'hidden']),
      latLon: Subject.create<LatLonInterface>({ lat: 0, lon: 0 }, GtcLatLonDialog.LATLON_EQUALS, GtcLatLonDialog.LATLON_MUTATOR),
      lonPrefixIndex: 7,
      invalidLatMessage: 'Invalid Entry\nLatitude must be between\n00°00.00\' and 89°59.99\'',
      invalidLonMessage: 'Invalid Entry\nLongitude must be between\n00°00.00\' and 180°00.00\''
    },
    [LatLonDisplayFormat.HDDD_MM_SSs]: {
      inputRef: FSComponent.createRef<LatLonInput>(),
      cssClass: SetSubject.create(['latlon-dialog-input', 'latlon-dialog-input-dddmmss', 'hidden']),
      latLon: Subject.create<LatLonInterface>({ lat: 0, lon: 0 }, GtcLatLonDialog.LATLON_EQUALS, GtcLatLonDialog.LATLON_MUTATOR),
      lonPrefixIndex: 8,
      invalidLatMessage: 'Invalid Entry\nLatitude must be between\n00°00\'00.0" and 89°59\'59.9"',
      invalidLonMessage: 'Invalid Entry\nLongitude must be between\n00°00\'00.0" and 180°00\'00.0"'
    }
  };

  private readonly numpadRef = FSComponent.createRef<NumberPad>();
  private readonly backspaceRef = FSComponent.createRef<GtcImgTouchButton>();
  private readonly nRef = FSComponent.createRef<GtcTouchButton>();
  private readonly sRef = FSComponent.createRef<GtcTouchButton>();
  private readonly eRef = FSComponent.createRef<GtcTouchButton>();
  private readonly wRef = FSComponent.createRef<GtcTouchButton>();

  private activeContext?: GtcLatLonDialogContext;

  private resolveFunction?: (value: GtcDialogResult<LatLonInterface>) => void;
  private resultObject: GtcDialogResult<LatLonInterface> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    this._sidebarState.dualConcentricKnobLabel.set('dataEntryPushEnterHold');
    this._sidebarState.slot5.set('enterEnabled');

    for (const key in this.contexts) {
      const context = this.contexts[key as G3000LatLonDisplayFormat];
      context.editingSub = context.inputRef.instance.isEditingActive.sub(isActive => {
        this.onEditingActiveChanged(isActive);
      });
    }
  }

  /** @inheritdoc */
  public request(input: GtcLatLonDialogInput): Promise<GtcDialogResult<LatLonInterface>> {
    if (!this.isAlive) {
      throw new Error('GtcLatLonDialog: cannot request from a dead dialog');
    }

    return new Promise((resolve) => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this._sidebarState.slot1.set(null);

      this.activeContext = this.contexts[input.format];

      this.activeContext.cssClass.delete('hidden');
      this.activeContext.inputRef.instance.setLatLon(input.initialValue);
      this.activeContext.inputRef.instance.refresh();
      this.activeContext.editingSub?.resume();

      this._title.set(input.title);
    });
  }

  /** @inheritDoc */
  public onResume(): void {
    this.activeContext?.inputRef.instance.refresh();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onGtcInteractionEvent(event: GtcInteractionEvent): boolean {
    switch (event) {
      case GtcInteractionEvent.InnerKnobInc:
        this.activeContext?.inputRef.instance.changeSlotValue(1);
        return true;
      case GtcInteractionEvent.InnerKnobDec:
        this.activeContext?.inputRef.instance.changeSlotValue(-1);
        return true;
      case GtcInteractionEvent.OuterKnobInc:
        this.activeContext?.inputRef.instance.moveCursor(1, true);
        return true;
      case GtcInteractionEvent.OuterKnobDec:
        this.activeContext?.inputRef.instance.moveCursor(-1, true);
        return true;
      case GtcInteractionEvent.InnerKnobPush:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.InnerKnobPushLong:
        this.validateValueAndClose();
        return true;
      case GtcInteractionEvent.ButtonBarEnterPressed:
        this.validateValueAndClose();
        return true;
      default:
        return false;
    }
  }

  /**
   * Validates the currently selected value, and if valid sets the value to be returned for the currently pending
   * request and closes this dialog.
   */
  private async validateValueAndClose(): Promise<void> {
    if (this.activeContext !== undefined) {
      const latLon = this.activeContext.latLon.get();

      if (latLon.lat <= -90 || latLon.lat >= 90) {
        const result = await GtcDialogs.openMessageDialog(this.props.gtcService, this.activeContext.invalidLatMessage, false);

        if (result) {
          this.activeContext.inputRef.instance.deactivateEditing();
        }
        return;
      }

      if (latLon.lon < -180 || latLon.lon > 180) {
        const result = await GtcDialogs.openMessageDialog(this.props.gtcService, this.activeContext.invalidLonMessage, false);

        if (result) {
          this.activeContext.inputRef.instance.deactivateEditing();
        }
        return;
      }

      this.resultObject = {
        wasCancelled: false,
        payload: latLon
      };

      this.props.gtcService.goBack();
    }
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    if (this.activeContext !== undefined) {
      this.activeContext.inputRef.instance.deactivateEditing();
      this.activeContext.cssClass.add('hidden');
      this.activeContext.editingSub?.pause();

      this.activeContext = undefined;
    }

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's number pad buttons is pressed.
   * @param value The value of the button that was pressed.
   */
  protected onNumberPressed(value: number): void {
    if (this.activeContext !== undefined) {
      if (this.activeContext.inputRef.instance.isEditingActive.get()) {
        // Editing is active -> if the cursor is on one of the prefix slots, move it to the next position before
        // setting the number value.
        const selectedIndex = this.activeContext.inputRef.instance.cursorPosition.get();
        if (selectedIndex === 0 || selectedIndex === this.activeContext.lonPrefixIndex) {
          this.activeContext.inputRef.instance.moveCursor(1, false);
        }
      } else {
        // Editing is inactive -> place the cursor at the first numeric character position before setting the number value.
        this.activeContext.inputRef.instance.placeCursor(1, false);
      }

      this.activeContext.inputRef.instance.setSlotCharacterValue(`${value}`);
    }
  }

  /**
   * Responds to when this dialog's backspace button is pressed.
   */
  protected onBackspacePressed(): void {
    this.activeContext?.inputRef.instance.backspace();
  }

  /**
   * Responds to when the editing state of this dialog's active input changes.
   * @param isEditingActive Whether editing is active for this dialog's active input.
   */
  private onEditingActiveChanged(isEditingActive: boolean): void {
    if (isEditingActive) {
      this._sidebarState.slot1.set('cancel');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='latlon-dialog'>
        {this.renderHDDDMMmmInput()}
        {this.renderHDDDMMSSsInput()}
        <NumberPad
          ref={this.numpadRef}
          onNumberPressed={this.onNumberPressed.bind(this)}
          class='latlon-dialog-numpad'
          orientation={this.props.gtcService.orientation}
        />
        <GtcImgTouchButton
          ref={this.backspaceRef}
          label='BKSP'
          imgSrc={`${G3000FilePaths.ASSETS_PATH}/Images/GTC/icon_backspace_long.png`}
          onPressed={this.onBackspacePressed.bind(this)}
          class='latlon-dialog-backspace'
        />
        <div class='latlon-dialog-prefix-column'>
          <GtcTouchButton
            ref={this.nRef}
            label='N'
            onPressed={() => { this.activeContext?.inputRef.instance.setLatSign(1); }}
            class='latlon-dialog-prefix-button'
          />
          <GtcTouchButton
            ref={this.nRef}
            label='S'
            onPressed={() => { this.activeContext?.inputRef.instance.setLatSign(-1); }}
            class='latlon-dialog-prefix-button'
          />
          <GtcTouchButton
            ref={this.nRef}
            label='E'
            onPressed={() => { this.activeContext?.inputRef.instance.setLonSign(1); }}
            class='latlon-dialog-prefix-button'
          />
          <GtcTouchButton
            ref={this.nRef}
            label='W'
            onPressed={() => { this.activeContext?.inputRef.instance.setLonSign(-1); }}
            class='latlon-dialog-prefix-button'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders this dialog's input for the HDDD MM.mm format.
   * @returns This dialog's input for the HDDD MM.mm format, as a VNode.
   */
  private renderHDDDMMmmInput(): VNode {
    const context = this.contexts[LatLonDisplayFormat.HDDD_MMmm];

    return (
      <LatLonInput
        ref={context.inputRef}
        format={LatLonDisplayFormat.HDDD_MMmm}
        latLon={context.latLon}
        class={context.cssClass}
      />
    );
  }

  /**
   * Renders this dialog's input for the HDDD MM SS.s format.
   * @returns This dialog's input for the HDDD MM SS.s format, as a VNode.
   */
  private renderHDDDMMSSsInput(): VNode {
    const context = this.contexts[LatLonDisplayFormat.HDDD_MM_SSs];

    return (
      <LatLonInput
        ref={context.inputRef}
        format={LatLonDisplayFormat.HDDD_MM_SSs}
        latLon={context.latLon}
        class={context.cssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.contexts[LatLonDisplayFormat.HDDD_MMmm].inputRef.getOrDefault()?.destroy();
    this.contexts[LatLonDisplayFormat.HDDD_MM_SSs].inputRef.getOrDefault()?.destroy();

    this.numpadRef.getOrDefault()?.destroy();
    this.backspaceRef.getOrDefault()?.destroy();
    this.nRef.getOrDefault()?.destroy();
    this.sRef.getOrDefault()?.destroy();
    this.eRef.getOrDefault()?.destroy();
    this.wRef.getOrDefault()?.destroy();

    super.destroy();
  }
}
