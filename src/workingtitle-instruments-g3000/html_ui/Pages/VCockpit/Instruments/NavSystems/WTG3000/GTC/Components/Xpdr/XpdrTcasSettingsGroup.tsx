import {
  ComponentProps, ConsumerSubject, ControlEvents, DisplayComponent, EventBus, FSComponent, MappedSubject, SetSubject, SubscribableSet,
  Subscription, UserSettingManager, VNode, XPDRMode, XPDRSimVarEvents,
} from '@microsoft/msfs-sdk';
import { TrafficOperatingModeSetting, TrafficUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { GtcSetValueTouchButton } from '../TouchButton/GtcSetValueTouchButton';
import { GtcToggleTouchButton } from '../TouchButton/GtcToggleTouchButton';

import './XpdrTcasSettingsGroup.css';

/**
 * Component props for XpdrTcasSettingsGroup.
 */
export interface TcasXpdrSettingsGroupProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** A manager for traffic system user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;

  /** CSS class(es) to apply to the group's root element. */
  class?: string | SubscribableSet<string>;

  /** Whether to show the long Altitude Reporting label */
  longAltReportingLabel?: boolean;
}

/**
 * A component which displays a group of buttons controlling transponder and TCAS-II operating modes.
 */
export class XpdrTcasSettingsGroup extends DisplayComponent<TcasXpdrSettingsGroupProps> {
  private static readonly ROOT_CLASSES = ['xpdr-tcas-group'];

  private readonly buttonRefs = Array.from({ length: 5 }, () => FSComponent.createRef<DisplayComponent<any>>());

  private readonly controlPublisher = this.props.bus.getPublisher<ControlEvents>();

  private readonly xpdrMode = ConsumerSubject.create(null, XPDRMode.OFF);
  private readonly trafficOperatingModeSetting = this.props.trafficSettingManager.getSetting('trafficOperatingMode');

  private readonly altState = MappedSubject.create(
    ([xpdrMode, trafficOperatingMode]): boolean => {
      return xpdrMode === XPDRMode.ALT && trafficOperatingMode === TrafficOperatingModeSetting.Standby;
    },
    this.xpdrMode,
    this.trafficOperatingModeSetting
  );

  private readonly onState = MappedSubject.create(
    ([xpdrMode, trafficOperatingMode]): boolean => {
      return xpdrMode === XPDRMode.ON && trafficOperatingMode === TrafficOperatingModeSetting.Standby;
    },
    this.xpdrMode,
    this.trafficOperatingModeSetting
  );

  private readonly standbyState = MappedSubject.create(
    ([xpdrMode, trafficOperatingMode]): boolean => {
      return xpdrMode === XPDRMode.STBY && trafficOperatingMode === TrafficOperatingModeSetting.Standby;
    },
    this.xpdrMode,
    this.trafficOperatingModeSetting
  );

  private cssClassSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    // TODO: Support multiple transponders
    this.xpdrMode.setConsumer(this.props.bus.getSubscriber<XPDRSimVarEvents>().on('xpdr_mode_1'));
  }

  /** @inheritdoc */
  public render(): VNode {
    let cssClass: string | SetSubject<string>;

    if (this.props.class !== undefined && typeof this.props.class === 'object') {
      cssClass = SetSubject.create(XpdrTcasSettingsGroup.ROOT_CLASSES);
      this.cssClassSub = FSComponent.bindCssClassSet(cssClass, this.props.class, XpdrTcasSettingsGroup.ROOT_CLASSES);
    } else {
      cssClass = 'xpdr-tcas-group';

      if (this.props.class !== undefined && this.props.class.length > 0) {
        cssClass += ' ' + FSComponent.parseCssClassesFromString(this.props.class, classToAdd => classToAdd !== 'xpdr-tcas-group').join(' ');
      }
    }

    return (
      <div class={cssClass}>
        <div class='xpdr-tcas-group-title'>XPDR/TCAS Mode</div>
        <GtcSetValueTouchButton
          ref={this.buttonRefs[0]}
          state={this.trafficOperatingModeSetting}
          setValue={TrafficOperatingModeSetting.Auto}
          label={'Auto'}
        />
        <GtcSetValueTouchButton
          ref={this.buttonRefs[1]}
          state={this.trafficOperatingModeSetting}
          setValue={TrafficOperatingModeSetting.TAOnly}
          label={'TA Only'}
        />
        <GtcToggleTouchButton
          ref={this.buttonRefs[2]}
          state={this.altState}
          label={this.props.longAltReportingLabel ? 'Altitude\nReporting' : 'ALT Reporting'}
          onPressed={(): void => {
            this.trafficOperatingModeSetting.value = TrafficOperatingModeSetting.Standby;
            this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.ALT, true, false);
          }}
        />
        <GtcToggleTouchButton
          ref={this.buttonRefs[3]}
          state={this.onState}
          label={'On'}
          onPressed={(): void => {
            this.trafficOperatingModeSetting.value = TrafficOperatingModeSetting.Standby;
            this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.ON, true, false);
          }}
        />
        <GtcToggleTouchButton
          ref={this.buttonRefs[4]}
          state={this.standbyState}
          label={'Standby'}
          onPressed={(): void => {
            this.trafficOperatingModeSetting.value = TrafficOperatingModeSetting.Standby;
            this.controlPublisher.pub('publish_xpdr_mode_1', XPDRMode.STBY, true, false);
          }}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    this.altState.destroy();
    this.onState.destroy();
    this.standbyState.destroy();

    this.cssClassSub?.destroy();

    super.destroy();
  }
}