import {
  AirportFacility, ApproachUtils, ArraySubject, CompiledMapSystem, DebounceTimer, FSComponent, FacilitySearchType,
  FacilityType, FacilityUtils, FacilityWaypoint, FlightPathCalculator, FlightPlan, ICAO, MapIndexedRangeModule,
  MapSystemBuilder, MappedSubject, NdbFacility, Subject, SubscribableMapFunctions, UserSettingManager, VNode, Vec2Math,
  Vec2Subject, VecNMath, VorFacility
} from '@microsoft/msfs-sdk';

import {
  AirportWaypoint, DynamicListData, FmsUtils, GarminFacilityWaypointCache, GarminMapKeys, GarminVfrApproachProcedure,
  MapFlightPlanFocusModule, MapProcedurePreviewModule, MapRangeController, ProcedureType, VfrApproachListItem
} from '@microsoft/msfs-garminsdk';

import { UiList } from '../../../Shared/Components/List/UiList';
import { G3XProcPreviewMapBuilder } from '../../../Shared/Components/Map/Assembled/G3XProcPreviewMapBuilder';
import { MapConfig } from '../../../Shared/Components/Map/MapConfig';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { UiWaypointDisplay } from '../../../Shared/Components/Waypoint/UiWaypointDisplay';
import { G3XFms } from '../../../Shared/FlightPlan/G3XFms';
import { G3XFmsFplLoadedApproachData } from '../../../Shared/FlightPlan/G3XFmsFplUserDataTypes';
import { G3XFmsUtils } from '../../../Shared/FlightPlan/G3XFmsUtils';
import { G3XSpecialChar } from '../../../Shared/Graphics/Text/G3XSpecialChar';
import { G3XUnitsUserSettings } from '../../../Shared/Settings/G3XUnitsUserSettings';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { MapUserSettings } from '../../../Shared/Settings/MapUserSettings';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiDialogResult, UiDialogView } from '../../../Shared/UiSystem/UiDialogView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { UiListSelectTouchButton } from '../../Components/TouchButton/UiListSelectTouchButton';
import { UiWaypointSelectButton } from '../../Components/TouchButton/UiWaypointSelectButton';
import { UiListDialogParams } from '../../Dialogs/UiListDialog';

import './ApproachDialog.css';

/**
 * A request input for {@link ApproachDialog}.
 */
export type ApproachDialogInput = {
  /** The airport to which to initialize the dialog. */
  initialAirport?: AirportFacility;

  /** The index of the approach to which to initialize the dialog. */
  initialApproachIndex?: number;

  /** Data describing the currently loaded approach. */
  loadedApproachData?: Readonly<G3XFmsFplLoadedApproachData>;

  /**
   * Whether the currently loaded approach is active. Ignored if `loadedApproachData` is `undefined`. Defaults to
   * `false`.
   */
  isLoadedApproachActive?: boolean;

  /** Whether to disable the Load Approach button. Defaults to `false`. */
  disableLoad?: boolean;
};

/**
 * A request result returned by {@link ApproachDialog}.
 */
export type ApproachDialogOutput = {
  /** The parent airport of the selected VFR approach. */
  airport: AirportFacility;

  /** The index of the published approach on which the selected VFR approach is based. */
  approachIndex: number;

  /** The selected VFR approach procedure. */
  approachProcedure: GarminVfrApproachProcedure;

  /** The selected action. */
  action: 'load' | 'activate' | 'vtf';
};

/**
 * Component props for {@link ApproachDialog}.
 */
export interface ApproachDialogProps extends UiViewProps {
  /** The flight path calculator to use to calculate approach previews. */
  flightPathCalculator: FlightPathCalculator;

  /** The FMS. */
  fms: G3XFms;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A configuration object defining options for the dialog's map. */
  mapConfig: MapConfig;
}

/**
 * An item describing a VFR approach procedure used by {@link ApproachDialog}.
 */
type DialogApproachItem = {
  /** The airport to which the approach belongs. */
  airport: AirportFacility;

  /** An item describing the approach. */
  approachItem: VfrApproachListItem;

  /** The name of the approach. */
  name: string;
};

/**
 * A dialog that allows the user to select a VFR approach along with an action to take with the selected approach.
 */
export class ApproachDialog extends AbstractUiView<ApproachDialogProps>
  implements UiDialogView<ApproachDialogInput, ApproachDialogOutput> {

  private static readonly MAP_WAKE_HIDE_DURATION = 250; // milliseconds

  private thisNode?: VNode;

  private readonly airportButtonRef = FSComponent.createRef<UiWaypointSelectButton<FacilitySearchType.Airport, any>>();

  private readonly facWaypointCache = GarminFacilityWaypointCache.getCache(this.props.uiService.bus);

  private readonly isMainVisible = Subject.create(false);
  private readonly isMainHidden = this.isMainVisible.map(SubscribableMapFunctions.not());

  private loadedApproachData: Readonly<G3XFmsFplLoadedApproachData> | undefined = undefined;
  private isLoadedApproachActive = false;

  private readonly selectedAirport = Subject.create<AirportWaypoint | null>(null);
  private readonly selectedAirportApproaches: DialogApproachItem[] = [];

  private readonly selectedApproach = Subject.create<DialogApproachItem | null>(null);
  private readonly isApproachSelected = this.selectedApproach.map(approach => approach !== null);
  private readonly isSelectedApproachButtonEnabled = Subject.create(false);

  private readonly waypointArray = ArraySubject.create<FacilityWaypoint & DynamicListData>([]);
  private readonly waypointListHidden = Subject.create(true);
  // TODO: support GDU470 (portrait)
  private readonly waypointListItemLengthPx = Subject.create(34);
  private readonly waypointListItemsPerPage = Subject.create(5);

  private readonly navaidBoxHidden = Subject.create(true);
  private readonly navaidIdentText = Subject.create('');
  private readonly navaidFreqText = Subject.create('');

  // TODO: support GDU470 (portrait)
  private readonly mapSize = Vec2Subject.create(Vec2Math.create(242, 202));

  private readonly compiledMap = MapSystemBuilder.create(this.props.uiService.bus)
    .with(G3XProcPreviewMapBuilder.build, {
      gduFormat: this.props.uiService.gduFormat,

      facilityLoader: this.props.fms.facLoader,

      bingId: `g3x-${this.props.uiService.instrumentIndex}-map-3`,

      dataUpdateFreq: 30,

      gduIndex: this.props.uiService.instrumentIndex,
      gduSettingManager: this.props.gduSettingManager,

      projectedRange: this.props.uiService.gduFormat === '460' ? 60 : 30,

      airplaneIconSrc: this.props.mapConfig.ownAirplaneIconSrc,

      // TODO: support GDU470 (portrait)
      nominalFocusMargins: VecNMath.create(4, 20, 20, 20, 20),

      settingManager: MapUserSettings.getStandardManager(this.props.uiService.bus),
      unitsSettingManager: G3XUnitsUserSettings.getManager(this.props.uiService.bus)
    })
    .withProjectedSize(this.mapSize)
    .build('common-map approach-dialog-map') as CompiledMapSystem<
      {
        /** The range module. */
        [GarminMapKeys.Range]: MapIndexedRangeModule;

        /** The procedure preview module. */
        [GarminMapKeys.ProcedurePreview]: MapProcedurePreviewModule;

        /** The flight plan focus module. */
        [GarminMapKeys.FlightPlanFocus]: MapFlightPlanFocusModule;
      },
      any,
      {
        /** The range controller. */
        [GarminMapKeys.Range]: MapRangeController;
      },
      any
    >;

  private readonly mapProcPreviewModule = this.compiledMap.context.model.getModule(GarminMapKeys.ProcedurePreview);
  private readonly mapFlightPlanFocusModule = this.compiledMap.context.model.getModule(GarminMapKeys.FlightPlanFocus);

  private isMapVisible = false;
  private readonly mapBoxHidden = Subject.create(true);

  private readonly mapContainerHiddenDebounce = new DebounceTimer();
  private readonly mapContainerHidden = Subject.create(false);
  private readonly showMapContainerFunc = this.mapContainerHidden.set.bind(this.mapContainerHidden, false);

  private readonly disableLoad = Subject.create(false);
  private readonly isLoadButtonEnabled = MappedSubject.create(
    ([isApproachSelected, disableLoad]) => isApproachSelected && !disableLoad,
    this.isApproachSelected,
    this.disableLoad
  );

  private resolveFunction?: (value: any) => void;
  private resultObject: UiDialogResult<ApproachDialogOutput> = {
    wasCancelled: true,
  };

  private isAlive = true;
  private isOpen = false;

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.compiledMap.ref.instance.sleep();
    this.mapProcPreviewModule.procedureType.set(ProcedureType.APPROACH);

    this.focusController.knobLabelState.pipe(this._knobLabelState);
    this.focusController.setActive(true);

    this.selectedAirport.sub(this.onSelectedAirportChanged.bind(this), true);
    this.selectedApproach.sub(this.onSelectedApproachChanged.bind(this), true);
    this.isMainVisible.sub(this.onMainVisibleChanged.bind(this), true);
  }

  /**
   * Responds to when this dialog's selected airport changes.
   * @param airport The new selected airport.
   */
  private onSelectedAirportChanged(airport: AirportWaypoint | null): void {
    this.focusController.removeFocus();
    this.focusController.clearRecentFocus();

    if (airport === null) {
      this.isMainVisible.set(false);
      this.selectedAirportApproaches.length = 0;
      this.selectedApproach.set(null);
      this.isSelectedApproachButtonEnabled.set(false);
    } else {
      const airportFacility = airport.facility.get();

      const approachListItems = FmsUtils.getVfrApproaches(airportFacility)
        .sort(G3XFmsUtils.sortVfrApproachItem);

      this.selectedAirportApproaches.length = 0;

      if (approachListItems.length > 0) {
        for (const approachItem of approachListItems) {
          this.selectedAirportApproaches.push({
            airport: airportFacility,
            approachItem,
            name: G3XFmsUtils.getVfrApproachName(approachItem.approach)
          });
        }

        this.selectedApproach.set(this.selectedAirportApproaches[0]);
        this.isSelectedApproachButtonEnabled.set(true);
      } else {
        this.selectedApproach.set(null);
        this.isSelectedApproachButtonEnabled.set(false);
      }

      this.isMainVisible.set(true);
    }
  }

  private approachPreviewOpId = 0;

  /**
   * Responds to when this dialog's selected approach changes.
   * @param dialogItem The item describing the selected approach.
   */
  private async onSelectedApproachChanged(dialogItem: DialogApproachItem | null): Promise<void> {
    const opId = ++this.approachPreviewOpId;

    if (dialogItem === null) {
      this.updateMapVisibility();
      this.waypointListHidden.set(true);
      this.waypointArray.clear();
      this.setNavaid(null);
      this.setMapPreviewPlan(null);
      return;
    }

    const [previewPlan, waypointArray, referenceFacility] = await Promise.all([
      this.props.fms.buildApproachPreviewPlan(
        this.props.flightPathCalculator,
        dialogItem.airport,
        dialogItem.approachItem.index,
        false
      ).catch(() => null),

      this.buildWaypointArray(dialogItem.approachItem.approach),

      ApproachUtils.getReferenceFacility(
        dialogItem.airport.approaches[dialogItem.approachItem.index], this.props.fms.facLoader
      ).catch(() => undefined)
    ]);

    if (opId !== this.approachPreviewOpId) {
      return;
    }

    this.waypointArray.set(waypointArray);
    this.waypointListHidden.set(false);
    this.setNavaid(referenceFacility ?? null);
    this.setMapPreviewPlan(previewPlan);

    this.updateMapVisibility();
  }

  /**
   * Responds to when whether the visibility of the main content area of this dialog changes.
   */
  private onMainVisibleChanged(): void {
    this.focusController.removeFocus();
    this.focusController.clearRecentFocus();

    this.updateMapVisibility();
  }

  /**
   * Updates the visibility of this dialog's map.
   */
  private updateMapVisibility(): void {
    const isVisible = this.isOpen && this.isMainVisible.get() && this.selectedApproach.get() !== null;

    if (this.isMapVisible === isVisible) {
      return;
    }

    this.isMapVisible = isVisible;

    if (isVisible) {
      this.compiledMap.ref.instance.wake();
      this.mapBoxHidden.set(false);

      // Hide the map for a short period after waking so that users don't see any artifacts from the Bing map texture.
      this.mapContainerHidden.set(true);
      this.mapContainerHiddenDebounce.schedule(this.showMapContainerFunc, ApproachDialog.MAP_WAKE_HIDE_DURATION);
    } else {
      this.compiledMap.ref.instance.sleep();
      this.mapBoxHidden.set(true);
      this.mapContainerHiddenDebounce.clear();
      this.mapContainerHidden.set(true);
    }
  }

  /**
   * Builds an array containing the waypoints fixes for a given VFR approach procedure.
   * @param approach The approach procedure for which to build a waypoint array.
   * @returns A Promise which will be fulfilled with an array containing the waypoint fixes for the specified VFR
   * approach procedure.
   */
  private async buildWaypointArray(approach: GarminVfrApproachProcedure): Promise<FacilityWaypoint[]> {
    const array = await Promise.all(approach.finalLegs.map(leg => {
      return new Promise<FacilityWaypoint | undefined>(resolve => {
        this.props.fms.facLoader.getFacility(ICAO.getFacilityType(leg.fixIcao), leg.fixIcao)
          .then(facility => {
            resolve(this.facWaypointCache.get(facility));
          })
          .catch(() => {
            resolve(undefined);
          });
      });
    }));

    return array.filter(element => element !== undefined) as FacilityWaypoint[];
  }

  /**
   * Sets this dialog's displayed navaid facility.
   * @param facility The navaid facility to display.
   */
  private setNavaid(facility: VorFacility | NdbFacility | null): void {
    if (facility) {
      this.navaidIdentText.set(ICAO.getIdent(facility.icao));
      if (FacilityUtils.isFacilityType(facility, FacilityType.NDB)) {
        this.navaidFreqText.set(`${facility.freqMHz.toFixed(1)}${G3XSpecialChar.Kilohertz}`);
      } else {
        this.navaidFreqText.set(`${facility.freqMHz.toFixed(2)}${G3XSpecialChar.Megahertz}`);
      }
      this.navaidBoxHidden.set(false);
      this.waypointListItemsPerPage.set(2);
    } else {
      this.navaidBoxHidden.set(true);
      this.navaidIdentText.set('');
      this.navaidFreqText.set('');
      this.waypointListItemsPerPage.set(5);
    }
  }

  /**
   * Sets the procedure preview plan to display on this dialog's map.
   * @param plan The plan to display.
   */
  private setMapPreviewPlan(plan: FlightPlan | null): void {
    if (plan) {
      this.mapProcPreviewModule.procedurePlan.set(plan);
      this.mapFlightPlanFocusModule.focus.set([...plan.legs()]);
    } else {
      this.mapProcPreviewModule.procedurePlan.set(null);
      this.mapFlightPlanFocusModule.focus.set(null);
    }
  }

  /** @inheritDoc */
  public request(input: ApproachDialogInput): Promise<UiDialogResult<ApproachDialogOutput>> {
    if (!this.isAlive) {
      throw new Error('ApproachDialog: cannot request from a dead dialog');
    }

    return new Promise<UiDialogResult<ApproachDialogOutput>>(resolve => {
      this.closeRequest();

      this.resolveFunction = resolve;
      this.resultObject = {
        wasCancelled: true,
      };

      this.loadedApproachData = input.loadedApproachData;
      this.isLoadedApproachActive = input.isLoadedApproachActive ?? false;

      if (input.initialAirport) {
        this.selectedAirport.set(input.initialAirport ? this.facWaypointCache.get(input.initialAirport) as AirportWaypoint : null);

        if (input.initialApproachIndex !== undefined) {
          const initialApproach = this.selectedAirportApproaches.find(item => item.approachItem.index === input.initialApproachIndex);
          if (initialApproach) {
            this.selectedApproach.set(initialApproach);
          }
        }
      }

      this.disableLoad.set(input.disableLoad ?? false);
    });
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isOpen = true;

    this.updateMapVisibility();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isOpen = false;

    this.focusController.clearRecentFocus();

    this.updateMapVisibility();

    this.closeRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.focusRecent();
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUpdate(time: number): void {
    this.compiledMap.ref.instance.update(time);
  }

  /** @inheritdoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Resolves this dialog's pending request Promise if one exists.
   */
  private closeRequest(): void {
    if (!this.resolveFunction) {
      return;
    }

    this.loadedApproachData = undefined;
    this.selectedAirport.set(null);
    this.disableLoad.set(false);

    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /**
   * Responds to when this dialog's empty airport button is pressed.
   */
  private onEmptyAirportButtonPressed(): void {
    this.airportButtonRef.instance.simulatePressed();
  }

  /**
   * Responds to when one of this dialog's action buttons is pressed.
   * @param action The action associated with the button that was pressed.
   */
  private onActionButtonPressed(action: 'load' | 'activate' | 'vtf'): void {
    const selectedApproach = this.selectedApproach.get();
    if (!selectedApproach) {
      return;
    }

    this.resultObject = {
      wasCancelled: false,
      payload: {
        airport: selectedApproach.airport,
        approachIndex: selectedApproach.approachItem.index,
        approachProcedure: selectedApproach.approachItem.approach,
        action
      }
    };

    this.props.uiService.goBackMfd();
  }

  /**
   * Gets approach list dialog parameters for this dialog's currently selected airport.
   * @returns Approach list dialog parameters for this dialog's currently selected airport.
   */
  private getApproachSelectListParams(): UiListDialogParams<DialogApproachItem | null> {
    // TODO: support GDU470 (portrait)
    return {
      listItemHeightPx: 80,
      listItemSpacingPx: 2,
      itemsPerPage: Math.min(7, this.selectedAirportApproaches.length),
      autoDisableOverscroll: true,
      inputData: this.selectedAirportApproaches.map(item => {
        return {
          value: item,
          labelRenderer: this.renderApproachName.bind(this, item)
        };
      }),
      selectedValue: this.selectedApproach.get(),
      class: 'approach-dialog-approach-select-dialog'
    };
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='approach-dialog ui-view-panel'>
        <div class='approach-dialog-title'>Select Approach</div>
        <div class={{ 'approach-dialog-main': true, 'hidden': this.isMainHidden }}>
          <div class='approach-dialog-main-top-row'>
            <UiWaypointSelectButton
              ref={this.airportButtonRef}
              uiService={this.props.uiService}
              waypointCache={GarminFacilityWaypointCache.getCache(this.props.uiService.bus)}
              type={FacilitySearchType.Airport}
              waypoint={this.selectedAirport}
              hideRightInfo
              focusController={this.focusController}
              canBeFocused={this.isMainVisible}
              class='approach-dialog-airport-button'
            />
          </div>
          <div class='approach-dialog-main-divider' />
          <UiListSelectTouchButton
            uiService={this.props.uiService}
            listDialogLayer={UiViewStackLayer.Overlay}
            listDialogKey={UiViewKeys.ListDialog1}
            openDialogAsPositioned
            containerRef={this.props.containerRef}
            isEnabled={this.isSelectedApproachButtonEnabled}
            state={this.selectedApproach}
            renderValue={item => item ? this.renderApproachName(item) : 'None'}
            listParams={this.getApproachSelectListParams.bind(this)}
            focusController={this.focusController}
            canBeFocused={this.isMainVisible}
            class='approach-dialog-approach-button'
          />
          <div class='approach-dialog-main-preview-container'>
            <div class='approach-dialog-preview-left'>
              <div class={{ 'approach-dialog-preview-waypoints-box': true, 'ui-view-box': true, 'hidden': this.waypointListHidden }}>
                <div class='ui-view-box-title'>Waypoints</div>
                <UiList
                  bus={this.props.uiService.bus}
                  data={this.waypointArray}
                  renderItem={this.renderWaypointListItem.bind(this)}
                  listItemLengthPx={this.waypointListItemLengthPx}
                  listItemSpacingPx={0}
                  itemsPerPage={this.waypointListItemsPerPage}
                  autoDisableOverscroll
                  class='approach-dialog-preview-waypoints-list'
                />
              </div>
              <div class={{ 'approach-dialog-preview-navaid-box': true, 'ui-view-box': true, 'hidden': this.navaidBoxHidden }}>
                <div class='ui-view-box-title'>Navaid</div>
                <div class='approach-dialog-preview-navaid-ident'>{this.navaidIdentText}</div>
                <div class='approach-dialog-preview-navaid-freq'>{this.navaidFreqText}</div>
              </div>
            </div>
            <div class={{ 'approach-dialog-map-box': true, 'hidden': this.mapBoxHidden }}>
              <div class={{ 'approach-dialog-map-container': true, 'visibility-hidden': this.mapContainerHidden }}>
                {this.compiledMap.map}
                <div class='ui-layered-darken' />
              </div>
            </div>
          </div>
          <div class='approach-dialog-main-bottom-row'>
            <UiTouchButton
              isEnabled={this.isLoadButtonEnabled}
              label={'Load\nApproach'}
              onPressed={this.onActionButtonPressed.bind(this, 'load')}
              focusController={this.focusController}
              canBeFocused={this.isMainVisible}
              class='approach-dialog-load-button'
            />
            <UiTouchButton
              isEnabled={this.isApproachSelected}
              label={'Activate\nApproach'}
              onPressed={this.onActionButtonPressed.bind(this, 'activate')}
              focusController={this.focusController}
              canBeFocused={this.isMainVisible}
              class='approach-dialog-activate-button'
            />
            <UiTouchButton
              isEnabled={this.isApproachSelected}
              label={'Activate\nVectors-to-Final'}
              onPressed={this.onActionButtonPressed.bind(this, 'vtf')}
              focusController={this.focusController}
              canBeFocused={this.isMainVisible}
              class='approach-dialog-vtf-button'
            />
          </div>
        </div>
        <div class={{ 'approach-dialog-empty-airport': true, 'hidden': this.isMainVisible }}>
          <UiTouchButton
            label='Select an Airport'
            onPressed={this.onEmptyAirportButtonPressed.bind(this)}
            focusController={this.focusController}
            canBeFocused={this.isMainHidden}
            class='approach-dialog-empty-airport-button'
          />
        </div>
      </div>
    );
  }

  /**
   * Renders the name of an approach.
   * @param item An item describing the approach for which to render a name.
   * @returns The name of the specified approach.
   */
  private renderApproachName(item: DialogApproachItem): string {
    const isLoaded = this.loadedApproachData
      && this.loadedApproachData.airportIcao === item.airport.icao
      && this.loadedApproachData.approachIndex === item.approachItem.index;

    return isLoaded ? `${item.name} (${this.isLoadedApproachActive ? 'Active' : 'Loaded'})` : item.name;
  }

  /**
   * Renders a preview list item for a waypoint.
   * @param waypoint The waypoint for which to render an item.
   * @returns A preview list item for the specified waypoint, as a VNode.
   */
  private renderWaypointListItem(waypoint: FacilityWaypoint): VNode {
    return (
      <div class='approach-dialog-preview-waypoints-list-item'>
        <UiWaypointDisplay
          waypoint={waypoint}
          hideRightInfo
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.isAlive = false;

    this.closeRequest();

    this.mapContainerHiddenDebounce.clear();

    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    super.destroy();
  }
}
