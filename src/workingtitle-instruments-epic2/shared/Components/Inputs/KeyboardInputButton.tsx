import { ComponentProps, ConsumerSubject, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { Epic2CockpitEvents } from '../../Misc';
import { CockpitUserSettings } from '../../Settings';

/** Props for a {@link KeyboardInputButton} */
export interface KeyboardInputButtonProps extends ComponentProps {
  /** The event bus */
  bus: EventBus;
  /** The classes to give the image button */
  classes?: string;
}

enum KeyboardInputButtonState {
  Inactive = '/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/keyboard_icon_grey.png',
  Active = '/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/keyboard_icon_white.png',
  Capturing = '/Pages/VCockpit/Instruments/NavSystems/Epic2v2/Assets/Icons/keyboard_icon_magenta.png',
}

/** A button which toggles keyboard input capturing */
export class KeyboardInputButton extends DisplayComponent<KeyboardInputButtonProps> {
  private readonly cockpitUserSettings = CockpitUserSettings.getManager(this.props.bus);
  private readonly captureInputSetting = this.cockpitUserSettings.getSetting('captureKeyboardInput');
  private readonly isCapturing = ConsumerSubject.create(this.props.bus.getSubscriber<Epic2CockpitEvents>().on('input_field_capturing'), false);

  private readonly imgRef = FSComponent.createRef<HTMLImageElement>();

  /**
   * Sets the keyboard input state
   */
  private setKeyboardInputState(): void {
    const ref = this.imgRef.getOrDefault();
    const isActive = this.captureInputSetting.get();
    const isCapturing = this.isCapturing.get();

    if (ref) {
      if (isCapturing) {
        ref.src = KeyboardInputButtonState.Capturing;
      } else if (isActive) {
        ref.src = KeyboardInputButtonState.Active;
      } else {
        ref.src = KeyboardInputButtonState.Inactive;
      }
    }
  }

  /** @inheritdoc */
  public onAfterRender(): void {
    this.captureInputSetting.sub(() => this.setKeyboardInputState());
    this.isCapturing.sub(() => this.setKeyboardInputState(), true);

    this.imgRef.instance.addEventListener('click', () => this.captureInputSetting.set(!this.captureInputSetting.get()));
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <img class={this.props.classes} ref={this.imgRef} src={KeyboardInputButtonState.Inactive} width="19" height="19" />
    );
  }
}
