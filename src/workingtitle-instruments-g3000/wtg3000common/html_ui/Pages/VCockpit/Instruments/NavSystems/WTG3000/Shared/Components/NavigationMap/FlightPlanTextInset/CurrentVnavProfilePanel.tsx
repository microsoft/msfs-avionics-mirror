import {
  ComponentProps, DisplayComponent, DurationDisplay, DurationDisplayDelim, DurationDisplayFormat, EventBus, FSComponent,
  NumberFormatter, SetSubject, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { Fms, NumberUnitDisplay, UnitsUserSettings, VNavDataProvider } from '@microsoft/msfs-garminsdk';

import { FlightPlanStore } from '../../../FlightPlan/FlightPlanStore';
import { VnavProfileStore } from '../../../Vnav/VnavProfileStore';
import { AltitudeConstraintDisplay } from '../../Constraints/AltitudeConstraintDisplay';
import { FpaDisplay } from '../../Constraints/FpaDisplay';
import { LegNameDisplay } from '../../Leg/LegNameDisplay';

import './CurrentVnavProfilePanel.css';

/**
 * The properties for the {@link CurrentVnavProfilePanel} component.
 */
export interface CurrentVnavProfilePanelProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The Fms. */
  fms: Fms;
  /** Which flight plan index to handle events for. */
  planIndex: number;
  /** The flight plan store to use. */
  store: FlightPlanStore;
  /** A provider of VNAV data. */
  vnavDataProvider: VNavDataProvider;
}

const VERTICAL_SPEED_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____', useMinusSign: true });
const FPA_FORMATTER = NumberFormatter.create({ precision: 0.01, nanString: '_____', useMinusSign: true });
const ALTITUDE_FORMATTER = NumberFormatter.create({ precision: 1, nanString: '_____', useMinusSign: true });

/**
 * A panel which displays information related to the current VNAV profile.
 */
export class CurrentVnavProfilePanel extends DisplayComponent<CurrentVnavProfilePanelProps> {
  private thisNode?: VNode;

  private readonly activeWaypointCssClass = SetSubject.create(['waypoint-row']);
  private readonly cruiseAltitudeCssClass = SetSubject.create(['waypoint-row']);

  private readonly unitsSettingManager = UnitsUserSettings.getManager(this.props.bus);

  private readonly vnavProfileStore = new VnavProfileStore(this.props.bus, this.props.store, this.props.store.isAdvancedVnav, this.props.vnavDataProvider);

  /** @inheritdoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.vnavProfileStore.showCruiseAltitude.sub(show => {
      this.activeWaypointCssClass.toggle('hidden', show);
      this.cruiseAltitudeCssClass.toggle('hidden', !show);
    }, true);
  }

  /** Resumes the vnav panel. */
  public resume(): void {
    this.vnavProfileStore.resume();
  }

  /** Pauses the vnav panel. */
  public pause(): void {
    this.vnavProfileStore.pause();
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="current-vnav-profile-panel pane-inset-panel">
        <div class="pane-inset-panel-title">Current VNAV Profile</div>
        <div class="sub-title">Active VNAV Waypoint</div>
        <div class={this.activeWaypointCssClass}>
          <div>
            <LegNameDisplay
              leg={this.vnavProfileStore.activeVnavWaypoint}
              nullText="__________"
            />
          </div>
          <AltitudeConstraintDisplay
            altDesc={this.vnavProfileStore.altDesc}
            altitude1={this.vnavProfileStore.altitude1}
            altitude2={this.vnavProfileStore.altitude2}
            displayAltitude1AsFlightLevel={this.vnavProfileStore.displayAltitude1AsFlightLevel}
            displayAltitude2AsFlightLevel={this.vnavProfileStore.displayAltitude2AsFlightLevel}
            isEdited={this.vnavProfileStore.isAltitudeEdited}
          />
        </div>
        <div class={this.cruiseAltitudeCssClass}>
          <div>CRZ ALT</div>
          <NumberUnitDisplay
            value={this.vnavProfileStore.cruiseAltitude}
            displayUnit={UnitType.FOOT}
            formatter={ALTITUDE_FORMATTER}
            class='crz-alt-value'
          />
        </div>
        <div class="data-rows">
          <div class="row tod-bod">
            <div class="label">{this.vnavProfileStore.timeToLabelExtended}</div>
            <DurationDisplay
              class="data"
              value={this.vnavProfileStore.timeToValue}
              options={{
                pad: 2,
                format: DurationDisplayFormat.hh_mm_or_mm_ss,
                delim: DurationDisplayDelim.ColonOrCross,
                nanString: '__:__',
              }}
            />
          </div>
          <div class="row fpa">
            <div class="label">FPA</div>
            <div class="data">
              <FpaDisplay
                fpa={this.vnavProfileStore.fpa}
                showClimb={this.vnavProfileStore.fpaShowClimb}
                formatter={FPA_FORMATTER}
              />
            </div>
          </div>
          <div class="row tgt">
            <div class="label">VS TGT</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.verticalSpeedUnits}
              formatter={VERTICAL_SPEED_FORMATTER}
              value={this.vnavProfileStore.verticalSpeedTarget}
            />
          </div>
          <div class="row req">
            <div class="label">VS REQ</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.verticalSpeedUnits}
              formatter={VERTICAL_SPEED_FORMATTER}
              value={this.vnavProfileStore.verticalSpeedRequired}
            />
          </div>
          <div class="row dev">
            <div class="label">V DEV</div>
            <NumberUnitDisplay
              class="data"
              displayUnit={this.unitsSettingManager.distanceUnitsSmall}
              formatter={ALTITUDE_FORMATTER}
              value={this.vnavProfileStore.verticalDeviation}
            />
          </div>
        </div>
      </div>
    );
  }

  /** Destroys subs and comps. */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    this.vnavProfileStore.destroy();
  }
}