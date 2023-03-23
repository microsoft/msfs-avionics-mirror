import {
  ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, MappedSubject, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AoaDataProvider, AoaIndicator as BaseAoaIndicator } from '@microsoft/msfs-garminsdk';
import { AoaIndicatorDisplaySettingMode, AoaIndicatorUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import { AoaIndicatorConfig } from './AoaIndicatorConfig';

import './AoaIndicator.css';

/**
 * Component props for AoaIndicator.
 */
export interface AoaIndicatorProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The configuration object for the indicator. */
  config: AoaIndicatorConfig;

  /** A data provider for the indicator. */
  dataProvider: AoaDataProvider;

  /** A manager for angle of attack indicator user settings. */
  settingManager: UserSettingManager<AoaIndicatorUserSettingTypes>;
}

/**
 * A G3000 PFD angle of attack indicator.
 */
export class AoaIndicator extends DisplayComponent<AoaIndicatorProps> {
  private readonly gear1Position = ConsumerSubject.create(null, 0);
  private readonly gear2Position = ConsumerSubject.create(null, 0);
  private readonly gear3Position = ConsumerSubject.create(null, 0);

  private readonly flapsLeftAngle = ConsumerSubject.create(null, 0);
  private readonly flapsRightAngle = ConsumerSubject.create(null, 0);

  private readonly declutter = MappedSubject.create(
    ([displayMode, gear1Position, gear2Position, gear3Position, flapsLeftAngle, flapsRightAngle]): boolean => {
      switch (displayMode) {
        case AoaIndicatorDisplaySettingMode.Auto:
          return gear1Position < 1
            && gear2Position < 1
            && gear3Position < 1
            && flapsLeftAngle < 3
            && flapsRightAngle < 3;
        case AoaIndicatorDisplaySettingMode.On:
          return false;
        default:
          return true;
      }
    },
    this.props.settingManager.getSetting('aoaDisplayMode'),
    this.gear1Position,
    this.gear2Position,
    this.gear3Position,
    this.flapsLeftAngle,
    this.flapsRightAngle
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

    this.gear1Position.setConsumer(sub.on('gear_position_1'));
    this.gear2Position.setConsumer(sub.on('gear_position_2'));
    this.gear3Position.setConsumer(sub.on('gear_position_3'));

    this.flapsLeftAngle.setConsumer(sub.on('flaps_left_angle'));
    this.flapsRightAngle.setConsumer(sub.on('flaps_right_angle'));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <BaseAoaIndicator
        advanced={this.props.config.advanced}
        dataProvider={this.props.dataProvider}
        declutter={this.declutter}
      />
    );
  }
}