import { ComponentProps, ComputedSubject, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import './EisValueDisplay.css';

/** The properties for the {@link EisValueDisplay} component. */
interface EisValueDisplayProps extends ComponentProps {
  /** The ComputedSubject for this value */
  valueSubject: ComputedSubject<number, string>;
  /** The text to be display when value is out of range */
  emptyText: string;
  /** The minimum value for a valid indication. A value below this will show yellow and the emptyText  */
  minValue: number;
}

/** The EisValueDisplay component. */
export class EisValueDisplay extends DisplayComponent<EisValueDisplayProps> {
  private readonly classSubject = Subject.create<string>('');
  private readonly textSubject = Subject.create<string>(this.props.emptyText);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.valueSubject.sub((v, rv) => {
      if (rv < this.props.minValue) {
        this.classSubject.set('eis-value-caution');
        this.textSubject.set(this.props.emptyText);
      } else {
        this.classSubject.set('');
        this.textSubject.set(v);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span class={this.classSubject}>
        {this.textSubject}
      </span>
    );
  }
}