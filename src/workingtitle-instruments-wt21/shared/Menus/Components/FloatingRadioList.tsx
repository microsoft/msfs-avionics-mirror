import { FSComponent, NodeReference, SetSubject, Subject, SubscribableSet, Subscription, ToggleableClassNameRecord, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';
import { FloatingRadioItem } from './FloatingRadioItem';

import './CyclicRadioList.css';

/**
 * The properties for the CyclicRadioList component.
 */
export interface CyclicRadioListProps extends WT21UiControlProps {
  /** The orinetation of the list */
  orientation: 'left' | 'right';

  /** A boolean determining wether the radio list is inline */
  inline?: boolean;

  /** The text label of the radio list */
  label?: string;

  /** Classname to append to the element */
  class?: string | SubscribableSet<string> | ToggleableClassNameRecord;

  /** The data ref subject for the selected index. */
  dataRef: Subject<number>;
}

/**
 * The CyclicRadioList component.
 */
export class FloatingRadioList extends WT21UiControl<CyclicRadioListProps> {
  private readonly LIST_ARROW_ORIENTATIONS: Record<'left' | 'right', string> = {
    left: 'M 7, 2 l -4, 5 l 4, 5',
    right: 'M 3, 2 l 4, 5 l -4, 5',
  };

  private cssClassSub?: Subscription | Subscription[];

  private cssClsses = SetSubject.create(['popup-menu-floating-radio']);

  private readonly radioButtonRefs: NodeReference<FloatingRadioItem>[] = [];

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
      const radioButtonRef = FSComponent.createRef<FloatingRadioItem>();
      radioButtonRef.instance = (radiobox as VNode).instance as FloatingRadioItem;
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
    let cssClass;
    if (typeof this.props.class === 'object') {
      if (this.props.orientation === 'right') {
        this.cssClsses.add('popup-menu-floating-radio-right');
      }

      this.cssClassSub = FSComponent.bindCssClassSet(cssClass = this.cssClsses, this.props.class, ['popup-menu-floating-radio', 'popup-menu-floating-radio-right']);
    } else {
      cssClass = `popup-menu-floating-radio ${this.props.class ?? ''} ${this.props.orientation === 'right' ? 'popup-menu-floating-radio-right' : ''}`;
    }

    return (
      <div class={cssClass} ref={this.radioListRef}>
        <div class="label">{this.props.label}</div>

        <div class="popup-menu-floating-radio-arrow-wrapper">
          <svg class="popup-menu-floating-radio-arrow" viewBox="0 0 10 14">
            <path d={this.LIST_ARROW_ORIENTATIONS[this.props.orientation]} stroke-width={1.5} stroke="cyan" />
          </svg>
        </div>

        {this.props.children}
      </div>
    );
  }
}