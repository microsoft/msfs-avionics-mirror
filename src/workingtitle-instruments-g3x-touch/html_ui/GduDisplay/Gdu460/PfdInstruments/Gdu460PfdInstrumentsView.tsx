import {
  CasSystem, ConsumerValue, DebounceTimer, DisplayComponent, FSComponent, KeyEventManager, MapSubject, MappedSubject,
  NavMath, NavSourceType, PluginSystem, ReadonlyFloat64Array, SimVarValueType, Subject, Subscribable, SubscribableMap,
  Subscription, UserSettingManager, VNode, Vec2Math, Vec2Subject
} from '@microsoft/msfs-sdk';

import {
  AhrsSystemEvents, AltitudeAlerter, DefaultAirspeedIndicatorDataProvider, DefaultAltimeterDataProvider,
  DefaultAoaDataProvider, DefaultMarkerBeaconDataProvider, DefaultVsiDataProvider, MinimumsAlerter,
  MinimumsDataProvider, PfdDeclutterManager, VNavDataProvider, VSpeedBugDefinition, WindDataProvider
} from '@microsoft/msfs-garminsdk';

import { AfcsStatusBox } from '../../../PFD/Components/AfcsStatusBox/AfcsStatusBox';
import { DefaultAirspeedIndicatorGsDataProvider } from '../../../PFD/Components/AirspeedIndicator/AirspeedIndicatorGsDataProvider';
import { G3XAirspeedIndicator } from '../../../PFD/Components/AirspeedIndicator/G3XAirspeedIndicator';
import { G3XAltimeter } from '../../../PFD/Components/Altimeter/G3XAltimeter';
import { BaroMinimumDisplay } from '../../../PFD/Components/BaroMinimumDisplay/BaroMinimumDisplay';
import { BearingInformationDisplay } from '../../../PFD/Components/BearingInformationDisplay/BearingInformationDisplay';
import { Hsi } from '../../../PFD/Components/HSI/Hsi';
import { DefaultHsiDataProvider } from '../../../PFD/Components/HSI/HsiDataProvider';
import { MarkerBeaconDisplay } from '../../../PFD/Components/MarkerBeaconDisplay/MarkerBeaconDisplay';
import { DefaultSlipSkidDataProvider, SlipSkidIndicator } from '../../../PFD/Components/SlipSkidIndicator';
import { TrafficAnnunciations } from '../../../PFD/Components/TrafficAnnunciations/TrafficAnnunciations';
import { PfdAileronRudderTrimGauge } from '../../../PFD/Components/TrimFlapGauges/AileronRudderTrimGauge/PfdAileronRudderTrimGauge';
import { PfdFlapsElevatorTrimGauge } from '../../../PFD/Components/TrimFlapGauges/FlapsElevatorTrimGauge/PfdFlapsElevatorTrimGauge';
import { DefaultVdiDataProvider } from '../../../PFD/Components/VDI/DefaultVdiDataProvider';
import { VerticalDeviationIndicator } from '../../../PFD/Components/VDI/VerticalDeviationIndicator';
import { G3XVerticalSpeedIndicator } from '../../../PFD/Components/VerticalSpeedIndicator/G3XVerticalSpeedIndicator';
import { PfdWindDisplay } from '../../../PFD/Components/WindDisplay/PfdWindDisplay';
import { PfdInstrumentsPluginComponent } from '../../../PFD/PfdInstruments/PfdInstrumentsPluginComponent';
import { PfdKnobAction } from '../../../PFD/UiSystem/PfdKnobAction';
import { AvionicsConfig } from '../../../Shared/AvionicsConfig/AvionicsConfig';
import { EisLayouts, EisSizes } from '../../../Shared/CommonTypes';
import { G3XCASDisplay } from '../../../Shared/Components/CAS/G3XCASDisplay';
import { G3XFplSourceDataProvider } from '../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XTouchPlugin, G3XTouchPluginBinder } from '../../../Shared/G3XTouchPlugin';
import { InstrumentConfig } from '../../../Shared/InstrumentConfig/InstrumentConfig';
import { G3XTouchNavIndicator, G3XTouchNavIndicators } from '../../../Shared/NavReference/G3XTouchNavReference';
import { G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { PfdKnobActionSettingMode, PfdKnobUserSettingTypes, PfdUserSettingTypes } from '../../../Shared/Settings/PfdUserSettings';
import { VSpeedUserSettingManager } from '../../../Shared/Settings/VSpeedUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent, UiInteractionHandler, UiKnobTurnInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiInteractionUtils } from '../../../Shared/UiSystem/UiInteractionUtils';
import { UiInnerKnobId, UiKnobGroup, UiKnobId, UiKnobRequestedLabelState, UiOuterKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiKnobUtils } from '../../../Shared/UiSystem/UiKnobUtils';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewOcclusionType, UiViewSizeMode, UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { Gdu460HorizonDisplay } from './HorizonDisplay/Gdu460HorizonDisplay';
import { PfdInsetContainer } from './Inset/PfdInsetContainer';
import { PfdInsetRegistrar } from './Inset/PfdInsetRegistrar';
import { PfdInsetSizeMode } from './Inset/PfdInsetTypes';

import './Gdu460PfdInstrumentsView.css';

/**
 * Component props for Gdu460PfdInstrumentsView.
 */
export interface Gdu460PfdInstrumentsViewProps extends UiViewProps {
  /** The global avionics configuration object. */
  config: AvionicsConfig;

  /** The configuration object for the view's parent instrument. */
  instrumentConfig: InstrumentConfig;

  /** The plugin system of the view's parent instrument. */
  pluginSystem: PluginSystem<G3XTouchPlugin, G3XTouchPluginBinder>;

  /** The CAS system. */
  casSystem: CasSystem;

  /** A registrar for PFD insets. */
  insetRegistrar: PfdInsetRegistrar;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A provider of wind data. */
  windDataProvider: WindDataProvider;

  /** VNav DataProvider */
  vnavDataProvider: VNavDataProvider;

  /** Minimums data provider */
  minimumsDataProvider: MinimumsDataProvider;

  /** A manager for aliased GDU user settings. */
  gduAliasedSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A collection of all navigation indicators. */
  navIndicators: G3XTouchNavIndicators;

  /** A manager for PFD user settings. */
  pfdSettingManager: UserSettingManager<PfdUserSettingTypes>;

  /** VSpeed Manager */
  vSpeedSettingManager: VSpeedUserSettingManager;
}

/**
 * A PFD instruments display.
 */
export class Gdu460PfdInstrumentsView extends AbstractUiView<Gdu460PfdInstrumentsViewProps> {

  private thisNode?: VNode;

  private readonly leftInsetRef = FSComponent.createRef<PfdInsetContainer>();
  private readonly rightInsetRef = FSComponent.createRef<PfdInsetContainer>();
  private readonly insetSizeMode = this.props.uiService.gdu460EisSize === undefined
    ? Subject.create(PfdInsetSizeMode.Full)
    : this.props.uiService.gdu460EisLayout.map(layout => {
      return layout === EisLayouts.None
        ? PfdInsetSizeMode.Full
        : this.props.uiService.gdu460EisSize === EisSizes.Narrow ? PfdInsetSizeMode.NarrowEis : PfdInsetSizeMode.WideEis;
    });

  private readonly horizonRef = FSComponent.createRef<Gdu460HorizonDisplay>();
  private readonly horizonSize = Vec2Subject.create(Vec2Math.create(100, 100));

  private readonly horizonAircraftSymbolSingleCueBarSpan = Vec2Subject.create(Vec2Math.create(0, 0));
  private readonly horizonAircraftSymbolSingleCueBarSpanState = MappedSubject.create(
    this.props.uiService.isPaneSplit,
    this.props.uiService.gdu460EisLayout
  );

  private readonly declutterManager = new PfdDeclutterManager(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAhrsIndex')
  );

  private readonly afcsRef = FSComponent.createRef<AfcsStatusBox>();
  private readonly afcsMaxVerticalRightSlots = Subject.create(0);

  private readonly windDisplayRef = FSComponent.createRef<PfdWindDisplay>();

  private readonly aoaDataProvider = new DefaultAoaDataProvider(
    this.props.uiService.bus,
    1,
    this.props.gduAliasedSettingManager.getSetting('gduAdcIndex')
  );

  private readonly airspeedIndicatorDataProvider = new DefaultAirspeedIndicatorDataProvider(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAdcIndex'),
    this.props.instrumentConfig.airspeedIndicator.dataProviderOptions,
    this.aoaDataProvider
  );
  private readonly airspeedIndicatorGsDataProvider = new DefaultAirspeedIndicatorGsDataProvider(
    this.props.uiService.bus,
    this.props.uiService.instrumentIndex
  );

  private readonly altimeterDataProvider = new DefaultAltimeterDataProvider(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAdcIndex'),
    { trendLookahead: 6 }
  );

  private readonly vsiDataProvider = new DefaultVsiDataProvider(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAdcIndex'),
    this.props.vnavDataProvider
  );

  private readonly vdiDataProvider = new DefaultVdiDataProvider(
    this.props.uiService.bus,
    this.props.vnavDataProvider,
    this.props.navIndicators.get('activeSource'),
    {
      fmsId: this.props.fplSourceDataProvider.fmsId,
      vnavIndex: this.props.fplSourceDataProvider.vnavIndex,
      ahrsIndex: this.props.gduAliasedSettingManager.getSetting('gduAhrsIndex')
    }
  );

  private readonly altitudeAlerter = new AltitudeAlerter(
    1,
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAdcIndex')
  );

  private readonly minimumsAlerter = new MinimumsAlerter(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAdcIndex'),
    true
  );

  private readonly slipSkidDataProvider = new DefaultSlipSkidDataProvider(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAhrsIndex')
  );

  private readonly hsiDataProvider = new DefaultHsiDataProvider(
    this.props.uiService.bus,
    this.props.gduAliasedSettingManager.getSetting('gduAhrsIndex'),
    this.props.uiService.gduIndex,
    this.props.navIndicators.get('activeSource'),
    this.props.navIndicators.get('bearingPointer1'),
    this.props.navIndicators.get('bearingPointer2'),
    this.props.fplSourceDataProvider,
    this.props.pfdSettingManager,
    this.props.config.autopilot !== undefined
  );

  private readonly markerBeaconDataProvider = new DefaultMarkerBeaconDataProvider(this.props.uiService.bus, 1);

  private readonly leftKnobActionHandler = new PfdKnobActionHandler(
    UiKnobGroup.Left,
    this.props.uiService,
    this.props.navIndicators.get('activeSource'),
    this.props.gduAliasedSettingManager,
    this.props.pfdSettingManager,
    this.props.config
  );
  private readonly rightKnobActionHandler = new PfdKnobActionHandler(
    UiKnobGroup.Right,
    this.props.uiService,
    this.props.navIndicators.get('activeSource'),
    this.props.gduAliasedSettingManager,
    this.props.pfdSettingManager,
    this.props.config
  );

  private readonly pluginComponents: PfdInstrumentsPluginComponent[] = [];

  private readonly subscriptions: Subscription[] = [
    ...('destroy' in this.insetSizeMode ? [this.insetSizeMode] : []),
    this.horizonAircraftSymbolSingleCueBarSpanState
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.horizonRef.instance.sleep();

    UiKnobUtils.reconcileRequestedLabelStates(
      this.props.uiService.validKnobIds,
      this._knobLabelState,
      false,
      this.leftKnobActionHandler.knobLabelState,
      this.rightKnobActionHandler.knobLabelState
    );

    this.insetSizeMode.sub(this.onInsetSizeModeChanged.bind(this), true);

    this.horizonAircraftSymbolSingleCueBarSpanState.sub(this.onHorizonAircraftSymbolSingleCueBarSpanState.bind(this), true);

    this.declutterManager.init();
    this.aoaDataProvider.init();
    this.airspeedIndicatorDataProvider.init();
    this.airspeedIndicatorGsDataProvider.init();
    this.altimeterDataProvider.init();
    this.vsiDataProvider.init();
    this.vdiDataProvider.init(true);
    this.altitudeAlerter.init();
    this.minimumsAlerter.init();
    this.slipSkidDataProvider.init();
    this.hsiDataProvider.init(true);
    this.markerBeaconDataProvider.init();

    // Enumerate plugin components.
    FSComponent.visitNodes(thisNode, node => {
      if (node.instance instanceof DisplayComponent && (node.instance as any).isPfdInstrumentsPluginComponent === true) {
        this.pluginComponents.push(node.instance as PfdInstrumentsPluginComponent);
        return true;
      }
      return false;
    });
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    this.horizonRef.instance.wake();
    this.afcsRef.getOrDefault()?.wake();
    this.windDisplayRef.instance.wake();

    this.vdiDataProvider.resume();
    this.hsiDataProvider.resume();

    for (const component of this.pluginComponents) {
      component.onOpen(sizeMode, dimensions);
    }
  }

  /** @inheritDoc */
  public onClose(): void {
    this.horizonRef.instance.sleep();
    this.afcsRef.getOrDefault()?.sleep();
    this.windDisplayRef.instance.sleep();
    this.leftInsetRef.instance.sleep();
    this.rightInsetRef.instance.sleep();

    this.vdiDataProvider.pause();
    this.hsiDataProvider.pause();

    for (const component of this.pluginComponents) {
      component.onClose();
    }
  }

  /** @inheritDoc */
  public onResume(): void {
    for (const component of this.pluginComponents) {
      component.onResume();
    }
  }

  /** @inheritDoc */
  public onPause(): void {
    for (const component of this.pluginComponents) {
      component.onPause();
    }
  }

  /** @inheritDoc */
  public onResize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.updateFromSize(sizeMode, dimensions);

    for (const component of this.pluginComponents) {
      component.onResize(sizeMode, dimensions);
    }
  }

  /** @inheritDoc */
  public onOcclusionChange(occlusionType: UiViewOcclusionType): void {
    for (const component of this.pluginComponents) {
      component.onOcclusionChange(occlusionType);
    }
  }

  /**
   * Updates this view's child components when its size changes.
   * @param sizeMode The new size mode of this view.
   * @param dimensions The new dimensions of this view, as `[width, height]` in pixels.
   */
  private updateFromSize(sizeMode: UiViewSizeMode, dimensions: ReadonlyFloat64Array): void {
    this.horizonSize.set(dimensions[0], dimensions[1]);

    if (sizeMode === UiViewSizeMode.Full) {
      this.leftInsetRef.instance.wake();
      this.rightInsetRef.instance.wake();

      if (this.props.config.autopilot) {
        // In full screen mode, the AFCS status box has 2.5 slots available for right-side vertical mode indications.
        // This allows the following combinations of indications:
        // - one vertical mode target indication
        // - up to two armed mode indications
        // - one 1-slot vertical mode target indication (IAS) + one armed mode indication
        // - one 1.5-slot vertical mode target indication (VS, ALT) + one armed mode indication
        this.afcsMaxVerticalRightSlots.set(2.5);
      }
    } else {
      this.leftInsetRef.instance.sleep();
      this.rightInsetRef.instance.sleep();

      if (this.props.config.autopilot) {
        // In split screen mode without yaw damper support, the AFCS status box has 2 slots available for right-side
        // vertical mode indications. This allows the following combinations of indications:
        // - one vertical mode target indication
        // - up to two armed mode indications
        // - one 1-slot vertical mode target indication (IAS) + one armed mode indication
        this.afcsMaxVerticalRightSlots.set(2);
      }
    }
  }

  /**
   * Responds to when this view's PFD inset size mode changes.
   * @param sizeMode The new size mode of this view's PFD insets.
   */
  private onInsetSizeModeChanged(sizeMode: PfdInsetSizeMode): void {
    this.leftInsetRef.instance.setSize(sizeMode);
    this.rightInsetRef.instance.setSize(sizeMode);
  }

  /**
   * Responds to when this view's single-cue aircraft symbol bar span state changes.
   * @param state The new single-cue aircraft symbol bar span state, as `[isPaneSplit, eisLayout]`.
   */
  private onHorizonAircraftSymbolSingleCueBarSpanState(state: readonly [boolean, EisLayouts]): void {
    const [isPaneSplit, eisLayout] = state;

    if (isPaneSplit) {
      if (eisLayout === EisLayouts.None || this.props.uiService.gdu460EisSize === undefined) {
        this.horizonAircraftSymbolSingleCueBarSpan.set(162, 122);
      } else if (this.props.uiService.gdu460EisSize === EisSizes.Wide) {
        this.horizonAircraftSymbolSingleCueBarSpan.set(130, 104);
      } else {
        this.horizonAircraftSymbolSingleCueBarSpan.set(139, 109);
      }
    } else {
      this.horizonAircraftSymbolSingleCueBarSpan.set(170, 130);
    }
  }

  /** @inheritdoc */
  public onUpdate(time: number): void {
    this.leftInsetRef.instance.update(time);
    this.rightInsetRef.instance.update(time);

    for (const component of this.pluginComponents) {
      component.onUpdate(time);
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    switch (event) {
      case UiInteractionEvent.MenuPress:
        if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.PfdOptions)) {
          this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.PfdOptions, true, { popupType: 'slideout-bottom-full' });
        }
        return true;
      case UiInteractionEvent.BackPress:
        if (this.props.casSystem.casActiveMessageSubject.length > 0) {
          const newMessages = this.props.casSystem.casActiveMessageSubject.getArray().filter((messageToCheck) => !messageToCheck.acknowledged);
          if (newMessages.length > 0) {
            const newMessage = newMessages[0];
            if (newMessage.priority === 0) {
              SimVar.SetSimVarValue('K:MASTER_WARNING_ACKNOWLEDGE', SimVarValueType.Number, 0);
              return true;
            }
          }
        }
    }

    return this.leftKnobActionHandler.onUiInteractionEvent(event) || this.rightKnobActionHandler.onUiInteractionEvent(event);
  }

  /** @inheritDoc */
  public render(): VNode {
    const vSpeedBugDefinitions = this.props.instrumentConfig.airspeedIndicator.vSpeedBugConfigs
      .map(config => config.resolve()(this.props.vSpeedSettingManager.vSpeedDefs))
      .filter(def => def !== undefined) as VSpeedBugDefinition[];

    const registeredInsetDefs = this.props.insetRegistrar.getRegisteredInsetsArray();

    const pluginRenderedVNodes: VNode[] = [];
    this.props.pluginSystem.callPlugins(plugin => {
      if (!plugin.renderToPfdInstruments) {
        return;
      }

      const node = plugin.renderToPfdInstruments(
        this.declutterManager.declutter
      );
      if (node) {
        pluginRenderedVNodes.push(node);
      }
    });

    return (
      <div class='pfd-instruments'>
        <Gdu460HorizonDisplay
          ref={this.horizonRef}
          bus={this.props.uiService.bus}
          gduIndex={this.props.uiService.gduIndex}
          config={this.props.instrumentConfig.horizon}
          supportSvt={!this.props.instrumentConfig.bingMapOptimization.disableSvt}
          projectedSize={this.horizonSize}
          aircraftSymbolOptions={{
            color: this.props.instrumentConfig.horizon.symbolColor,
            singleCueBarSpan: this.horizonAircraftSymbolSingleCueBarSpan
          }}
          includeFlightDirector={this.props.config.autopilot !== undefined}
          declutter={this.declutterManager.declutter}
          gduSettingManager={this.props.gduAliasedSettingManager}
          pfdSettingManager={this.props.pfdSettingManager}
        />
        {this.props.config.autopilot !== undefined && (
          <AfcsStatusBox
            ref={this.afcsRef}
            uiService={this.props.uiService}
            supportYawDamper={false}
            maxVerticalRightSlots={this.afcsMaxVerticalRightSlots}
          />
        )}
        <G3XAirspeedIndicator
          dataProvider={this.airspeedIndicatorDataProvider}
          gsDataProvider={this.airspeedIndicatorGsDataProvider}
          declutter={this.declutterManager.declutter}
          tapeScaleOptions={this.props.instrumentConfig.airspeedIndicator.tapeScaleOptions}
          colorRanges={this.props.instrumentConfig.airspeedIndicator.colorRangeDefinitions}
          vSpeedBugOptions={{
            vSpeedSettingManager: this.props.vSpeedSettingManager,
            vSpeedBugDefinitions
          }}
        />
        <G3XAltimeter
          index={this.props.config.gduDefs.definitions[this.props.uiService.gduIndex].altimeterIndex}
          uiService={this.props.uiService}
          dataProvider={this.altimeterDataProvider}
          baroDisplayUnit={G3XUnitsUserSettings.getManager(this.props.uiService.bus).baroPressureUnits}
          altitudeAlertState={this.altitudeAlerter.state}
          minimumsAlertState={this.minimumsAlerter.state}
          declutter={this.declutterManager.declutter}
        />
        <G3XVerticalSpeedIndicator
          dataProvider={this.vsiDataProvider}
          isCompact={this.props.uiService.isPaneSplit}
          declutter={this.declutterManager.declutter}
          scaleMaximum={this.props.instrumentConfig.vsi.scaleMaximum}
          isAdvancedVnav={false}
        />
        <VerticalDeviationIndicator
          dataProvider={this.vdiDataProvider}
          declutter={this.declutterManager.declutter}
        />
        <MarkerBeaconDisplay
          dataProvider={this.markerBeaconDataProvider}
          declutter={this.declutterManager.declutter}
        />
        <BaroMinimumDisplay
          uiService={this.props.uiService}
          dataProvider={this.props.minimumsDataProvider}
          minimumsAlertState={this.minimumsAlerter.state}
          declutter={this.declutterManager.declutter}
        />
        <SlipSkidIndicator slipSkidDataProvider={this.slipSkidDataProvider} />
        <Hsi
          uiService={this.props.uiService}
          dataProvider={this.hsiDataProvider}
          gduSettingManager={this.props.gduAliasedSettingManager}
          hsiSettingManager={this.props.pfdSettingManager}
          unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
          radiosConfig={this.props.config.radios}
          declutter={this.declutterManager.declutter}
        />
        <BearingInformationDisplay
          index={1}
          indicator={this.hsiDataProvider.bearing1Indicator}
          unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
          declutter={this.declutterManager.declutter}
        />
        <BearingInformationDisplay
          index={2}
          indicator={this.hsiDataProvider.bearing2Indicator}
          unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
          declutter={this.declutterManager.declutter}
        />
        <G3XCASDisplay
          bus={this.props.uiService.bus}
          annunciations={this.props.casSystem.casActiveMessageSubject}
          isPaneSplit={this.props.uiService.isPaneSplit}
          numAnnunciationsToShow={this.props.uiService.isPaneSplit.map(isSplit => isSplit ? 8 : 11)}
        />
        <PfdWindDisplay
          ref={this.windDisplayRef}
          dataProvider={this.props.windDataProvider}
          windDisplaySettingManager={this.props.pfdSettingManager}
          unitsSettingManager={G3XUnitsUserSettings.getManager(this.props.uiService.bus)}
          declutter={this.declutterManager.declutter}
        />
        {this.renderTrimFlapGauges()}
        <TrafficAnnunciations bus={this.props.uiService.bus} />
        <PfdInsetContainer
          ref={this.leftInsetRef}
          side='left'
          registeredInsetDefs={registeredInsetDefs}
          uiService={this.props.uiService}
          pfdInsetSettingManager={this.props.pfdSettingManager}
        />
        <PfdInsetContainer
          ref={this.rightInsetRef}
          side='right'
          registeredInsetDefs={registeredInsetDefs}
          uiService={this.props.uiService}
          pfdInsetSettingManager={this.props.pfdSettingManager}
        />
        {pluginRenderedVNodes}
      </div>
    );
  }

  /**
   * Renders this view's flap/trim gauges.
   * @returns This view's rendered flap/trim gauges, as a VNode.
   */
  private renderTrimFlapGauges(): VNode {
    const config = this.props.instrumentConfig.pfdTrimFlapGauges;

    return (
      <div class='pfd-trim-flap-gauges'>
        {(config.flapsGauge !== undefined || config.elevatorTrimGauge !== undefined) && (
          <PfdFlapsElevatorTrimGauge
            bus={this.props.uiService.bus}
            flapsGaugeConfig={config.flapsGauge}
            elevatorTrimGaugeConfig={config.elevatorTrimGauge}
          />
        )}
        {(config.aileronTrimGauge !== undefined || config.rudderTrimGauge !== undefined) && (
          <PfdAileronRudderTrimGauge
            bus={this.props.uiService.bus}
            aileronTrimGaugeConfig={config.aileronTrimGauge}
            rudderTrimGaugeConfig={config.rudderTrimGauge}
          />
        )}
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.vsiDataProvider.destroy();
    this.vdiDataProvider.destroy();
    this.hsiDataProvider.destroy();
    this.markerBeaconDataProvider.destroy();

    this.leftKnobActionHandler.destroy();
    this.rightKnobActionHandler.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}

/**
 * An interaction event handler that executes PFD knob actions.
 */
class PfdKnobActionHandler implements UiInteractionHandler {
  private static readonly TOGGLE_ACTION_DURATION = 10000; // milliseconds

  private keyManager?: KeyEventManager;

  private readonly defaultAction = MappedSubject.create(
    ([pfdPaneSide, splitSideActionSetting]) => {
      if ((this.knobGroup === UiKnobGroup.Left) === (pfdPaneSide === 'left')) {
        // Our knob is on the same side as the PFD pane when split screen mode is active. This knob always uses the
        // Heading/Altitude action.
        return PfdKnobAction.HeadingAltitude;
      } else {
        // Our knob is on the opposite side as the PFD pane with split screen mode is active. This knob's action is
        // controlled by user setting.
        switch (splitSideActionSetting) {
          case PfdKnobActionSettingMode.CourseBaro:
            return PfdKnobAction.CourseBaro;
          case PfdKnobActionSettingMode.FdBugBaro:
            return PfdKnobAction.FdBugBaro;
          default:
            return PfdKnobAction.HeadingAltitude;
        }
      }
    },
    this.uiService.gdu460PfdPaneSide,
    this.pfdKnobSettingManager.getSetting('pfdKnobSplitScreenSideAction')
  );

  private readonly toggleAction = Subject.create<PfdKnobAction | null>(null);
  private readonly toggleTimer = new DebounceTimer();
  private readonly clearToggleFunc = this.toggleAction.set.bind(this.toggleAction, null);

  private readonly action = MappedSubject.create(
    ([defaultAction, toggleAction]) => toggleAction ?? defaultAction,
    this.defaultAction,
    this.toggleAction
  );

  private readonly allowCourseAction = MappedSubject.create(
    ([activeNavSource]) => {
      // TODO: handle OBS
      return activeNavSource !== null && (
        activeNavSource.getType() === NavSourceType.Nav && activeNavSource.index <= this.config.radios.navCount
      );
    },
    this.activeNavIndicator.source
  );
  private readonly allowCourseActionSub: Subscription;

  private readonly outerKnobId: UiOuterKnobId;
  private readonly innerKnobId: UiInnerKnobId;

  private readonly altimeterIndex: number;

  private readonly isHeadingDataValid = ConsumerValue.create(null, false);
  private readonly heading = ConsumerValue.create(null, 0);

  private readonly _knobLabelState = MapSubject.create<UiKnobId, string>();
  /** The bezel rotary knob label state requested by this handler. */
  public readonly knobLabelState = this._knobLabelState as SubscribableMap<UiKnobId, string> & Subscribable<UiKnobRequestedLabelState>;

  private readonly ahrsIndexSub: Subscription;

  /**
   * Creates a new instance of PfdKnobActionHandler.
   * @param knobGroup The knob group for which this handler is responsible.
   * @param uiService The UI service.
   * @param activeNavIndicator The nav indicator for the active nav source.
   * @param gduSettingManager A manager for GDU user settings.
   * @param pfdKnobSettingManager A manager for PFD knob user settings.
   * @param config The global avionics configuration object.
   */
  public constructor(
    private readonly knobGroup: UiKnobGroup.Left | UiKnobGroup.Right,
    private readonly uiService: UiService,
    private readonly activeNavIndicator: G3XTouchNavIndicator,
    gduSettingManager: UserSettingManager<GduUserSettingTypes>,
    private readonly pfdKnobSettingManager: UserSettingManager<PfdKnobUserSettingTypes>,
    private readonly config: AvionicsConfig
  ) {
    if (knobGroup === UiKnobGroup.Left) {
      this.outerKnobId = UiKnobId.LeftOuter;
      this.innerKnobId = UiKnobId.LeftInner;
    } else {
      this.outerKnobId = UiKnobId.RightOuter;
      this.innerKnobId = UiKnobId.RightInner;
    }

    this.altimeterIndex = this.config.gduDefs.definitions[this.uiService.instrumentIndex].altimeterIndex;

    const sub = uiService.bus.getSubscriber<AhrsSystemEvents>();

    this.ahrsIndexSub = gduSettingManager.getSetting('gduAhrsIndex').sub(index => {
      this.isHeadingDataValid.setConsumer(sub.on(`ahrs_heading_data_valid_${index}`));
      this.heading.setConsumer(sub.on(`ahrs_hdg_deg_${index}`));
    }, true);

    this.allowCourseActionSub = this.allowCourseAction.sub(this.onAllowCourseActionChanged.bind(this), false, true);

    this.action.sub(this.onActionChanged.bind(this), true);

    KeyEventManager.getManager(this.uiService.bus).then(manager => this.keyManager = manager);
  }

  /**
   * Responds to when whether to allow the selected course change action changes.
   * @param allow Whether to allow the selected course change action.
   */
  private onAllowCourseActionChanged(allow: boolean): void {
    if (allow) {
      this._knobLabelState.setValue(this.innerKnobId, 'Course');
    } else {
      this._knobLabelState.delete(this.innerKnobId);
    }
  }

  /**
   * Responds to when this handler's active knob action changes.
   * @param action The new active knob action.
   */
  private onActionChanged(action: PfdKnobAction): void {
    switch (action) {
      case PfdKnobAction.CourseBaro:
        this._knobLabelState.setValue(this.outerKnobId, 'Baro');
        this.allowCourseActionSub.resume(true);
        break;
      case PfdKnobAction.FdBugBaro:
        this.allowCourseActionSub.pause();
        this._knobLabelState.setValue(this.outerKnobId, 'Baro');
        this._knobLabelState.setValue(this.innerKnobId, 'FD Bug');
        break;
      case PfdKnobAction.HeadingAltitude:
        this.allowCourseActionSub.pause();
        this._knobLabelState.setValue(this.outerKnobId, 'Altitude');
        this._knobLabelState.setValue(this.innerKnobId, 'Heading');
        break;
      default:
        this.allowCourseActionSub.pause();
        this._knobLabelState.setValue(this.outerKnobId, '');
        this._knobLabelState.setValue(this.innerKnobId, '');
    }
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (UiInteractionUtils.isKnobEvent(event)) {
      const knobId = UiInteractionUtils.KNOB_EVENT_TO_KNOB_ID[event];
      if (UiKnobUtils.KNOB_ID_TO_KNOB_GROUP[knobId] === this.knobGroup) {
        if (UiKnobUtils.isPushKnobId(knobId)) {
          switch (event) {
            case UiInteractionEvent.SingleKnobPressLong:
            case UiInteractionEvent.LeftKnobPressLong:
            case UiInteractionEvent.RightKnobPressLong:
              return this.handleKnobPushLong();
            default:
              return this.handleKnobPush();
          }
        } else if (UiKnobUtils.isOuterKnobId(knobId)) {
          return this.handleOuterKnobAction(UiInteractionUtils.getKnobTurnDirection(event as UiKnobTurnInteractionEvent));
        } else {
          return this.handleInnerKnobAction(UiInteractionUtils.getKnobTurnDirection(event as UiKnobTurnInteractionEvent));
        }
      }
    }

    return false;
  }

  /**
   * Handles an outer knob action.
   * @param direction The direction in which the knob was turned.
   * @returns Whether the action was handled.
   */
  private handleOuterKnobAction(direction: 1 | -1): boolean {
    switch (this.action.get()) {
      case PfdKnobAction.CourseBaro:
      case PfdKnobAction.FdBugBaro:
        this.keyManager?.triggerKey(direction === 1 ? 'KOHLSMAN_INC' : 'KOHLSMAN_DEC', false, this.altimeterIndex);
        return true;
      case PfdKnobAction.HeadingAltitude:
        // TODO: Support custom altitude lock var index.
        this.keyManager?.triggerKey(direction === 1 ? 'AP_ALT_VAR_INC' : 'AP_ALT_VAR_DEC', false, 0);
        return true;
      default:
        return true;
    }
  }

  /**
   * Handles an inner knob action.
   * @param direction The direction in which the knob was turned.
   * @returns Whether the action was handled.
   */
  private handleInnerKnobAction(direction: 1 | -1): boolean {
    switch (this.action.get()) {
      case PfdKnobAction.CourseBaro:
        if (this.allowCourseAction.get()) {
          // TODO: Handle OBS.
          const activeNavSource = this.activeNavIndicator.source.get();
          if (activeNavSource) {
            switch (activeNavSource.getType()) {
              case NavSourceType.Nav: {
                const simRadioIndex = this.config.radios.navDefinitions[activeNavSource.index]?.simIndex;
                if (simRadioIndex !== undefined) {
                  this.keyManager?.triggerKey(direction === 1 ? `VOR${simRadioIndex}_OBI_INC` : `VOR${simRadioIndex}_OBI_DEC`, false);
                }
                break;
              }
            }
          }

          return true;
        } else {
          return false;
        }
      case PfdKnobAction.FdBugBaro:
        // TODO: Find out what FD bug is.
        return true;
      case PfdKnobAction.HeadingAltitude:
        // TODO: Support custom heading bug index.
        this.keyManager?.triggerKey(direction === 1 ? 'HEADING_BUG_INC' : 'HEADING_BUG_DEC', false, 0);
        return true;
      default:
        return true;
    }
  }

  /**
   * Handles a knob push action.
   * @returns Whether the action was handled.
   */
  private handleKnobPush(): boolean {
    switch (this.action.get()) {
      case PfdKnobAction.CourseBaro:
        if (this.allowCourseAction.get()) {
          // TODO: Handle OBS.
          const activeNavSource = this.activeNavIndicator.source.get();
          if (activeNavSource && (activeNavSource.signalStrength.get() ?? 0) > 0) {
            switch (activeNavSource.getType()) {
              case NavSourceType.Nav: {
                const simRadioIndex = this.config.radios.navDefinitions[activeNavSource.index]?.simIndex;
                if (simRadioIndex !== undefined) {
                  if (activeNavSource.isLocalizer.get()) {
                    // If tuned to a localizer, then set course to the database localizer course.
                    const localizerCourse = activeNavSource.localizerCourse.get();
                    if (localizerCourse !== null) {
                      this.keyManager?.triggerKey(`VOR${simRadioIndex}_SET`, false, NavMath.normalizeHeading(Math.round(localizerCourse)));
                    }
                  } else {
                    // If tuned to a VOR, then set course to the bearing to the VOR.
                    const bearing = activeNavSource.bearing.get();
                    if (bearing !== null) {
                      this.keyManager?.triggerKey(`VOR${simRadioIndex}_SET`, false, NavMath.normalizeHeading(Math.round(bearing)));
                    }
                  }
                }
                break;
              }
            }
          }

          return true;
        } else {
          return false;
        }
      case PfdKnobAction.FdBugBaro:
        // TODO: Find out what FD bug is.
        return true;
      case PfdKnobAction.HeadingAltitude:
        // TODO: Support custom heading bug index.
        if (this.isHeadingDataValid.get()) {
          this.keyManager?.triggerKey('HEADING_BUG_SET', false, NavMath.normalizeHeading(Math.round(this.heading.get())));
        }
        return true;
      default:
        return true;
    }
  }

  /**
   * Handles a knob long push action.
   * @returns Whether the action was handled.
   */
  private handleKnobPushLong(): boolean {
    if (!this.pfdKnobSettingManager.getSetting('pfdKnobPressToToggleAction').value) {
      return false;
    }

    let newAction: PfdKnobAction;
    const currentAction = this.action.get();
    switch (currentAction) {
      case PfdKnobAction.CourseBaro:
        newAction = PfdKnobAction.FdBugBaro;
        break;
      case PfdKnobAction.FdBugBaro:
        newAction = PfdKnobAction.HeadingAltitude;
        break;
      default: // PfdKnobAction.HeadingAltitude
        newAction = PfdKnobAction.CourseBaro;
    }

    this.toggleAction.set(newAction);
    this.toggleTimer.schedule(this.clearToggleFunc, PfdKnobActionHandler.TOGGLE_ACTION_DURATION);

    return true;
  }

  /**
   * Destroys this handler.
   */
  public destroy(): void {
    this.toggleTimer.clear();
    this.defaultAction.destroy();
    this.allowCourseAction.destroy();
    this.isHeadingDataValid.destroy();
    this.heading.destroy();

    this.ahrsIndexSub.destroy();
  }
}
