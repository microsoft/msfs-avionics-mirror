import {
  ActiveLegType, ClockEvents, FlightPlanActiveLegEvent, FocusPosition, FSComponent, GPSSatComputerEvents, GPSSystemState, LegType, Subject,
  UserSetting, VNode
} from '@microsoft/msfs-sdk';

import { DefaultNavDataBarFieldModelFactory, DirectToState, Fms, NavDataFieldGpsValidity, NavDataFieldType } from '@microsoft/msfs-garminsdk';

import { GNSSettingsProvider } from '../../../../Shared/Settings/GNSSettingsProvider';
import { SelectableText } from '../../../../Shared/UI/Controls/SelectableText';
import { FieldTypeMenu } from '../../../../Shared/UI/DataFields/FieldTypeMenu';
import { GNSDataField } from '../../../../Shared/UI/DataFields/GNSDataField';
import { DataFieldContext, GNSDataFieldRenderer } from '../../../../Shared/UI/DataFields/GNSDataFieldRenderer';
import { GNSUiControl } from '../../../../Shared/UI/GNSUiControl';
import { InteractionEvent } from '../../../../Shared/UI/InteractionEvent';
import { LegIcon } from '../../../../Shared/UI/Pages/Map/LegIcon';
import { WaypointLeg } from '../../../../Shared/UI/Pages/Map/WaypointLeg';
import { MenuDefinition, MenuEntry, Page, PageProps, ViewService } from '../../../../Shared/UI/Pages/Pages';
import { WT430Cdi } from './WT430Cdi';

import './NavInfo.css';

/**
 * Props for {@link NavInfo}
 */
export interface NavInfoProps extends PageProps {
  /** The fms */
  fms: Fms,
}

/**
 * GNS430 NAV Page 1
 */
export class NavInfo extends Page<NavInfoProps> {
  private readonly fromWaypoint = FSComponent.createRef<WaypointLeg>();
  private readonly toWaypoint = FSComponent.createRef<WaypointLeg>();
  private readonly legIcon = FSComponent.createRef<LegIcon>();
  private readonly rootControl = FSComponent.createRef<GNSUiControl>();

  private readonly pageMenu = new NavInfoPageMenu();

  private readonly gpsValidity = Subject.create<NavDataFieldGpsValidity>(NavDataFieldGpsValidity.Invalid);
  private readonly settingsProvider = new GNSSettingsProvider(this.props.bus);

  private readonly fieldContext: DataFieldContext = {
    modelFactory: new DefaultNavDataBarFieldModelFactory(this.props.bus, this.gpsValidity, {
      lnavIndex: this.props.fms.lnavIndex,
      vnavIndex: this.props.fms.vnavIndex
    }),
    renderer: new GNSDataFieldRenderer(this.settingsProvider.units, this.settingsProvider.time),
    fieldTypeMenuEntries: [
      { label: 'BRG - Bearing', disabled: false, type: NavDataFieldType.BearingToWaypoint },
      { label: 'DIS - Distance', disabled: false, type: NavDataFieldType.DistanceToWaypoint },
      { label: 'DTK - Desired Track', disabled: false, type: NavDataFieldType.DesiredTrack },
      { label: 'ESA - Enrte Safe Alt', disabled: true, type: NavDataFieldType.BearingToWaypoint },
      { label: 'ETA - Est Time Arvl', disabled: false, type: NavDataFieldType.TimeOfWaypointArrival },
      { label: 'ETE - Est Time Enrte', disabled: false, type: NavDataFieldType.TimeToWaypoint },
      { label: 'FLOW - Total Fuel Flow', disabled: true, type: NavDataFieldType.BearingToWaypoint },
      { label: 'GS - Ground Speed', disabled: false, type: NavDataFieldType.GroundSpeed },
      { label: 'MSA - Min Safe Alt', disabled: true, type: NavDataFieldType.BearingToWaypoint },
      { label: 'TKE - Track Ang Err', disabled: false, type: NavDataFieldType.TrackAngleError },
      { label: 'TRK - Track', disabled: false, type: NavDataFieldType.GroundTrack },
      { label: 'VSR - Vert Spd Reqd', disabled: false, type: NavDataFieldType.VerticalSpeedRequired },
      { label: 'XTK - Cross Track Err', disabled: false, type: NavDataFieldType.CrossTrack },
    ],
  };

  private readonly fields = [
    FSComponent.createRef<GNSDataField>(),
    FSComponent.createRef<GNSDataField>(),
    FSComponent.createRef<GNSDataField>(),
    FSComponent.createRef<GNSDataField>(),
    FSComponent.createRef<GNSDataField>(),
    FSComponent.createRef<GNSDataField>(),
  ];

  private readonly clockSub = this.props.bus.getSubscriber<ClockEvents>().on('realTime')
    .atFrequency(4).handle(() => {
      for (let i = 0; i < this.fields.length; i++) {
        this.fields[i].getOrDefault()?.update();
      }
    });

  /** @inheritDoc */
  onSuspend(): void {
    super.onSuspend();

    this.clockSub.pause();
  }

  /** @inheritDoc */
  onResume(): void {
    super.onResume();

    this.clockSub.resume();
  }

  /** @inheritdoc */
  public onInteractionEvent(evt: InteractionEvent): boolean {
    if (evt === InteractionEvent.MENU) {
      ViewService.menu(this.pageMenu);
      return true;
    }

    let handled = false;
    if (this.rootControl.instance.isFocused) {
      if (evt === InteractionEvent.CLR) {
        this.rootControl.instance.blur();
        handled = true;
      } else {
        handled = this.rootControl.instance.onInteractionEvent(evt);
      }
    }

    if (handled) {
      return handled;
    }

    return super.onInteractionEvent(evt);
  }

  /** @inheritDoc */
  onAfterRender(node: VNode): void {
    super.onAfterRender(node);

    this.props.fms.flightPlanner.onEvent('fplActiveLegChange').handle(this.onActiveLegChanged.bind(this));
    this.legIcon.instance.updateLegIcon(true, false, LegType.TF);

    this.toWaypoint.instance.setDisabled(true);
    this.fromWaypoint.instance.setDisabled(true);

    this.pageMenu.onRestoreDefaults = (): void => {
      this.settingsProvider.arcMapFields.getAllSettings().forEach(v => v.resetToDefault());
      ViewService.back();
    };

    this.pageMenu.onChangeFieldsSelected = (): any => {
      ViewService.back();
      this.rootControl.instance.focus(FocusPosition.First);
    };

    this.props.bus.getSubscriber<GPSSatComputerEvents>().on('gps_system_state_changed_1').handle(state => {
      const valid = state === GPSSystemState.SolutionAcquired || state === GPSSystemState.DiffSolutionAcquired;
      this.gpsValidity.set(valid ? NavDataFieldGpsValidity.Valid : NavDataFieldGpsValidity.Invalid);
    });
  }

  /**
   * Handles when the active flight plan leg changes.
   * @param data The active flight plan leg change event.
   */
  private onActiveLegChanged(data: FlightPlanActiveLegEvent): void {
    if (data.planIndex !== this.props.fms.flightPlanner.activePlanIndex) {
      return;
    }

    if (this.props.fms.hasPrimaryFlightPlan() && data.type === ActiveLegType.Lateral) {
      const plan = this.props.fms.getPrimaryFlightPlan();
      const toLeg = plan.tryGetLeg(data.segmentIndex, data.legIndex);
      this.toWaypoint.instance.setLeg(toLeg);

      if (toLeg !== null) {
        const toLegIndex = plan.getLegIndexFromLeg(toLeg);
        const fromLeg = plan.tryGetLeg(toLegIndex - 1);
        const directToState = this.props.fms.getDirectToState();

        this.fromWaypoint.instance.setLeg(fromLeg);

        if (fromLeg === null || directToState === DirectToState.TOEXISTING || directToState === DirectToState.TORANDOM) {
          this.legIcon.instance.updateLegIcon(true, true, toLeg.leg.type, toLeg.leg.turnDirection);
        } else {
          this.legIcon.instance.updateLegIcon(true, false, toLeg.leg.type, toLeg.leg.turnDirection);
        }
      } else {
        this.legIcon.instance.updateLegIcon(true, false, LegType.TF);
      }
    } else {
      this.legIcon.instance.updateLegIcon(true, false, LegType.TF);
    }
  }

  /**
   * Handles a data field change interaction (right inner dec/inc)
   *
   * @param fieldIndex 1-indexed data field index
   *
   * @returns true
   */
  private onChangeDataField(fieldIndex: number): boolean {
    const field = this.fields[fieldIndex - 1];

    ViewService.menu(
      new FieldTypeMenu(
        this.fieldContext.fieldTypeMenuEntries,
        field.instance.props.type as UserSetting<NavDataFieldType>,
        () => {
          ViewService.back();
          this.rootControl.instance.scroll('forward');
        },
      ),
    );

    return true;
  }

  /**
   * Renders a data field label
   *
   * @param fieldIndex 1-indexed data field index
   *
   * @returns a vnode
   */
  private renderDataFieldLabel(fieldIndex: 1 | 2 | 3 | 4 | 5 | 6): VNode {
    const fieldSettings = this.settingsProvider.wt430navInfoFields;

    return (
      <SelectableText
        data={fieldSettings.getSetting(`wt430_navinfo_field_${fieldIndex}_type`)}
        selectedClass="selected-cyan"
        onRightInnerDec={this.onChangeDataField.bind(this, fieldIndex)}
        onRightInnerInc={this.onChangeDataField.bind(this, fieldIndex)}
      />
    );
  }

  /**
   * Renders a data field element
   *
   * @param fieldIndex 1-indexed data field index
   *
   * @returns a vnode
   */
  private renderDataFieldElement(fieldIndex: 1 | 2 | 3 | 4 | 5 | 6): VNode {
    const fieldSettings = this.settingsProvider.wt430navInfoFields;

    return (
      <GNSDataField
        class='map-data-field-field'
        context={this.fieldContext}
        type={fieldSettings.getSetting(`wt430_navinfo_field_${fieldIndex}_type`)}
        ref={this.fields[fieldIndex - 1]}
      />
    );
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class='page nav-info-page hide-element' ref={this.el}>
        <GNSUiControl ref={this.rootControl} isolateScroll>
          <WT430Cdi bus={this.props.bus} fms={this.props.fms} />

          <div class="nav-info-fromto">
            <WaypointLeg ref={this.fromWaypoint} class='arc-map-waypoints-from' isArcMap={true} />
            <LegIcon ref={this.legIcon} />
            <WaypointLeg ref={this.toWaypoint} class='arc-map-waypoints-to' isArcMap={true} />
          </div>

          <div class="nav-info-field-labels">
            <span>{this.renderDataFieldLabel(1)}</span>
            <span>{this.renderDataFieldLabel(2)}</span>
            <span>{this.renderDataFieldLabel(3)}</span>
          </div>

          <div class="nav-info-fields">
            <span>{this.renderDataFieldElement(1)}</span>
            <span>{this.renderDataFieldElement(2)}</span>
            <span>{this.renderDataFieldElement(3)}</span>
            <span>{this.renderDataFieldElement(4)}</span>
            <span>{this.renderDataFieldElement(5)}</span>
            <span>{this.renderDataFieldElement(6)}</span>
          </div>

          <div class="nav-info-field-labels">
            <span>{this.renderDataFieldLabel(4)}</span>
            <span>{this.renderDataFieldLabel(5)}</span>
            <span>{this.renderDataFieldLabel(6)}</span>
          </div>
        </GNSUiControl>
      </div>
    );
  }
}

/**
 * A page menu for the NAV 1 page on the 4330.
 */
class NavInfoPageMenu extends MenuDefinition {
  public onChangeFieldsSelected = (): void => { };

  public onRestoreDefaults = (): void => { };

  /** @inheritdoc */
  public entries: readonly MenuEntry[] = [
    { label: 'Crossfill?', disabled: true, action: (): void => { } },
    { label: 'Change Fields?', disabled: false, action: (): void => this.onChangeFieldsSelected() },
    { label: 'Restore Defaults?', disabled: false, action: (): void => this.onRestoreDefaults() },
  ];

  /** @inheritdoc */
  public updateEntries(): void {
    /** no-op */
  }
}