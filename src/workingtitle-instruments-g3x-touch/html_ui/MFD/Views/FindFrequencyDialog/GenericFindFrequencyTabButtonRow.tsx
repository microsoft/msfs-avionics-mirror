import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';

import './GenericFindFrequencyTabButtonRow.css';

/**
 * Component props for {@link GenericFindFrequencyTabButtonRow}.
 */
export interface GenericFindFrequencyTabButtonRowProps extends ComponentProps {
  /** The label of the back button. */
  backButtonLabel: string | Subscribable<string>;
  /** The image source of the back button. */
  backButtonImgSrc: string | Subscribable<string>;
  /** The function to call when the back button is pressed. */
  onBackPressed: () => void;
  /** The label of the action button. */
  actionButtonLabel: string | Subscribable<string>;
  /** The function to call when the action button is pressed. */
  onActionPressed?: () => void;
  /** Whether the action button is enabled. */
  actionButtonEnabled?: boolean | Subscribable<boolean>;
}

/**
 * A shared row of buttons for a COM find frequency tab.
 */
export class GenericFindFrequencyTabButtonRow extends DisplayComponent<GenericFindFrequencyTabButtonRowProps> {
  private readonly actionButtonEnabled = this.props.onActionPressed ? this.props.actionButtonEnabled : false;

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="find-frequency-dialog-input-row">
        <UiImgTouchButton
          label={this.props.backButtonLabel}
          imgSrc={this.props.backButtonImgSrc}
          onPressed={this.props.onBackPressed}
          class='ui-nav-button'
        />
        <UiTouchButton
          label={this.props.actionButtonLabel}
          isEnabled={this.actionButtonEnabled}
          onPressed={this.props.onActionPressed}
          class='find-frequency-dialog-action-button'
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
  }
}
