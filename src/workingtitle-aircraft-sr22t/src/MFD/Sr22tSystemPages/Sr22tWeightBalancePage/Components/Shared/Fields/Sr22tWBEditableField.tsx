import { ComponentProps, DisplayComponent, FSComponent, MutableSubscribable, ObjectSubject, UserSetting, VNode } from '@microsoft/msfs-sdk';

import { ScrollableControl, UnitsWeightSettingMode } from '@microsoft/msfs-wtg1000';

import { Sr22tWBNumberEntry } from '../Sr22tWBNumberEntry';

import './Sr22tWBFields.css';

/** The object containing all display data for a single display field. */
export type EditableDataEntry = ObjectSubject<{
  /** The title of the section. */
  title: string;
  /** The weight value of the section. */
  storeValue: MutableSubscribable<number>;
  /** The weight unit setting. */
  weightUnit: UserSetting<UnitsWeightSettingMode>;
  /** The function to register scroll controls */
  registerScroll: (ctrl: ScrollableControl, unregister: boolean) => void;
}>;

/** The properties for the {@link Sr22tWBEditableField} component. */
interface Sr22tWBEditableFieldProps extends ComponentProps {
  /** The `LabeledNumberData` object. */
  data: EditableDataEntry;
  /** The maximum value allowed, in pounds. */
  maxValue?: number;
}

/** A component which allows changing the weight in a payload station. */
export class Sr22tWBEditableField extends DisplayComponent<Sr22tWBEditableFieldProps> {
  private readonly numberEntryRef = FSComponent.createRef<Sr22tWBNumberEntry>();

  /** Resets the temporary value to the value received in the store. */
  public reset(): void {
    this.numberEntryRef.getOrDefault()?.reset();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='wb-labeled-number'>
        <div class='wb-labeled-number-title'>{this.props.data.get().title}</div>
        <Sr22tWBNumberEntry
          ref={this.numberEntryRef}
          class='wb-labeled-number-entry-value'
          registerScroll={this.props.data.get().registerScroll}
          weightUnit={this.props.data.get().weightUnit}
          storeValue={this.props.data.get().storeValue}
          maxValue={this.props.maxValue}
        />
      </div>
    );
  }
}
