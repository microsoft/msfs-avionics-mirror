import {
  ArraySubject, ComponentProps, DisplayComponent, FocusPosition, FSComponent, MapRotation, NodeReference, Subject, SubscribableArray, Subscription, Unit,
  UnitFamily, UnitType, UserSetting, UserSettingValue, VNode
} from '@microsoft/msfs-sdk';

import { GNSSettingsProvider } from '../../../Settings/GNSSettingsProvider';
import { MapSettingsRangeArrayKM, MapSettingsRangeArrayNM, MapSettingsRanges, MapSettingsWaypointSizes, MapTrafficMode } from '../../../Settings/MapSettingsProvider';
import { GNSType } from '../../../UITypes';
import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSUiControl, GNSUiControlProps } from '../../GNSUiControl';
import { MenuDialog } from '../Dialogs/MenuDialog';
import { MenuEntry, ViewService } from '../Pages';

import './MapSetup.css';

/**
 * Props on the MapSetup control.
 */
interface MapSetupProps extends GNSUiControlProps {
  /** The settings provider to use. */
  settingsProvider: GNSSettingsProvider;

  /** Which type of GNS is in use. */
  gnsType: GNSType;
}

/**
 * A control that contains the map setup menu.
 */
export class MapSetup extends GNSUiControl<MapSetupProps> {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly groups = new Map<MapSetupGroups530 | MapSetupGroups430, NodeReference<DisplayComponent<any> & SettingsGroup>>([
    [MapSetupGroups530.Map, FSComponent.createRef<DisplayComponent<any> & SettingsGroup>()],
    [MapSetupGroups530.Waypoint, FSComponent.createRef<DisplayComponent<any> & SettingsGroup>()],
    [MapSetupGroups530.Traffic, FSComponent.createRef<DisplayComponent<any> & SettingsGroup>()],
    [MapSetupGroups430.Airport, FSComponent.createRef<DisplayComponent<any> & SettingsGroup>()],
    [MapSetupGroups430.NAVAID, FSComponent.createRef<DisplayComponent<any> & SettingsGroup>()]
  ]);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.onGroupSelected(MapSetupGroups530.Map);
  }

  /**
   * Sets whether or not the map setup pane is open.
   * @param isOpen True if open, false otherwise.
   */
  public setOpen(isOpen: boolean): void {
    if (isOpen) {
      this.el.instance.classList.remove('hide-element');
      this.focus(FocusPosition.First);
    } else {
      this.el.instance.classList.add('hide-element');
      this.blur();
    }
  }

  /**
   * Selects a map settings group to display.
   * @param group The group to display.
   */
  private onGroupSelected(group: MapSetupGroups530 | MapSetupGroups430): void {
    this.groups.forEach(g => g.getOrDefault()?.setVisible(false));
    this.groups.get(group)?.instance.setVisible(true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='std-map-setup hide-element' ref={this.el}>
        <h3 class='map-setup-title'>MAP SETUP</h3>
        <MapSetupGroup onGroupSelected={g => this.onGroupSelected(g)} gnsType={this.props.gnsType} />
        <div class='map-setup-settings'>
          <MapGroup settingsProvider={this.props.settingsProvider} gnsType={this.props.gnsType} ref={this.groups.get(MapSetupGroups530.Map)} />
          <TrafficGroup settingsProvider={this.props.settingsProvider} gnsType={this.props.gnsType} ref={this.groups.get(MapSetupGroups530.Traffic)} />
          <WaypointGroup settingsProvider={this.props.settingsProvider} gnsType={this.props.gnsType} ref={this.groups.get(MapSetupGroups530.Waypoint)} />
          <AirportGroup settingsProvider={this.props.settingsProvider} gnsType={this.props.gnsType} ref={this.groups.get(MapSetupGroups430.Airport)} />
          <NAVAIDGroup settingsProvider={this.props.settingsProvider} gnsType={this.props.gnsType} ref={this.groups.get(MapSetupGroups430.NAVAID)} />
        </div>
      </div>
    );
  }
}

enum MapSetupGroups530 {
  Map = 'Map',
  Weather = 'Weather',
  Traffic = 'Traffic',
  LineRoad = 'Line/Road',
  Waypoint = 'Waypoint',
  Airspace = 'Airspace',
  CityOther = 'City/Other'
}

enum MapSetupGroups430 {
  Map = 'Map',
  Weather = 'Weather',
  Traffic = 'Traffic',
  Airport = 'Airport',
  NAVAID = 'NAVAID',
  Waypoint = 'Waypoint',
  Line = 'Line',
  Control = 'Control',
  Airspace = 'Airspace',
  City = 'City',
  Road = 'Road',
  Other = 'Other'
}

/**
 * Props on the MapSetupGroup control.
 */
interface MapSetupGroupProps extends GNSUiControlProps {
  /**
   * A callback that fires when a new map group is selected.
   * @param group The group that was selected.
   */
  onGroupSelected(group: MapSetupGroups530 | MapSetupGroups430): void;


  /** Which type of GNS is in use. */
  gnsType: GNSType;
}

/**
 * A control that changes the map setup group.
 */
class MapSetupGroup extends GNSUiControl<MapSetupGroupProps> {
  private readonly selected = Subject.create('Map');
  private readonly selectedEl = FSComponent.createRef<HTMLElement>();
  private readonly menu530: MenuEntry[] = [
    { label: MapSetupGroups530.Map, disabled: false, action: () => this.selectGroup(MapSetupGroups530.Map) },
    { label: MapSetupGroups530.Weather, disabled: false, action: () => this.selectGroup(MapSetupGroups530.Weather) },
    { label: MapSetupGroups530.Traffic, disabled: false, action: () => this.selectGroup(MapSetupGroups530.Traffic) },
    { label: MapSetupGroups530.LineRoad, disabled: true, action: () => this.selectGroup(MapSetupGroups530.LineRoad) },
    { label: MapSetupGroups530.Waypoint, disabled: false, action: () => this.selectGroup(MapSetupGroups530.Waypoint) },
    { label: MapSetupGroups530.Airspace, disabled: false, action: () => this.selectGroup(MapSetupGroups530.Airspace) },
    { label: MapSetupGroups530.CityOther, disabled: true, action: () => this.selectGroup(MapSetupGroups530.CityOther) }
  ];

  private readonly menu430: MenuEntry[] = [
    { label: MapSetupGroups430.Map, disabled: false, action: () => this.selectGroup(MapSetupGroups430.Map) },
    { label: MapSetupGroups430.Weather, disabled: false, action: () => this.selectGroup(MapSetupGroups430.Weather) },
    { label: MapSetupGroups430.Traffic, disabled: false, action: () => this.selectGroup(MapSetupGroups430.Traffic) },
    { label: MapSetupGroups430.Airport, disabled: false, action: () => this.selectGroup(MapSetupGroups430.Airport) },
    { label: MapSetupGroups430.NAVAID, disabled: false, action: () => this.selectGroup(MapSetupGroups430.NAVAID) },
    { label: MapSetupGroups430.Waypoint, disabled: false, action: () => this.selectGroup(MapSetupGroups430.Waypoint) },
    { label: MapSetupGroups430.Line, disabled: true, action: () => this.selectGroup(MapSetupGroups430.Line) },
    { label: MapSetupGroups430.Control, disabled: true, action: () => this.selectGroup(MapSetupGroups430.Control) },
    { label: MapSetupGroups430.Airspace, disabled: true, action: () => this.selectGroup(MapSetupGroups430.Airspace) },
    { label: MapSetupGroups430.City, disabled: true, action: () => this.selectGroup(MapSetupGroups430.City) },
    { label: MapSetupGroups430.Road, disabled: true, action: () => this.selectGroup(MapSetupGroups430.Road) },
    { label: MapSetupGroups430.Other, disabled: true, action: () => this.selectGroup(MapSetupGroups430.Other) },
  ];


  /** @inheritdoc */
  protected onFocused(): void {
    this.selectedEl.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.selectedEl.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    this.openMenu();
    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    this.openMenu();
    return true;
  }

  /**
   * Opens the map group menu.
   */
  private openMenu(): void {
    if (this.props.gnsType === 'wt530') {
      ViewService.menu(this.menu530, 'MAP SETUP');
    } else {
      ViewService.menu(this.menu430, 'MAP SETUP');
    }
  }

  /**
   * Selects a group.
   * @param group The group that was selected.
   */
  private selectGroup(group: MapSetupGroups530 | MapSetupGroups430): void {
    this.selected.set(group);
    this.props.onGroupSelected(group);
    ViewService.back();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setup-group'>
        <label>GROUP</label>
        <div class='map-setup-group-select'>
          <div ref={this.selectedEl}>{this.selected}</div>
        </div>
      </div>
    );
  }
}

/**
 * Props on the MapGroup component.
 */
interface GroupProps extends GNSUiControlProps {
  /** The setting provider to use. */
  settingsProvider: GNSSettingsProvider;

  /** Which type of GNS is in use. */
  gnsType: GNSType;
}

/**
 * An interface that describes a group of map settings.
 */
interface SettingsGroup {
  /**
   * Sets the settings group visibility.
   * @param isVisible True if visible, false otherwise.
   */
  setVisible(isVisible: boolean): void;
}

/**
 * The Map map setup group.
 */
class MapGroup extends GNSUiControl<GroupProps> implements SettingsGroup {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly mapSettings = this.props.settingsProvider.map;

  /** @inheritdoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(false));
      this.setDisabled(false);
    } else {
      this.el.instance.classList.add('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(true));
      this.setDisabled(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setup-settings' ref={this.el}>
        <div class='map-setup-settings-header'>
        </div>
        <div class='map-setup-settings-labels'>
          <MapSettingLabel line1='ORIENT-' line2='ATION' />
          <MapSettingLabel line1='AUTO' line2='ZOOM' />
          <MapSettingLabel line1='LAND' line2='DATA' />
          <MapSettingLabel line1='AVIATN' line2='DATA' />
        </div>
        <div class='map-setup-settings-controls'>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_orientation')} menuTitle='ORIENTATION'
              options={[['North up', MapRotation.NorthUp], ['Track up', MapRotation.TrackUp]]} />
          </div>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_autozoom')} menuTitle='AUTO ZOOM'
              options={[['Off', false], ['On', true]]} />
          </div>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_land_data')} menuTitle='LAND DATA'
              options={[['Off', false], ['On', true]]} />
          </div>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_aviation_data')} menuTitle='AVIATION DATA'
              options={[['Off', false], ['On', true]]} />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * The Map map setup group.
 */
class TrafficGroup extends GNSUiControl<GroupProps> implements SettingsGroup {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly mapSettings = this.props.settingsProvider.map;
  private readonly rangeOptions = ArraySubject.create<[string, MapSettingsRanges]>([]);

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.settingsProvider.units.distanceUnitsLarge.sub(this.onUnitsChanged.bind(this), true);
  }

  /** @inheritdoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(false));
      this.setDisabled(false);
    } else {
      this.el.instance.classList.add('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(true));
      this.setDisabled(true);
    }
  }

  /**
   * Handles when the system units settings are changed.
   * @param type The type of units that the setting was changed to.
   */
  private onUnitsChanged(type: Unit<UnitFamily.Distance>): void {
    const ranges = type === UnitType.KILOMETER ? MapSettingsRangeArrayKM : MapSettingsRangeArrayNM;

    this.rangeOptions.clear();
    this.rangeOptions.set(ranges.map((kv, i) => i === 0 ? ['Off', i] : [`${kv[1].number}${GNSNumberUnitDisplay.getUnitChar(kv[1].unit)}`, i]));
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setup-settings' ref={this.el}>
        <div class='map-setup-settings-header'>
        </div>
        <div class='map-setup-settings-labels'>
          <MapSettingLabel line1='TRAFC' line2='MODE' />
          <MapSettingLabel line1='TRAFC' line2='SMBL' />
          <MapSettingLabel line1='TRAFC' line2='LBL' />
        </div>
        <div class='map-setup-settings-controls'>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_traffic_mode')} menuTitle='TRAFFIC MODE'
              options={[['All Trfc', MapTrafficMode.All], ['TA/Prox', MapTrafficMode.TAAndProximity], ['TA Only', MapTrafficMode.TAOnly]]} />
          </div>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_traffic_symbol_range')} menuTitle='TRAFFIC SYMBOLS' options={this.rangeOptions} />
          </div>
          <div class='map-setting-control'>
            <MapSettingControl setting={this.mapSettings.getSetting('map_traffic_label_range')} menuTitle='TRAFFIC LABELS' options={this.rangeOptions} />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * The Waypoint map setup group.
 */
class WaypointGroup extends GNSUiControl<GroupProps> implements SettingsGroup {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly mapSettings = this.props.settingsProvider.map;
  private readonly rangeOptions = ArraySubject.create<[string, MapSettingsRanges]>([]);
  private readonly sizeOptions: [string, MapSettingsWaypointSizes][] = [
    ['Off', MapSettingsWaypointSizes.Off],
    ['Sml', MapSettingsWaypointSizes.Small],
    ['Med', MapSettingsWaypointSizes.Med],
    ['Lrg', MapSettingsWaypointSizes.Large]
  ];

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.settingsProvider.units.distanceUnitsLarge.sub(this.onUnitsChanged.bind(this), true);
  }

  /**
   * Handles when the system units settings are changed.
   * @param type The type of units that the setting was changed to.
   */
  private onUnitsChanged(type: Unit<UnitFamily.Distance>): void {
    const ranges = type === UnitType.KILOMETER ? MapSettingsRangeArrayKM : MapSettingsRangeArrayNM;

    this.rangeOptions.clear();
    this.rangeOptions.set(ranges.map((kv, i) => i === 0 ? ['Off', i] : [`${kv[1].number}${GNSNumberUnitDisplay.getUnitChar(kv[1].unit)}`, i]));
  }

  /** @inheritdoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(false));
      this.setDisabled(false);
    } else {
      this.el.instance.classList.add('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(true));
      this.setDisabled(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setup-settings' ref={this.el}>
        <div class='map-setup-settings-header'>
          <span>TEXT</span><span>RNG</span>
        </div>

        {this.props.gnsType === 'wt530' ? <div class='map-setup-settings-labels'>
          <MapSettingLabel line1='ACTIVE' line2='FPL' />
          <MapSettingLabel line1='LARGE' line2='APT' />
          <MapSettingLabel line1='MEDIUM' line2='APT' />
          <MapSettingLabel line1='SMALL' line2='APT' />
          <MapSettingLabel line1='INT' />
          <MapSettingLabel line1='NDB' />
          <MapSettingLabel line1='VOR' />
          <MapSettingLabel line1='USER' />
        </div> :
          <div class='map-setup-settings-labels'>
            <MapSettingLabel line1='USER' line2='WPT' />
            <MapSettingLabel line1='ACTY' line2='FPL' />

          </div>
        }
        {this.props.gnsType === 'wt530' ?
          <div class='map-setup-settings-controls'>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_fpl_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_fpl_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_large_apt_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_large_apt_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_medium_apt_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_medium_apt_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_small_apt_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_small_apt_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_int_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_int_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_ndb_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_ndb_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_vor_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_vor_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_user_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_user_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
          </div> :
          <div class='map-setup-settings-controls'>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_user_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_user_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
            <div class='map-setting-control dual'>
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_fpl_size')} menuTitle='TEXT' options={this.sizeOptions} />
              <MapSettingControl setting={this.mapSettings.getSetting('wpt_fpl_range')} menuTitle='RANGE' options={this.rangeOptions} />
            </div>
          </div>
        }
      </div>
    );
  }
}

/**
 * Props on the MapSettingLabel component.
 */
interface MapSettingLabelProps extends ComponentProps {
  /** The first line of the label. */
  line1: string;

  /** The second line of the label. */
  line2?: string;
}

/**
 * Renders map setup settings labels.
 */
class MapSettingLabel extends DisplayComponent<MapSettingLabelProps> {
  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setting-label'>
        <label>{this.props.line1}</label>
        {this.props.line2 && <label class='right'>{this.props.line2}</label>}
      </div>
    );
  }
}

/**
 * Props on the MapSettingControl control.
 */
interface MapSettingControlProps<T extends UserSettingValue> extends GNSUiControlProps {
  /** The setting to read and write. */
  setting: UserSetting<T>;

  /** The options for the setting. */
  options: [string, T][] | SubscribableArray<[string, T]>;

  /** The title for the settings change menu. */
  menuTitle: string;
}

/**
 * A control that changes a map setup setting.
 */
class MapSettingControl<T extends UserSettingValue> extends GNSUiControl<MapSettingControlProps<T>> {
  private settingSub?: Subscription;
  private optionsSub?: Subscription;

  private readonly valueText = Subject.create('');
  private readonly el = FSComponent.createRef<HTMLElement>();

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);
    this.settingSub = this.props.setting.sub(this.onSettingChanged.bind(this), true);

    if (!Array.isArray(this.props.options)) {
      this.optionsSub = this.props.options.sub(this.onOptionsChanged.bind(this));
    }
  }

  /**
   * Handles when the setting is changed.
   * @param value The value that the setting was changed to.
   */
  private onSettingChanged(value: T): void {
    const options = Array.isArray(this.props.options) ? this.props.options : this.props.options.getArray();
    const index = options.findIndex(option => option[1] === value);

    if (options[index] !== undefined) {
      this.valueText.set(options[index][0]);
    } else {
      this.valueText.set('');
    }
  }

  /**
   * Handles when the list of options has changed.
   */
  private onOptionsChanged(): void {
    if (!Array.isArray(this.props.options)) {
      const option = this.props.options.getArray().find(v => v[1] === this.props.setting.get());
      if (option !== undefined) {
        this.valueText.set(option[0]);
      } else {
        this.valueText.set('');
      }
    }
  }

  /** @inheritdoc */
  protected onFocused(): void {
    this.el.instance.classList.add('selected');
  }

  /** @inheritdoc */
  protected onBlurred(): void {
    this.el.instance.classList.remove('selected');
  }

  /** @inheritdoc */
  public onRightInnerInc(): boolean {
    this.openMenu();
    return true;
  }

  /** @inheritdoc */
  public onRightInnerDec(): boolean {
    this.openMenu();
    return true;
  }

  /**
   * Opens the map group menu.
   */
  private openMenu(): void {
    const options = Array.isArray(this.props.options) ? this.props.options : this.props.options.getArray();

    const menu = ViewService.menu(options.map(option => ({
      label: option[0],
      disabled: false,
      action: () => {
        this.props.setting.set(option[1]);
        ViewService.back();
      }
    })), this.props.menuTitle);

    if (menu !== undefined) {
      (menu as MenuDialog).setSelectedItem(options.findIndex(v => v[1] === this.props.setting.get()));
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span ref={this.el}>{this.valueText}</span>
    );
  }
}


/**
 * The Waypoint map setup group.
 */
class AirportGroup extends GNSUiControl<GroupProps> implements SettingsGroup {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly mapSettings = this.props.settingsProvider.map;
  private readonly rangeOptions = ArraySubject.create<[string, MapSettingsRanges]>([]);
  private readonly sizeOptions: [string, MapSettingsWaypointSizes][] = [
    ['Off', MapSettingsWaypointSizes.Off],
    ['Sml', MapSettingsWaypointSizes.Small],
    ['Med', MapSettingsWaypointSizes.Med],
    ['Lrg', MapSettingsWaypointSizes.Large]
  ];

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.settingsProvider.units.distanceUnitsLarge.sub(this.onUnitsChanged.bind(this), true);
  }

  /**
   * Handles when the system units settings are changed.
   * @param type The type of units that the setting was changed to.
   */
  private onUnitsChanged(type: Unit<UnitFamily.Distance>): void {
    const ranges = type === UnitType.KILOMETER ? MapSettingsRangeArrayKM : MapSettingsRangeArrayNM;

    this.rangeOptions.clear();
    this.rangeOptions.set(ranges.map((kv, i) => i === 0 ? ['Off', i] : [`${kv[1].number}${GNSNumberUnitDisplay.getUnitChar(kv[1].unit)}`, i]));
  }

  /** @inheritdoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(false));
      this.setDisabled(false);
    } else {
      this.el.instance.classList.add('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(true));
      this.setDisabled(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setup-settings' ref={this.el}>
        <div class='map-setup-settings-header'>
          <span>TEXT</span><span>RNG</span>
        </div>
        <div class='map-setup-settings-labels'>
          <MapSettingLabel line1='LARGE' line2='APT' />
          <MapSettingLabel line1='MEDIUM' line2='APT' />
          <MapSettingLabel line1='SMALL' line2='APT' />
        </div>
        <div class='map-setup-settings-controls'>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_large_apt_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_large_apt_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_medium_apt_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_medium_apt_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_small_apt_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_small_apt_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
        </div> :
        <div class='map-setup-settings-controls'>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_user_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_user_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_fpl_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_fpl_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
        </div>
      </div>
    );
  }
}


/**
 * The Waypoint map setup group.
 */
class NAVAIDGroup extends GNSUiControl<GroupProps> implements SettingsGroup {
  private readonly el = FSComponent.createRef<HTMLElement>();
  private readonly mapSettings = this.props.settingsProvider.map;
  private readonly rangeOptions = ArraySubject.create<[string, MapSettingsRanges]>([]);
  private readonly sizeOptions: [string, MapSettingsWaypointSizes][] = [
    ['Off', MapSettingsWaypointSizes.Off],
    ['Sml', MapSettingsWaypointSizes.Small],
    ['Med', MapSettingsWaypointSizes.Med],
    ['Lrg', MapSettingsWaypointSizes.Large]
  ];

  /** @inheritdoc */
  public onAfterRender(node: VNode): void {
    super.onAfterRender(node);
    this.props.settingsProvider.units.distanceUnitsLarge.sub(this.onUnitsChanged.bind(this), true);
  }

  /**
   * Handles when the system units settings are changed.
   * @param type The type of units that the setting was changed to.
   */
  private onUnitsChanged(type: Unit<UnitFamily.Distance>): void {
    const ranges = type === UnitType.KILOMETER ? MapSettingsRangeArrayKM : MapSettingsRangeArrayNM;

    this.rangeOptions.clear();
    this.rangeOptions.set(ranges.map((kv, i) => i === 0 ? ['Off', i] : [`${kv[1].number}${GNSNumberUnitDisplay.getUnitChar(kv[1].unit)}`, i]));
  }

  /** @inheritdoc */
  public setVisible(isVisible: boolean): void {
    if (isVisible) {
      this.el.instance.classList.remove('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(false));
      this.setDisabled(false);
    } else {
      this.el.instance.classList.add('hide-element');
      this.registeredControls?.forEach(c => c.setDisabled(true));
      this.setDisabled(true);
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class='map-setup-settings' ref={this.el}>
        <div class='map-setup-settings-header'>
          <span>TEXT</span><span>RNG</span>
        </div>
        <div class='map-setup-settings-labels'>
          <MapSettingLabel line1='INT' />
          <MapSettingLabel line1='NDB' />
          <MapSettingLabel line1='VOR' />
        </div>
        <div class='map-setup-settings-controls'>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_int_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_int_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_ndb_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_ndb_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
          <div class='map-setting-control dual'>
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_vor_size')} menuTitle='TEXT' options={this.sizeOptions} />
            <MapSettingControl setting={this.mapSettings.getSetting('wpt_vor_range')} menuTitle='RANGE' options={this.rangeOptions} />
          </div>
        </div>
      </div>
    );
  }
}