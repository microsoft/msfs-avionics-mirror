import { ComponentProps, DisplayComponent, EventBus, FSComponent, MutableSubscribable, UserSetting, VNode } from '@microsoft/msfs-sdk';
import { ScrollableControl, UnitsUserSettings, UnitsWeightSettingMode } from '@microsoft/msfs-wtg1000';
import { WeightBalanceStore } from '../../../Stores';
import { Sr22tWBNumberEntry, Sr22tWBNumberEntryDigitCount } from '../Shared/Sr22tWBNumberEntry';

import './Sr22tWBAircraftLoad.css';

/** Component props for {@link Sr22tWBAircraftLoad}. */
export interface Sr22tWBAircraftLoadProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;
  /** The weight and balance store. */
  store: WeightBalanceStore;
  /** The function to register scroll controls */
  registerScroll: (ctrl: ScrollableControl, unregister: boolean) => void;
}

/** A component which displays the SR22T's aircraft load. */
export class Sr22tWBAircraftLoad extends DisplayComponent<Sr22tWBAircraftLoadProps> {
  private readonly weightUnit = UnitsUserSettings.getManager(this.props.bus).getSetting('unitsWeight');

  private readonly pilotWeightRef = FSComponent.createRef<AircraftLoadSection>();
  private readonly copilotWeightRef = FSComponent.createRef<AircraftLoadSection>();
  private readonly tksFluidWeightRef = FSComponent.createRef<AircraftLoadSection>();
  private readonly passMidWeightRef = FSComponent.createRef<AircraftLoadSection>();
  private readonly passLeftWeightRef = FSComponent.createRef<AircraftLoadSection>();
  private readonly passRightWeightRef = FSComponent.createRef<AircraftLoadSection>();
  private readonly baggageWeightRef = FSComponent.createRef<AircraftLoadSection>();

  /** Resets the temporary values to the values in the store. */
  public resetValues(): void {
    this.pilotWeightRef.getOrDefault()?.reset();
    this.copilotWeightRef.getOrDefault()?.reset();
    this.tksFluidWeightRef.getOrDefault()?.reset();
    this.passMidWeightRef.getOrDefault()?.reset();
    this.passLeftWeightRef.getOrDefault()?.reset();
    this.passRightWeightRef.getOrDefault()?.reset();
    this.baggageWeightRef.getOrDefault()?.reset();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='sr22t-system-page-section sr22t-wb-page-aircraft-load'>
        <div class='sr22t-system-page-section-title'>Aircraft Load</div>
        <AircraftLoadSection
          ref={this.pilotWeightRef}
          title='Pilot'
          storeValue={this.props.store.pilotWeightInput}
          class='aircraft-load-pilot'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
        />
        <AircraftLoadSection
          ref={this.copilotWeightRef}
          title='Copilot'
          storeValue={this.props.store.copilotWeightInput}
          class='aircraft-load-copilot'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
        />
        <AircraftLoadSection
          ref={this.tksFluidWeightRef}
          title='TKS Fluid'
          storeValue={this.props.store.tksFluidWeightInput}
          class='aircraft-load-tks-fluid'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
          digitCount={2}
          maxValue={74}
        />
        <AircraftLoadSection
          ref={this.passMidWeightRef}
          title='Pass M'
          storeValue={this.props.store.passMidWeightInput}
          class='aircraft-load-pass-mid'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
        />
        <AircraftLoadSection
          ref={this.passLeftWeightRef}
          title='Pass L'
          storeValue={this.props.store.passLeftWeightInput}
          class='aircraft-load-pass-left'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
        />
        <AircraftLoadSection
          ref={this.passRightWeightRef}
          title='Pass R'
          storeValue={this.props.store.passRightWeightInput}
          class='aircraft-load-pass-right'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
        />
        <AircraftLoadSection
          ref={this.baggageWeightRef}
          title='Baggage'
          storeValue={this.props.store.baggageWeightInput}
          class='aircraft-load-baggage'
          weightUnit={this.weightUnit}
          registerScroll={this.props.registerScroll}
          digitCount={2}
          maxValue={130}
        />
      </div>
    );
  }
}

/** Component props for {@link AircraftLoadSection}. */
interface AircraftLoadSectionProps extends ComponentProps {
  /** The title of the section. */
  title: string;
  /** The weight value of the section. */
  storeValue: MutableSubscribable<number>;
  /** The CSS class of the section. */
  class: string;
  /** The weight unit setting. */
  weightUnit: UserSetting<UnitsWeightSettingMode>;
  /** The function to register scroll controls */
  registerScroll: (ctrl: ScrollableControl, unregister: boolean) => void;
  /** The number of digits to for the number entry. Defaults to three digits. */
  digitCount?: Sr22tWBNumberEntryDigitCount;
  /** The maximum value allowed, in pounds. */
  maxValue?: number;
}

/** A component which allows changing the weight in a payload station. */
class AircraftLoadSection extends DisplayComponent<AircraftLoadSectionProps> {
  private readonly numberEntryRef = FSComponent.createRef<Sr22tWBNumberEntry>();

  /** Resets the temporary value to the value received in the store. */
  public reset(): void {
    this.numberEntryRef.getOrDefault()?.reset();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={`sr22t-wb-aircraft-load-section ${this.props.class}`}>
        <div class='aircraft-load-section-title'>{this.props.title}</div>
        <div class='aircraft-load-section-value'>
          <Sr22tWBNumberEntry
            ref={this.numberEntryRef}
            class={this.props.class}
            registerScroll={this.props.registerScroll}
            weightUnit={this.props.weightUnit}
            storeValue={this.props.storeValue}
            digitCount={this.props.digitCount ?? 3}
            maxValue={this.props.maxValue}
          />
        </div>
      </div>
    );
  }
}
