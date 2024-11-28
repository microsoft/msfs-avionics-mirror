import { ConsumerSubject, EventBus, Subject, Subscription } from '@microsoft/msfs-sdk';
import { Epic2CockpitEvents } from '../../Misc';
import { InputField } from '../Inputs/InputField';

/** Manages `active` state of all input fields of all `FlightPlanConfig` tabs */
export class InputFocusManager {
  private readonly subscriber = this.bus.getSubscriber<Epic2CockpitEvents>();

  private readonly activeInputId = ConsumerSubject.create<string | undefined>(
    this.subscriber.on('tsc_keyboard_active_input_id'),
    undefined
  );
  private lastActiveInputId: string | undefined = this.activeInputId.get();

  public readonly activeTopTab = Subject.create<string | undefined>('ground');

  private activeInputIndex: number | undefined;
  private nextActiveInputIndex: number | undefined;

  public inputFieldList: InputField<string>[] = [];

  /**
   * Gets the list of `InputField`s that can be focused.
   * @returns The list of `InputField`s.
   */
  private get enabledInputFieldList(): InputField<string>[] {
    return this.inputFieldList.filter((inputField) => inputField.inputBoxRef.instance.isEnabled.get());
  }

  private currentList: InputField<string>[] = [];

  private subscriptions: Subscription[] = [];

  /**
   * The constructor of `InputFocusManager`.
   * Subscribes to `Epic2CockpitEvents` to manage `activeInputField` and `activeTab`.
   * @param bus An instance of the EventBus.
   */
  constructor(private readonly bus: EventBus) {
    this.subscriptions = [
      this.activeInputId.sub((id: string | undefined) => {
        if (id !== undefined) {
          this.lastActiveInputId = id;
          this.activeInputIndex = this.findActiveInputIndex(id);
        }
      }),

      this.subscriber.on('tsc_keyboard_next').handle(() => {
        if (this.activeInputId.get() === undefined && this.lastActiveInputId === undefined) {
          return;
        } else {
          if (this.activeInputIndex === undefined) {
            // should never happen
            return;
          }

          this.currentList = this.enabledInputFieldList;

          if (this.activeInputIndex + 1 >= this.currentList.length) {
            this.currentList[this.activeInputIndex].inputBoxRef.instance.inputRef.instance.blur();
            this.activeInputIndex = undefined;
            return;
          }

          this.nextActiveInputIndex = this.activeInputIndex + 1;

          this.currentList[this.activeInputIndex].inputBoxRef.instance.inputRef.instance.blur();
          this.currentList[this.nextActiveInputIndex].inputBoxRef.instance.inputRef.instance.focus({ preventScroll: true });

          this.activeInputIndex = this.nextActiveInputIndex;
          this.nextActiveInputIndex = undefined;
        }
      }),

      this.subscriber.on('tsc_keyboard_force_blur').handle(() => {
        this.activeInputIndex !== undefined && this.enabledInputFieldList[this.activeInputIndex].inputBoxRef.instance.inputRef.instance.blur();
      }),
    ];
  }

  /**
   * Finds the index of the currrent active input field in `inputFieldList`
   * using the HTML `id` property of the active `InputBox` element.
   * @param id The `id` value of the active `InputBox` element.
   * @returns The index number, or `undefined`.
   */
  private findActiveInputIndex(id: string | undefined): number | undefined {
    this.currentList = this.enabledInputFieldList;
    const index = this.currentList.findIndex((inputField): boolean =>
      inputField.inputBoxRef.instance.isEnabled.get() &&
      inputField.inputBoxRef.instance.inputId === id
    );

    return index === -1 ? undefined : index;
  }

  /** Destroys this manager. */
  public destroy(): void {
    this.subscriptions.map(sub => sub.destroy());
  }
}
