import { ComponentProps, EventBus, DisplayComponent, VNode, FSComponent, Subject, ClockEvents, Subscription } from '@microsoft/msfs-sdk';
import { DefaultNavDataBarFieldModelFactory, Fms, NavDataBarFieldModel, NavDataFieldGpsValidity, NavDataFieldType, UnitsUserSettings } from '@microsoft/msfs-garminsdk';
import { Sr22tDestAirportInfoFieldRenderer } from './Sr22tDestAirportInfoFieldRenderer';

import './Sr22tDestAirportInfoDisplay.css';

/** The properties for the {@link Sr22tDestAirportInfoDisplay} component. */
interface Sr22tDestAirportInfoDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** The FMS. */
  fms: Fms;

  /** The update frequency of the data fields, in hertz. */
  updateFreq: number;
}

/**
 * The Sr22tDestAirportInfoComponent.
 * Displays Destination Airport Information, including:
 * - Destination airport ident
 * - Enroute distance
 * - Estimated time enroute
 * - Bearing to airport
 * - Fuel remaining at airport
 */
export class Sr22tDestAirportInfoDisplay extends DisplayComponent<Sr22tDestAirportInfoDisplayProps> {
  private readonly fieldTypes = [
    NavDataFieldType.Destination,
    NavDataFieldType.TimeToDestination,
    NavDataFieldType.FuelOverDestination,
    NavDataFieldType.DistanceToDestination,
    NavDataFieldType.BearingToWaypoint,
  ];

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.bus);

  private readonly modelFactory = new DefaultNavDataBarFieldModelFactory(
    this.props.bus,
    this.props.fms,
    Subject.create(NavDataFieldGpsValidity.Valid),
  );

  private readonly fieldRenderer = new Sr22tDestAirportInfoFieldRenderer(this.unitsSettingManager);

  private readonly fieldSlots: VNode[] = Array.from(
    { length: this.fieldTypes.length },
    () => <div class='nav-data-bar-field-slot' />
  );
  private readonly models: NavDataBarFieldModel<any>[] = [];

  private clockSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    for (const [index, type] of this.fieldTypes.entries()) {
      const model = this.modelFactory.create(type);
      model.update();
      const field = this.fieldRenderer.render(type, model);

      FSComponent.render(field, this.fieldSlots[index].instance as HTMLDivElement);
      this.models[index] = model;
    }

    this.clockSub = this.props.bus.getSubscriber<ClockEvents>().on('realTime').whenChangedBy(1000 / this.props.updateFreq).handle(this.onUpdated.bind(this));
  }

  /** Responds to update events. */
  private onUpdated(): void {
    for (let i = 0; i < this.fieldTypes.length; i++) {
      this.models[i].update();
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="sr22t-dest-airport-info-display">
        {this.fieldSlots}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.clockSub?.destroy();

    for (let i = 0; i < this.fieldTypes.length; i++) {
      this.models[i]?.destroy();
    }
  }
}