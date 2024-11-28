import { ComponentProps, DisplayComponent, FSComponent, NodeReference, Subject, VNode } from '@microsoft/msfs-sdk';

import './TscIconButton.css';

/** Nav Button Config props. */
export interface NavButtonConfigProps {
  /** Active toogle boolean */
  isActive: Subject<boolean>;
  /** Button node ref */
  ref: NodeReference<HTMLElement>;
  /** Button styles */
  btnClass: string;
  /** Button text styles */
  textClass: string;
  /** Button circle styles */
  circleClass: string;
  /** Button text */
  text: string;
}

/** TSC Icon Button props. */
interface TscIconButtonProps extends ComponentProps {
  /** Button attributes */
  config: NavButtonConfigProps;
}
/** The TSC Icon Button. */
export class TscIconButton extends DisplayComponent<TscIconButtonProps> {

  /** @inheritdoc */
  public render(): VNode | null {
    return <button
      class={{
        'navigation-button': true,
        [this.props.config.btnClass]: true,
        'isActive': this.props.config.isActive
      }}
      ref={this.props.config.ref}>
      <div class={{
        [this.props.config.textClass]: true,
        'isActive': this.props.config.isActive
      }}>{this.props.config.text}</div>
      <div class={{
        [this.props.config.circleClass]: true,
        'isActive': this.props.config.isActive
      }}></div>
    </button>;
  }
}
