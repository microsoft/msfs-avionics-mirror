import { FSComponent, Subject, SubscribableArray, VNode } from '@microsoft/msfs-sdk';

import { WT21UiControl, WT21UiControlProps } from '../../UI/WT21UiControl';

import './SelectInput.css';

/**
 * The properties for the SelectInput component.
 */
interface SelectInputProps extends WT21UiControlProps {
  /** The text label of the input */
  label: string;

  /** The value text of the input */
  // TODO: should probably be generic
  data: SubscribableArray<string>;

  /** The data ref subject for the selected index. */
  dataRef: Subject<number>;
}

/**
 * The SelectInput component.
 */
export class SelectInput extends WT21UiControl<SelectInputProps> {

  private readonly el = FSComponent.createRef<HTMLDivElement>();

  private readonly selectedItem = Subject.create(0);

  private readonly displayValue = Subject.create('');

  /** @inheritdoc */
  public onUpperKnobInc(): boolean {
    this.props.dataRef.set(Math.min(this.props.dataRef.get() + 1, this.props.data.length - 1));
    return true;
  }

  /** @inheritdoc */
  public onUpperKnobDec(): boolean {
    this.props.dataRef.set(Math.max(this.props.dataRef.get() - 1, 0));
    return true;
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove(WT21UiControl.FOCUS_CLASS);
  }

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.selectedItem.sub(this.updateDisplayValue, true);

    this.props.data.sub(this.updateDisplayValue, true);

    this.props.dataRef.sub((v: number) => {
      this.selectedItem.set(v);
    }, true);
  }

  private readonly updateDisplayValue = (): void => {
    this.displayValue.set(this.props.data.tryGet(this.selectedItem.get()) ?? 'n/a');
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="popup-menu-line popup-menu-select" ref={this.el}>
        <div class="popup-menu-select-label">{this.props.label}</div>
        <div class="popup-menu-select-value">{this.displayValue}</div>
      </div>
    );
  }
}