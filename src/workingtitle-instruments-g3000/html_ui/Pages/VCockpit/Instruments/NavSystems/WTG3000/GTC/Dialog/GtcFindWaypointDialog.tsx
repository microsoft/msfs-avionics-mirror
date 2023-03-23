import { FacilitySearchType, FacilityWaypoint, FSComponent, SetSubject, Subject, VNode } from '@microsoft/msfs-sdk';
import { G3000WaypointSearchType } from '@microsoft/msfs-wtg3000-common';
import { GtcNearestTab } from '../Components/Nearest/GtcNearestTab';
import { TabbedContainer, TabConfiguration } from '../Components/Tabs/TabbedContainer';
import { TabbedContent } from '../Components/Tabs/TabbedContent';
import { GtcView, GtcViewProps } from '../GtcService/GtcView';
import { GtcPositionHeadingDataProvider } from '../Navigation/GtcPositionHeadingDataProvider';
import { GtcDialogResult, GtcDialogView } from './GtcDialogView';

import './GtcFindWaypointDialog.css';

const INITIAL_TAB = 2;

/** {@link GtcFindWaypointDialog} props. */
export interface GtcFindDialogProps extends GtcViewProps {
  /** A provider of airplane position and heading data. */
  posHeadingDataProvider: GtcPositionHeadingDataProvider;
}

/**
 * A GTC dialog which allows the user to find and select a waypoint from a number of different contexts:
 * * Recently selected waypoints (not yet implemented).
 * * Nearest waypoints.
 * * Flight plan waypoints (not yet implemented).
 * * Favorited waypoints (not yet implemented).
 */
export class GtcFindWaypointDialog extends GtcView<GtcFindDialogProps> implements GtcDialogView<FacilitySearchType, FacilityWaypoint> {

  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();
  private readonly nearestTabRef = FSComponent.createRef<GtcNearestTab>();
  private readonly rootCssClass = SetSubject.create(['gtc-find-wpt-dialog']);

  private readonly facilitySearchType = Subject.create<G3000WaypointSearchType>(FacilitySearchType.AllExceptVisual);
  private resolveFunction?: (value: any) => void;
  private resultObject: GtcDialogResult<FacilityWaypoint> = {
    wasCancelled: true,
  };

  private isAlive = true;

  /** @inheritdoc */
  public override onAfterRender(): void {
    this._title.set('Find Waypoint');
  }

  /** @inheritDoc */
  public override onOpen(): void {
    this.tabsRef.instance.selectTab(INITIAL_TAB);
  }

  /** @inheritDoc */
  public override onClose(): void {
    this.cleanupRequest();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.tabsRef.instance.resume();
  }

  /** @inheritdoc */
  public onPause(): void {
    this.tabsRef.instance.pause();
  }

  /** @inheritDoc */
  public request(input: G3000WaypointSearchType): Promise<GtcDialogResult<FacilityWaypoint>> {
    if (!this.isAlive) {
      throw new Error('GtcFindWaypointDialog: cannot request from a dead dialog');
    }

    return new Promise<GtcDialogResult<FacilityWaypoint>>(resolve => {
      this.cleanupRequest();
      this.resolveFunction = resolve;
      this.resultObject = { wasCancelled: true };

      this.facilitySearchType.set(input);
      input === FacilitySearchType.AllExceptVisual && this.nearestTabRef.instance.resetNearestWaypointFilter();
    });
  }

  /**
   * Responds to when a waypoint is selected from this dialog.
   * @param waypoint The selected waypoint.
   */
  private onWaypointSelected(waypoint: FacilityWaypoint): void {
    this.resultObject = {
      wasCancelled: false,
      payload: waypoint,
    };
    this.props.gtcService.goBack();
  }

  /** Clears this dialog's pending request and resolves the pending request Promise if one exists. */
  private cleanupRequest(): void {
    const resolve = this.resolveFunction;
    this.resolveFunction = undefined;
    resolve && resolve(this.resultObject);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <TabbedContainer
          ref={this.tabsRef}
          initiallySelectedTabPosition={INITIAL_TAB}
          configuration={TabConfiguration.Left5}
        >

          <TabbedContent position={1} label='Recent' disabled={true} />

          <TabbedContent
            position={2}
            label='Nearest'
            onPause={() => this.nearestTabRef.instance?.onPause()}
            onResume={() => this.nearestTabRef.instance?.onResume()}
            onDestroy={() => this.nearestTabRef.getOrDefault()?.destroy()}
          >
            <GtcNearestTab
              ref={this.nearestTabRef}
              bus={this.bus}
              activeComponent={this._activeComponent}
              sidebarState={this._sidebarState}
              gtcService={this.props.gtcService}
              controlMode={this.props.controlMode}
              posHeadingDataProvider={this.props.posHeadingDataProvider}
              onSelected={this.onWaypointSelected.bind(this)}
              facilitySearchType={this.facilitySearchType}
            />
          </TabbedContent>

          <TabbedContent position={3} label='Flight<br>Plan' disabled={true} />
          <TabbedContent position={4} label='Favorites' disabled={true} />
          <TabbedContent position={5} label='Search' disabled={true} />

        </TabbedContainer>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.cleanupRequest();

    this.tabsRef.getOrDefault()?.destroy();

    super.destroy();
  }
}