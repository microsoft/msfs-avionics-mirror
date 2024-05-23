import { ArraySubject, FSComponent, LegDefinition, NodeReference, Subject, Subscription, VNode } from '@microsoft/msfs-sdk';

import { DynamicListData } from '@microsoft/msfs-garminsdk';

import { FmsFlightPlanningConfig } from '../../../../../Shared/AvionicsConfig/FmsConfig';
import { UiList } from '../../../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../../../Shared/Components/List/UiListFocusable';
import { UiValueTouchButton } from '../../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { DefaultFlightPlanDataFieldCalculatorRepo } from '../../../../../Shared/FlightPlan/DefaultFlightPlanDataFieldCalculatorRepo';
import { DefaultFlightPlanDataFieldFactory } from '../../../../../Shared/FlightPlan/DefaultFlightPlanDataFieldFactory';
import { FlightPlanDataField, FlightPlanDataFieldType } from '../../../../../Shared/FlightPlan/FlightPlanDataField';
import { FlightPlanDataItemType, FlightPlanLegDataItem } from '../../../../../Shared/FlightPlan/FlightPlanDataItem';
import { ActiveFlightPlanDataArray } from '../../../../../Shared/FlightPlan/ActiveFlightPlanDataArray';
import { G3XFms } from '../../../../../Shared/FlightPlan/G3XFms';
import { G3XFplSourceDataProvider } from '../../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XExternalFplSourceIndex, G3XFplSource } from '../../../../../Shared/FlightPlan/G3XFplSourceTypes';
import { FplCalculationUserSettings } from '../../../../../Shared/Settings/FplCalculationUserSettings';
import { G3XDateTimeUserSettings } from '../../../../../Shared/Settings/G3XDateTimeUserSettings';
import { G3XUnitsUserSettings } from '../../../../../Shared/Settings/G3XUnitsUserSettings';
import { AbstractUiView } from '../../../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../../../Shared/UiSystem/UiView';
import { UiViewSizeMode } from '../../../../../Shared/UiSystem/UiViewTypes';
import { MfdFplPageDataFieldRenderer } from './MfdFplPageDataFieldRenderer';
import { MfdFplPageDataFieldSlot } from './MfdFplPageDataFieldSlot';

import './MfdFplPageDataFieldSelectDialog.css';

/**
 * Component props for {@link MfdFplPageDataFieldSelectDialog}.
 */
export interface MfdFplPageDataFieldSelectDialogProps extends UiViewProps {
  /** The FMS. */
  fms: G3XFms;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A configuration object defining options for flight planning. */
  flightPlanningConfig: FmsFlightPlanningConfig;
}

/**
 * A request input for {@link MfdFplPageDataFieldSelectDialog}.
 */
export type MfdFplPageDataFieldSelectDialogInput = {
  /** The initial data field type to focus when opening the request. */
  initialValue: FlightPlanDataFieldType;

  /**
   * The flight plan leg whose associated data field values should be previewed in the dialog, or `null` if no data
   * field values should be previewed.
   */
  previewLeg: LegDefinition | null;
};

/**
 * A description of a flight plan data field type selection button.
 */
type DataFieldTypeButtonEntry = {
  /** The index of the data field type associated with this entry's button. */
  index: number;

  /** The data field type associated with this entry's button. */
  type: FlightPlanDataFieldType;

  /** The data field to preview in this entry's button. */
  dataField: Subject<FlightPlanDataField | null>;

  /** The label text of this entry's button. */
  buttonLabel: string;

  /** A reference to this entry's rendered button. */
  buttonRef: NodeReference<UiValueTouchButton<any>>;
};

/**
 * A dialog that allows the user to select an MFD FPL page flight plan data field type.
 */
export class MfdFplPageDataFieldSelectDialog extends AbstractUiView<MfdFplPageDataFieldSelectDialogProps>
  implements UiDialogView<MfdFplPageDataFieldSelectDialogInput, FlightPlanDataFieldType> {

  private static readonly FIELD_LABELS: Partial<Record<FlightPlanDataFieldType, string>> = {
    [FlightPlanDataFieldType.CumulativeDistance]: 'Cumulative\nDistance',
    [FlightPlanDataFieldType.CumulativeEte]: 'Cumulative\nETE',
    [FlightPlanDataFieldType.CumulativeFuel]: 'Cumulative\nFuel',
    [FlightPlanDataFieldType.Dtk]: 'Leg\nDesired Track',
    [FlightPlanDataFieldType.Eta]: 'Estimated\nTime of Arrival',
    [FlightPlanDataFieldType.FuelRemaining]: 'Fuel Remaining\nAt Waypoint',
    [FlightPlanDataFieldType.LegDistance]: 'Leg\nDistance',
    [FlightPlanDataFieldType.LegEte]: 'Leg\nETE',
    [FlightPlanDataFieldType.LegFuel]: 'Leg\nFuel',
    // TODO: Disabling these until the calculations are implemented.
    // [FlightPlanDataFieldType.Sunrise]: 'Sunrise\nAt Waypoint',
    // [FlightPlanDataFieldType.Sunset]: 'Sunset\nAt Waypoint'
  };

  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 187 : 80;
  private readonly animateScrollToFocus = Subject.create(false);

  private readonly dataFieldTypeButtonEntries = new Map<FlightPlanDataFieldType, DataFieldTypeButtonEntry>(
    (Object.entries(MfdFplPageDataFieldSelectDialog.FIELD_LABELS) as [FlightPlanDataFieldType, string][]).map(([type, label], index) => {
      return [
        type,
        {
          index,
          type,
          dataField: Subject.create<FlightPlanDataField | null>(null),
          buttonLabel: label,
          buttonRef: FSComponent.createRef<UiValueTouchButton<any>>()
        }
      ];
    })
  );

  private readonly row2Array = [...this.dataFieldTypeButtonEntries.entries()]
    .reduce((rows, [, entry], index) => {
      // Two buttons per row.
      const rowIndex = Math.trunc(index / 2);
      (rows[rowIndex] ??= []).push(entry);
      return rows;
    }, [] as Readonly<DataFieldTypeButtonEntry>[][]);
  private readonly row4Array = [...this.dataFieldTypeButtonEntries.entries()]
    .reduce((rows, [, entry], index) => {
      // Four buttons per row.
      const rowIndex = Math.trunc(index / 4);
      (rows[rowIndex] ??= []).push(entry);
      return rows;
    }, [] as Readonly<DataFieldTypeButtonEntry>[][]);

  private activeRowArray?: Readonly<DataFieldTypeButtonEntry>[][];
  private readonly rowArray = ArraySubject.create<Readonly<DataFieldTypeButtonEntry>[] & DynamicListData>([]);

  private focusedDataFieldType?: FlightPlanDataFieldType;

  private readonly fplCalculationSettingManager = FplCalculationUserSettings.getManager(this.props.uiService.bus);

  private readonly fplDataFieldCalculatorRepo = new DefaultFlightPlanDataFieldCalculatorRepo(
    this.props.uiService.bus,
    this.props.uiService.gduIndex,
    this.fplCalculationSettingManager.getSetting('fplSpeed'),
    this.fplCalculationSettingManager.getSetting('fplFuelFlow'),
    {
      supportSensedFuelFlow: this.props.flightPlanningConfig.supportSensedFuelFlow,
      fuelOnBoardType: this.props.flightPlanningConfig.fuelOnBoardType
    }
  );

  private readonly fplDataFieldRenderer = new MfdFplPageDataFieldRenderer(
    false,
    G3XUnitsUserSettings.getManager(this.props.uiService.bus),
    G3XDateTimeUserSettings.getManager(this.props.uiService.bus)
  );

  private readonly fplDataArray = new ActiveFlightPlanDataArray(
    new DefaultFlightPlanDataFieldFactory(),
    this.fplDataFieldCalculatorRepo,
    {
      dataFieldCount: this.dataFieldTypeButtonEntries.size
    }
  );

  private isRequestPending = false;
  private requestInitialValue = FlightPlanDataFieldType.CumulativeDistance;
  private requestPreviewLeg: LegDefinition | null = null;
  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<FlightPlanDataFieldType> = {
    wasCancelled: true,
  };

  private isAlive = true;
  private isOpen = false;

  private fplSourceSub?: Subscription;

  /**
   * Creates a new instance of MfdFplPageDataFieldSelectDialog.
   * @param props The properties of the component.
   */
  public constructor(props: MfdFplPageDataFieldSelectDialogProps) {
    super(props);

    for (const entry of this.dataFieldTypeButtonEntries.values()) {
      this.fplDataArray.setDataFieldType(entry.index, entry.type);
    }
  }

  /** @inheritDoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);

    this.fplSourceSub = this.props.fplSourceDataProvider.source.sub(this.onFplSourceChanged.bind(this), false, true);
  }

  /**
   * Responds to when the flight plan source changes.
   * @param source The new flight plan source.
   */
  private onFplSourceChanged(source: G3XFplSource): void {
    if (source === G3XFplSource.Internal || source === G3XFplSource.InternalRev) {
      this.fplDataFieldCalculatorRepo.setLNavIndex(this.props.fplSourceDataProvider.internalSourceDef.lnavIndex);
      this.fplDataArray.setFlightPlanner(false, this.props.fms.internalFms.flightPlanner);
    } else {
      this.updateFplArrayFromExternalSource(source === G3XFplSource.External1 ? 1 : 2);
    }
  }

  /**
   * Updates this dialog's flight plan data array from an external flight plan source.
   * @param index The index of the external flight plan source from which to update the array.
   */
  private updateFplArrayFromExternalSource(index: G3XExternalFplSourceIndex): void {
    const def = this.props.fplSourceDataProvider.externalSourceDefs[index];

    this.fplDataFieldCalculatorRepo.setLNavIndex(def?.lnavIndex ?? -1);
    this.fplDataArray.setFlightPlanner(true, def?.fms.flightPlanner ?? null);
  }

  /** @inheritDoc */
  public request(input: MfdFplPageDataFieldSelectDialogInput): Promise<UiDialogResult<FlightPlanDataFieldType>> {
    if (!this.isAlive) {
      throw new Error('MfdFplPageDataFieldSelectDialog: cannot request from a dead dialog');
    }

    return new Promise<UiDialogResult<FlightPlanDataFieldType>>(resolve => {
      this.cleanupRequest();

      this.isRequestPending = true;
      ({ initialValue: this.requestInitialValue, previewLeg: this.requestPreviewLeg } = input);

      this.fplSourceSub?.resume(true);
      this.fplDataArray.resume();
      this.fplDataArray.calculateDataFields();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.setPreviewLeg(this.requestPreviewLeg);

      if (this.isOpen) {
        this.dataFieldTypeButtonEntries.get(this.requestInitialValue)?.buttonRef.instance.focusSelf();
        this.animateScrollToFocus.set(true);
      }
    });
  }

  /**
   * Sets the flight plan leg whose associated data field values are previewed in this dialog.
   * @param leg The flight plan leg whose associated data field values are to be previewed, or `null` if no data field
   * values are to be previewed.
   */
  private setPreviewLeg(leg: LegDefinition | null): void {
    const dataItem = leg
      ? this.fplDataArray.getArray().find(item => item.type === FlightPlanDataItemType.Leg && item.leg === leg) as FlightPlanLegDataItem | undefined
      : undefined;

    for (const entry of this.dataFieldTypeButtonEntries.values()) {
      entry.dataField.set(dataItem ? dataItem.dataFields[entry.index].get() : null);
    }
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode): void {
    this.isOpen = true;
    this.handleResize(sizeMode);

    if (this.isRequestPending) {
      this.setPreviewLeg(this.requestPreviewLeg);

      this.dataFieldTypeButtonEntries.get(this.requestInitialValue)?.buttonRef.instance.focusSelf();
      this.animateScrollToFocus.set(true);
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onResize(sizeMode: UiViewSizeMode): void {
    this.handleResize(sizeMode);
  }

  /**
   * Handles when this dialog is resized while open.
   * @param sizeMode This dialog's new size mode.
   */
  private handleResize(sizeMode: UiViewSizeMode): void {
    const newArray = this.props.uiService.gduFormat === '460' && sizeMode === UiViewSizeMode.Full
      ? this.row4Array
      : this.row2Array;

    if (newArray === this.activeRowArray) {
      return;
    }

    const typeToFocus = this.focusedDataFieldType;

    this.activeRowArray = newArray;
    this.rowArray.set(newArray);

    // If a button was focused before the resize, then make sure the corresponding button is focused after the resize.
    if (typeToFocus !== undefined) {
      const oldAnimateScrollToFocus = this.animateScrollToFocus.get();
      this.animateScrollToFocus.set(false);
      this.dataFieldTypeButtonEntries.get(typeToFocus)?.buttonRef.instance.focusSelf();
      if (oldAnimateScrollToFocus) {
        this.animateScrollToFocus.set(true);
      }
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Resolves this dialog's pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    if (!this.isRequestPending) {
      return;
    }

    this.isRequestPending = false;
    this.requestPreviewLeg = null;
    this.fplSourceSub!.pause();
    this.fplDataArray.pause();
    this.animateScrollToFocus.set(false);
    this.listRef.getOrDefault()?.clearRecentFocus();

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's selection buttons is pressed.
   * @param type The data field type associated with the button that was pressed.
   */
  private onButtonPressed(type: FlightPlanDataFieldType): void {
    this.resultObject = {
      wasCancelled: false,
      payload: type
    };
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-page-data-field-select-dialog ui-view-panel'>
        <div class='mfd-fpl-page-data-field-select-dialog-title'>Select Data Field</div>
        <UiList
          ref={this.listRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds}
          data={this.rowArray}
          renderItem={this.renderRow.bind(this)}
          listItemLengthPx={this.listItemLengthPx}
          itemsPerPage={3}
          animateScrollToFocus={this.animateScrollToFocus}
          autoDisableOverscroll
          class='mfd-fpl-page-data-field-select-dialog-list'
        />
      </div>
    );
  }

  private readonly renderButtonFunc = this.renderButton.bind(this);

  /**
   * Renders a row of flight plan data field type selection buttons.
   * @param buttonEntries Entries describing the buttons to render in the row.
   * @returns A row of the specified flight plan data field type selection buttons, as a VNode.
   */
  private renderRow(buttonEntries: Readonly<DataFieldTypeButtonEntry>[]): VNode {
    return (
      <div class='mfd-fpl-page-data-field-select-dialog-row'>
        <UiListFocusable>
          {buttonEntries.map(this.renderButtonFunc)}
        </UiListFocusable>
      </div>
    );
  }

  /**
   * Renders a flight plan data field type selection button.
   * @param entry The entry describing the button to render.
   * @returns A selection button for the specified flight plan data field type, as a VNode.
   */
  private renderButton(entry: Readonly<DataFieldTypeButtonEntry>): VNode {
    return (
      <UiValueTouchButton
        ref={entry.buttonRef}
        label={entry.buttonLabel}
        state={entry.dataField}
        renderValue={
          <MfdFplPageDataFieldSlot
            index={0}
            dataField={entry.dataField}
            renderer={this.fplDataFieldRenderer}
          />
        }
        onFocusGained={() => this.focusedDataFieldType = entry.type}
        onFocusLost={() => this.focusedDataFieldType = undefined}
        isInList
        gduFormat={this.props.uiService.gduFormat}
        onPressed={this.onButtonPressed.bind(this, entry.type)}
        class='mfd-fpl-page-data-field-select-dialog-button'
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.listRef.getOrDefault()?.destroy();

    this.fplSourceSub?.destroy();

    super.destroy();
  }
}
