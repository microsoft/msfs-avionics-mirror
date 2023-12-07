import { FSComponent, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';
import { RadioBox } from './Radiobox';

import './RadioList.css';

export enum RadioListStyle {
  Inline,
  SideButtonBound,
}

/**
 * The properties for the RadioList component.
 */
interface RadioListProps extends WT21UiControlProps {
  /** A boolean determining wether the radio list is inline */
  inline?: boolean;

  /** The text label of the radio list */
  label?: string;

  /** The style of this RadioList */
  style?: RadioListStyle;

  /** Orientation of the RadioList - only relevant if {@link style} is set to `SideButtonBound`. */
  orientation?: 'left' | 'right';

  /** The data ref subject for the selected index. */
  dataRef: Subject<number>;
}

/**
 * The RadioList component.
 */
export class RadioList extends WT21UiControl<RadioListProps> {
  private static readonly ARROW_ORIENTATIONS: Record<'left' | 'right', string> = {
    left: 'M 7, 2 l -4, 5 l 4, 5',
    right: 'M 3, 2 l 4, 5 l -4, 5',
  };

  private readonly radioButtonRefs: NodeReference<RadioBox>[] = [];

  private readonly childrenContainerRef = FSComponent.createRef<HTMLElement>();

  private readonly radioListRef = FSComponent.createRef<HTMLDivElement>();

  private readonly style = this.props.style ?? RadioListStyle.Inline;

  private readonly orientation = this.props.orientation ?? 'left';

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    const nextIndex = this.getIndexOfNextEnabledRadioBox(this.props.dataRef.get(), 1);
    if (nextIndex !== null) {
      this.props.dataRef.set(nextIndex);
    }
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    const nextIndex = this.getIndexOfNextEnabledRadioBox(this.props.dataRef.get(), -1);
    if (nextIndex !== null) {
      this.props.dataRef.set(nextIndex);
    }
    return true;
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.props.children?.forEach(radiobox => {
      const radioButtonRef = FSComponent.createRef<RadioBox>();
      radioButtonRef.instance = (radiobox as VNode).instance as RadioBox;
      this.radioButtonRefs.push(radioButtonRef);
    });

    this.props.dataRef.sub((v: number): void => {
      this.setSelectIndex(v);
    }, true);
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private getIndexOfNextEnabledRadioBox(currentIndex: number, direction: 1 | -1): number | null {
    const nextIndex = currentIndex + direction;
    const nextRadioBox = this.radioButtonRefs[nextIndex];
    if (nextRadioBox) {
      if (nextRadioBox.instance.isEnabled.get() !== false) {
        return nextIndex;
      } else {
        return this.getIndexOfNextEnabledRadioBox(nextIndex, direction);
      }
    } else {
      return null;
    }
  }

  /**
   * Sets the checked radio box according to the selected index.
   * @param v The selected index.
   */
  private setSelectIndex(v: number): void {
    for (let i = 0; i < this.radioButtonRefs.length; i++) {
      const radioBox = this.radioButtonRefs[i];
      radioBox.instance.setIsChecked(i == v);
    }
  }

  /**
   * Returns the element instance to receive focus
   *
   * @returns the an `HTMLElement`
   */
  private get focusEl(): HTMLElement {
    return (this.style === RadioListStyle.Inline ? this.radioListRef : this.childrenContainerRef).instance;
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.focusEl.classList.add(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.focusEl.classList.remove(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div
        ref={this.radioListRef}
        class={{
          'popup-menu-radio': true,
          'popup-menu-radio-side-buttons': this.style === RadioListStyle.SideButtonBound,
          'popup-menu-radio-inline': this.props.inline ?? false,
        }}
        data-label={this.props.label}
      >
        <div class="popup-menu-radio-label">
          {this.style === RadioListStyle.SideButtonBound && (this.props.orientation ?? 'left') === 'left' && (
            <div class="check-side-buttons-arrow-wrapper">
              <svg class="check-side-buttons-arrow" viewBox="0 0 10 14">
                <path d={RadioList.ARROW_ORIENTATIONS[this.props.orientation ?? 'left']} stroke-width={1.5} stroke="cyan" />
              </svg>
            </div>
          )}

          {this.props.label}

          {this.style === RadioListStyle.SideButtonBound && (this.props.orientation ?? 'left') === 'right' && (
            <div class="check-side-buttons-arrow-wrapper">
              <svg class="check-side-buttons-arrow" viewBox="0 0 10 14">
                <path d={RadioList.ARROW_ORIENTATIONS[this.props.orientation ?? 'left']} stroke-width={1.5} stroke="cyan" />
              </svg>
            </div>
          )}
        </div>

        <span ref={this.childrenContainerRef} class="popup-menu-radio-children">
          {this.props.children}
        </span>
      </div>
    );
  }
}