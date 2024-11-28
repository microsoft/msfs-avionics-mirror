import { ComponentProps, DisplayComponent, EventBus, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

import {
  FmsPositionMode, GpsIntegrityDataProvider, NavDataFieldGpsValidity, NavStatusBox as BaseNavStatusBox, NavStatusBoxDataProvider, UnitsUserSettingManager
} from '@microsoft/msfs-garminsdk';

import { NavStatusBoxConfig } from './NavStatusBoxConfig';

import './NavStatusBox.css';

/**
 * Component props for NavStatusBox.
 */
export interface NavStatusBoxProps extends ComponentProps {
  /** The event bus. */
  bus: EventBus;

  /** The configuration object for the status box. */
  config: NavStatusBoxConfig;

  /** A data provider for the status box. */
  dataProvider: NavStatusBoxDataProvider;

  /** A provider of GPS position integrity data. */
  gpsIntegrityDataProvider: GpsIntegrityDataProvider;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the status box should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 PFD navigation status box.
 */
export class NavStatusBox extends DisplayComponent<NavStatusBoxProps> {
  private readonly legRef = FSComponent.createRef<BaseNavStatusBox>();

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
  public render(): VNode {
    return (
      <BaseNavStatusBox
        ref={this.legRef}
        bus={this.props.bus}
        fieldTypes={[this.props.config.field1, this.props.config.field2]}
        dataProvider={this.props.dataProvider}
        gpsValidity={this.navDataFieldGpsValidity}
        unitsSettingManager={this.props.unitsSettingManager}
        declutter={this.props.declutter}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.legRef.getOrDefault()?.destroy();

    this.navDataFieldGpsValidity.destroy();

    super.destroy();
  }
}