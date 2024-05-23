import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MappedSubscribable, ObjectSubject, Subscribable, SubscribableUtils, Subscription, UnitType, UserSetting, VNode,
} from '@microsoft/msfs-sdk';
import { UnitsWeightSettingMode } from '@microsoft/msfs-wtg1000';

import './Sr22tWBFields.css';

/** The object containing all display data for a single display field. */
export type DisplayFieldData = ObjectSubject<{
  /** The title of the field. */
  title: string;
  /** The value of the field. */
  value: Subscribable<number>;
  /** The weight unit setting. */
  weightUnit: UserSetting<UnitsWeightSettingMode>;
}>;

/** The properties for the {@link Sr22tWBDisplayField} component. */
export interface DisplayFieldProps extends ComponentProps {
  /** The `DisplayFieldData` object. */
  data: DisplayFieldData;
  /** The callback function defining how the final display value string is generated. */
  valueCallback?: (value: number) => string;
  /** If not specified, the weight unit default label will be displayed. */
  unitLabel?: Subscribable<string> | string;
  /** Whether the display field is in warning state. */
  isWarning?: Subscribable<boolean> | boolean;
}

/** Displays a single field of title and value in `AUX - Weight and Balance` page. */
export class Sr22tWBDisplayField extends DisplayComponent<DisplayFieldProps> {
  private readonly ref = FSComponent.createRef<HTMLDivElement>();

  private readonly isWarning = SubscribableUtils.toSubscribable(this.props.isWarning ?? false, true);

  private warningSubscription?: Subscription;

  private readonly unitAsString = this.props.unitLabel
    ? SubscribableUtils.toSubscribable(this.props.unitLabel, true)
    : this.props.data.get().weightUnit.map(v => v === UnitsWeightSettingMode.Pounds ? 'LB' : 'KG');

  private readonly valueAsString: MappedSubscribable<string> = MappedSubject.create(([value, weightUnit]) => {
    if (value < 0) {
      return '_ _ _ _';
    } else {
      if (this.props.valueCallback) {
        return this.props.valueCallback(value);
      }

      return weightUnit === UnitsWeightSettingMode.Pounds ? value.toString()
        : UnitType.POUND.convertTo(value, UnitType.KILOGRAM).toFixed(0);
    }
  }, this.props.data.get().value, this.props.data.get().weightUnit);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.warningSubscription = this.isWarning.sub((isWarning) => this.ref.instance.classList.toggle('warning', isWarning), true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='wb-labeled-number' ref={this.ref}>
        <div class='wb-labeled-number-title'>{this.props.data.get().title}</div>
        <div class='wb-labeled-number-value'>{this.valueAsString}</div>
        <div class='wb-labeled-number-unit'>{this.unitAsString}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.warningSubscription?.destroy();
  }
}
