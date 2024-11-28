import { FSComponent, VNode } from '@microsoft/msfs-sdk';

import { GtcTouchButton } from '../../Components/TouchButton/GtcTouchButton';
import { GtcView, GtcViewProps } from '../../GtcService/GtcView';

import './GtcChecklistOptionsPopup.css';

/**
 * Component props for {@link GtcChecklistOptionsPopup}.
 */
export interface GtcChecklistOptionsPopupProps extends GtcViewProps {
  /** A callback function which will be called when the popup's reset current checklist button is pressed. */
  onResetCurrentPressed?: () => void;

  /** A callback function which will be called when the popup's reset all checklists button is pressed. */
  onResetAllPressed?: () => void;
}

/**
 * A GTC checklist options popup.
 */
export class GtcChecklistOptionsPopup extends GtcView<GtcChecklistOptionsPopupProps> {
  private thisNode?: VNode;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this._title.set('Checklist');
  }

  /**
   * Responds to when this popup's reset current checklist button is pressed.
   */
  private onResetCurrentPressed(): void {
    this.props.onResetCurrentPressed?.();
  }

  /**
   * Responds to when this popup's reset all checklists button is pressed.
   */
  private onResetAllPressed(): void {
    this.props.onResetAllPressed?.();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='checklist-options-popup gtc-popup-panel'>
        <div class='checklist-options-popup-title'>Checklist Options</div>
        <GtcTouchButton
          label={'Reset Current\nChecklist'}
          onPressed={this.onResetCurrentPressed.bind(this)}
          class='checklist-options-popup-button'
        />
        <GtcTouchButton
          label={'Reset All\nChecklists'}
          onPressed={this.onResetAllPressed.bind(this)}
          class='checklist-options-popup-button'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
