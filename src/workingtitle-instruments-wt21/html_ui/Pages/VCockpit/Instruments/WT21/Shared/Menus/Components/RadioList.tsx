import { FSComponent, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';
import { RadioBox } from './Radiobox';

import './RadioList.css';

/**
 * The properties for the RadioList component.
 */
interface RadioListProps extends WT21UiControlProps {
  /** A boolean determining wether the radio list is inline */
  inline?: boolean;

  /** The text label of the radio list */
  label?: string;

  /** The data ref subject for the selected index. */
  dataRef: Subject<number>;
}

/**
 * The RadioList component.
 */
export class RadioList extends WT21UiControl<RadioListProps> {

  private readonly radioButtonRefs: NodeReference<RadioBox>[] = [];

  protected readonly radioListRef = FSComponent.createRef<HTMLDivElement>();

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

    if (this.props.inline === true) {
      this.radioListRef.instance.classList.add('inline');
    }

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

  /** @inheritdoc */
  protected onFocused(): void {
    this.radioListRef.instance.classList.add(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.radioListRef.instance.classList.remove(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-radio" ref={this.radioListRef}>
        <div class="label">{this.props.label}</div>
        {this.props.children}
      </div>
    );
  }
}