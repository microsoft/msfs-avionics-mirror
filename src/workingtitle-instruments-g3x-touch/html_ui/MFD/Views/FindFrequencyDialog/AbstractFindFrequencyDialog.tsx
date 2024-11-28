import { FSComponent, ReadonlyFloat64Array, Subject, Vec2Math, VNode } from '@microsoft/msfs-sdk';

import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { DefaultRadioSavedFrequenciesDataProvider } from '../../../Shared/DataProviders/RadioSavedFrequenciesDataProvider';
import { GduFormat } from '../../../Shared/CommonTypes';
import { TabbedContainer } from '../../../Shared/Components/TabbedContainer/TabbedContainer';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiViewSizeMode } from '../../../Shared/UiSystem/UiViewTypes';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { PositionHeadingDataProvider } from '../../../Shared/Navigation';

/** Configuration for a Find Frequency List */
export interface FindFrequencyListConfiguration {
  /** Height of each item in pixels */
  itemHeightPx: number;
  /** Number of items to show per page */
  itemsPerPage: number;
  /** Spacing between each item in pixels */
  itemSpacingPx: number;
  /** Height of the list in pixels */
  listHeightPx: number;
}

/**
 * The props of a generic find frequency dialog.
 */
export interface AbstractFindFrequencyDialogProps extends UiViewProps {
  /** The saved frequencies data provider. */
  savedFrequenciesProvider: DefaultRadioSavedFrequenciesDataProvider;
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: PositionHeadingDataProvider;
}

/**
 * The input of a generic find frequency dialog.
 */
export interface AbstractFindFrequencyDialogInput {
  /** The index of the radio to find a frequency for. */
  radioIndex: 1 | 2;
}

/**
 * The output of a generic find frequency dialog.
 */
export interface AbstractFindFrequencyDialogOutput {
  /** The frequency that was selected in Hz, rounded to 5000 Hz (5 KHz) */
  frequency: number;
  /** The name of the radio station that was selected */
  name?: string;
}

/**
 * A generic find frequency dialog context.
 */
export type AbstractFindFrequencyDialogContext = {
  /** Whether this context's input is hidden. */
  readonly hidden: Subject<boolean>;
  /** The index of the radio to find a frequency for. */
  radioIndex: 1 | 2;
}

/**
 * A dialog that allows the user to find a frequency.
 */
export abstract class AbstractFindFrequencyDialog<I extends AbstractFindFrequencyDialogInput, O extends AbstractFindFrequencyDialogOutput>
  extends AbstractUiView<AbstractFindFrequencyDialogProps>
  implements UiDialogView<I, O> {

  private readonly FREQUENCY_LIST_CONFIGURATIONS: Map<GduFormat, FindFrequencyListConfiguration> = new Map([
    ['460', {
      itemHeightPx: 82,
      itemsPerPage: 5,
      itemSpacingPx: 0,
      listHeightPx: 410,
    }],
    // TODO: specify 470 numbers, these are the 460 numbers as placeholder
    ['470', {
      itemHeightPx: 82,
      itemsPerPage: 5,
      itemSpacingPx: 0,
      listHeightPx: 410,
    }],
  ]);

  protected freqListConfig = this.FREQUENCY_LIST_CONFIGURATIONS.get(this.props.uiService.gduFormat)
    || {
      itemHeightPx: 82,
      itemsPerPage: 5,
      itemSpacingPx: 0,
      listHeightPx: 410,
    };

  protected thisNode?: VNode;

  protected readonly tabbedContainerRef = FSComponent.createRef<TabbedContainer>();

  protected contexts: AbstractFindFrequencyDialogContext = {
    hidden: Subject.create<boolean>(false),
    radioIndex: 1,
  };

  protected activeContext?: AbstractFindFrequencyDialogContext;

  protected readonly backButtonLabel = Subject.create('');
  protected readonly backButtonImgSrc = Subject.create('');

  protected readonly dimensions = Vec2Math.create();
  protected readonly tabLength = Subject.create(123); // pixels
  protected readonly tabSpacing = Subject.create(8); // pixels

  protected resolveFunction?: (value: UiDialogResult<O>) => void;
  protected resultObject: UiDialogResult<O> = {
    wasCancelled: true,
  };

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    this.thisNode = node;

    this.tabbedContainerRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public abstract request(input: I): Promise<UiDialogResult<O>>;


  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
    this.tabbedContainerRef.instance.open();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.tabbedContainerRef.instance.close();
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.tabbedContainerRef.instance.resume();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.tabbedContainerRef.instance.pause();
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    super.onUpdate(time);
    this.tabbedContainerRef.instance.update(time);
  }

  /**
   * Responds to when this display's parent view is resized while open.
   * @param sizeMode The new size mode of this display's parent view.
   * @param dimensions The new dimensions of this display, as `[width, height]` in pixels.
   */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.tabbedContainerRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Responds to when a frequency is selected.
   * @param frequency The frequency that was selected.
   * @param name (optional) The name of the radio station that was selected
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected abstract onFrequencySelected(frequency: number, name?: string): void;

  /**
   * Updates this display when the size of its parent view changes.
   * @param sizeMode The new size mode of this display's parent view.
   * @param dimensions The new dimensions of this display, as `[width, height]` in pixels.
   */
  protected updateFromSize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    Vec2Math.copy(dimensions, this.dimensions);
    if (this.props.uiService.gduFormat === '460') {
      if (this.dimensions[0] <= 531) {
        this.tabLength.set(113);
      } else if (this.dimensions[0] <= 555) {
        this.tabLength.set(119);
      } else {
        this.tabLength.set(123);
      }
    }
    // TODO: Implement GDU470 support.
  }

  /**
   * Clears this dialog's pending request and resolves the pending request Promise if one exists.
   */
  protected cleanupRequest(): void {
    if (this.activeContext) {
      this.activeContext.hidden.set(true);
      this.activeContext = undefined;
    }

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when this dialog's back button is pressed.
   */
  protected onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public abstract render(): VNode;

  /** @inheritDoc */
  public destroy(): void {
    this.cleanupRequest();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
