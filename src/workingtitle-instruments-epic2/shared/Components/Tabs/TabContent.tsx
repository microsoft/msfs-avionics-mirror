import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';
import { InputField } from '../Inputs/InputField';
import { InputFocusManager } from './InputFocusManager';

/** The properties for the {@link TabContent} component. */
export interface TabContentProps extends ComponentProps {
  /** An instance of the event bus. */
  readonly bus: EventBus;

  /** An instance of the `InputFocusManager`. */
  readonly inputFocusManager?: InputFocusManager;
}

/** The TabContent component. */
export class TabContent<Props extends TabContentProps = TabContentProps> extends DisplayComponent<Props> {

  /** Called when tab is resumed/revealed. */
  public onResume(): void {
    // noop
  }

  /** Called when tab is paused/hidden. */
  public onPause(): void {
    // noop
  }

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    this.visitNodes(node);
  }

  /**
   * Visits the full VNode of the instrument to find node instances that extend `TabContent` component.
   * @param node The VNode.
   */
  private visitNodes(node: VNode): void {
    if (this.props.inputFocusManager !== undefined) {
      FSComponent.visitNodes(node, (current): boolean => {
        if (Object.getPrototypeOf(current.instance).constructor.name === this.constructor.name) {
          this.findInputFields(current);
        }
        return true;
      });
    }
  }

  /**
   * Find all `InputField` elements of a node, including its children nodes.
   * @param node A `VNode`.
   */
  private findInputFields = (node: VNode): void => {
    if (node.instance?.constructor.name === 'InputField' && (node.instance as InputField<string>)?.props.tscConnected) {
      this.props.inputFocusManager!.inputFieldList.push(node.instance as InputField<string>);
    }
    node.children?.map((child) => this.findInputFields(child));
  };

  /**
   * Handles line select key presses when the tab is active.
   * @param key The number of the key pressed, starting at 0 for the topmost key next to the tab view area.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onLineSelectKey(key: number): void {
    // noop
  }

  /** @inheritdoc */
  public render(): VNode {
    return <>
      {this.props.children}
    </>;
  }
}
