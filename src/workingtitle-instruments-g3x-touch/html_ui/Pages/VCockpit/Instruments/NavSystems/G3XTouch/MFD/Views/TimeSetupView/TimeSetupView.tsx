import {
  ArraySubject, ClockEvents, ConsumerSubject, DateTimeFormatter, DurationFormatter, FSComponent, MappedSubject,
  MathUtils, MutableSubscribable, MutableSubscribableInputType, Subject, SubscribableType, Subscription, UnitType,
  VNode
} from '@microsoft/msfs-sdk';

import { DateTimeFormatSettingMode, DynamicListData, TimeDisplayFormat, TouchButtonOnTouchedAction } from '@microsoft/msfs-garminsdk';

import { G3XTimeDisplay } from '../../../Shared/Components/Common/G3XTimeDisplay';
import { UiList } from '../../../Shared/Components/List/UiList';
import { UiListFocusable } from '../../../Shared/Components/List/UiListFocusable';
import { UiListItem } from '../../../Shared/Components/List/UiListItem';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XDateTimeUserSettings } from '../../../Shared/Settings/G3XDateTimeUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';

import './TimeSetupView.css';

/**
 * An item in {@link TimeSetupView}'s list.
 */
type TimeSetupViewItem = DynamicListData & {
  /** A function that renders this item. */
  renderItem: () => VNode;
};

/**
 * A time setup menu.
 */
export class TimeSetupView extends AbstractUiView {

  private static readonly DATE_FORMATTER = DateTimeFormatter.create('{MON}-{dd}-{YY}');
  private static readonly LOCAL_OFFSET_FORMATTER = DurationFormatter.create('{+-}{hh}:{mm}', UnitType.MILLISECOND, 60000, '__:__');

  private static readonly DATE_TIME_FORMAT_SETTING_MAP = {
    [DateTimeFormatSettingMode.Local12]: TimeDisplayFormat.Local12,
    [DateTimeFormatSettingMode.Local24]: TimeDisplayFormat.Local24,
    [DateTimeFormatSettingMode.UTC]: TimeDisplayFormat.UTC
  };

  private readonly simTime = ConsumerSubject.create(null, 0).pause();

  private readonly dateTimeSettingManager = G3XDateTimeUserSettings.getManager(this.props.uiService.bus);

  private readonly dateTimeDisplayFormat = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(settingMode => {
    return TimeSetupView.DATE_TIME_FORMAT_SETTING_MAP[settingMode] ?? TimeDisplayFormat.UTC;
  }).pause();

  private readonly isTimeZoneItemVisible = this.dateTimeSettingManager.getSetting('dateTimeFormat').map(format => {
    return format !== DateTimeFormatSettingMode.UTC;
  }).pause();
  private readonly isLocalOffsetDecButtonEnabled = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').map(offset => {
    return offset > -86400e3; // -24 hr
  }).pause();
  private readonly isLocalOffsetIncButtonEnabled = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset').map(offset => {
    return offset < 86400e3; // +24 hr
  }).pause();

  private readonly dateTimeOffset = MappedSubject.create(
    ([format, offset]): number => {
      return format === DateTimeFormatSettingMode.UTC ? 0 : offset;
    },
    this.dateTimeSettingManager.getSetting('dateTimeFormat'),
    this.dateTimeSettingManager.getSetting('dateTimeLocalOffset')
  ).pause();

  private readonly offsetTime = MappedSubject.create(
    ([time, offset]): number => {
      return time + offset;
    },
    this.simTime,
    this.dateTimeOffset
  );

  private readonly dateString = this.offsetTime.map(TimeSetupView.DATE_FORMATTER);

  private readonly listRef = FSComponent.createRef<UiList<any>>();
  private readonly listData = ArraySubject.create<TimeSetupViewItem>(this.createListData());

  private readonly listItemLengthPx = this.props.uiService.gduFormat === '460' ? 96 : 50;
  private readonly listItemSpacingPx = this.props.uiService.gduFormat === '460' ? 8 : 4;

  private readonly subscriptions: Subscription[] = [
    this.simTime,
    this.dateTimeOffset,
    this.dateTimeDisplayFormat,
    this.isTimeZoneItemVisible,
    this.isLocalOffsetDecButtonEnabled,
    this.isLocalOffsetIncButtonEnabled
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    const sub = this.props.uiService.bus.getSubscriber<ClockEvents>();

    this.simTime.setConsumer(sub.on('simTime').withPrecision(-3));

    this.listRef.instance.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onResume(): void {
    this.listRef.instance.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.listRef.instance.removeFocus();
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.listRef.instance.scrollToIndex(0, 0, true, false);

    for (const sub of this.subscriptions) {
      sub.resume();
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    this.listRef.instance.clearRecentFocus();

    for (const sub of this.subscriptions) {
      sub.pause();
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.listRef.instance.onUiInteractionEvent(event);
  }

  /**
   * Increments the value of the local time offset setting by 15 minutes.
   * @param direction The direction in which to increment the setting value.
   */
  private incrementLocalOffsetSetting(direction: 1 | -1): void {
    const localOffsetSetting = this.dateTimeSettingManager.getSetting('dateTimeLocalOffset');

    // Clamp values from -24 hours to +24 hours.
    localOffsetSetting.value = MathUtils.clamp(
      localOffsetSetting.value + direction * UnitType.MINUTE.convertTo(15, UnitType.MILLISECOND),
      -86400e3,
      86400e3
    );
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='time-setup-view ui-titled-view'>
        <div class='time-setup-view-title ui-view-title'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_time_setup.png`} class='ui-view-title-icon' />
          <div>Time Setup</div>
        </div>
        <div class='time-setup-view-content ui-titled-view-content'>
          <UiList
            ref={this.listRef}
            bus={this.props.uiService.bus}
            validKnobIds={this.props.uiService.validKnobIds}
            data={this.listData}
            listItemLengthPx={this.listItemLengthPx}
            listItemSpacingPx={this.listItemSpacingPx}
            itemsPerPage={6}
            renderItem={item => item.renderItem()}
            autoDisableOverscroll
            autoRefocus
            class='time-setup-view-list'
          />
        </div>
      </div>
    );
  }

  /**
   * Creates this view's list data array.
   * @returns This view's list data array.
   */
  private createListData(): TimeSetupViewItem[] {
    const utcOffsetValueButtonRef = FSComponent.createRef<UiTouchButton>();

    return [
      {
        renderItem: () => (
          <UiListItem>
            <div class='time-setup-view-row-left'>Current Time</div>
            <div class='time-setup-view-row-date-time-right'>
              <G3XTimeDisplay
                class='time-setup-view-time'
                time={this.offsetTime}
                format={this.dateTimeDisplayFormat}
                localOffset={0}
                useVerticalSuffix
                hideSuffixWhenNaN
              />
              <div class='time-setup-view-date'>
                {this.dateString}
              </div>
            </div>
          </UiListItem>
        )
      },
      {
        renderItem: () => (
          <UiListItem>
            <div class='time-setup-view-row-left'>Time Format</div>
            <UiListFocusable>
              {this.renderListSelectButton(
                this.dateTimeSettingManager.getSetting('dateTimeFormat'),
                value => {
                  switch (value) {
                    case DateTimeFormatSettingMode.UTC:
                      return 'UTC';
                    case DateTimeFormatSettingMode.Local12:
                      return '12 Hour';
                    case DateTimeFormatSettingMode.Local24:
                      return '24 Hour';
                    default:
                      return '';
                  }
                },
                {
                  selectedValue: this.dateTimeSettingManager.getSetting('dateTimeFormat'),
                  inputData: [
                    {
                      value: DateTimeFormatSettingMode.UTC,
                      labelRenderer: () => 'UTC',
                    },
                    {
                      value: DateTimeFormatSettingMode.Local12,
                      labelRenderer: () => '12 Hour',
                    },
                    {
                      value: DateTimeFormatSettingMode.Local24,
                      labelRenderer: () => '24 Hour',
                    },
                  ]
                }
              )}
            </UiListFocusable>
          </UiListItem>
        )
      },
      {
        isVisible: this.isTimeZoneItemVisible,
        renderItem: () => (
          <UiListItem>
            <div class='time-setup-view-row-left'>Time Zone</div>
            <UiListFocusable>
              {this.renderListSelectButton(Subject.create('Manual'))}
            </UiListFocusable>
          </UiListItem>
        )
      },
      {
        isVisible: this.isTimeZoneItemVisible,
        renderItem: () => (
          <UiListItem>
            <div class='time-setup-view-row-left'>UTC Offset</div>
            <div class='time-setup-view-row-utc-offset-right'>
              <UiTouchButton
                label='-'
                isEnabled={this.isLocalOffsetDecButtonEnabled}
                onTouched={() => {
                  utcOffsetValueButtonRef.instance.focusSelf();
                  return TouchButtonOnTouchedAction.Prime;
                }}
                onPressed={this.incrementLocalOffsetSetting.bind(this, -1)}
                class='time-setup-view-utc-offset-incdec-button'
              />
              <UiListFocusable>
                <UiTouchButton
                  ref={utcOffsetValueButtonRef}
                  label={this.dateTimeOffset.map(TimeSetupView.LOCAL_OFFSET_FORMATTER)}
                  onTouched={() => TouchButtonOnTouchedAction.Ignore}
                  class='time-setup-view-utc-offset-value-button'
                />
              </UiListFocusable>
              <UiTouchButton
                label='+'
                isEnabled={this.isLocalOffsetIncButtonEnabled}
                onTouched={() => {
                  utcOffsetValueButtonRef.instance.focusSelf();
                  return TouchButtonOnTouchedAction.Prime;
                }}
                onPressed={this.incrementLocalOffsetSetting.bind(this, 1)}
                class='time-setup-view-utc-offset-incdec-button'
              />
            </div>
          </UiListItem>
        )
      }
    ];
  }

  /**
   * Renders a button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog.
   * @param state The state to which to bind the button.
   * @param renderValue A function which renders the value of the button's bound state, or a VNode which renders the
   * value. If not defined, then values are rendered into strings via default `toString()` behavior. If the rendered
   * value is a VNode, then all first-level DisplayComponents in the VNode tree will be destroyed when a new value is
   * rendered or when the button is destroyed.
   * @param listParams Parameters to pass to the selection list dialog, or a function which will return the parameters
   * when called each time the list is opened.
   * @param cssClass CSS class(es) to apply to the button's root element.
   * @returns A button which displays a state value and when pressed, allows the user to select a value for the state
   * from a list dialog, as a VNode.
   */
  private renderListSelectButton<S extends MutableSubscribable<any, any>>(
    state: S,
    renderValue?: VNode | ((stateValue: SubscribableType<S>) => string | VNode),
    listParams?: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>),
    cssClass?: string
  ): VNode {
    const defaultListItemHeight = this.props.uiService.gduFormat === '460' ? 84 : 42;
    const defaultListItemSpacing = this.props.uiService.gduFormat === '460' ? 4 : 2;

    const modifyListParams = (inputListParams: UiListDialogParams<MutableSubscribableInputType<S>>): UiListDialogParams<MutableSubscribableInputType<S>> => {
      const modified = Object.assign({}, inputListParams);

      modified.itemsPerPage ??= Math.min(inputListParams.inputData.length, 5);
      modified.listItemHeightPx ??= defaultListItemHeight;
      modified.listItemSpacingPx ??= defaultListItemSpacing;
      modified.autoDisableOverscroll ??= true;
      modified.class ??= 'time-setup-view-select-list';

      return modified;
    };

    let finalListParams: UiListDialogParams<MutableSubscribableInputType<S>> | ((state: S) => UiListDialogParams<MutableSubscribableInputType<S>>);

    if (listParams === undefined) {
      finalListParams = { inputData: [] };
    } else if (typeof listParams === 'object') {
      finalListParams = modifyListParams(listParams);
    } else {
      finalListParams = (listParamsState: S): UiListDialogParams<MutableSubscribableInputType<S>> => {
        return modifyListParams(listParams(listParamsState));
      };
    }

    return (
      <UiListSelectTouchButton
        uiService={this.props.uiService}
        listDialogLayer={UiViewStackLayer.Overlay}
        listDialogKey={UiViewKeys.ListDialog1}
        openDialogAsPositioned
        containerRef={this.props.containerRef}
        isEnabled={listParams !== undefined}
        state={state}
        renderValue={renderValue}
        listParams={finalListParams}
        isInList
        class={cssClass}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.listRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}