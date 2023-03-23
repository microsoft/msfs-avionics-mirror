import { ComponentProps, DisplayComponent, EventBus, FSComponent, SetSubject, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import {
  DateTimeUserSettingTypes, DefaultNavDataBarFieldModelFactory, Fms, FmsPositionMode, GpsIntegrityDataProvider, NavDataBar, NavDataBarSettingTypes,
  NavDataFieldGpsValidity, NextGenNavDataBarFieldRenderer, UnitsUserSettingManager
} from '@microsoft/msfs-garminsdk';

import './MfdNavDataBar.css';

/**
 * Component props for NavDataBar.
 */
export interface MfdNavDataBarProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The FMS. */
  fms: Fms;

  /** A provider of GPS position integrity data. */
  gpsIntegrityDataProvider: GpsIntegrityDataProvider;

  /** A user setting manager for the settings that control the data bar's field types. */
  dataBarSettingManager: UserSettingManager<NavDataBarSettingTypes>;

  /** A user setting manager for measurement units. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A user setting manager for date/time settings. */
  dateTimeSettingManager: UserSettingManager<DateTimeUserSettingTypes>;

  /** The update frequency of the data fields, in hertz. */
  updateFreq: number;
}

/**
 * An MFD navigation data bar. Displays four navigation data fields in addition to the title of the current open MFD
 * page.
 */
export class MfdNavDataBar extends DisplayComponent<MfdNavDataBarProps> {
  private static readonly FIELD_COUNT = 8;

  private readonly ref = FSComponent.createRef<NavDataBar>();

  private readonly rootCssClass = SetSubject.create<string>();

  private readonly navDataFieldGpsValidity = this.props.gpsIntegrityDataProvider.fmsPosMode.map(mode => {
    switch (mode) {
      case FmsPositionMode.Gps:
      case FmsPositionMode.Dme:
      case FmsPositionMode.Hns:
        return NavDataFieldGpsValidity.Valid;
      case FmsPositionMode.DeadReckoning:
      case FmsPositionMode.DeadReckoningExpired:
        return NavDataFieldGpsValidity.DeadReckoning;
      default:
        return NavDataFieldGpsValidity.Invalid;
    }
  });

  /** @inheritdoc */
  public onAfterRender(): void {
    this.navDataFieldGpsValidity.sub(validity => {
      this.rootCssClass.toggle('nav-data-bar-gps-loi', validity !== NavDataFieldGpsValidity.Valid);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <NavDataBar
        ref={this.ref}
        bus={this.props.bus}
        fieldCount={MfdNavDataBar.FIELD_COUNT}
        modelFactory={new DefaultNavDataBarFieldModelFactory(this.props.bus, this.props.fms, this.navDataFieldGpsValidity)}
        fieldRenderer={new NextGenNavDataBarFieldRenderer(this.props.unitsSettingManager, this.props.dateTimeSettingManager)}
        dataBarSettingManager={this.props.dataBarSettingManager}
        updateFreq={this.props.updateFreq}
        class={this.rootCssClass}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    this.navDataFieldGpsValidity.destroy();

    super.destroy();
  }
}