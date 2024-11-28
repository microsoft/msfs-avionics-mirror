import { ComponentProps, DisplayComponent, FSComponent, NodeReference, VNode } from '@microsoft/msfs-sdk';

import './NumberPad.css';

/** Num Pad Button props. */
export interface NumButtonProps {
  /** Button node ref */
  ref: NodeReference<HTMLElement>;
  /** Button value */
  value: string;
}

/** The TSC Number Pad props. */
interface NumberPadProps extends ComponentProps {
  /** Pad Buttons */
  numButtons: NumButtonProps[];
}
/** The TSC Content Tabs. */
export class NumberPad extends DisplayComponent<NumberPadProps> {

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class="number-pad">
      {this.props.numButtons.map((button) => (
        <button
          class={{
            'number-pad-button': true
          }}
          ref={button.ref}>
          <span>{button.value}</span>
        </button>
      ))}
    </div>;
  }
}
