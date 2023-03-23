import {
  CombinedSubject,
  ComponentProps,
  DisplayComponent,
  EventBus,
  FlightPlanner,
  FSComponent,
  Subject,
  VNode
} from '@microsoft/msfs-sdk';
import { MfdDisplayMode, MFDUserSettings } from '../../../MFD/MFDUserSettings';
import { WT21TCAS } from '../../Traffic/WT21TCAS';
import { LeftInfoPanel } from '../LeftInfoPanel/LeftInfoPanel';
import { RightInfoPanel } from '../RightInfoPanel/RightInfoPanel';
import { WaypointAlerter } from '../WaypointAlerter';
import { HSIContainer } from './HSIContainer';

import './MfdHsi.css';

/**
 * The properties for the MfdHsi component.
 */
interface MfdHsiProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner;

  /** An instance of TCAS. */
  tcas: WT21TCAS;

  /** The index of the MFD screen. */
  mfdIndex: number;
}

/**
 * The MfdHsi component.
 */
export class MfdHsi extends DisplayComponent<MfdHsiProps> {

  private readonly waypointAlerter = new WaypointAlerter(this.props.bus);
  private readonly containerRef = FSComponent.createRef<HTMLDivElement>();

  private readonly mfdSettingManager = MFDUserSettings.getAliasedManager(this.props.bus);
  private readonly mfdDisplayModeSetting = this.mfdSettingManager.getSetting('mfdDisplayMode');

  private visibleForElectricity = Subject.create(false);
  private visibleForMode = Subject.create(false);

  /** Show the MFD HSI based on electricity status. */
  public electricityShow(): void {
    this.visibleForElectricity.set(true);
  }

  /** Hide the MFD HSI based on electricity status. */
  public electricityHide(): void {
    this.visibleForElectricity.set(false);
  }

  /** Show the MFD HSI based on MFD mode. */
  public modeShow(): void {
    this.visibleForMode.set(true);
  }

  /** Hide the MFD HSI based on MFD mode. */
  public modeHide(): void {
    this.visibleForMode.set(false);
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.mfdDisplayModeSetting.sub((mode) => {
      if (mode === MfdDisplayMode.Map) {
        this.modeShow();
      } else {
        this.modeHide();
      }
    }, true);

    CombinedSubject.create(this.visibleForElectricity, this.visibleForMode).sub(([visibleForElectricity, visibleForMode]) => {
      const shown = visibleForElectricity && visibleForMode;

      this.containerRef.instance.classList.toggle('hidden', !shown);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <>
        <div ref={this.containerRef} class="mfd-hsi MFD">
          <div class="left-panel">
            <LeftInfoPanel bus={this.props.bus} pfdOrMfd="MFD" waypointAlerter={this.waypointAlerter} />
          </div>
          <div class="hsi-center">
            <HSIContainer
              bus={this.props.bus}
              pfdOrMfd="MFD"
              flightPlanner={this.props.flightPlanner}
              tcas={this.props.tcas}
              mfdIndex={this.props.mfdIndex}
              waypointAlerter={this.waypointAlerter}
            />
          </div>
          <div class="right-panel">
            <RightInfoPanel bus={this.props.bus} tcas={this.props.tcas} pfdOrMfd="MFD" />
          </div>
        </div>
      </>
    );
  }
}