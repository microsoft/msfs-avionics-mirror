import { ComponentProps, DisplayComponent, FSComponent, ImageCache, LegTurnDirection, LegType, VNode } from '@microsoft/msfs-sdk';

/**
 * A component that displays a GNS leg type icon.
 */
export class LegIcon extends DisplayComponent<ComponentProps> {
  private iconElement = FSComponent.createRef<HTMLImageElement>();

  /**
   * A callback called when the leg type changes to modify the leg type icon.
   * @param legExists is a bool for whether an arrow should be drawn at all
   * @param isDirectTo is a bool for whether the flight plan is current in a direct to state.
   * @param legType The current enum value for the leg type.
   * @param turnDirection the direction of the turn
   */
  public updateLegIcon(legExists: boolean, isDirectTo?: boolean, legType?: LegType, turnDirection?: LegTurnDirection): void {
    if (legExists) {
      this.iconElement.instance.classList.remove('hide-element');

      if (isDirectTo) {
        this.iconElement.instance.src = ImageCache.get('LEGICON_DIRECTTO').src;
      } else {
        switch (legType) {
          case LegType.HA:
          case LegType.HF:
          case LegType.HM:
            if (turnDirection === LegTurnDirection.Left) {
              this.iconElement.instance.src = ImageCache.get('LEGICON_HOLD_LEFT').src;
            } else {
              this.iconElement.instance.src = ImageCache.get('LEGICON_HOLD_RIGHT').src;
            }
            break;
          case LegType.RF:
          case LegType.AF:
            if (turnDirection === LegTurnDirection.Left) {
              this.iconElement.instance.src = ImageCache.get('LEGICON_ARC_LEFT').src;
            } else {
              this.iconElement.instance.src = ImageCache.get('LEGICON_ARC_RIGHT').src;
            }
            break;
          default:
            this.iconElement.instance.src = ImageCache.get('LEGICON_DEFAULT').src;
            break;
        }
      }
    } else {
      this.iconElement.instance.classList.add('hide-element');
    }
  }

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  render(): VNode {
    return (
      <img class='leg-icon hide-element' src='' ref={this.iconElement} />
    );
  }
}
