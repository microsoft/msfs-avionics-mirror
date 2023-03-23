import {
  ClockEvents, ComponentProps, ConsumerSubject, DateTimeFormatter, DisplayComponent, EventBus, FSComponent, HEvent,
  SetSubject, Subscribable, SubscribableUtils, Subscription, UnitType, VNode
} from '@microsoft/msfs-sdk';
import { G3000FilePaths, G3000Version } from '@microsoft/msfs-wtg3000-common';
import { StartupScreenPrebuiltRow, StartupScreenRowDefinition, StartupScreenRowFactory } from './StartupScreenRow';

import './StartupScreen.css';

/**
 * Component props for StartupScreen.
 */
export interface StartupScreenProps extends ComponentProps {
  /** The text to display for the airplane name. */
  airplaneName: string;

  /** The path to the airplane logo image asset, or `undefined` if there is no airplane logo to display. */
  airplaneLogoFilePath?: string;

  /** An instance of the event bus. */
  bus: EventBus;

  /**
   * An array of data rows to render on the right side of the screen. Each row is defined by either a function which
   * returns an object describing the row to render, or a pre-built row key. Up to eleven rows can be rendered. The
   * rows will be rendered from top to bottom in the order in which they appear in the array. If not defined, a default
   * set of rows will be rendered.
   */
  rows?: readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[];

  /** The H event fired when the user presses the confirmation softkey. */
  confirmationSoftkeyEvent: string;

  /** A callback function which is executed each time the user confirms the startup screen. */
  onConfirmation?: () => void;
}

/**
 * A G3000 MFD startup screen.
 */
export class StartupScreen extends DisplayComponent<StartupScreenProps> {

  private static readonly NAV_DATA_REGEX = /^([A-Z]+)(\d\d?)([A-Z]+)(\d\d?)\/(\d\d)$/;

  private static EXPIRATION_DATE_FORMATTER = DateTimeFormatter.create('Expires {d}-{MON}-{YYYY}', { nanString: 'Unknown' });

  private static readonly DEFAULT_ROWS = [
    StartupScreenPrebuiltRow.System,
    StartupScreenPrebuiltRow.Navigation
  ];

  private readonly rootCssClass = SetSubject.create(['startup-screen', 'hidden']);

  private readonly simTime = ConsumerSubject.create(null, 0).pause();

  private readonly rowDestructors: (() => void)[] = [];

  private isAlive = true;
  private _isAwake = false;

  private hEventSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const sub = this.props.bus.getSubscriber<ClockEvents & HEvent>();

    this.simTime.setConsumer(sub.on('simTime').withPrecision(-3));

    this.hEventSub = sub.on('hEvent').handle(hEvent => {
      if (hEvent === this.props.confirmationSoftkeyEvent) {
        this.props.onConfirmation && this.props.onConfirmation();
      }
    }, !this._isAwake);
  }

  /**
   * Checks whether this screen is awake.
   * @returns Whether this screen is awake.
   */
  public isAwake(): boolean {
    return this._isAwake;
  }

  /**
   * Wakes this screen. Once awake, this screen will be visible and will respond to confirmation softkey interaction
   * events.
   * @throws Error if this screen has been destroyed.
   */
  public wake(): void {
    if (!this.isAlive) {
      throw new Error('StartupScreen: cannot wake a dead screen');
    }

    if (this._isAwake) {
      return;
    }

    this._isAwake = true;

    this.rootCssClass.delete('hidden');

    this.simTime.resume();
    this.hEventSub?.resume();
  }

  /**
   * Puts this screen to sleep. Once asleep, this screen will be hidden and will not respond to softkey interaction
   * events.
   * @throws Error if this screen has been destroyed.
   */
  public sleep(): void {
    if (!this.isAlive) {
      throw new Error('StartupScreen: cannot sleep a dead screen');
    }

    if (!this._isAwake) {
      return;
    }

    this._isAwake = false;

    this.simTime.pause();
    this.hEventSub?.pause();

    this.rootCssClass.add('hidden');
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass}>
        <div class='startup-screen-airplane-logo-container'>
          {this.props.airplaneLogoFilePath && (
            <img src={this.props.airplaneLogoFilePath} class='startup-screen-airplane-logo startup-screen-airplane-logo-specific' />
          )}
        </div>
        <img src={`${G3000FilePaths.ASSETS_PATH}/Images/Common/garmin_logo.png`} class='startup-screen-garmin-logo startup-screen-garmin-logo-specific' />
        <div class='startup-screen-right'>
          {this.renderRows(this.props.rows ?? StartupScreen.DEFAULT_ROWS)}
        </div>
        <div class='startup-screen-confirm-text'>
          Press rightmost softkey to continue
        </div>
      </div>
    );
  }

  /**
   * Renders this startup screen's data rows.
   * @param rows An array of factories and pre-built row keys defining the rows to render. The rows will be rendered
   * in the order in which they appear in the array.
   * @returns This startup screen's data rows, as a VNode.
   */
  private renderRows(rows: readonly (StartupScreenRowFactory | StartupScreenPrebuiltRow)[]): VNode {
    return (
      <>
        {
          rows.map<StartupScreenRowFactory | undefined>(row => typeof row === 'string' ? this.getPrebuiltRowFactory(row) : row)
            .filter<StartupScreenRowFactory>((factory => !!factory) as (factory: StartupScreenRowFactory | undefined) => factory is StartupScreenRowFactory)
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
  private getPrebuiltRowFactory(key: StartupScreenPrebuiltRow): StartupScreenRowFactory | undefined {
    switch (key) {
      case StartupScreenPrebuiltRow.System:
        return () => {
          return {
            iconFilePath: `${G3000FilePaths.ASSETS_PATH}/Images/Startup/icon_startup_system.png`,
            title: this.props.airplaneName,
            value: `System ${G3000Version.VERSION}`
          };
        };

      case StartupScreenPrebuiltRow.Navigation:
        return (simTime) => {
          const expirationDate = StartupScreen.getNavDataExpirationDate();
          const value = StartupScreen.EXPIRATION_DATE_FORMATTER(expirationDate);
          const caution = simTime.map(time => isNaN(expirationDate) || expirationDate <= time);

          return {
            iconFilePath: `${G3000FilePaths.ASSETS_PATH}/Images/Startup/icon_startup_nav_db.png`,
            title: 'Navigation Data:',
            value,
            caution
          };
        };

      default:
        return undefined;
    }
  }

  /**
   * Renders a data row.
   * @param def An object describing the row to render.
   * @returns A data row, as a VNode.
   */
  private renderRow(def: Readonly<StartupScreenRowDefinition>): VNode {
    let cssClass: string | Subscribable<string>;
    if (SubscribableUtils.isSubscribable(def.caution)) {
      cssClass = def.caution.map(v => `startup-screen-right-row ${v ? 'startup-screen-right-row-caution' : ''}`);
    } else {
      cssClass = `startup-screen-right-row ${def.caution ? 'startup-screen-right-row-caution' : ''}`;
    }

    return (
      <div class={cssClass}>
        <svg width='23' height='9' viewBox='0 0 23 9' class='startup-screen-right-row-line'>
          <path d='M 1 0 l 0 8 l 22 0' stroke='gray' stroke-width='2px' />
        </svg>
        <img src={def.iconFilePath} class='startup-screen-right-row-icon' />
        <div class='startup-screen-right-row-title'>{def.title}</div>
        <div class='startup-screen-right-row-value'>{def.value}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.isAlive = false;

    this.simTime.destroy();

    this.hEventSub?.destroy();

    this.rowDestructors.forEach(fn => { fn(); });

    super.destroy();
  }

  /**
   * Gets the expiration date of the current navigation data, as a UNIX timestamp in milliseconds.
   * @returns The expiration date of the current navigation data, as a UNIX timestamp in milliseconds, or `NaN` if the
   * date could not be determined.
   */
  private static getNavDataExpirationDate(): number {
    const match = (SimVar.GetGameVarValue('FLIGHT_NAVDATA_DATE_RANGE', 'string') as string).match(StartupScreen.NAV_DATA_REGEX);
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