import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

export enum LegArrowType {
  None,
  From,
  Between,
  To,
  Direct
}

/**
 * Displays a flight plan leg arrow on the FPL page.
 */
export class FPLLegArrow extends DisplayComponent<ComponentProps> {
  private readonly el = FSComponent.createRef<HTMLImageElement>();

  /**
   * Sets the type of flight plan leg arrow to display.
   * @param type The type of leg arrow.
   */
  public set(type: LegArrowType): void {
    switch (type) {
      case LegArrowType.None:
        this.el.instance.classList.add('hidden-element');
        this.el.instance.src = '';
        break;
      case LegArrowType.From:
        this.el.instance.classList.remove('hidden-element');
        this.el.instance.src = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legarrow_from.svg';
        break;
      case LegArrowType.Between:
        this.el.instance.classList.remove('hidden-element');
        this.el.instance.src = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legarrow_between.svg';
        break;
      case LegArrowType.To:
        this.el.instance.classList.remove('hidden-element');
        this.el.instance.src = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legarrow_to.svg';
        break;
      case LegArrowType.Direct:
        this.el.instance.classList.remove('hidden-element');
        this.el.instance.src = 'coui://html_ui/Pages/VCockpit/Instruments/NavSystems/GPS/Shared/Assets/legarrow_directto.svg';
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <img class='fpl-leg-arrow' src='' ref={this.el} />
    );
  }
}