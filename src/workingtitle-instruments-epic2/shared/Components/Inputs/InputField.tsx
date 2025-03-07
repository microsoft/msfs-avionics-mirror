import { DisplayComponent, FSComponent, Subject, Subscribable, SubscribableUtils, Subscription, VNode } from '@microsoft/msfs-sdk';

import { Epic2TscKeyboardEvents } from '../../Misc';
import { InputBox, InputBoxProps } from './InputBox';
import { InputBoxTsc } from './InputBoxTsc';

import './InputField.css';

/** Possible input field colors */
export type InputFieldColor = 'green' | 'white';

/** The properties for the {@link InputField} component. */
interface InputFieldProps<T> extends InputBoxProps<T> {
  /** The MFD label of this field */
  readonly topLabel?: string | Subscribable<string>;
  /** The TSC keyboard header label of this field. */
  readonly tscDisplayLabel?: string | Subscribable<string>;
  /** A suffix to the input */
  readonly suffix?: string | Subscribable<string>;
  /** A prefix to the input */
  readonly prefix?: string | Subscribable<string>;
  /** CSS class to apply to the root element. */
  readonly class?: string;
  /** Text alignment. */
  readonly textAlign?: 'right' | 'center';
  /** Text color. */
  readonly color?: InputFieldColor | Subscribable<InputFieldColor>;
  /** This InputField is connected to the TSC keyboard. */
  readonly tscConnected?: boolean;
  /** Callback when `Enter` key is pressed. */
  // FIXME: Make it so that only `InputBoxTsc` can have this prop.
  readonly onEnter?: () => void;
}

/** The InputField component. Wraps an InputBox component with labels and a connection to the TSC Keyboard Input box */
export class InputField<T extends number | string> extends DisplayComponent<InputFieldProps<T>> {
  public readonly inputBoxRef = FSComponent.createRef<InputBox<T>>();

  private readonly topLabel = this.props.topLabel === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.topLabel, true);
  private readonly suffix = this.props.suffix === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.suffix, true);
  private readonly prefix = this.props.prefix === undefined ? undefined : SubscribableUtils.toSubscribable(this.props.prefix, true);

  private readonly isEnabled = SubscribableUtils.toSubscribable(this.props.isEnabled ?? true, true) as Subscribable<boolean>;
  private color = SubscribableUtils.toSubscribable(this.props.color ?? '', true) as Subscribable<string>;

  private readonly inputIsActive = Subject.create(false);
  private readonly inputIsCapturing = Subject.create(false);
  private readonly publisher = this.props.bus.getPublisher<Epic2TscKeyboardEvents>();

  private inputIsActivePipeSub: Subscription | undefined;
  private inputIsActiveSub: Subscription | undefined;
  private inputIsCapturingPipeSub: Subscription | undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.inputIsCapturingPipeSub = this.inputBoxRef.instance.isCapturing.pipe(this.inputIsCapturing);
    this.inputIsActivePipeSub = this.inputBoxRef.instance.isActive.pipe(this.inputIsActive);
    this.inputIsActiveSub = this.inputIsActive.sub((isActive: boolean) => {
      if (isActive) {
        this.publisher.pub('tsc_keyboard_header', this.tscDisplayLabel, true);
      }
    });
  }

  /**
   * The label of this field to be shown as TSC keyboard header.
   * @returns A string.
   */
  get tscDisplayLabel(): string {
    if (this.props.tscDisplayLabel === undefined) {
      if (this.props.topLabel === undefined) {
        return '';
      } else {
        return SubscribableUtils.toSubscribable(this.props.topLabel, true).get();
      }
    }

    return SubscribableUtils.toSubscribable(this.props.tscDisplayLabel, true).get();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        class={{
          ...(this.props.class ? { [`${this.props.class}`]: true } : {}),
          ...(this.props.textAlign ? { [`input-text-align-${this.props.textAlign}`]: true } : {}),
          'input-text-color-white': this.color.map((v) => v === 'white'),
          'input-text-color-green': this.color.map((v) => v === 'green'),
          'input-field': true,
          'input-active': this.inputIsActive,
          'input-field-disabled': this.isEnabled.map(x => !x),
          'input-capturing': this.inputIsCapturing,
        }}
      > {this.prefix && <div class="prefix-label">{this.prefix}</div>}
        {this.topLabel && <div class="top-label">{this.topLabel}</div>}
        <div class="input-row">
          {this.props.tscConnected
            ? <InputBoxTsc {...this.props} ref={this.inputBoxRef} />
            : <InputBox {...this.props} ref={this.inputBoxRef} />
          }
          {this.suffix && <div class="suffix-label">{this.suffix}</div>}
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.inputBoxRef.getOrDefault()?.destroy();
    this.inputIsActiveSub?.destroy();
    this.inputIsActivePipeSub?.destroy();
    this.inputIsCapturingPipeSub?.destroy();
    super.destroy();
  }
}
