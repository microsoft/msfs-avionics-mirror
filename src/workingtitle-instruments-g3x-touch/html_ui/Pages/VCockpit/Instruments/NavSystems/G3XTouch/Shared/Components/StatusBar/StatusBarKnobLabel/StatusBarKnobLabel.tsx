import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, SetSubject, Subscribable, SubscribableMapFunctions, VNode
} from '@microsoft/msfs-sdk';

import './StatusBarKnobLabel.css';

/**
 * Component props for StatusBarKnobLabel.
 */
export interface StatusBarKnobLabelProps extends ComponentProps {
  /** The label text for inner knob rotation. */
  innerText: Subscribable<string>;

  /** The label text for inner knob push. */
  innerPushText: Subscribable<string>;

  /** The label text for outer knob rotation. */
  outerText: Subscribable<string>;

  /** CSS class(es) to apply to the label's root element. */
  class?: string;
}

/**
 * Icon states for {@link StatusBarKnobLabel}.
 */
enum KnobIconState {
  /** The icon is hidden. */
  Hidden = 'Hidden',

  /** Only the inner knob part of the icon is active. */
  Inner = 'Inner',

  /** Only the outer knob part of the icon is active. */
  Outer = 'Outer',

  /** Both inner and outer knob parts of the icon are active. */
  Both = 'Both'
}

/**
 * A G3X status bar bezel rotary knob contextual label display.
 */
export class StatusBarKnobLabel extends DisplayComponent<StatusBarKnobLabelProps> {
  private static readonly RESERVED_CLASSES = [
    'status-bar-knob',
    'status-bar-knob-icon-hidden',
    'status-bar-knob-icon-inner',
    'status-bar-knob-icon-outer',
    'status-bar-knob-icon-both'
  ];

  private static readonly INNER_TEXT_MAP_FUNC = ([inner, innerPush]: readonly [string, string]): string => {
    if (inner && innerPush) {
      return `${inner} / ${innerPush}`;
    } else if (inner) {
      return inner;
    } else if (innerPush) {
      return innerPush;
    } else {
      return '';
    }
  };

  private static readonly KNOB_SEPARATOR_STATE_MAP_FUNC = ([inner, innerPush, outer]: readonly [string, string, string]): KnobIconState => {
    if ((inner || innerPush) && outer) {
      if (inner === outer) {
        return KnobIconState.Hidden;
      } else {
        return KnobIconState.Both;
      }
    } else if (inner || innerPush) {
      return KnobIconState.Inner;
    } else if (outer) {
      return KnobIconState.Outer;
    } else {
      return KnobIconState.Hidden;
    }
  };

  private readonly rootCssClass = SetSubject.create(['status-bar-knob']);

  private readonly innerText = MappedSubject.create(
    StatusBarKnobLabel.INNER_TEXT_MAP_FUNC,
    this.props.innerText,
    this.props.innerPushText
  );

  private readonly outerText = this.props.outerText.map(SubscribableMapFunctions.identity());

  private readonly iconState = MappedSubject.create(
    StatusBarKnobLabel.KNOB_SEPARATOR_STATE_MAP_FUNC,
    this.props.innerText,
    this.props.innerPushText,
    this.props.outerText
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.iconState.sub(this.onIconStateChanged.bind(this), true);
  }

  /**
   * Responds to when this label's icon state changes.
   * @param state The new icon state.
   */
  private onIconStateChanged(state: KnobIconState): void {
    this.rootCssClass.toggle('status-bar-knob-icon-hidden', state === KnobIconState.Hidden);
    this.rootCssClass.toggle('status-bar-knob-icon-inner', state === KnobIconState.Inner);
    this.rootCssClass.toggle('status-bar-knob-icon-outer', state === KnobIconState.Outer);
    this.rootCssClass.toggle('status-bar-knob-icon-both', state === KnobIconState.Both);
  }

  /** @inheritDoc */
  public render(): VNode {
    if (this.props.class) {
      for (const cssClass of FSComponent.parseCssClassesFromString(this.props.class, classToAdd => !StatusBarKnobLabel.RESERVED_CLASSES.includes(classToAdd))) {
        this.rootCssClass.add(cssClass);
      }
    }

    return (
      <div class={this.rootCssClass}>
        <div class="status-bar-knob-inner">{this.innerText}</div>
        <svg viewBox='0 0 33 20' class='status-bar-knob-icon'>
          <path
            d='M 7.28 3.21 c 1.83 -1.97 4.44 -3.21 7.34 -3.21 c 5.52 0 10 4.48 10 10 s -4.48 10 -10 10 c -2.9 0 -5.51 -1.23 -7.34 -3.21'
            fill='none' stroke-width='3'
            class='status-bar-knob-icon-outer-center'
          />
          <path
            d='M 33 10 l -8.38 0'
            fill='none' stroke-width='3'
            class='status-bar-knob-icon-outer-line'
          />

          <circle
            cx='14.64' cy='10' r='4.73'
            class='status-bar-knob-icon-inner-center'
          />
          <path
            d='M 0 10 l 9.91 0'
            fill='none' stroke-width='3'
            class='status-bar-knob-icon-inner-line'
          />
        </svg>
        <div class='status-bar-knob-outer'>{this.outerText}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.innerText.destroy();
    this.outerText.destroy();
    this.iconState.destroy();

    super.destroy();
  }
}