import {
  ClockEvents, ConsumerSubject, DateTimeFormatter, FSComponent, SubscribableMapFunctions, SubscribableUtils,
  Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';

import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiInteractionEvent } from '../../../Shared/UiSystem/UiInteraction';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { StartupViewPrebuiltRow, StartupViewRowDefinition, StartupViewRowFactory } from './StartupViewRow';

import './StartupView.css';

/**
 * Component props for {@link StartupView}.
 */
export interface StartupViewProps extends UiViewProps {
  /**
   * An array of database rows to render in the view. Each row is defined by either a function which returns an object
   * describing the row to render, or a pre-built row key. The rows will be rendered from top to bottom in the order in
   * which they appear in the array. If not defined, a default set of rows will be rendered.
   */
  rows?: readonly (StartupViewRowFactory | StartupViewPrebuiltRow)[];
}

/**
 * A startup view.
 */
export class StartupView extends AbstractUiView<StartupViewProps> {
  private static readonly NAV_DATA_REGEX = /^([A-Z]+)(\d\d?)([A-Z]+)(\d\d?)\/(\d\d)$/;

  private static EXPIRATION_DATE_FORMATTER = DateTimeFormatter.create('Expires {d}-{MON}-{YYYY}', { nanString: 'Unknown' });

  private static readonly DEFAULT_ROWS = [
    StartupViewPrebuiltRow.Navigation,
    StartupViewPrebuiltRow.Terrain,
  ];

  private thisNode?: VNode;

  private readonly simTime = ConsumerSubject.create(null, 0).pause();

  private readonly rowDestructors: (() => void)[] = [];

  private readonly subscriptions: Subscription[] = [
    this.simTime
  ];

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;

    this.focusController.setActive(true);

    this._knobLabelState.set([
      [UiKnobId.SingleInner, 'Continue'],
      [UiKnobId.SingleOuter, 'Continue'],
      [UiKnobId.LeftInner, 'Continue'],
      [UiKnobId.LeftOuter, 'Continue'],
      [UiKnobId.RightInner, 'Continue'],
      [UiKnobId.RightOuter, 'Continue']
    ]);

    this.simTime.setConsumer(this.props.uiService.bus.getSubscriber<ClockEvents>().on('simTime').withPrecision(-3));
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.simTime.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.simTime.pause();
  }

  /** @inheritDoc */
  public onResume(): void {
    this.focusController.setFocusIndex(0);
  }

  /** @inheritDoc */
  public onPause(): void {
    this.focusController.removeFocus();
  }

  /** @inheritDoc */
  public onUiInteractionEvent(event: UiInteractionEvent): boolean {
    this.focusController.onUiInteractionEvent(event);
    return true;
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='startup-view'>
        <div class='startup-view-main ui-view-panel'>
          <div class='startup-view-databases'>
            <div class='startup-view-databases-title'>Databases</div>
            <div class='startup-view-databases-row-container'>
              {this.renderRows(this.props.rows ?? StartupView.DEFAULT_ROWS)}
            </div>
          </div>
          <div class='startup-view-main-divider' />
          <div class='startup-view-weather-notice'>
            CAUTION - ADVISORY ONLY
            <br /><br />
            Data link weather information is subject to service interruptions, may contain errors or inaccuracies, and should not be relied upon exclusively.
            You are urged to check alternate weather information sources prior to making safety related decisions.
            <br /><br />
            You acknowledge and agree that you shall be solely responsible for use of weather information and all decisions taken with respect thereto.
          </div>
          <div class='startup-view-main-divider' />
          <div class='startup-view-map-notice'>
            All map and terrain data provided is only to be used as a general reference to your surrounding and as an aid to situational awareness.
          </div>
        </div>
        <UiTouchButton
          label='Continue'
          onPressed={() => { this.props.uiService.exitStartupPhase(); }}
          focusController={this.focusController}
          class='startup-view-continue'
        />
      </div>
    );
  }

  /**
   * Renders this view's database rows.
   * @param rows An array of factories and pre-built row keys defining the rows to render. The rows will be rendered
   * in the order in which they appear in the array.
   * @returns This view's database rows, as a VNode.
   */
  private renderRows(rows: readonly (StartupViewRowFactory | StartupViewPrebuiltRow)[]): VNode {
    return (
      <>
        {
          rows.map<StartupViewRowFactory | undefined>(row => typeof row === 'string' ? this.getPrebuiltRowFactory(row) : row)
            .filter<StartupViewRowFactory>((factory => !!factory) as (factory: StartupViewRowFactory | undefined) => factory is StartupViewRowFactory)
            .map(factory => {
              const def = factory(this.simTime);
              def.onDestroy && this.rowDestructors.push(def.onDestroy);
              return this.renderRow(def);
            })
        }
      </>
    );
  }

  /**
   * Gets a row factory for a pre-built row key.
   * @param key The key of the pre-built row.
   * @returns A row factory for the specified pre-built key, or `undefined` if the key is not valid.
   */
  private getPrebuiltRowFactory(key: StartupViewPrebuiltRow): StartupViewRowFactory | undefined {
    switch (key) {
      case StartupViewPrebuiltRow.Navigation:
        return (simTime) => {
          const expirationDate = StartupView.getNavDataExpirationDate();
          const value = StartupView.EXPIRATION_DATE_FORMATTER(expirationDate);
          const caution = simTime.map(time => isNaN(expirationDate) || expirationDate <= time);

          return {
            iconFilePath: `${G3XTouchFilePaths.ASSETS_PATH}/Images/Startup/icon_startup_nav_db.png`,
            title: 'Navigation Data',
            value,
            caution
          };
        };

      case StartupViewPrebuiltRow.Terrain:
        return () => {
          return {
            iconFilePath: `${G3XTouchFilePaths.ASSETS_PATH}/Images/Startup/icon_startup_terrain_db.png`,
            title: 'Worldwide Terrain'
          };
        };

      default:
        return undefined;
    }
  }

  /**
   * Renders a database row.
   * @param def An object describing the row to render.
   * @returns A database row, as a VNode.
   */
  private renderRow(def: Readonly<StartupViewRowDefinition>): VNode {
    const caution = SubscribableUtils.isSubscribable(def.caution) ? def.caution.map(SubscribableMapFunctions.identity()) : def.caution ?? false;
    if (SubscribableUtils.isSubscribable(caution)) {
      this.subscriptions.push(caution);
    }

    return (
      <div
        class={{
          'startup-view-databases-row': true,
          'startup-view-databases-row-caution': caution
        }}
      >
        <img src={def.iconFilePath} class='startup-view-databases-row-icon' />
        <div class='startup-view-databases-row-text'>
          <div class='startup-view-databases-row-title'>{def.title}</div>
          <div class='startup-view-databases-row-value'>{def.value ?? ''}</div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.thisNode && FSComponent.shallowDestroy(this.thisNode);

    for (const destructor of this.rowDestructors) {
      destructor();
    }

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }

  /**
   * Gets the expiration date of the current navigation data, as a Javascript timestamp.
   * @returns The expiration date of the current navigation data, as a Javascript timestamp, or `NaN` if the date could
   * not be determined.
   */
  private static getNavDataExpirationDate(): number {
    const match = (SimVar.GetGameVarValue('FLIGHT_NAVDATA_DATE_RANGE', 'string') as string).match(StartupView.NAV_DATA_REGEX);
    if (match === null) {
      return NaN;
    }

    const [, , , endMonth, endDay, year] = match;

    // The year in the nav data date string is the end year.
    const end = new Date(`${endMonth}-${endDay}-${year}`);

    // The game var presents the last day the current AIRAC cycle is effective, so the expiration date is exactly one day later.
    return end.getTime() + UnitType.HOUR.convertTo(24, UnitType.MILLISECOND);
  }
}