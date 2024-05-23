import {
  AirportFacility, BitFlags, DisplayComponent, FSComponent, FacilitySearchType, FacilityType, ICAO, LegDefinition,
  LegDefinitionFlags, MappedSubject, NodeReference, Subject, SubscribableMapFunctions, Subscription,
  UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { UiImgTouchButton } from '../../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiToggleTouchButton } from '../../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../../Shared/Components/TouchButton/UiTouchButton';
import { UiValueTouchButton } from '../../../../Shared/Components/TouchButton/UiValueTouchButton';
import { FlightPlanStore } from '../../../../Shared/FlightPlan/FlightPlanStore';
import { G3XFms } from '../../../../Shared/FlightPlan/G3XFms';
import { G3XFmsUtils } from '../../../../Shared/FlightPlan/G3XFmsUtils';
import { G3XFplSourceDataProvider } from '../../../../Shared/FlightPlan/G3XFplSourceDataProvider';
import { G3XFplSource } from '../../../../Shared/FlightPlan/G3XFplSourceTypes';
import { G3XTouchFilePaths } from '../../../../Shared/G3XTouchFilePaths';
import { FplDisplayUserSettingTypes } from '../../../../Shared/Settings/FplDisplayUserSettings';
import { AbstractUiView } from '../../../../Shared/UiSystem/AbstractUiView';
import { UiFocusableComponent } from '../../../../Shared/UiSystem/UiFocusTypes';
import { UiInteractionEvent } from '../../../../Shared/UiSystem/UiInteraction';
import { UiViewProps } from '../../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../../Shared/UiSystem/UiViewKeys';
import { UiViewSizeMode, UiViewStackLayer } from '../../../../Shared/UiSystem/UiViewTypes';
import { ApproachDialog } from '../../../Views/ApproachDialog/ApproachDialog';
import { WaypointDialog } from '../../../Views/WaypointDialog/WaypointDialog';

import './MfdFplOptionsPopup.css';

/**
 * Component props for {@link MfdFplOptionsPopup}.
 */
export interface MfdFplOptionsPopupProps extends UiViewProps {
  /** The FMS. */
  fms: G3XFms;

  /** A provider of flight plan source data. */
  fplSourceDataProvider: G3XFplSourceDataProvider;

  /** A store for the active flight plan. */
  flightPlanStore: FlightPlanStore;

  /** A manager for flight plan display user settings. */
  fplDisplaySettingManager: UserSettingManager<FplDisplayUserSettingTypes>;
}

/**
 * An MFD FPL options menu.
 */
export class MfdFplOptionsPopup extends AbstractUiView<MfdFplOptionsPopupProps> {
  private thisNode?: VNode;

  private readonly focusableRefs: NodeReference<UiFocusableComponent & DisplayComponent<any>>[] = [];

  private readonly isInternalFplSource = this.props.fplSourceDataProvider.source.map(source => {
    return source === G3XFplSource.Internal || source === G3XFplSource.InternalRev;
  }).pause();

  private readonly showApproachRow = MappedSubject.create(
    ([isInternalFplSource, loadedApproachData]) => isInternalFplSource && loadedApproachData !== null,
    this.isInternalFplSource,
    this.props.flightPlanStore.loadedVfrApproachData
  ).pause();
  private readonly showLowerRow = this.showApproachRow.map(SubscribableMapFunctions.not());

  private readonly isApproachActivated = this.props.flightPlanStore.vfrApproachActiveStatus.map(status => status !== 'none').pause();
  private readonly isVtfActivated = this.props.flightPlanStore.vfrApproachActiveStatus.map(status => status === 'vtf').pause();

  private readonly isShowMapButtonVisible = Subject.create(false);

  private readonly subscriptions: Subscription[] = [
    this.isInternalFplSource,
    this.showApproachRow,
    this.isApproachActivated,
    this.isVtfActivated
  ];

  private readonly pauseable: Subscription[] = [
    this.isInternalFplSource,
    this.showApproachRow,
    this.isApproachActivated,
    this.isVtfActivated
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    for (const ref of this.focusableRefs) {
      this.focusController.register(ref.instance);
    }

    this.focusController.setActive(true);
    this.focusController.knobLabelState.pipe(this._knobLabelState);
  }

  /** @inheritDoc */
  public onOpen(sizeMode: UiViewSizeMode): void {
    for (const sub of this.pauseable) {
      sub.resume(true);
    }

    this.isShowMapButtonVisible.set(this.props.uiService.gduFormat === '470' || sizeMode === UiViewSizeMode.Half);
  }

  /** @inheritDoc */
  public onClose(): void {
    for (const sub of this.pauseable) {
      sub.pause();
    }

    this.focusController.clearRecentFocus();
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
  public onResize(sizeMode: UiViewSizeMode): void {
    this.isShowMapButtonVisible.set(this.props.uiService.gduFormat === '470' || sizeMode === UiViewSizeMode.Half);
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    if (event === UiInteractionEvent.MenuPress) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.MainMenu, true, {
        popupType: 'slideout-bottom-full',
        backgroundOcclusion: 'hide'
      });
      return true;
    }

    return this.focusController.onUiInteractionEvent(event);
  }

  /**
   * Opens the approach dialog to allow a user to select and load/activate an approach.
   * @param initialAirport The airport to which to initialize the approach dialog.
   * @param initialApproachIndex The index of the approach to which to initialize the approach dialog.
   */
  private async openApproachDialog(initialAirport: AirportFacility | undefined, initialApproachIndex: number | undefined): Promise<void> {
    if (!initialAirport) {
      initialApproachIndex = undefined;

      const airportResult = await this.props.uiService
        .openMfdPopup<WaypointDialog>(UiViewStackLayer.Overlay, UiViewKeys.WaypointDialog, true)
        .ref.request({
          searchType: FacilitySearchType.Airport
        });

      if (!airportResult.wasCancelled) {
        initialAirport = airportResult.payload.facility.get();
      }
    }

    const approachResult = await this.props.uiService
      .openMfdPopup<ApproachDialog>(UiViewStackLayer.Overlay, UiViewKeys.ApproachDialog, true, { popupType: 'slideout-right-full' })
      .ref.request({
        initialAirport,
        initialApproachIndex,
        loadedApproachData: this.props.flightPlanStore.loadedVfrApproachData.get() ?? undefined,
        isLoadedApproachActive: this.props.flightPlanStore.vfrApproachActiveStatus.get() !== 'none',
        disableLoad: !this.props.fms.hasInternalPrimaryFlightPlan() || this.props.fms.getInternalPrimaryFlightPlan().length === 0
      });

    if (!this.isInternalFplSource.get()) {
      return;
    }

    if (!approachResult.wasCancelled) {
      const { airport, approachIndex, action } = approachResult.payload;
      await this.props.fms.loadApproach(airport, approachIndex, action !== 'load', action === 'vtf');
    }
  }

  /**
   * Responds to when this popup's select approach button is pressed.
   */
  private async onSelectApproachButtonPressed(): Promise<void> {
    // If the last waypoint in the flight plan is an airport, set it as the initial airport. Otherwise, the initial
    // airport remains undefined.

    let initialAirport: AirportFacility | undefined = undefined;

    let lastLeg: LegDefinition | null = null;
    if (this.props.fms.hasInternalPrimaryFlightPlan()) {
      lastLeg = this.props.fms.getInternalPrimaryFlightPlan().findLeg(leg => {
        return !BitFlags.isAny(leg.flags, LegDefinitionFlags.DirectTo | LegDefinitionFlags.VectorsToFinal);
      }, true);
    }

    if (lastLeg && ICAO.isFacility(lastLeg.leg.fixIcao, FacilityType.Airport)) {
      try {
        initialAirport = await this.props.fms.facLoader.getFacility(FacilityType.Airport, lastLeg.leg.fixIcao);
      } catch {
        // noop
      }
    }

    await this.openApproachDialog(initialAirport, undefined);
  }

  /**
   * Responds to when this popup's remove approach button is pressed.
   */
  private onRemoveApproachButtonPressed(): void {
    if (!this.isInternalFplSource.get()) {
      return;
    }

    this.props.fms.removeApproach();
    this.props.uiService.goBackMfd();
  }

  /**
   * Responds to when this popup's approach button is pressed.
   */
  private async onApproachButtonPressed(): Promise<void> {
    const approachData = this.props.flightPlanStore.loadedVfrApproachData.get();

    if (approachData) {
      try {
        const airport = await this.props.fms.facLoader.getFacility(FacilityType.Airport, approachData.airportIcao);
        await this.openApproachDialog(airport, approachData.approachIndex);
      } catch {
        // noop
      }
    } else {
      await this.openApproachDialog(undefined, undefined);
    }
  }

  /**
   * Responds to when this popup's vectors button is pressed.
   */
  private onVectorsButtonPressed(): void {
    if (!this.isInternalFplSource.get()) {
      return;
    }

    this.props.fms.activateApproach(!this.isVtfActivated.get());
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-fpl-options-popup ui-view-panel'>
        <div class='mfd-fpl-options-popup-title'>Flight Plan Options</div>

        <div class='mfd-fpl-options-popup-main'>
          <div class='mfd-fpl-options-popup-upper'>
            <div class='mfd-fpl-options-popup-upper-col'>
              <UiImgTouchButton
                ref={this.createFocusableRef(0)}
                isEnabled={false}
                label={'Flight Plan\nList'}
                class='ui-directory-button'
              />
              <UiTouchButton
                ref={this.createFocusableRef(3)}
                isEnabled={false}
                label={'Save Copy'}
              />
            </div>

            <div class='mfd-fpl-options-popup-upper-divider' />

            <div class='mfd-fpl-options-popup-upper-col'>
              <UiImgTouchButton
                ref={this.createFocusableRef(1)}
                isEnabled={false}
                label={'Edit on\nMap'}
                class='ui-directory-button'
              />
              <UiTouchButton
                ref={this.createFocusableRef(4)}
                isEnabled={false}
                label={'Resume\nFlight Plan'}
              />
            </div>

            <div class='mfd-fpl-options-popup-upper-col'>
              <UiImgTouchButton
                ref={this.createFocusableRef(2)}
                isEnabled={false}
                label={'Stop\nNavigation'}
                class='ui-directory-button'
              />
              <UiTouchButton
                ref={this.createFocusableRef(5)}
                isEnabled={false}
                label={'Set OBS\nand Hold'}
              />
            </div>
          </div>

          <div class={{ 'mfd-fpl-options-popup-main-divider': true, 'hidden': this.showApproachRow }} />

          <div class={{ 'mfd-fpl-options-popup-lower': true, 'hidden': this.showApproachRow }}>
            <div class='mfd-fpl-options-popup-lower-col'>
              <UiTouchButton
                ref={this.createFocusableRef(6)}
                isEnabled={this.isInternalFplSource}
                label={'Select\nApproach...'}
                onPressed={this.onSelectApproachButtonPressed.bind(this)}
                canBeFocused={this.showLowerRow}
              />
            </div>

            <div class='mfd-fpl-options-popup-lower-col'>
              <UiTouchButton
                ref={this.createFocusableRef(7)}
                isEnabled={false}
                label={'Invert'}
                canBeFocused={this.showLowerRow}
              />
            </div>

            <div class='mfd-fpl-options-popup-lower-col' />
          </div>

          <div class={{ 'mfd-fpl-options-popup-approach': true, 'ui-view-box': true, 'hidden': this.showLowerRow }}>
            <div class='ui-view-box-title'>Approach</div>

            <div class='mfd-fpl-options-popup-approach-col'>
              <UiTouchButton
                ref={this.createFocusableRef(8)}
                label={'Remove'}
                onPressed={this.onRemoveApproachButtonPressed.bind(this)}
                canBeFocused={this.showApproachRow}
              />
            </div>

            <div class='mfd-fpl-options-popup-approach-col'>
              <UiValueTouchButton
                ref={this.createFocusableRef(9)}
                state={this.props.flightPlanStore.loadedVfrApproachData}
                renderValue={data => {
                  if (data === null) {
                    return '';
                  }

                  return `${ICAO.getIdent(data.airportIcao)}\n${G3XFmsUtils.getVfrApproachName(data.approach)}`;
                }}
                onPressed={this.onApproachButtonPressed.bind(this)}
                canBeFocused={this.showApproachRow}
                class='mfd-fpl-options-popup-approach-button'
              />
            </div>

            <div class='mfd-fpl-options-popup-approach-col'>
              <UiToggleTouchButton
                ref={this.createFocusableRef(10)}
                state={this.isVtfActivated}
                isVisible={this.isApproachActivated}
                label={'Vectors'}
                onPressed={this.onVectorsButtonPressed.bind(this)}
                canBeFocused={this.showApproachRow}
              />
            </div>
          </div>

          <UiToggleTouchButton
            ref={this.createFocusableRef(11)}
            state={this.props.fplDisplaySettingManager.getSetting('fplShowMap')}
            isVisible={this.isShowMapButtonVisible}
            label={'Show Map'}
            class='mfd-fpl-options-popup-show-map-button'
          />
        </div>

        <div class='mfd-fpl-options-popup-main-menu-msg'>
          <img src={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_menu_button.png`} class='mfd-fpl-options-popup-main-menu-icon' /> for Main Menu
        </div>
      </div>
    );
  }

  /**
   * Creates a reference for one of this popup's focusable components.
   * @param index The index to assign the focusable component with the focus controller.
   * @returns A reference for one of this popup's focusable components.
   */
  private createFocusableRef(index: number): NodeReference<UiFocusableComponent & DisplayComponent<any>> {
    const ref = FSComponent.createRef<UiFocusableComponent & DisplayComponent<any>>();
    this.focusableRefs[index] = ref;
    return ref;
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
