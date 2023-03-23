import { DisplayComponent, FSComponent, SetSubject, Subscription, UserSettingManager, VNode } from '@microsoft/msfs-sdk';
import { DisplayPaneSettings } from '@microsoft/msfs-wtg3000-common';
import { GtcTouchButton, GtcTouchButtonProps } from './GtcTouchButton';

import './GtcSelectedButton.css';
import './ImgTouchButton.css';

/**
 * Component props for GtcDesignatedPaneButton.
 */
export interface GtcDesignatedPaneButtonProps extends Omit<GtcTouchButtonProps, 'label' | 'onPressed'> {
  /** A manager of display pane settings for the display pane controlled by the button. */
  displayPaneSettingManager: UserSettingManager<DisplayPaneSettings>;

  /**
   * An iterable of keys for display pane views that, when set as the designated pane view for the button's display
   * pane, marks the button as selected.
   */
  selectedPaneViewKeys: Iterable<string>;

  /** The button's label when not selected. Also defines the label when selected if `selectedLabel` is not defined. */
  label?: string;

  /** The src of the button's image when not selected. Also defines the src when selected if `selectedImgSrc` is not defined. */
  imgSrc?: string;

  /** The button's label when selected. Defaults to the unselected label. */
  selectedLabel?: string;

  /** The src of the button's image when selected. Defaults to the unselected image src. */
  selectedImgSrc?: string;

  /**
   * A callback function which will be called every time the button is pressed. If not defined and
   * `getPaneViewKeyToSelect` is defined, the button will set the designated pane view and the displayed pane view to
   * the one returned by `getPaneViewKeyToSelect` when pressed and not selected.
   */
  onPressed?: (isSelected: boolean, button: GtcDesignatedPaneButton) => void;

  /**
   * A function which gets the key of the display pane view to set as the designated and displayed pane view when the
   * button is pressed and not considered to be selected. Ignored if `onPressed` is defined.
   */
  getPaneViewKeyToDesignate?: () => string;

  /**
   * A call back function which will be called every time the button is pressed and considered to be selected. Ignored
   * if `onPressed` is defined.
   */
  onPressedSelected?: (button: GtcDesignatedPaneButton) => void;
}

/**
 * A touchscreen button displaying a label and image whose state is dependent on the designated pane view of a display
 * pane. The button is considered selected when the designated pane view is one of a set of specified views. When
 * selected, the button is marked with a cyan border and optionally displays a different label and image. The button
 * can be configured to execute certain actions based on whether it is selected, including setting the designated and
 * displayed pane views to a specific view.
 */
export class GtcDesignatedPaneButton extends DisplayComponent<GtcDesignatedPaneButtonProps> {
  private static readonly RESERVED_CSS_CLASSES = ['touch-button-img', 'gtc-button-selected'];

  private readonly buttonRef = FSComponent.createRef<GtcTouchButton>();

  private readonly rootCssClass = SetSubject.create(['touch-button-img']);
  private readonly imgCssClass = this.props.imgSrc === undefined ? undefined : SetSubject.create(['touch-button-img-img']);
  private readonly selectedImgCssClass = this.props.selectedImgSrc === undefined ? undefined : SetSubject.create(['touch-button-img-img']);

  private readonly paneKeys = new Set(this.props.selectedPaneViewKeys);

  private readonly isSelected = this.props.displayPaneSettingManager.getSetting('displayPaneDesignatedView').map(key => this.paneKeys.has(key));

  private readonly unselectedLabel = this.props.label ?? '';
  private readonly selectedLabel = this.props.selectedLabel ?? this.unselectedLabel;

  private readonly label = this.props.label !== undefined || this.props.selectedLabel !== undefined
    ? this.isSelected.map(isSelected => {
      return isSelected ? this.selectedLabel : this.unselectedLabel;
    })
    : undefined;

  private cssClassSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.isSelected.sub(isSelected => {
      this.rootCssClass.toggle('gtc-button-selected', isSelected);

      if (this.selectedImgCssClass !== undefined) {
        this.imgCssClass?.toggle('hidden', isSelected);
        this.selectedImgCssClass.toggle('hidden', !isSelected);
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    if (this.props.class !== undefined) {
      if (typeof this.props.class === 'object') {
        this.cssClassSub = FSComponent.bindCssClassSet(this.rootCssClass, this.props.class, GtcDesignatedPaneButton.RESERVED_CSS_CLASSES);
      } else if (this.props.class.length > 0) {
        for (const classToAdd of FSComponent.parseCssClassesFromString(this.props.class, cssClass => !GtcDesignatedPaneButton.RESERVED_CSS_CLASSES.includes(cssClass))) {
          this.rootCssClass.add(classToAdd);
        }
      }
    }

    return (
      <GtcTouchButton
        ref={this.buttonRef}
        label={this.label}
        onPressed={() => {
          if (this.props.onPressed !== undefined) {
            this.props.onPressed(this.isSelected.get(), this);
          } else if (this.props.getPaneViewKeyToDesignate !== undefined) {
            if (this.isSelected.get()) {
              this.props.onPressedSelected && this.props.onPressedSelected(this);
            } else if (this.props.getPaneViewKeyToDesignate !== undefined) {
              const key = this.props.getPaneViewKeyToDesignate();
              this.props.displayPaneSettingManager.getSetting('displayPaneDesignatedView').value = key;
              this.props.displayPaneSettingManager.getSetting('displayPaneView').value = key;
            }
          }
        }}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        gtcOrientation={this.props.gtcOrientation}
        class={this.rootCssClass}
      >
        {this.props.imgSrc !== undefined && <img src={this.props.imgSrc} class={this.imgCssClass} />}
        {this.props.selectedImgSrc !== undefined && <img src={this.props.selectedImgSrc} class={this.selectedImgCssClass} />}
        <>{this.props.children}</>
      </GtcTouchButton>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.props.onDestroy && this.props.onDestroy();

    this.buttonRef.getOrDefault()?.destroy();

    this.isSelected.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}