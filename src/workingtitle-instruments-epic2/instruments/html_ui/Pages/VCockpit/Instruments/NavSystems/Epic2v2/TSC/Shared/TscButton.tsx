import { TouchButton, TouchButtonProps } from '@microsoft/msfs-epic2-shared';
import { MutableSubscribable, NodeReference, Subject, Subscribable, VNode } from '@microsoft/msfs-sdk';

import './TscButton.css';

/** TSC Button styles. */
export interface TscButtonStyles {
  [key: string]: string | undefined;

  /** The button height. */
  height?: string | undefined;
  /** The button width. */
  width?: string | undefined;
  /** The button font size. */
  fontSize?: string | undefined;
  /** The button text's line height. */
  lineHeight?: string | undefined;
  /** The button background color. */
  backgroundColor?: string | undefined;
  /** The button color. */
  color?: string | undefined;
  /** The button border. */
  border?: string | undefined;
  /** The button margin. */
  margin?: string | undefined;
}

/** TSC Button props. */
interface TscButtonProps extends TouchButtonProps {
  /** Button node ref */
  ref?: NodeReference<HTMLElement>;
  /** The button label. */
  label: string | Subject<string> | VNode;
  /** The button styles. */
  styles?: TscButtonStyles;
  /** A callback function which will be called every time a mouse down event happens. */
  onMouseDown?: () => void;
  /** A callback function which will be called every time a mouse up event happens. */
  onMouseUp?: () => void;
  /** Within the scope of this keyboard, Whether the mouse is currently pressed down.*/
  mouseIsDown?: Subscribable<boolean>;
  /** Whether the popup of this key will be displayed. */
  showPopup?: MutableSubscribable<boolean>;
}

/** The TSC Button. */
export class TscButton extends TouchButton<TscButtonProps> {

  /** @inheritdoc */
  private setStyles(styles: TscButtonStyles | undefined): void {
    this.styles.set('height', styles?.height ? styles.height : '61px');
    this.styles.set('width', styles?.width ? styles.width : '115px');
    this.styles.set('font-size', styles?.fontSize ? styles.fontSize : '22px');
    this.styles.set('background-color', styles?.backgroundColor ? styles.backgroundColor : 'var(--epic2-color-darker-grey)');
    this.styles.set('color', styles?.color ? styles.color : 'var(--epic2-color-white)');
    this.styles.set('border', styles?.border ? styles.border : '2px solid var(--epic2-color-light-grey)');
    this.styles.set('margin', styles?.margin ? styles.margin : 'none');
  }

  /** @inheritdoc */
  public onBeforeRender(): void {
    if (this.props.styles) {
      this.setStyles(this.props.styles);
    }
  }

  /** @inheritdoc */
  protected onMouseDown(e: MouseEvent): void {
    this.actualRef.instance.classList.add('border-cyan', 'touch-button-active');
    this.props.onMouseDown && this.props.onMouseDown();
    this.props.showPopup?.set(true);

    super.onMouseDown(e);
  }

  /** @inheritdoc */
  protected onMouseUp(): void {
    this.actualRef.instance.classList.remove('border-cyan');
    this.props.onMouseUp && this.props.onMouseUp();
    this.props.showPopup?.set(false);

    super.onMouseUp();
  }

  /** @inheritdoc */
  protected onMouseEnter(): void {
    if (this.props.mouseIsDown?.get()) {
      this.setPrimed(true);
      this.actualRef.instance.classList.add('border-cyan', 'touch-button-active');
      this.props.showPopup?.set(true);
    }

    super.onMouseEnter();
  }

  /** @inheritdoc */
  protected onMouseLeave(e: MouseEvent): void {
    super.onMouseLeave(e);
    this.actualRef.instance.classList.remove('border-cyan', 'touch-button-active');
    this.props.showPopup?.set(false);
  }
}
