import { FlightPlanner, FSComponent, SubEvent, Subject, TcasAdvisoryDataProvider, Vec2Math, Vec2Subject, VNode } from '@microsoft/msfs-sdk';

import { Fms, TrafficSystem } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { InteractionEvent } from '../../InteractionEvent';
import { MenuDefinition, MenuEntry, Page, PageProps, ViewService } from '../Pages';
import { GNSMapBuilder } from './GNSMapBuilder';
import { GNSMapController } from './GNSMapController';
import { GNSMapContextProps, GNSMapControllers, GNSMapKeys, GNSMapLayers, GNSMapModules } from './GNSMapSystem';
import { MapSetup } from './MapSetup';
import { StandardNavMapFields } from './StandardNavMapFields';

import './StandardNavMap.css';
import { GNSType } from '../../../UITypes';

/** A type describing the arc map controllers. */
type GNSStandardMapControllers = GNSMapControllers & {

  /** The root map controller instance. */
  [GNSMapKeys.Controller]: GNSMapController;
}

/**
 * Props on the ArcNavMap page.
 */
interface StandardNavMapProps extends PageProps {
  /** The FMS */
  fms: Fms,

  /** The GNS user settings provider. */
  settingsProvider: GNSSettingsProvider;

  /** The GNS FMS system flight planner. */
  flightPlanner: FlightPlanner;

  /** The GNS traffic system to source traffic data from. */
  trafficSystem: TrafficSystem;

  /** The traffic advisory data provider. */
  tcasDataProvider: TcasAdvisoryDataProvider;

  /** Which type of GNS is in use. */
  gnsType: GNSType;

  /** The instrument index. */
  instrumentIndex: number;
}

/**
 * A component that displays the GNS arc/nav main map.
 */
export class StandardNavMap extends Page<StandardNavMapProps> {
  private readonly mapSetup = FSComponent.createRef<MapSetup>();
  private readonly dataFields = FSComponent.createRef<StandardNavMapFields>();
  private readonly leftPane = FSComponent.createRef<HTMLElement>();

  private readonly mapSize = Vec2Subject.create(this.props.gnsType === 'wt430' ? Vec2Math.create(272, 174) : Vec2Math.create(255, 217));
  private readonly dataFieldsOn = Subject.create(false);

  private readonly pageMenu = new StandardNavMapMenu(this.dataFieldsOn, this.props.settingsProvider);

  private readonly StandardMap = GNSMapBuilder
    .withStandardMap(
      this.props.bus,
      this.props.fms,
      this.props.settingsProvider,
      this.props.gnsType,
      this.props.instrumentIndex,
      true,
      this.props.trafficSystem,
      this.props.tcasDataProvider)
    .withController(GNSMapKeys.Controller, c => new GNSMapController(c, this.props.settingsProvider, this.props.fms))
    .withProjectedSize(this.mapSize)
    .build<GNSMapModules, GNSMapLayers, GNSStandardMapControllers, GNSMapContextProps>('standard-map-container');

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.StandardMap.ref.instance.sleep();

    // Setup page events
    this.pageMenu.setupPressed.on(() => this.openSetup());
    this.pageMenu.dataFieldsOnOffPressed.on(() => this.toggleDataFields());
    this.pageMenu.changeFieldsPressed.on(() => this.startEditingDataFields());

    // Show/hide data fields with state
    this.dataFieldsOn.sub((on) => {
      if (on) {
        this.showDataFields();
      } else {
        this.hideDataFields();
      }
    }, true);

    this.props.settingsProvider.map.getSetting('map_std_nexrad_enabled').sub(v => {
      this.StandardMap.context.getController(GNSMapKeys.Controller).setNexradVisible(v);
    }, true);

    this.props.settingsProvider.map.getSetting('map_std_declutter_level').sub(v => {
      this.StandardMap.context.model.getModule(GNSMapKeys.Declutter)?.declutterLevel.set(v);
    }, true);
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    switch (evt) {
      case InteractionEvent.RangeIncrease:
        this.StandardMap.context.getController(GNSMapKeys.Controller).increaseRange();
        return true;
      case InteractionEvent.RangeDecrease:
        this.StandardMap.context.getController(GNSMapKeys.Controller).decreaseRange();
        return true;
      case InteractionEvent.MENU:
        ViewService.menu(this.pageMenu);
        return true;
      case InteractionEvent.CLR:
        if (this.mapSetup.instance.isFocused) {
          this.closeSetup();
        } else {
          this.StandardMap.context.getController(GNSMapKeys.Controller).changeDeclutter(this.props.settingsProvider.map.getSetting('map_std_declutter_level'));
        }

        return true;
    }

    let handled = false;
    if (this.mapSetup.instance.isFocused) {
      handled = this.mapSetup.instance.onInteractionEvent(evt);
    } else if (this.dataFields.instance.isFocused) {
      handled = this.dataFields.instance.onInteractionEvent(evt);
    }

    if (handled) {
      return handled;
    } else {
      return super.onInteractionEvent(evt);
    }
  }

  /**
   * Opens the map setup menu.
   */
  private openSetup(): void {
    this.hideDataFields();

    this.mapSetup.instance.setOpen(true);
    if (this.props.gnsType === 'wt430') {
      this.mapSize.set(133, 174);
    } else {
      this.mapSize.set(116, 217);
    }

    this.leftPane.instance.classList.add('with-setup');
  }

  /**
   * Closes the map setup menu.
   */
  private closeSetup(): void {
    this.mapSetup.instance.setOpen(false);

    if (this.props.gnsType === 'wt430') {
      this.mapSize.set(272, 174);
    } else {
      this.mapSize.set(255, 217);
    }

    this.leftPane.instance.classList.remove('with-setup');

    if (this.dataFieldsOn.get()) {
      this.showDataFields();
    }
  }

  /**
   * Shows the data fields.
   */
  private showDataFields(): void {
    this.dataFields.instance.setOpen(true);

    if (this.props.gnsType === 'wt430') {
      this.mapSize.set(203, 174);
    } else {
      this.mapSize.set(186, 217);
    }

    this.leftPane.instance.classList.add('with-fields');
  }

  /**
   * Hides the data fields.
   */
  private hideDataFields(): void {
    this.dataFields.instance.setOpen(false);

    if (this.props.gnsType === 'wt430') {
      this.mapSize.set(272, 174);
    } else {
      this.mapSize.set(255, 217);
    }

    this.leftPane.instance.classList.remove('with-fields');
  }

  /**
   * Toggles data fields being on or off
   */
  private toggleDataFields(): void {
    const currently = this.dataFieldsOn.get();

    this.dataFieldsOn.set(!currently);
  }

  /**
   * Sets data fields shown and focuses the data fields pane
   */
  private startEditingDataFields(): void {
    this.dataFieldsOn.set(true);

    this.dataFields.instance.focusSelf();
  }

  /** @inheritdoc */
  public onSuspend(): void {
    super.onSuspend();
    this.StandardMap.ref.instance.sleep();

    this.dataFields.instance.clockSub.pause();
  }

  /** @inheritdoc */
  public onResume(): void {
    super.onResume();
    this.StandardMap.ref.instance.wake();

    this.dataFields.instance.clockSub.resume();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='page page-no-padding std-map hide-element' ref={this.el}>
        <div class='std-map-left' ref={this.leftPane}>
          {this.StandardMap.map}
        </div>
        <MapSetup
          ref={this.mapSetup}
          settingsProvider={this.props.settingsProvider}
          gnsType={this.props.gnsType}
          isolateScroll
        />
        <StandardNavMapFields
          ref={this.dataFields}
          bus={this.props.bus}
          fms={this.props.fms}
          gnsType={this.props.gnsType}
          isolateScroll
        />
      </div>
    );
  }
}

/**
 * A page menu for the standard nav map page.
 */
class StandardNavMapMenu extends MenuDefinition {
  public setupPressed = new SubEvent<StandardNavMapMenu, void>();
  public dataFieldsOnOffPressed = new SubEvent<StandardNavMapMenu, void>();
  public changeFieldsPressed = new SubEvent<StandardNavMapMenu, void>();

  /** @inheritDoc */
  constructor(
    private readonly dataFieldsOn: Subject<boolean>,
    private readonly settingsProvider: GNSSettingsProvider
  ) {
    super();

    this.dataFieldsOn.sub((on) => this.dataFieldsOnLabel.set(`Data Fields ${on ? 'Off' : 'On'}?`), true);

    const nexradSetting = this.settingsProvider.map.getSetting('map_std_nexrad_enabled');
    nexradSetting.sub(v => this.setEntryLabel(3, v ? 'Hide NEXRAD?' : 'Display NEXRAD?'), true);
  }

  private readonly dataFieldsOnLabel = Subject.create('');

  /**
   * Handles 'Setup Map?' being pressed
   */
  private handleSetupMap(): void {
    this.setupPressed.notify(this);
    ViewService.back();
  }

  /**
   * Handles 'Data Fields On/Off?' being pressed
   */
  private handleDataFieldsOnOff(): void {
    this.dataFieldsOnOffPressed.notify(this);
    ViewService.back();
  }

  /**
   * Handles 'Change Fields?' being pressed
   */
  private handleChangeFields(): void {
    this.changeFieldsPressed.notify(this);
    ViewService.back();
  }

  /**
   * Resets all the data fields to defaults.
   */
  private restoreDefaults(): void {
    this.settingsProvider.standardNavMapFields.getAllSettings().forEach(v => v.resetToDefault());
    ViewService.back();
  }

  /**
   * Toggles NEXRAD for the arc nav map.
   */
  private toggleNexrad(): void {
    const nexradSetting = this.settingsProvider.map.getSetting('map_std_nexrad_enabled');
    nexradSetting.set(!nexradSetting.get());

    ViewService.back();
  }

  /** @inheritDoc */
  public entries: MenuEntry[] = [
    { label: 'Setup Map?', disabled: false, action: this.handleSetupMap.bind(this) },
    { label: 'Measure Dist?', disabled: true, action: () => { } },
    { label: this.dataFieldsOnLabel, disabled: false, action: this.handleDataFieldsOnOff.bind(this) },
    { label: 'Display NEXRAD?', disabled: false, action: this.toggleNexrad.bind(this) },
    { label: 'Change Fields?', disabled: false, action: this.handleChangeFields.bind(this) },
    { label: 'Restore Defaults?', disabled: false, action: this.restoreDefaults.bind(this) }
  ];
}