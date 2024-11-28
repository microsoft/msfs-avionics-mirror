import { ComponentProps, DisplayComponent, FSComponent, Subscribable, SubscribableMapFunctions, SubscribableUtils, VNode } from '@microsoft/msfs-sdk';

import { Epic2Colors } from '../../Misc/Epic2Colors';
import { TouchButton } from '../TouchButton';
import { ListButton } from './ListButton';

import './DiamondListItem.css';

/** The properties for the {@link DiamondListItem} component. */
interface DiamondListItemProps extends ComponentProps {
  /** The list item label. */
  readonly label: string | Subscribable<string>;
  /** Whether to show the inner cyan diamond or not. */
  readonly isSelected: boolean | Subscribable<boolean>;

  /** The selection icon shape. Defaults to 'diamond'. */
  readonly shape?: 'diamond' | 'circle';

  /** Additional single css class name. */
  readonly class?: string;

  /**
   * A callback function which will be called every time the button is pressed.
   * @param button The button that was pressed.
   * @param isHeld Whether the button was held when it was pressed.
   */
  readonly onPressed?: <B extends TouchButton = TouchButton>(button: B, isHeld: boolean) => void;
}

/** The DiamondListItem component. */
export class DiamondListItem extends DisplayComponent<DiamondListItemProps> {
  private readonly diamondListItemRef = FSComponent.createRef<HTMLDivElement>();
  private readonly listButtonRef = FSComponent.createRef<ListButton>();

  private readonly isSelected = (SubscribableUtils.toSubscribable(this.props.isSelected, true) as Subscribable<boolean>)
    .map(SubscribableMapFunctions.identity());
  private readonly label = (SubscribableUtils.toSubscribable(this.props.label, true) as Subscribable<string>)
    .map(SubscribableMapFunctions.identity());

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO?
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <ListButton
        ref={this.listButtonRef}
        listItemClasses={'diamond-list-item ' + (this.props.class ?? '')}
        label={<>
          <svg viewBox="-12 -12 24 24" width="20">
            {(this.props.shape === 'diamond' || this.props.shape === undefined) && <>
              <path d="M 10 0 L 0 10 L -10 0 L 0 -10 Z" stroke={Epic2Colors.white} stroke-width="1.5" fill="none" vector-effect="non-scaling-stroke" />
              <path d="M 7 0 L 0 7 L -7 0 L 0 -7 Z" stroke="none" fill={this.isSelected.map(x => x ? Epic2Colors.cyan : 'none')} vector-effect="non-scaling-stroke" />
            </>}
            {this.props.shape === 'circle' && <>
              <circle cx="0" cy="0" r="8" stroke={Epic2Colors.white} stroke-width="1.5" fill="none" vector-effect="non-scaling-stroke" />
              <circle cx="0" cy="0" r="5.5" stroke="none" fill={this.isSelected.map(x => x ? Epic2Colors.cyan : 'none')} vector-effect="non-scaling-stroke" />
            </>}
          </svg>
          <span>{this.label}</span>
        </>}
        onPressed={this.props.onPressed?.bind(this)}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isSelected.destroy();
    this.listButtonRef.instance.destroy();
  }
}
