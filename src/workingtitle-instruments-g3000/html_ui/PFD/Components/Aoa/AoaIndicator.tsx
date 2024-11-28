import {
  ComponentProps, ConsumerSubject, ControlSurfacesEvents, DisplayComponent, EventBus, FSComponent, MappedSubject,
  Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { AoaDataProvider, AoaIndicator as BaseAoaIndicator } from '@microsoft/msfs-garminsdk';

import { AoaIndicatorDisplaySettingMode, AoaIndicatorUserSettingTypes, NumericConfigResult } from '@microsoft/msfs-wtg3000-common';

import { AoaIndicatorConfig } from './AoaIndicatorConfig';

import './AoaIndicator.css';

/**
 * Component props for {@link AoaIndicator}.
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
  private readonly rootRef = FSComponent.createRef<BaseAoaIndicator>();

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

  private readonly subscriptions: Subscription[] = [
    this.gear1Position,
    this.gear2Position,
    this.gear3Position,
    this.flapsLeftAngle,
    this.flapsRightAngle,
    this.declutter
  ];

  private readonly aoaDefs: NumericConfigResult[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<ControlSurfacesEvents>();

    this.gear1Position.setConsumer(sub.on('gear_position_1'));
    this.gear2Position.setConsumer(sub.on('gear_position_2'));
    this.gear3Position.setConsumer(sub.on('gear_position_3'));

    this.flapsLeftAngle.setConsumer(sub.on('flaps_left_angle'));
    this.flapsRightAngle.setConsumer(sub.on('flaps_right_angle'));
  }

  /** @inheritDoc */
  public render(): VNode {
    const aoaDefContext = { bus: this.props.bus };

    const donutCueNormAoaDef = this.props.config.donutCueNormAoa?.(aoaDefContext);
    const referenceTickNormAoaDef = this.props.config.advanced ? undefined : this.props.config.referenceTickNormAoa?.(aoaDefContext);
    const warningThresholdDef = this.props.config.warningThreshold?.(aoaDefContext);
    const cautionThresholdDef = this.props.config.cautionThreshold?.(aoaDefContext);

    donutCueNormAoaDef && this.aoaDefs.push(donutCueNormAoaDef);
    referenceTickNormAoaDef && this.aoaDefs.push(referenceTickNormAoaDef);
    warningThresholdDef && this.aoaDefs.push(warningThresholdDef);
    cautionThresholdDef && this.aoaDefs.push(cautionThresholdDef);

    return (
      <BaseAoaIndicator
        advanced={this.props.config.advanced}
        dataProvider={this.props.dataProvider}
        showDigitalReadout={this.props.config.showDigitalReadout}
        donutCueNormAoa={donutCueNormAoaDef?.value}
        referenceTickNormAoa={referenceTickNormAoaDef?.value}
        showMinorTicks={this.props.config.showMinorTicks}
        warningThreshold={warningThresholdDef?.value}
        cautionThreshold={cautionThresholdDef?.value}
        declutter={this.declutter}
      />
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.rootRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    for (const def of this.aoaDefs) {
      def.destroy?.();
    }

    super.destroy();
  }
}