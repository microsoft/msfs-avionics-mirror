import { ArraySubject, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MapUtils, UnitsUserSettings } from '@microsoft/msfs-garminsdk';

import { MapUserSettings } from '../../../../Shared/Map/MapUserSettings';
import { ContextMenuDialog, ContextMenuItemDefinition } from '../../../../Shared/UI/Dialogs/ContextMenuDialog';
import { FmsHEvent } from '../../../../Shared/UI/FmsHEvent';
import { SoftKeyMenuSystem } from '../../../../Shared/UI/Menus/SoftKeyMenuSystem';
import { SelectControl } from '../../../../Shared/UI/UIControls/SelectControl';
import { UiView, UiViewProps } from '../../../../Shared/UI/UiView';
import { GroupBox } from '../GroupBox';
import { MFDMapSettingsAirspaceGroup } from './MFDMapSettingsAirspaceGroup';
import { MFDMapSettingsAviationGroup } from './MFDMapSettingsAviationGroup';
import { MFDMapSettingsGroup } from './MFDMapSettingsGroup';
import { MFDMapSettingsLandGroup } from './MFDMapSettingsLandGroup';
import { MFDMapSettingsMapGroup } from './MFDMapSettingsMapGroup';
import { MFDMapSettingsTrafficGroup } from './MFDMapSettingsTrafficGroup';
import { MFDMapSettingsWeatherGroup } from './MFDMapSettingsWeatherGroup';

import './MFDMapSettings.css';

/**
 * Component props for MFDMapSettings.
 */
export interface MFDMapSettingsProps extends UiViewProps {
  /** The event bus. */
  bus: EventBus;

  /** The softkey menu system. */
  menuSystem: SoftKeyMenuSystem;
}

/** A name for a map settings group. */
type MFDMapSettingsGroupName = 'Map' | 'Weather' | 'Traffic' | 'Aviation' | 'Airspace' | 'Airways' | 'Land' | 'VSD';

/**
 * The MFD map settings menu.
 */
export class MFDMapSettings extends UiView<MFDMapSettingsProps> {
  private static readonly GROUP_ITEMS: MFDMapSettingsGroupName[] = ['Map', 'Weather', 'Traffic', 'Aviation', 'Airspace', 'Airways', 'Land', 'VSD'];

  private readonly groupRefs = {
    ['Map']: FSComponent.createRef<MFDMapSettingsMapGroup>(),
    ['Weather']: FSComponent.createRef<MFDMapSettingsWeatherGroup>(),
    ['Traffic']: FSComponent.createRef<MFDMapSettingsTrafficGroup>(),
    ['Aviation']: FSComponent.createRef<MFDMapSettingsAviationGroup>(),
    ['Airspace']: FSComponent.createRef<MFDMapSettingsAirspaceGroup>(),
    ['Airways']: FSComponent.createRef<MFDMapSettingsGroup<any>>(),
    ['Land']: FSComponent.createRef<MFDMapSettingsLandGroup>(),
    ['VSD']: FSComponent.createRef<MFDMapSettingsGroup<any>>()
  };

  private readonly settingManager = MapUserSettings.getMfdManager(this.props.bus);
  private readonly mapRangeArray = UnitsUserSettings.getManager(this.props.bus).getSetting('unitsDistance').map(setting => {
    return MapUtils.nextGenMapRanges(setting);
  });

  private activeGroup: MFDMapSettingsGroup<any> | null = null;

  /** @inheritdoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_PUSH:
      case FmsHEvent.CLR:
        this.close();
        return true;
    }

    return false;
  }

  /** @inheritdoc */
  protected onViewOpened(): void {
    this.props.menuSystem.pushMenu('empty');
  }

  /** @inheritdoc */
  protected onViewClosed(): void {
    this.props.menuSystem.back();
  }

  /**
   * Builds a menu item definition for a group item.
   * @param item A group item.
   * @returns a menu item definition for the group item.
   */
  private buildGroupMenuItem(item: MFDMapSettingsGroupName): ContextMenuItemDefinition {
    return {
      id: item,
      renderContent: (): VNode => <span>{item}</span>,
      estimatedWidth: item.length * ContextMenuDialog.CHAR_WIDTH,
      isEnabled: item === 'Map' || item === 'Weather' || item === 'Aviation' || item === 'Airspace' || item === 'Traffic' || item === 'Land'
    };
  }

  /**
   * A callback which is called when a group item is selected.
   * @param index The index of the selected item.
   * @param item The selected item.
   */
  private onGroupItemSelected(index: number, item: MFDMapSettingsGroupName | undefined): void {
    const selectedGroup = item === undefined ? null : this.groupRefs[item].instance;
    if (selectedGroup !== this.activeGroup) {
      if (this.activeGroup) {
        this.activeGroup.hide();
        this.scrollController.unregisterCtrl(this.activeGroup);
      }

      if (selectedGroup) {
        this.scrollController.registerCtrl(selectedGroup);
        selectedGroup.show();
      }

      this.activeGroup = selectedGroup;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.viewContainerRef} class='popout-dialog mfd-mapsettings'>
        <h1>{this.props.title}</h1>
        <GroupBox title={'Group'}>
          <SelectControl<MFDMapSettingsGroupName> viewService={this.props.viewService} onRegister={this.register} outerContainer={this.viewContainerRef}
            data={ArraySubject.create(MFDMapSettings.GROUP_ITEMS)}
            buildMenuItem={this.buildGroupMenuItem.bind(this)}
            onItemSelected={this.onGroupItemSelected.bind(this)} />
        </GroupBox>
        <div class='mfd-mapsettings-groupcontainer'>
          <MFDMapSettingsMapGroup viewService={this.props.viewService} ref={this.groupRefs['Map']} settingManager={this.settingManager} mapRanges={this.mapRangeArray} />
          <MFDMapSettingsWeatherGroup viewService={this.props.viewService} ref={this.groupRefs['Weather']} settingManager={this.settingManager} mapRanges={this.mapRangeArray} />
          <MFDMapSettingsAviationGroup viewService={this.props.viewService} ref={this.groupRefs['Aviation']} settingManager={this.settingManager} mapRanges={this.mapRangeArray} />
          <MFDMapSettingsAirspaceGroup viewService={this.props.viewService} ref={this.groupRefs['Airspace']} settingManager={this.settingManager} mapRanges={this.mapRangeArray} />
          <MFDMapSettingsTrafficGroup viewService={this.props.viewService} ref={this.groupRefs['Traffic']} settingManager={this.settingManager} mapRanges={this.mapRangeArray} />
          <MFDMapSettingsLandGroup viewService={this.props.viewService} ref={this.groupRefs['Land']} settingManager={this.settingManager} mapRanges={this.mapRangeArray} />
        </div>
      </div>
    );
  }
}