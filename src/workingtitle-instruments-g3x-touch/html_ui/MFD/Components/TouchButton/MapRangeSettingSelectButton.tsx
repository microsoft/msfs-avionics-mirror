import { ArrayUtils, DisplayComponent, FSComponent, MutableSubscribable, VNode } from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { G3XMapRangeSettingDisplay } from '../../../Shared/Components/Common/G3XMapRangeSettingDisplay';
import { G3XMapUtils } from '../../../Shared/Components/Map/G3XMapUtils';
import { UiFocusableComponent } from '../../../Shared/UiSystem/UiFocusTypes';
import { ListDialogItemDefinition, UiListDialogParams } from '../../Dialogs/UiListDialog';
import { UiListSelectTouchButton, UiListSelectTouchButtonProps } from './UiListSelectTouchButton';

/**
 * Selection list dialog parameters used by {@link MapRangeSettingSelectButton}.
 */
export type MapRangeSettingSelectButtonListParams = Omit<UiListDialogParams<number>, 'inputData' | 'selectedValue'>;

/**
 * Component props for MapRangeSettingSelectButton.
 */
export interface MapRangeSettingSelectButtonProps
  extends Omit<UiListSelectTouchButtonProps<MutableSubscribable<number>>, 'listParams'> {

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** The index of the smallest selectable map range, inclusive. */
  startIndex: number;

  /** The index of the largest selectable map range, inclusive. */
  endIndex: number;

  /** Whether to include the 'Off' (`-1`) setting in the selection list. */
  includeOff?: boolean;

  /** Parameters to pass to the selection list dialog. */
  listParams: Readonly<MapRangeSettingSelectButtonListParams>;
}

/**
 * A touchscreen button which displays the value of a map range setting and when pressed, opens a selection list dialog
 * to set the value of the setting.
 */
export class MapRangeSettingSelectButton extends DisplayComponent<MapRangeSettingSelectButtonProps> {
  private readonly buttonRef = FSComponent.createRef<UiListSelectTouchButton<MutableSubscribable<number>>>();

  /** A reference to this button's focusable component. */
  public readonly focusableComponentRef = FSComponent.createRef<UiFocusableComponent & DisplayComponent<any>>();

  private readonly mapRangeArray = this.props.unitsSettingManager.getSetting('unitsDistance').map(mode => G3XMapUtils.mapRanges(mode));

  /** @inheritdoc */
  public onAfterRender(): void {
    this.focusableComponentRef.instance = this.buttonRef.instance.focusableComponentRef.instance;
  }

  /**
   * Gets this button's root HTML element.
   * @returns This button's root HTML element.
   * @throws Error if this button has not yet been rendered.
   */
  public getRootElement(): HTMLElement {
    return this.buttonRef.instance.getRootElement();
  }

  /**
   * Simulates this button being pressed. This will execute the `onPressed()` callback if one is defined.
   * @param ignoreDisabled Whether to simulate the button being pressed regardless of whether the button is disabled.
   * Defaults to `false`.
   */
  public simulatePressed(ignoreDisabled = false): void {
    this.buttonRef.getOrDefault()?.simulatePressed(ignoreDisabled);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <UiListSelectTouchButton
        ref={this.buttonRef}
        uiService={this.props.uiService}
        listDialogLayer={this.props.listDialogLayer}
        listDialogKey={this.props.listDialogKey}
        openDialogAsPositioned={this.props.openDialogAsPositioned}
        containerRef={this.props.containerRef}
        dialogPositionReference={this.props.dialogPositionAlign}
        dialogPositionAlign={this.props.dialogPositionAlign}
        dialogPositionXOffset={this.props.dialogPositionXOffset}
        dialogPositionYOffset={this.props.dialogPositionYOffset}
        dialogBackgroundOcclusion={this.props.dialogBackgroundOcclusion}
        hideDropdownArrow={this.props.hideDropdownArrow}
        state={this.props.state}
        isEnabled={this.props.isEnabled}
        isHighlighted={this.props.isHighlighted}
        isVisible={this.props.isVisible}
        label={this.props.label}
        renderValue={
          <G3XMapRangeSettingDisplay
            rangeIndex={this.props.state}
            rangeArray={this.mapRangeArray}
            displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
          />
        }
        listParams={{
          inputData: [
            ...(this.props.includeOff
              ? [{ value: -1, labelRenderer: () => 'Off' }]
              : []
            ),
            ...ArrayUtils.create(this.props.endIndex - this.props.startIndex + 1, (index): ListDialogItemDefinition<number> => {
              const value = index + this.props.startIndex;

              return {
                value,
                labelRenderer: (): VNode => {
                  return (
                    <G3XMapRangeSettingDisplay
                      rangeIndex={value}
                      rangeArray={this.mapRangeArray}
                      displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
                    />
                  );
                }
              };
            })
          ],
          selectedValue: this.props.state,
          ...this.props.listParams
        }}
        onTouched={this.props.onTouched}
        onHoldStarted={this.props.onHoldStarted}
        onHoldTick={this.props.onHoldTick}
        onHoldEnded={this.props.onHoldEnded}
        focusOnDrag={this.props.focusOnDrag}
        inhibitOnDrag={this.props.inhibitOnDrag}
        inhibitOnDragAxis={this.props.inhibitOnDragAxis}
        dragThresholdPx={this.props.dragThresholdPx}
        isInList={this.props.isInList}
        listScrollAxis={this.props.listScrollAxis}
        focusController={this.props.focusController}
        canBeFocused={this.props.canBeFocused}
        focusOptions={this.props.focusOptions}
        class={this.props.class}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRef.getOrDefault()?.destroy();

    this.mapRangeArray.destroy();

    super.destroy();
  }
}