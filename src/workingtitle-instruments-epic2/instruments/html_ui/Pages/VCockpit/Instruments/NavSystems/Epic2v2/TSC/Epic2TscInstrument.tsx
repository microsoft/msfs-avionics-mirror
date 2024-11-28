/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Instruments/Shared/BaseInstrument" />
/// <reference types="@microsoft/msfs-types/Pages/VCockpit/Core/VCockpit" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/js/netbingmap" />
/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/avionics" />

import {
  AvionicsSystem, ElectricalPublisher, EventBus, FSComponent, FsInstrument, HEventPublisher, InstrumentBackplane, NavComSimVarPublisher, XPDRInstrument
} from '@microsoft/msfs-sdk';

import {
  AdfSystem, AvionicsConfig, Epic2InputControlPublisher, InstrumentBackplaneNames, NavComUserSettingManager, XpdrSystem
} from '@microsoft/msfs-epic2-shared';

import { BottomRow } from './Components/BottomRow';
import { TscWindow } from './Components/TscWindow';
import { Epic2TscController } from './Epic2TscController';
import { TscService } from './TscService';

/**
 * The Tsc instrument.
 */
export class Epic2TscInstrument implements FsInstrument {

  protected readonly bus = new EventBus();
  protected readonly backplane = new InstrumentBackplane();
  protected readonly hEventPublisher = new HEventPublisher(this.bus);
  protected readonly navComSimVarPublisher = new NavComSimVarPublisher(this.bus);
  protected readonly electricalPublisher = new ElectricalPublisher(this.bus);

  protected readonly xpdrInstrument = new XPDRInstrument(this.bus);
  protected readonly duControlPublisher = new Epic2InputControlPublisher(this.bus);
  protected readonly tscController = new Epic2TscController(this.bus);

  protected readonly systems: AvionicsSystem[] = [];

  protected readonly navComUserSettingsManager = new NavComUserSettingManager(this.bus, 2);

  private readonly tscService = new TscService(this.bus, this.navComUserSettingsManager);

  /** @inheritdoc */
  constructor(
    public readonly instrument: BaseInstrument,
    protected readonly config: AvionicsConfig,
  ) {
    this.backplane.addInstrument(InstrumentBackplaneNames.Xpdr, this.xpdrInstrument);

    this.backplane.addPublisher(InstrumentBackplaneNames.HEvents, this.hEventPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.NavCom, this.navComSimVarPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.Electrical, this.electricalPublisher);
    this.backplane.addPublisher(InstrumentBackplaneNames.DuControl, this.duControlPublisher);

    this.createSystems();
    this.renderComponents();

    // Called once after rendering all input fields.
    Coherent.trigger('UNFOCUS_INPUT_FIELD', '');

    this.doInit();
  }

  /**
   * Creates this instrument's avionics systems.
   */
  protected createSystems(): void {
    const adfSystems = this.config.sensors.adfDefinitions.slice(1, this.config.sensors.adfCount + 1).map((def, index) => {
      return new AdfSystem(index + 1, this.bus, def.electricity);
    });

    const xpdrSystems = this.config.sensors.xpdrDefinitions.slice(1, this.config.sensors.xpdrCount + 1).map((def, index) => {
      return new XpdrSystem(index + 1, this.bus, def.electricity);
    });

    this.systems.push(
      ...adfSystems,
      ...xpdrSystems
    );
  }

  /** @inheritdoc */
  protected renderComponents(): void {
    FSComponent.render(<TscWindow bus={this.bus} tscService={this.tscService} />, document.getElementById('TopSection'));
    FSComponent.render(<BottomRow bus={this.bus} tscService={this.tscService} />, document.getElementById('BottomSection'));
  }

  /** @inheritdoc */
  public Update(): void {
    this.backplane.onUpdate();
    this.updateSystems();
  }

  /**
   * Updates this instrument's systems.
   */
  protected updateSystems(): void {
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].onUpdate();
    }
  }

  /** @inheritdoc */
  public onInteractionEvent(_args: string[]): void {
    this.hEventPublisher.dispatchHEvent(_args[0]);
  }

  /** @inheritdoc */
  public onFlightStart(): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onGameStateChanged(oldState: GameState, newState: GameState): void {
    // noop
  }

  /** @inheritdoc */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onSoundEnd(soundEventId: Name_Z): void {
    // noop
  }

  /** Init instrument. */
  protected doInit(): void {
    this.backplane.init();
  }
}
