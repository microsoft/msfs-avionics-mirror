import { ComponentProps, DisplayComponent, FSComponent, NumberFormatter, Subject, UnitType, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { TrafficAltitudeModeSetting, TrafficMotionVectorModeSetting, TrafficOperatingModeSetting, TrafficSystemType, TrafficUserSettingTypes } from '@microsoft/msfs-garminsdk';
import { NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import { SetValueTouchButton } from '../../Components/TouchButton/SetValueTouchButton';
import { ToggleTouchButton } from '../../Components/TouchButton/ToggleTouchButton';
import { GtcService } from '../../GtcService/GtcService';
import { GtcViewKeys } from '../../GtcService/GtcViewKeys';
import { GtcListSelectTouchButton } from '../TouchButton/GtcListSelectTouchButton';
import { XpdrTcasSettingsGroup } from '../Xpdr/XpdrTcasSettingsGroup';

import './TrafficSettingsDisplay.css';

/**
 * Component props for TrafficSettingsDisplay.
 */
export interface TrafficSettingsDisplayProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** The type of traffic system installed in the airplane. */
  trafficSystemType: TrafficSystemType;

  /** Whether the installed traffic system supports ADS-B in. */
  adsb: boolean;

  /** A manager for traffic system user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;
}

/**
 * A component displaying buttons for controlling traffic settings.
 */
export class TrafficSettingsDisplay extends DisplayComponent<TrafficSettingsDisplayProps> {
  private thisNode?: VNode;

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-settings'>
        {
          this.props.trafficSystemType === TrafficSystemType.Tis
            ? this.renderTis()
            : this.renderNonTis()
        }
      </div>
    );
  }

  /**
   * Renders a Traffic Information Service settings display.
   * @returns A Traffic Information Service settings display, as a VNode.
   */
  private renderTis(): VNode {
    return (
      <Tis trafficSettingManager={this.props.trafficSettingManager} />
    );
  }

  /**
   * Renders a settings display for Traffic Advisory System or TCAS-II.
   * @returns A settings display for Traffic Advisory System or TCAS-II, as a VNode.
   */
  private renderNonTis(): VNode {
    return (
      <>
        {this.renderOperatingModeGroup()}
        {this.renderAltitudeGroup()}
        {this.renderAdsbGroup()}
      </>
    );
  }

  /**
   * Renders the operating mode settings group display.
   * @returns The operating mode settings group display, as a VNode.
   */
  private renderOperatingModeGroup(): VNode {
    if (this.props.trafficSystemType === TrafficSystemType.TcasII) {
      return (
        <XpdrTcasSettingsGroup bus={this.props.gtcService.bus} trafficSettingManager={this.props.trafficSettingManager} class='tfc-settings-group' />
      );
    } else {
      return (
        <TasOperatingMode trafficSettingManager={this.props.trafficSettingManager} />
      );
    }
  }

  /**
   * Renders the altitude settings group display.
   * @returns The altitude settings group display, as a VNode.
   */
  private renderAltitudeGroup(): VNode {
    return (
      <AltitudeGroup
        gtcService={this.props.gtcService}
        trafficSettingManager={this.props.trafficSettingManager}
      />
    );
  }

  /**
   * Renders the ADS-B settings group display.
   * @returns The ADS-B settings group display, as a VNode, or `null` if ADS-B is not supported.
   */
  private renderAdsbGroup(): VNode | null {
    if (this.props.adsb) {
      return (
        <AdsbGroup
          gtcService={this.props.gtcService}
          trafficSettingManager={this.props.trafficSettingManager}
        />
      );
    } else {
      return null;
    }
  }

  /** @inheritdoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}

/**
 * Component props for Tis.
 */
interface TisProps extends ComponentProps {
  /** A manager for traffic system user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;
}

/**
 * A component displaying buttons for controlling Traffic Information Service settings.
 */
class Tis extends DisplayComponent<TisProps> {
  private readonly buttonRefs = Array.from({ length: 3 }, () => FSComponent.createRef<DisplayComponent<any>>());

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-settings-tis'>
        <div class='tfc-settings-group tfc-settings-tis-operate-group'>
          <div class='tfc-settings-group-title'>Operation Mode</div>
          <SetValueTouchButton
            ref={this.buttonRefs[0]}
            state={this.props.trafficSettingManager.getSetting('trafficOperatingMode')}
            setValue={TrafficOperatingModeSetting.Operating}
            label={'Operate'}
          />
          <SetValueTouchButton
            ref={this.buttonRefs[1]}
            state={this.props.trafficSettingManager.getSetting('trafficOperatingMode')}
            setValue={TrafficOperatingModeSetting.Standby}
            label={'Standby'}
          />
        </div>
        <ToggleTouchButton
          ref={this.buttonRefs[2]}
          state={Subject.create(true)}
          label={'Mute<br>"Traffic Not Available"'}
          isEnabled={false}
          class='tfc-settings-tis-mute-button'
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    super.destroy();
  }
}

/**
 * Component props for TasOperatingMode.
 */
interface TasOperatingModeProps extends ComponentProps {
  /** A manager for traffic system user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;
}

/**
 * A component displaying buttons for controlling Traffic Advisory System operating mode.
 */
class TasOperatingMode extends DisplayComponent<TasOperatingModeProps> {
  private readonly buttonRefs = Array.from({ length: 2 }, () => FSComponent.createRef<DisplayComponent<any>>());

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-settings-group tfc-settings-tas-group'>
        <div class='tfc-settings-group-title'>Operation Mode</div>
        <SetValueTouchButton
          ref={this.buttonRefs[0]}
          state={this.props.trafficSettingManager.getSetting('trafficOperatingMode')}
          setValue={TrafficOperatingModeSetting.Operating}
          label={'Operate'}
        />
        <SetValueTouchButton
          ref={this.buttonRefs[1]}
          state={this.props.trafficSettingManager.getSetting('trafficOperatingMode')}
          setValue={TrafficOperatingModeSetting.Standby}
          label={'Standby'}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    super.destroy();
  }
}

/**
 * Component props for AltitudeGroup.
 */
interface AltitudeGroupProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** A manager for traffic system user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;
}

/**
 * A component displaying buttons for controlling traffic system altitude settings.
 */
class AltitudeGroup extends DisplayComponent<AltitudeGroupProps> {
  private readonly buttonRefs = Array.from({ length: 3 }, () => FSComponent.createRef<DisplayComponent<any>>());

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-settings-group tfc-settings-altitude-group'>
        <div class='tfc-settings-group-title'>Altitude Display</div>
        <SetValueTouchButton
          ref={this.buttonRefs[0]}
          state={this.props.trafficSettingManager.getSetting('trafficAltitudeRelative')}
          setValue={true}
          label={'Relative'}
        />
        <SetValueTouchButton
          ref={this.buttonRefs[1]}
          state={this.props.trafficSettingManager.getSetting('trafficAltitudeRelative')}
          setValue={false}
          label={'Absolute'}
        />
        <GtcListSelectTouchButton
          ref={this.buttonRefs[2]}
          gtcService={this.props.gtcService}
          state={this.props.trafficSettingManager.getSetting('trafficAltitudeMode')}
          label={'Altitude Range'}
          listDialogKey={GtcViewKeys.ListDialog1}
          listParams={{
            title: 'Altitude Range',
            inputData: [
              {
                value: TrafficAltitudeModeSetting.Unrestricted,
                labelRenderer: () => 'Unrestricted'
              },
              {
                value: TrafficAltitudeModeSetting.Above,
                labelRenderer: () => 'Above'
              },
              {
                value: TrafficAltitudeModeSetting.Normal,
                labelRenderer: () => 'Normal'
              },
              {
                value: TrafficAltitudeModeSetting.Below,
                labelRenderer: () => 'Below'
              }
            ],
            selectedValue: this.props.trafficSettingManager.getSetting('trafficAltitudeMode')
          }}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    super.destroy();
  }
}

/**
 * Component props for AdsbGroup.
 */
interface AdsbGroupProps extends ComponentProps {
  /** The GTC service. */
  gtcService: GtcService;

  /** A manager for traffic system user settings. */
  trafficSettingManager: UserSettingManager<TrafficUserSettingTypes>;
}

/**
 * A component displaying buttons for controlling traffic system ADS-B settings.
 */
class AdsbGroup extends DisplayComponent<AdsbGroupProps> {
  private static readonly NUMBER_FORMATTER = NumberFormatter.create({ precision: 1 });
  private static readonly VECTOR_DURATION_ARRAY = [
    UnitType.SECOND.createNumber(30),
    UnitType.MINUTE.createNumber(1),
    UnitType.MINUTE.createNumber(2),
    UnitType.MINUTE.createNumber(5)
  ];
  private static readonly DEFAULT_VECTOR_DURATION = UnitType.SECOND.createNumber(NaN);

  private readonly buttonRefs = Array.from({ length: 3 }, () => FSComponent.createRef<DisplayComponent<any>>());

  private readonly vectorDuration = this.props.trafficSettingManager.getSetting('trafficMotionVectorLookahead').map(lookahead => {
    return AdsbGroup.VECTOR_DURATION_ARRAY.find(duration => duration.equals(lookahead, UnitType.SECOND)) ?? AdsbGroup.DEFAULT_VECTOR_DURATION;
  });

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='tfc-settings-group tfc-settings-adsb-group'>
        <div class='tfc-settings-group-title'>ADS-B</div>
        <ToggleTouchButton
          ref={this.buttonRefs[0]}
          state={this.props.trafficSettingManager.getSetting('trafficAdsbEnabled')}
          label={'Traffic Display'}
        />
        <GtcListSelectTouchButton
          ref={this.buttonRefs[1]}
          gtcService={this.props.gtcService}
          state={this.props.trafficSettingManager.getSetting('trafficMotionVectorMode')}
          label={'Motion Vector'}
          listDialogKey={GtcViewKeys.ListDialog1}
          listParams={{
            title: 'Motion Vector Mode',
            inputData: [
              {
                value: TrafficMotionVectorModeSetting.Off,
                labelRenderer: () => 'Off'
              },
              {
                value: TrafficMotionVectorModeSetting.Absolute,
                labelRenderer: () => 'Absolute'
              },
              {
                value: TrafficMotionVectorModeSetting.Relative,
                labelRenderer: () => 'Relative'
              }
            ],
            selectedValue: this.props.trafficSettingManager.getSetting('trafficMotionVectorMode')
          }}
        />
        <GtcListSelectTouchButton
          ref={this.buttonRefs[2]}
          gtcService={this.props.gtcService}
          state={this.props.trafficSettingManager.getSetting('trafficMotionVectorLookahead')}
          label={'VECT Duration'}
          renderValue={
            <NumberUnitDisplay value={this.vectorDuration} displayUnit={null} formatter={AdsbGroup.NUMBER_FORMATTER} />
          }
          listDialogKey={GtcViewKeys.ListDialog1}
          listParams={{
            title: 'Motion Vector Duration',
            inputData: AdsbGroup.VECTOR_DURATION_ARRAY.map(duration => {
              return {
                value: duration.asUnit(UnitType.SECOND),
                labelRenderer: () => <NumberUnitDisplay value={duration} displayUnit={null} formatter={AdsbGroup.NUMBER_FORMATTER} />
              };
            }),
            selectedValue: this.props.trafficSettingManager.getSetting('trafficMotionVectorLookahead')
          }}
        />
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.buttonRefs.forEach(ref => { ref.getOrDefault()?.destroy(); });

    this.vectorDuration.destroy();

    super.destroy();
  }
}