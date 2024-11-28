import { DisplayComponent, FSComponent, VNode, ComponentProps, Subscribable, Subscription } from '@microsoft/msfs-sdk';

import './KeyboardAlphaKeyPopup.css';

/** The properties for the {@link KeyboardAlphaKeyPopup} component. */
interface KeyboardAlphaKeyPopupProps extends ComponentProps {
  /** The label to display inside this popup. */
  readonly label: string;
  /** Whether this popup is displayed */
  readonly show: Subscribable<boolean>;
}

/** The KeyboardAlphaKeyPopup component. */
export class KeyboardAlphaKeyPopup extends DisplayComponent<KeyboardAlphaKeyPopupProps> {

  private readonly popupRef = FSComponent.createRef<HTMLDivElement>();

  private sub: Subscription | undefined;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.sub = this.props.show.sub((isShown: boolean) => {
      this.popupRef.instance.classList.toggle('hidden', !isShown);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tsc-keyboard-alpha-key-container'>
        <div ref={this.popupRef} class='tsc-keyboard-alpha-key-popup-container'>
          <svg class='tsc-keyboard-alpha-key-popup-background' viewBox="-1 -1 72 83">
            <g fill="cyan" stroke="black" stroke-width="4">
              <path class="" d="M 8 3 L 62 3 L 67 8 L 67 71 L 62 78 L 8 78 L 8 78 L 3 71 L 3 8 L 8 3 z" />
            </g>
            <g fill="none" stroke="cyan" stroke-width="1">
              <path class="" d="M 0 7 l 7 -7 L 63 0 L 70 7 L 70 72 L 64 81 L 6 81 L 0 72 L 0 7 z" />
            </g>
          </svg>

          <div class='tsc-keyboard-alpha-key-popup-label'>{this.props.label}</div>
        </div>

        {this.props.children}
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.sub?.destroy();
  }
}