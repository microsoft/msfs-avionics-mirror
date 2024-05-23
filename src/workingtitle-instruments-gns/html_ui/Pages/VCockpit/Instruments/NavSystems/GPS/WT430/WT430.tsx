/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />

import {
  BaseInstrumentPublisher, ComRadioIndex, EventBus, FSComponent, HEventPublisher, InstrumentBackplane, NavComInstrument, NavComSimVarPublisher, NavRadioIndex,
  SimVarValueType
} from '@microsoft/msfs-sdk';

import { GNSDummyInstrument } from '../Shared/GnsDummyInstrument';
import { PowerEvents, PowerState } from '../Shared/Instruments/Power';
import { MainScreen, MainScreenOptions } from '../Shared/MainScreen';
import { GNSSettingSaveManager } from '../Shared/Settings/GNSSettingSaveManager';

import '../Shared/GNSBase.css';

/**
 * The base GNS430 instrument.
 */
class WT430 extends BaseInstrument {
  private readonly mainScreen = FSComponent.createRef<MainScreen>();

  private readonly bus = new EventBus();
  private readonly baseInstrumentPublisher: BaseInstrumentPublisher;
  private readonly backplane: InstrumentBackplane;

  private readonly hEventPublisher = new HEventPublisher(this.bus);
  private readonly navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
  private readonly navComInstrument = new NavComInstrument(this.bus, undefined, 2, 2, false);

  private settingSaveManager: GNSSettingSaveManager;

  private options: MainScreenOptions = {
    instrumentIndex: 1,
    eventPrefix: 'AS430',
    templateId: 'AS430',
    navIndex: 1,
    comIndex: 1,
    isUsingNewCdiBehaviour: false,
    disableAutopilot: false,
    disableApNavArm: false,
    apSupportsFlightDirector: false,
    disableApBackCourse: false,
    flightPlannerId: '',
    g3xExternalSourceIndex: undefined,
  };

  private gpsDisabledVar?: string;
  private isNavigating = false;

  /**
   * Creates an instance of the WT430.
   */
  constructor() {
    super();
    this.baseInstrumentPublisher = new BaseInstrumentPublisher(this, this.bus);
    this.backplane = new InstrumentBackplane();
    this.backplane.addPublisher('base', this.baseInstrumentPublisher);
    this.backplane.addPublisher('navcom', this.navComSimVarPublisher);
    this.backplane.addInstrument('navcom', this.navComInstrument);
    this.settingSaveManager = new GNSSettingSaveManager(this.bus);
  }

  /**
   * The instrument template ID.
   * @returns The instrument template ID.
   */
  get templateID(): string {
    return 'AS430';
  }

  /**
   * Whether or not the instrument is interactive (a touchscreen instrument).
   * @returns True
   */
  get isInteractive(): boolean {
    return true;
  }

  /** @inheritdoc */
  public connectedCallback(): void {
    super.connectedCallback();

    // force enable animations
    document.documentElement.classList.add('animationsEnabled');

    this.setOptions();

    FSComponent.render(<MainScreen
      ref={this.mainScreen}
      class='wt430'
      bus={this.bus}
      backplane={this.backplane}
      options={this.options}
      xmlConfig={this.xmlConfig} />,
      document.getElementById('InstrumentsContainer'));

    const saveKey = `${SimVar.GetSimVarValue('ATC MODEL', 'string')}.${this.instrumentIdentifier}.${this.options.navIndex}`;
    this.settingSaveManager.load(saveKey);
    this.settingSaveManager.startAutoSave(saveKey);
  }

  /** @inheritdoc */
  protected Init(): void {
    super.Init();
    this.hEventPublisher.startPublish();
    SimVar.SetSimVarValue(`L:WT_GNS430_INSTALLED_${this.instrumentIndex}`, SimVarValueType.Bool, true);
  }

  /** @inheritdoc */
  public Update(): void {
    super.Update();
    this.mainScreen.getOrDefault()?.update();

    if (!SimVar.GetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool)) {
      SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, true);
    }

    if (this.gpsDisabledVar !== undefined) {
      if (SimVar.GetSimVarValue(this.gpsDisabledVar, SimVarValueType.Bool) === 1 && !this.isNavigating) {
        window.location.assign(`coui://html_ui/Pages/VCockpit/Core/VCockpit.html?id=${encodeURIComponent(this.gpsDisabledVar)}` +
          `&guid=${this.getAttribute('Guid')}` +
          `&instrumentId=${this.instrumentIdentifier}` +
          `&instrumentIdx=${this.instrumentIndex}` +
          `&primary=${this.options.navIndex === 1 ? 'true' : 'false'}`);
        this.isNavigating = true;
      }
    }
  }

  /** @inheritdoc */
  public onPowerOn(): void {
    super.onPowerOn();
    this.bus.getPublisher<PowerEvents>().pub('instrument_powered', this.wasTurnedOff() ? PowerState.Booting : PowerState.OnSkipInit, false, true);
  }

  /** @inheritdoc */
  public onShutDown(): void {
    super.onShutDown();
    this.bus.getPublisher<PowerEvents>().pub('instrument_powered', PowerState.Off, false, true);
  }

  /**
   * Gets and Sets the options for this instrument from the panel.xml
   */
  private setOptions(): void {
    const elements = this.xmlConfig.querySelectorAll('PlaneHTMLConfig > Instrument');
    let nodeIndex = -1;

    if (this.instrumentIndex === 1) {
      const as430NodeIndex = Array.from(elements).findIndex((node) => node.querySelector('Name')?.textContent === 'AS430');

      if (as430NodeIndex === -1) {
        nodeIndex = Array.from(elements).findIndex((node) => node.querySelector('Name')?.textContent === 'AS430_1');
      } else {
        nodeIndex = as430NodeIndex;
      }

    } else if (this.instrumentIndex > 1) {
      nodeIndex = Array.from(elements).findIndex((node) => node.querySelector('Name')?.textContent === `AS430_${this.instrumentIndex}`);
    }

    const node = elements?.[nodeIndex] ?? undefined;

    if (node !== undefined) {
      const externalSourceIndex = parseInt(node.querySelector('G3XExternalSourceIndex')?.textContent ?? '-1');

      this.options.isUsingNewCdiBehaviour = node.querySelector('NewCDIBehavior')?.textContent === 'True';
      this.options.comIndex = parseInt(node.querySelector('ComIndex')?.textContent ?? '1') as ComRadioIndex;
      this.options.navIndex = parseInt(node.querySelector('NavIndex')?.textContent ?? '1') as NavRadioIndex;
      this.options.disableAutopilot = node.querySelector('DisableAutopilot')?.textContent === 'True';
      this.options.disableApNavArm = node.querySelector('DisableAPNavArm')?.textContent === 'True';
      this.options.apSupportsFlightDirector = node.querySelector('SupportAPFlightDirector')?.textContent === 'True';
      this.options.disableApBackCourse = node.querySelector('DisableAPBackCourse')?.textContent === 'True';
      this.options.lnavIndex = parseInt(node.querySelector('LNavIndex')?.textContent ?? 'NaN');
      this.options.vnavIndex = parseInt(node.querySelector('VNavIndex')?.textContent ?? 'NaN');
      this.options.maxApBankAngle = parseInt(node.querySelector('MaxAPBankAngle')?.textContent ?? 'NaN');
      this.options.flightPlannerId = node.querySelector('FlightPlannerId')?.textContent ?? '';
      this.options.isFmsPrimary = node.querySelector('IsFMSPrimary') !== null ? node.querySelector('IsFMSPrimary')?.textContent === 'True' : undefined;
      this.options.g3xExternalSourceIndex = (externalSourceIndex === 1 || externalSourceIndex === 2) ? externalSourceIndex : undefined;

      this.options.lnavIndex = isNaN(this.options.lnavIndex) ? undefined : this.options.lnavIndex;
      this.options.vnavIndex = isNaN(this.options.vnavIndex) ? undefined : this.options.vnavIndex;
      this.options.maxApBankAngle = isNaN(this.options.maxApBankAngle) ? undefined : this.options.maxApBankAngle;
    }

    this.options.templateId = this.templateID;
    this.options.instrumentIndex = this.instrumentIndex;
    this.gpsDisabledVar = `L:XMLVAR_GPS_DISABLED_${this.templateID}_${this.instrumentIndex}`;
  }

  /**
   * A callback called when the instrument received a H event.
   * @param args The H event and associated arguments, if any.
   */
  public onInteractionEvent(args: string[]): void {
    // TODO Update our typedefs so we don't have to cast this to any.
    const event = (this as any).DecomposeEventFromPrefix(args);
    if (event !== null) {
      this.hEventPublisher.dispatchHEvent(event);
    }
  }

  /**
   * Callback called when the flight starts.
   */
  protected onFlightStart(): void {
    super.onFlightStart();
    this.mainScreen.getOrDefault()?.onFlightStart();
  }
}

/** Set up the instrument */
function setup(): void {
  const searchString = window.location.search.substring(1);
  if (searchString.length > 0) {
    const queryParts = searchString.split('&');
    const disabledVar = decodeURIComponent(queryParts[0].split('=')[1]);
    const guid = decodeURIComponent(queryParts[1].split('=')[1]);
    const instrumentId = decodeURIComponent(queryParts[2].split('=')[1]);
    const instrumentIdx = decodeURIComponent(queryParts[3].split('=')[1]);
    const isPrimary = decodeURIComponent(queryParts[4].split('=')[1]) === 'true' ? true : false;
    let viewListener: any = undefined;
    let isNavigating = false;
    let initted = false;
    let isDummyRegistered = false;
    const checkVar = (): void => {
      try {
        if (RegisterViewListener !== undefined && SimVar !== undefined && !isNavigating) {
          if (viewListener === undefined) {
            viewListener = RegisterViewListener('JS_LISTENER_INSTRUMENTS');
          }

          if (viewListener !== undefined) {
            const isDisabled = SimVar.GetSimVarValue(disabledVar, 'number');

            if (!initted) {
              if (isPrimary) {
                SimVar.SetSimVarValue('GPS OVERRIDDEN', SimVarValueType.Bool, false);
                SimVar.SetSimVarValue('K:AP_AVIONICS_MANAGED_OFF', SimVarValueType.Bool, true);
                SimVar.SetSimVarValue('L:WT1000_AP_G1000_INSTALLED', SimVarValueType.Bool, false);
              }
              SimVar.SetSimVarValue(`L:WT_GNS430_INSTALLED_${instrumentIdx}`, SimVarValueType.Bool, false);
              SimVar.SetSimVarValue('L:XMLVAR_NEXTGEN_FLIGHTPLAN_ENABLED', SimVarValueType.Bool, false);
              LaunchFlowEvent('ON_VCOCKPIT_INSTRUMENT_INITIALIZED', guid, instrumentId, false, false);
              initted = true;
            }

            if (isDisabled !== null && isDisabled !== 1) {
              window.location.assign('coui://html_ui/Pages/VCockpit/Core/VCockpit.html');
              isNavigating = true;
            } else {
              if (!isDummyRegistered) {
                registerInstrument('wt-gns430', GNSDummyInstrument);
                isDummyRegistered = true;
              }
            }
          }
        }
      } catch (err) {
        // noop
      }
      requestAnimationFrame(checkVar);
    };
    requestAnimationFrame(checkVar);
  } else {
    registerInstrument('wt-gns430', WT430);
  }
}

setup();
