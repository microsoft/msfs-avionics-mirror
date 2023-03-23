// TODO: remove lint disable when done
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './MenuContainer.css';

/**
 * The properties for the MenuContainer component.
 */
interface MenuContainerProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The MenuContainer component.
 * The menus get displayed here by the view service.
 */
export class MenuContainer extends DisplayComponent<MenuContainerProps> {

  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    // TODO do stuff
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div id="MenuContainer">

      </div>
    );
  }
}