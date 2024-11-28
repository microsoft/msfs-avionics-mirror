import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, EventBus, FlightPlanner, FSComponent,
  MappedSubject, NavSourceType, NumberFormatter, SetSubject, Subject, Subscribable, SubscribableMapFunctions,
  Subscription, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { ObsSuspModes, TrafficSystem, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import {
  BearingDisplay, DisplayPaneViewEvent, G3000FlightPlannerId, MapConfig, PfdIndex, PfdMapLayoutSettingMode,
  PfdMapLayoutUserSettingTypes, PfdSensorsUserSettingManager
} from '@microsoft/msfs-wtg3000-common';

import { HsiDataProvider } from './HsiDataProvider';
import { HsiMap } from './HsiMap';
import { HsiRose } from './HsiRose';

import './Hsi.css';

/** Properties on the HSI component. */
export interface HSIProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;

  /** An instance of the flight planner. */
  flightPlanner: FlightPlanner<G3000FlightPlannerId>;

  /** The traffic system. */
  trafficSystem: TrafficSystem;

  /** The index of the PFD to which the HSI belongs. */
  pfdIndex: PfdIndex;

  /** A configuration object defining options for the HSI map. */
  mapConfig: MapConfig;

  /** A manager for all PFD sensors user settings. */
  pfdSensorsSettingManager: PfdSensorsUserSettingManager;

  /** Manager for PFD map layout user settings. */
  pfdMapLayoutSettingManager: UserSettingManager<PfdMapLayoutUserSettingTypes>;

  /** A data provider for the HSI. */
  dataProvider: HsiDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the HSI should be decluttered. */
  declutter: Subscribable<boolean>;
}

/** The HSI component of the PFD. */
export class Hsi extends DisplayComponent<HSIProps> {
  private readonly hdgRef = FSComponent.createRef<BearingDisplay>();
  private readonly crsRef = FSComponent.createRef<BearingDisplay>();
  private readonly roseRef = FSComponent.createRef<HsiRose>();
  private readonly mapRef = FSComponent.createRef<HsiMap>();

  private readonly rootCssClass = SetSubject.create(['hsi']);

  private readonly hdgCrsHidden = Subject.create(false);
  private readonly hdgSyncModeHidden = this.props.dataProvider.isHdgSyncModeActive.map(SubscribableMapFunctions.not());

  private readonly showMap = this.props.pfdMapLayoutSettingManager.getSetting('pfdMapLayout').map(layout => layout === PfdMapLayoutSettingMode.Hsi);

  private readonly selectedHeadingState = MappedSubject.create(
    this.props.dataProvider.selectedHeadingMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly selectedHeadingValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  private readonly dtkCrsMag = Subject.create(0);
  private readonly dtkCrsState = MappedSubject.create(
    this.dtkCrsMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly dtkCrsValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  private readonly dtkCrsSourceState = MappedSubject.create(
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.obsSuspMode
  ).pause();

  private readonly dtkCrsTitleText = this.dtkCrsSourceState.map(([cdiSource, obsSuspMode]): string => {
    return cdiSource?.getType() !== NavSourceType.Gps || obsSuspMode === ObsSuspModes.OBS ? 'CRS' : 'DTK';
  });

  private readonly isAwake = Subject.create(false);

  private isAlive = true;

  private cdiSourceSub?: Subscription;
  private navCoursePipe?: Subscription;
  private obsCoursePipe?: Subscription;
  private headingDataFailedSub?: Subscription;
  private gpsDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {

    this.cdiSourceSub = this.props.dataProvider.activeNavIndicator.source.sub(source => {
      if (source?.getType() === NavSourceType.Gps) {
        this.rootCssClass.add('hsi-active-nav-gps');
        this.rootCssClass.delete('hsi-active-nav-nav');
      } else {
        this.rootCssClass.add('hsi-active-nav-nav');
        this.rootCssClass.delete('hsi-active-nav-gps');
      }
    }, false, true);

    this.selectedHeadingState.sub(([selectedHeadingMag, magVar]) => {
      this.selectedHeadingValue.set(selectedHeadingMag, magVar);
    }, true);

    this.dtkCrsState.sub(([dtkCrsMag, magVar]) => {
      this.dtkCrsValue.set(dtkCrsMag, magVar);
    }, true);

    const navCoursePipe = this.navCoursePipe = this.props.dataProvider.activeNavIndicator.course.pipe(this.dtkCrsMag, course => course ?? 0, true);
    const obsCoursePipe = this.obsCoursePipe = this.props.dataProvider.obsCourse.pipe(this.dtkCrsMag, true);

    const dtkCrsSourceStateSub = this.dtkCrsSourceState.sub(([cdiSource, obsSuspMode]) => {
      if (cdiSource?.getType() === NavSourceType.Gps && obsSuspMode === ObsSuspModes.OBS) {
        navCoursePipe.pause();
        obsCoursePipe.resume(true);
      } else {
        obsCoursePipe.pause();
        navCoursePipe.resume(true);
      }
    }, false, true);

    this.headingDataFailedSub = this.props.dataProvider.isHeadingDataFailed.sub(isFailed => {
      this.rootCssClass.toggle('heading-data-failed', isFailed);
    }, false, true);

    this.gpsDataFailedSub = this.props.dataProvider.isGpsDataFailed.sub(isFailed => {
      this.rootCssClass.toggle('gps-data-failed', isFailed);
    }, false, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.selectedHeadingState.pause();

        this.dtkCrsState.pause();

        this.dtkCrsSourceState.pause();
        dtkCrsSourceStateSub.pause();

        navCoursePipe.pause();
        obsCoursePipe.pause();

        this.hdgSyncModeHidden.pause();

        this.hdgCrsHidden.set(true);
      } else {
        this.selectedHeadingState.resume();

        this.dtkCrsSourceState.resume();
        dtkCrsSourceStateSub.resume(true);

        this.dtkCrsState.resume();

        this.hdgSyncModeHidden.resume();

        this.hdgCrsHidden.set(false);
      }
    }, false, true);

    this.isAwake.sub(isAwake => {
      if (isAwake) {
        this.cdiSourceSub!.resume(true);
        this.headingDataFailedSub!.resume(true);
        this.gpsDataFailedSub!.resume(true);
        this.declutterSub!.resume(true);
      } else {
        this.cdiSourceSub!.pause();
        this.headingDataFailedSub!.pause();
        this.gpsDataFailedSub!.pause();
        this.declutterSub!.pause();

        this.rootCssClass.toggle('heading-data-failed', false);
        this.rootCssClass.toggle('gps-data-failed', false);

        this.selectedHeadingState.pause();

        this.dtkCrsState.pause();

        this.dtkCrsSourceState.pause();
        dtkCrsSourceStateSub.pause();

        navCoursePipe.pause();
        obsCoursePipe.pause();

        this.hdgSyncModeHidden.pause();

        this.hdgCrsHidden.set(true);
      }
    }, true);
  }

  /**
   * Wakes this HSI. When this HSI is awake, it will automatically update its appearance and respond to interaction
   * events.
   * @throws Error if this HSI has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('Hsi: cannot wake a dead component');
    }

    this.isAwake.set(true);
  }

  /**
   * Puts this HSI to sleep. When this HSI is asleep, it will not be visible and will not respond to interaction
   * events.
   * @throws Error if this HSI has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('Hsi: cannot sleep a dead component');
    }

    this.isAwake.set(false);
  }

  /**
   * Responds to when this HSI's parent display pane view is updated.
   * @param time The current real time, as a UNIX timestamp in milliseconds.
   */
  public onUpdate(time: number): void {
    // NOTE: The map has an internal check to prevent updates if it is not visible.
    this.mapRef.instance.update(time);
  }

  /**
   * Responds to events sent to this container's parent display pane view.
   * @param event A display pane view event.
   */
  public onEvent(event: DisplayPaneViewEvent): void {
    if (!this.isAwake.get()) {
      return;
    }

    if (this.showMap.get()) {
      this.mapRef.instance.onEvent(event);
    }
  }

  /**
   * Handles an interaction event.
   * @param event The interaction event to handle.
   * @returns Whether the interaction event was handled.
   */
  public onInteractionEvent(event: string): boolean {
    if (!this.isAwake.get()) {
      return false;
    }

    if (this.showMap.get()) {
      return this.mapRef.instance.onInteractionEvent(event);
    } else {
      return false;
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class={{ 'hsi-hdgcrs-box': true, 'hsi-hdg-box': true, 'hidden': this.hdgCrsHidden }}>
          <div class="hsi-hdg-box-upper">
            <div class="hsi-hdgcrs-box-title">HDG</div>
            <BearingDisplay
              ref={this.hdgRef}
              value={this.selectedHeadingValue}
              displayUnit={this.props.unitsSettingManager.navAngleUnits}
              formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
              class="hsi-hdgcrs-box-value hsi-hdg-box-value"
            />
          </div>
          <div class={{ 'hsi-hdg-box-sync-mode': true, 'hidden': this.hdgSyncModeHidden }}>SYNC MODE</div>
        </div>
        <div class={{ 'hsi-hdgcrs-box': true, 'hsi-crs-box': true, 'hidden': this.hdgCrsHidden }}>
          <div class="hsi-hdgcrs-box-title">{this.dtkCrsTitleText}</div>
          <BearingDisplay
            ref={this.crsRef}
            value={this.dtkCrsValue}
            displayUnit={this.props.unitsSettingManager.navAngleUnits}
            formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
            class="hsi-hdgcrs-box-value hsi-crs-box-value"
          />
        </div>
        <HsiRose
          ref={this.roseRef}
          bus={this.props.bus}
          dataProvider={this.props.dataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
          show={MappedSubject.create(([showMap, isAwake]) => !showMap && isAwake, this.showMap, this.isAwake)}
        />
        <HsiMap
          ref={this.mapRef}
          bus={this.props.bus}
          flightPlanner={this.props.flightPlanner}
          trafficSystem={this.props.trafficSystem}
          pfdIndex={this.props.pfdIndex}
          config={this.props.mapConfig}
          dataProvider={this.props.dataProvider}
          pfdSensorsSettingManager={this.props.pfdSensorsSettingManager}
          unitsSettingManager={this.props.unitsSettingManager}
          show={MappedSubject.create(SubscribableMapFunctions.and(), this.showMap, this.isAwake)}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.hdgRef.getOrDefault()?.destroy();
    this.crsRef.getOrDefault()?.destroy();
    this.roseRef.getOrDefault()?.destroy();
    this.mapRef.getOrDefault()?.destroy();

    this.hdgSyncModeHidden.destroy();

    this.showMap.destroy();

    this.selectedHeadingState.destroy();
    this.dtkCrsSourceState.destroy();
    this.dtkCrsSourceState.destroy();

    this.cdiSourceSub?.destroy();
    this.navCoursePipe?.destroy();
    this.obsCoursePipe?.destroy();
    this.headingDataFailedSub?.destroy();
    this.gpsDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}
