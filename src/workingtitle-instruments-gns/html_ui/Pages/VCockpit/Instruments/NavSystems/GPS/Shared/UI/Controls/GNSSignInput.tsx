import { DebounceTimer, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { GNSUiControl, GNSUiControlProps } from '../GNSUiControl';


import './GNSSignInput.css';

/**
 * Component props for SignInput.
 */
export interface GNSSignInputProps extends GNSUiControlProps {
  /** A subject which is bound to the input sign value. */
  sign: Subject<1 | -1>;

  /**
   * The duration, in milliseconds, of the applied solid highlight when this input is focused or edited. Defaults to
   * 1000.
   */
  solidHighlightDuration?: number;

  /** CSS class(es) to apply to the root of the component. */
  class?: string;
}

/**
 * An input control which allows the user to select a numeric sign (+ or −).
 */
export class GNSSignInput extends GNSUiControl<GNSSignInputProps> {
  private static readonly DEFAULT_SOLID_HIGHLIGHT_DURATION = 1000; // milliseconds

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly signText = this.props.sign.map(sign => sign > 0 ? '+' : '-');

  protected readonly solidHighlightTimer = new DebounceTimer();

  /** @inheritdoc */
  protected onFocused(source: GNSUiControl): void {
    super.onFocused(source);

    this.rootRef.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(source: GNSUiControl): void {
    super.onBlurred(source);

    this.rootRef.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  protected onEnabled(source: GNSUiControl): void {
    super.onEnabled(source);

    this.rootRef.instance.classList.remove('input-disabled');
  }

  /** @inheritdoc */
  protected onDisabled(source: GNSUiControl): void {
    super.onDisabled(source);

    this.rootRef.instance.classList.add('input-disabled');
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    this.changeSign();
    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    this.changeSign();
    return true;
  }

  /**
   * Changes this input's sign value.
   */
  private changeSign(): void {
    this.props.sign.set(this.props.sign.get() * -1 as 1 | -1);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span ref={this.rootRef} class={`digit-input ${this.props.class ?? ''}`}>{this.signText}</span>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.solidHighlightTimer.clear();
    this.signText.destroy();
  }
}