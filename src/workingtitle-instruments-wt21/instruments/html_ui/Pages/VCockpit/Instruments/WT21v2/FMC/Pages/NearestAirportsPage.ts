import {
  AbstractFmcPage, AirportFacility, DisplayField, FmcListUtility, FmcRenderTemplate, FmcRenderTemplateRow, Formatter, ICAO, OneWayRunway, RawFormatter, UnitType
} from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../WT21FmcPage';
import { NearestAirportsPageController } from './NearestAirportsPageController';
import { NearestAirportData, NearestAirportsPageStore } from './NearestAirportsPageStore';

/**
 * The nearest airports page. Displays information on the ORIGIN/DESTINATION and nearest airports up to a total of 5,
 * and allows the user to select each airport or its longest runway.
 */
export class NearestAirportsPage extends WT21FmcPage {
  private static readonly AIRPORT_FORMATTER: Formatter<AirportFacility> = {
    nullValueString: '',

    format: (airport: AirportFacility) => {
      return `<${ICAO.getIdent(airport.icao)}[magenta]`;
    },
  };

  private static readonly RUNWAY_FORMATTER: Formatter<OneWayRunway> = {
    nullValueString: '',

    format: (runway: OneWayRunway) => {
      return `RW${runway.designation}>`;
    },
  };

  private readonly store = new NearestAirportsPageStore(this.bus);
  private readonly controller = new NearestAirportsPageController(this.bus, this.fms, this.store, this.onNearestSearchInit.bind(this));

  private readonly listRenderer = new FmcListUtility(this, this.store.displayedAirports, this.renderAirport.bind(this), 5);

  private updateAirportsField!: DisplayField<string>;

  private isPaused = true;

  /**
   * Responds to when this page's controller's nearest search session is initialized.
   */
  private onNearestSearchInit(): void {
    if (!this.isPaused) {
      this.controller.dequeueUpdate();
    }

    this.store.displayedAirports.sub(this.initialRender.bind(this));
  }

  /** @inheritdoc */
  protected onInit(): void {
    this.updateAirportsField = new DisplayField<string>(this, {
      formatter: RawFormatter,
      onSelected: async (): Promise<boolean> => {
        this.updateAirports();
        return true;
      },
    });
    this.updateAirportsField.takeValue('AIRPORTS>');
  }

  /** @inheritdoc */
  protected onPause(): void {
    super.onPause();

    this.isPaused = true;
  }

  /** @inheritdoc */
  protected onResume(): void {
    super.onResume();

    this.isPaused = false;
    this.updateAirports();
  }

  /**
   * Updates this page's displayed airports.
   */
  private updateAirports(): void {
    this.controller.enqueueUpdate();
    this.controller.dequeueUpdate();
  }

  /**
   * Selects an airport or runway.
   * @param airport The airport that was selected.
   * @param runway The runway that was selected, or null if no runway was selected.
   * @returns A Promise...
   */
  private async select(airport: AirportFacility, runway: OneWayRunway | null): Promise<boolean | string> {
    if (!this.fms.canEditPlan()) {
      return Promise.reject('XSIDE EDIT IN PROGRESS');
    }

    if (!runway) {
      this.fms.createDirectToAirport(airport);

      this.screen.navigateTo('/legs');

      return Promise.resolve(true);
    } else {
      await this.fms.createDirectToRunwayVisualApproach(airport, runway);

      this.screen.navigateTo('/legs');

      return Promise.resolve(true);
    }
  }

  /** @inheritdoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['', '', 'NEAREST AIRPORTS[blue]'],
        ...this.listRenderer.renderList(1),
        ['MIN RWY[blue]', 'UPDATE[d-text]', '-----[blue]'],
        ['1500 FT', this.updateAirportsField],
      ],
    ];
  }

  /**
   * Renders an airport item row
   *
   * @param page the page instance
   * @param indexInDisplay index of the item in the visible list
   * @param prevData the previous item
   * @param data the current item
   *
   * @returns an array of fmc render template rows
   */
  private renderAirport(page: AbstractFmcPage, indexInDisplay: number, prevData: NearestAirportData | undefined, data: NearestAirportData | undefined): FmcRenderTemplateRow[] {
    if (data === undefined) {
      return [['', ''], ['', '']];
    }

    let bearing = Math.round(data.bearing);
    if (bearing === 0) {
      bearing = 360;
    }

    const airportField = new DisplayField(page, {
      formatter: NearestAirportsPage.AIRPORT_FORMATTER,
      onSelected: async (): Promise<boolean> => {
        await this.select(data.airport, null);
        return true;
      },
    });

    airportField.takeValue(data.airport);

    const runwayField = new DisplayField(page, {
      formatter: NearestAirportsPage.RUNWAY_FORMATTER,
      onSelected: async (): Promise<boolean> => {
        await this.select(data.airport, data.runway);
        return true;
      },
    });

    runwayField.takeValue(data.runway);

    const runwayLength = data.runway ? `${UnitType.METER.convertTo(data.runway.length - data.runway.startThresholdLength - data.runway.endThresholdLength, UnitType.FOOT).toFixed(0)}FT` : '';

    const eteRounded = Math.round(data.ete);
    const eteFormatted = `${Math.floor(eteRounded / 60)}:${(eteRounded % 60).toFixed(0).padStart(2, '0')}`;

    const fobFormatted = `${data.fod.toFixed(0)} LB  `;

    return [
      [`${bearing.toFixed(0).padStart(3, '0')}°/${data.distance.toFixed(0)}`, fobFormatted, eteFormatted],
      [airportField, runwayField, runwayLength],
    ];
  }

  /** @inheritdoc */
  protected onDestroy(): void {
    super.onDestroy();

    this.controller.destroy();
    this.store.destroy();
  }
}
