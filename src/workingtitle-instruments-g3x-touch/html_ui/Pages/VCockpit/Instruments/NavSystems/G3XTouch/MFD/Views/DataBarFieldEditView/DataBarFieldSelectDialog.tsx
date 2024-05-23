import { FSComponent, NodeReference, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { NavDataBarFieldModel, NavDataBarFieldModelFactory, NavDataField, NavDataFieldGpsValidity, NavDataFieldRenderer, NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';

import './DataBarFieldSelectDialog.css';

/**
 * A request input for {@link DataBarFieldSelectDialog}.
 */
export type DataBarFieldSelectDialogInput = {
  /** The initial navigation data field type to focus when opening the request. */
  initialValue: NavDataFieldType;
};

/**
 * Component props for DataBarFieldSelectDialog.
 */
export interface DataBarFieldSelectDialogProps extends UiViewProps {
  /** The factory to use to create data models for the dialog's data fields. */
  navDataBarFieldModelFactory: NavDataBarFieldModelFactory;

  /** The renderer to use to render the dialog's data fields. */
  navDataBarFieldRenderer: NavDataFieldRenderer;

  /** The GPS validity state for nav data fields. */
  navDataFieldGpsValidity: Subscribable<NavDataFieldGpsValidity>;
}

/**
 * A dialog which allows the user to select a CNS data bar field type.
 */
export class DataBarFieldSelectDialog extends AbstractUiView<DataBarFieldSelectDialogProps> implements UiDialogView<DataBarFieldSelectDialogInput, NavDataFieldType> {
  private static readonly FIELD_LABELS: Partial<Record<NavDataFieldType, string>> = {
    [NavDataFieldType.BearingToWaypoint]: 'Bearing\nto Waypoint', // TODO: Need to confirm wording
    [NavDataFieldType.CabinAltitude]: 'Cabin\nAltitude', // TODO: Need to confirm wording
    [NavDataFieldType.ClimbGradient]: 'Climb Gradient', // TODO: Need to confirm wording
    [NavDataFieldType.ClimbGradientPerDistance]: 'Climb Gradient\n(ALT/NM)', // TODO: Need to confirm wording
    [NavDataFieldType.CrossTrack]: 'Cross Track\nError', // TODO: Need to confirm wording
    [NavDataFieldType.DensityAltitude]: 'Density\nAltitude',
    [NavDataFieldType.DesiredTrack]: 'Desired\nTrack',
    [NavDataFieldType.DistanceToDestination]: 'Distance\n(Destination)',
    [NavDataFieldType.DistanceToWaypoint]: 'Distance\n(Next Waypoint)',
    [NavDataFieldType.FlightLevel]: 'Flight Level',
    [NavDataFieldType.FuelFlow]: 'Fuel Flow',
    [NavDataFieldType.FuelOverDestination]: 'Fuel Over\nDestination',
    // [NavDataFieldType.FuelUsed]: 'Fuel Used',
    [NavDataFieldType.FuelEconomy]: 'Fuel\nEconomy',
    [NavDataFieldType.Endurance]: 'Fuel\nEndurance',
    [NavDataFieldType.FuelOnBoard]: 'Fuel\nRemaining',
    [NavDataFieldType.GMeter]: 'G-Meter',
    // [NavDataFieldType.GlideRatio]: 'Glide Ratio',
    [NavDataFieldType.GpsAltitude]: 'GPS\nAltitude',
    [NavDataFieldType.GroundSpeed]: 'Ground Speed',
    [NavDataFieldType.GroundTrack]: 'Ground Track',
    [NavDataFieldType.AboveGroundLevel]: 'Height Above\nGround Level',
    [NavDataFieldType.ISA]: 'ISA Temp\nDeviation',
    [NavDataFieldType.MachNumber]: 'Mach Number',
    [NavDataFieldType.Waypoint]: 'Next\nWaypoint',
    [NavDataFieldType.OutsideTemperature]: 'Outside Air\nTemperature',
    [NavDataFieldType.RamAirTemperature]: 'Ram Air\nTemperature',
    [NavDataFieldType.TimeToDestination]: 'Time En Route\n(Destination)',
    [NavDataFieldType.TimeToWaypoint]: 'Time En Route\n(Next Waypoint)',
    [NavDataFieldType.TimeOfDestinationArrival]: 'Time of Arrival\n(Destination)',
    [NavDataFieldType.TimeOfWaypointArrival]: 'Time of Arrival\n(Next Waypoint)',
    [NavDataFieldType.LocalTime]: 'Time of Day\n(Local)', // TODO: Need to confirm wording
    [NavDataFieldType.UtcTime]: 'Time of Day\n(UTC)', // TODO: Need to confirm wording
  };

  private readonly listRef = FSComponent.createRef<UiList<any>>();

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 192 : 80;
  private readonly animateScrollToFocus = Subject.create(false);

  private readonly models: NavDataBarFieldModel<any>[] = [];

  private readonly buttonRefs = new Map<NavDataFieldType, NodeReference<UiTouchButton>>();

  private lastUpdateTime?: number;

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<NavDataFieldType> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritdoc */
  public request(input: DataBarFieldSelectDialogInput): Promise<UiDialogResult<NavDataFieldType>> {
    if (!this.isAlive) {
      throw new Error('DataBarFieldSelectDialog: cannot request from a dead dialog');
    }

    return new Promise<UiDialogResult<NavDataFieldType>>(resolve => {
      this.cleanupRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.buttonRefs.get(input.initialValue)?.instance.focusSelf();
      this.animateScrollToFocus.set(true);
    });
  }

  /** @inheritdoc */
  public onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    if (this.lastUpdateTime === undefined || time - this.lastUpdateTime >= 1000) {
      for (let i = 0; i < this.models.length; i++) {
        this.models[i].update();
      }
      this.lastUpdateTime = time;
    } else if (time < this.lastUpdateTime) {
      this.lastUpdateTime = time;
    }
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Resolves this dialog's pending request Promise if one exists.
   */
  private cleanupRequest(): void {
    this.animateScrollToFocus.set(false);
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when one of this dialog's selection buttons is pressed.
   * @param type The navigation data field type associated with the button that was pressed.
   */
  private onButtonPressed(type: NavDataFieldType): void {
    this.resultObject = {
      wasCancelled: false,
      payload: type
    };
    this.props.uiService.goBackMfd();
  }

  /** @inheritdoc */
  public render(): VNode {
    const renderButtonFunc = this.renderButton.bind(this);

    return (
      <div class='data-bar-field-select-dialog ui-view-panel'>
        <div class='data-bar-field-select-dialog-title'>Select Data Field</div>
        <UiList
          ref={this.listRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds}
          listItemLengthPx={this.listItemLengthPx}
          itemsPerPage={3}
          animateScrollToFocus={this.animateScrollToFocus}
          class='data-bar-field-select-dialog-list'
        >
          {
            (Object.entries(DataBarFieldSelectDialog.FIELD_LABELS) as [NavDataFieldType, string][])
              .reduce((rows, entry, index) => {
                // Two buttons per row.
                const rowIndex = Math.trunc(index / 2);
                (rows[rowIndex] ??= []).push(entry);
                return rows;
              }, [] as [NavDataFieldType, string][][])
              .map(row => {
                return (
                  <div class='data-bar-field-select-dialog-row'>
                    <UiListFocusable>
                      {row.map(renderButtonFunc)}
                    </UiListFocusable>
                  </div>
                );
              })
          }
        </UiList>
      </div>
    );
  }

  /**
   * Renders a navigation data field type selection button.
   * @param entry The entry describing the data field type for which to render the button, as `[type, label]`.
   * @returns A selection button for the specified navigation data field type, as a VNode.
   */
  private renderButton(entry: [NavDataFieldType, string]): VNode {
    const [type, label] = entry;

    const ref = FSComponent.createRef<UiTouchButton>();
    this.buttonRefs.set(type, ref);

    const model = this.props.navDataBarFieldModelFactory.create(type);
    this.models.push(model);

    const fieldNode = this.props.navDataBarFieldRenderer.render(type, model);

    return (
      <UiTouchButton
        ref={ref}
        isInList
        gduFormat={this.props.uiService.gduFormat}
        onPressed={this.onButtonPressed.bind(this, type)}
        onDestroy={() => { (fieldNode.instance as NavDataField<any>).destroy(); }}
        class='data-bar-field-select-dialog-button'
      >
        <div class='data-bar-field-select-dialog-button-title'>{label}</div>
        {fieldNode}
      </UiTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.listRef.getOrDefault()?.destroy();

    super.destroy();
  }
}