/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { ComponentProps, DisplayComponent, FSComponent, Subject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { DateTimeUserSettingTypes, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { TemperatureInfoDataProvider } from '../../DataProviders';
import { UiKnobId } from '../../UiSystem/UiKnobTypes';
import { UiService } from '../../UiSystem/UiService';
import { StatusBarClock } from './StatusBarClock';
import { StatusBarKnobLabel } from './StatusBarKnobLabel/StatusBarKnobLabel';
import { StatusBarOat } from './StatusBarOat/StatusBarOat';
import { StatusBarTimer } from './StatusBarTimer/StatusBarTimer';

import './StatusBar.css';

/**
 * Component props for StatusBar.
 */
export interface StatusBarProps extends ComponentProps {
  /** The UI service instance. */
  uiService: UiService;

  /** A temperature data provider for the status bar. */
  temperatureDataProvider: TemperatureInfoDataProvider;

  /** A manager for date/time user settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;
}

/**
 * Status bar display component for the G3X Touch.
 */
export class StatusBar extends DisplayComponent<StatusBarProps> {
  private readonly knobLeftInnerText = this.props.uiService.gduFormat === '460'
    ? this.props.uiService.knobLabelState[UiKnobId.LeftInner]
    : undefined;

  private readonly knobLeftInnerPushText = this.props.uiService.gduFormat === '460'
    ? this.props.uiService.knobLabelState[UiKnobId.LeftInnerPush]
    : undefined;

  private readonly knobLeftOuterText = this.props.uiService.gduFormat === '460'
    ? this.props.uiService.knobLabelState[UiKnobId.LeftOuter]
    : undefined;

  private readonly knobRightInnerText = this.props.uiService.knobLabelState[this.props.uiService.gduFormat === '460' ? UiKnobId.RightInner : UiKnobId.SingleInner];

  private readonly knobRightInnerPushText = this.props.uiService.knobLabelState[this.props.uiService.gduFormat === '460' ? UiKnobId.RightInnerPush : UiKnobId.SingleInnerPush];

  private readonly knobRightOuterText = this.props.uiService.knobLabelState[this.props.uiService.gduFormat === '460' ? UiKnobId.RightOuter : UiKnobId.SingleOuter];

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class="status-bar-bottom">
        {this.props.uiService.gduFormat === '460' && (
          <>
            <StatusBarKnobLabel
              innerText={this.knobLeftInnerText!}
              innerPushText={this.knobLeftInnerPushText!}
              outerText={this.knobLeftOuterText!}
              class='status-bar-knob-left'
            />
            <div class="status-bar-divider" />
            <StatusBarTimer uiService={this.props.uiService} />
            <div class="status-bar-divider" />
            <StatusBarOat
              dataProvider={this.props.temperatureDataProvider}
              unitsSettingManager={this.props.unitsSettingManager}
              declutter={Subject.create(false)}
            />
            <div class="status-bar-divider" />
            <StatusBarClock
              bus={this.props.uiService.bus}
              dateTimeSettingManager={this.props.dateTimeSettingManager}
            />
            <div class="status-bar-divider" />
          </>
        )}
        <div class="status-bar-section status-bar-messages-container">Messages</div>
        <div class="status-bar-divider" />
        <StatusBarKnobLabel
          innerText={this.knobRightInnerText}
          innerPushText={this.knobRightInnerPushText}
          outerText={this.knobRightOuterText}
          class='status-bar-knob-right'
        />
      </div>
    );
  }
}