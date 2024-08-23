import {
  DisplayField, DmsFormatter, Facility, FmcPagingEvents, FmcRenderTemplate, Formatter, LineSelectKeyEvent, MappedSubject, TextInputField, Validator
} from '@microsoft/msfs-sdk';

import { WT21FmcPage } from '../../WT21FmcPage';
import { WT21FixInfoPageController } from './FixInfoPageController';
import { FixInfoRef, WT21FixInfoPageStore } from './FixInfoPageStore';

/**
 * Fix Info page
 */
export class FixInfoPage extends WT21FmcPage {
  protected readonly store = new WT21FixInfoPageStore();
  protected readonly controller = new WT21FixInfoPageController(this.bus, this.fms, this.store, this, this.screen);
  protected readonly dmsFormatter = new DmsFormatter();

  /**
   * Format a PB/D for the scratchpad
   * @param fixIdent Identifier of the fix from which the PBD originates
   * @param bearing Bearing from the fix in degrees
   * @param distance Distance from the fix in nautical miles
   * @returns formatted string for the scratchpad
   */
  protected formatPbdForScratchpad(fixIdent: string, bearing: number, distance: number): string {
    return `${fixIdent} ${bearing.toFixed(0).padStart(3, '0')}/${distance.toFixed(1)}`;
  }

  /**
   * Format a lat/lon for the scratchpad.
   * @param latitude latitude in degrees.
   * @param longitude longitude in degrees.
   * @returns formatted string for the scratchpad.
   */
  protected formatLlForScratchpad(latitude: number, longitude: number): string {
    return (this.dmsFormatter.getLatDmsStr(latitude, false, false, 2) + this.dmsFormatter.getLonDmsStr(longitude, false, 2)).replace(/°/g, '');
  }

  /** @inheritDoc */
  protected async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    if (event === 'pageLeft') {
      this.controller.previous();
      return true;
    } else if (event === 'pageRight') {
      this.controller.next();
      return true;
    }
    return false;
  }

  protected readonly fixInfoPaging = MappedSubject.create(
    ([currentPage, pageCount]) => ([currentPage, pageCount] as const),
    this.controller.currentPage,
    this.controller.pageCount,
  );
  protected readonly FixInfoPagingIndicator = new DisplayField(this, {
    formatter: this.PagingFormat,
  }).bind(this.fixInfoPaging);

  // 1L - ref fix
  protected readonly FixField = new TextInputField<string | null, Facility>(this, {
    formatter: {
      nullValueString: '-----',

      /** @inheritDoc */
      format(value: string) {
        return value.padEnd(7);
      },

      /** @inheritDoc */
      parse: async (input: string) => this.controller.getFix(input),
    },
    onSelected: async (scratchpadContents) => {
      if (scratchpadContents.length > 0) {
        return false;
      }

      const [lat] = this.store.currentLatCross.get();
      const [lon] = this.store.currentLonCross.get();
      if (lat !== null && lon !== null) {
        return this.formatLlForScratchpad(lat, lon);
      }

      const fixIdent = this.store.currentFixIdent.get();

      const [rad] = this.store.currentRadCross.get();
      const [dis] = this.store.currentDisCross.get();
      if (this.store.currentRef.get() === FixInfoRef.Direct || fixIdent === null || rad === null || dis === null) {
        return fixIdent ?? true;
      }

      return this.formatPbdForScratchpad(fixIdent, rad, dis);
    },
    onModified: async (fac) => {
      this.controller.setCurrentFix(fac);
      return true;
    },
    onDelete: async () => {
      if (this.store.currentFixIdent === null) {
        return Promise.reject('INVALID DELETE');
      }
      return this.controller.deleteCurrentFix();
    },
  }).bind(this.store.currentFixIdent);

  // 2L - rad cross
  protected readonly RadCrossField = new TextInputField<[number | null, boolean]>(this, {
    formatter: {
      nullValueString: '---°',

      /** @inheritDoc */
      format: ([bearing, isPilotEntry]) => {
        if (this.store.currentFixIdent.get() === null) {
          return '';
        } else if (bearing === null) {
          return '---°';
        }
        return `${(bearing % 360).toFixed(0).padStart(3, '0')}°[${isPilotEntry ? 'd' : 's'}-text]`;
      },
      /** @inheritdoc */
      parse: (input: string) => {
        const match = input.match(/^(\d{1,3})$/);
        if (match === null) {
          throw 'INVALID ENTRY';
        }

        const bearing = match[1] !== undefined ? parseInt(match[1]) : null;

        if (bearing === null || bearing > 360) {
          throw 'INVALID ENTRY';
        }

        return [bearing % 360, true];
      },
    },
    /** @inheritdoc */
    onModified: async ([bearing]) => {
      const foundIntersection = await this.controller.setRadDisCross(bearing, null);
      if (!foundIntersection) {
        this.screen.clearScratchpad();
        return Promise.reject('NO INTERSECTION');
      }
      return true;
    },
    onDelete: async () => {
      if (this.store.currentAbeamPointCalculated) {
        return this.controller.deleteAbeamPoint();
      }

      const [, isPilotEntry] = this.store.currentRadCross.get();
      if (!isPilotEntry) {
        return Promise.reject('INVALID DELETE');
      }
      this.controller.deleteRadDisCross();
      return true;
    },
  }).bind(this.store.currentRadCross);

  // 3L - dis cross
  protected readonly DisCrossField = new TextInputField<[number | null, boolean]>(this, {
    formatter: {
      nullValueString: '--.-NM',

      /** @inheritDoc */
      format: ([distance, isPilotEntry]) => {
        if (this.store.currentFixIdent.get() === null) {
          return '';
        } else if (distance === null) {
          return '--.-NM';
        }
        return `${distance.toFixed(1).padStart(4)}NM[${isPilotEntry ? 'd' : 's'}-text]`;
      },
      /** @inheritdoc */
      parse: (input: string) => {
        const match = input.match(/^(\d{1,3}(\.\d)?)$/);
        if (match === null) {
          throw 'INVALID ENTRY';
        }

        const dist = match[1] !== undefined ? parseFloat(match[1]) : null;

        if (dist === null) {
          throw 'INVALID ENTRY';
        }
        if (dist > 500) {
          throw 'DISTANCE TOO LARGE';
        }

        return [dist, true];
      },
    },
    /** @inheritdoc */
    onModified: async ([distance]) => {
      const foundIntersection = await this.controller.setRadDisCross(null, distance);
      if (!foundIntersection) {
        this.screen.clearScratchpad();
        return Promise.reject('NO INTERSECTION');
      }
      return true;
    },
    onDelete: async () => {
      if (this.store.currentAbeamPointCalculated) {
        return this.controller.deleteAbeamPoint();
      }

      const [, isPilotEntry] = this.store.currentDisCross.get();
      if (!isPilotEntry) {
        return Promise.reject('INVALID DELETE');
      }
      this.controller.deleteRadDisCross();
      return true;
    },
  }).bind(this.store.currentDisCross);

  // 2R - lat cross
  protected readonly LatCrossField = new TextInputField<[number | null, boolean], number>(this, {
    formatter: new LatTextFormat(),

    /** @inheritdoc */
    onModified: async (lat) => {
      const foundIntersection = await this.controller.setLatLonCross(lat, null);
      if (!foundIntersection) {
        this.screen.clearScratchpad();
        return Promise.reject('NO INTERSECTION');
      }
      return true;
    },
    onDelete: async () => {
      const [, isPilotEntry] = this.store.currentLatCross.get();
      if (!isPilotEntry) {
        return Promise.reject('INVALID DELETE');
      }
      this.controller.deleteLatLonCross();
      return true;
    },
  }).bind(this.store.currentLatCross);

  // 3R - lon cross
  protected readonly LonCrossField = new TextInputField<[number | null, boolean], number>(this, {
    formatter: new LonTextFormat(),

    /** @inheritdoc */
    onModified: async (lon) => {
      const foundIntersection = await this.controller.setLatLonCross(null, lon);
      if (!foundIntersection) {
        this.screen.clearScratchpad();
        return Promise.reject('NO INTERSECTION');
      }
      return true;
    },
    onDelete: async () => {
      const [, isPilotEntry] = this.store.currentLonCross.get();
      if (!isPilotEntry) {
        return Promise.reject('INVALID DELETE');
      }
      this.controller.deleteLatLonCross();
      return true;
    },
  }).bind(this.store.currentLonCross);

  // 4L - abeam ref
  protected readonly AbeamField = new DisplayField<string | null>(this, {
    formatter: {
      /** @inheritDoc */
      format: () => '<ABEAM REF',
    },
    /** @inheritdoc */
    onSelected: async () => {
      if (this.store.currentFixIdent.get() === null) {
        return false;
      }

      if (!this.store.currentAbeamPointCalculated) {
        const result: boolean = await this.controller.createAbeamPoint();
        if (!result) {
          return Promise.reject('NO INTERSECTION');
        }
      }
      return true;
    },
  });

  // 5C - ref title
  protected readonly RefTitleField = new DisplayField(this, {
    formatter: {
      nullValueString: '',
      format: (ref) => {
        switch (ref) {
          case FixInfoRef.AlongTrack:
            return 'ALONG TRK';
          case FixInfoRef.Abeam:
            return `ABEAM ${(this.store.currentFixIdent.get() ?? '').padEnd(5)}`;
          case FixInfoRef.Direct:
          default:
            return `DIRECT TO ${(this.store.currentFixIdent.get() ?? '').padEnd(5)}`;
        }
      },
    },
  }).bind(this.store.currentRef);

  // 6L - ref crs/dist
  protected readonly RefCrsDistField = new DisplayField<[number | null, number | null]>(this, {
    formatter: {
      nullValueString: '',
      format: ([bearing, distance]) => {
        return `${bearing !== null ? (bearing === 360 ? 0 : bearing).toFixed(0).padStart(3, '0') + '°' : '    '}[s-text] ${distance?.toFixed(1).padStart(4) ?? '--.-[s-text]'}[d-text]NM[s-text]`;
      },
    },
  }).bind(this.store.currentRefCrsDist);

  /** @inheritDoc */
  protected async onHandleSelectKey(event: LineSelectKeyEvent): Promise<boolean | string> {
    if (event.col === 0 && event.row === (6 * 2)) {
      this.screen.navigateTo('/index');
      return true;
    }
    return false;
  }

  // 6R - ref ete/fob

  /** @inheritDoc */
  public  render(): FmcRenderTemplate[] {
    const hasFix = this.store.currentFixIdent.get() !== null;

    return [
      [
        ['', this.FixInfoPagingIndicator, 'FIX INFO[blue]'],
        [' REF[blue]', ''],
        [this.FixField, ''],
        [' RAD CROSS[blue]', 'LAT CROSS [blue]'],
        [hasFix ? this.RadCrossField : '', this.LatCrossField],
        [' DIS CROSS[blue]', 'LON CROSS [blue]'],
        [hasFix ? this.DisCrossField : '', this.LonCrossField],
        ['', ''],
        [this.AbeamField, ''],
        ['', ''],
        ['', '', this.RefTitleField],
        [' CRS  DIST[blue]','ETE  FUEL[blue] '],
        [this.RefCrsDistField , '-:--  -----'],
      ],
    ];
  }

  /** @inheritdoc */
  override onInit(): void {
    this.controller.init();
    this.controller.currentPage.sub(() => this.invalidate());
  }

  /** @inheritdoc */
  override onPause(): void {
    this.controller.pause();
  }

  /** @inheritdoc */
  override onResume(): void {
    this.controller.resume();
  }
}

/**
 * Format for latitude entry.
 */
class LatTextFormat implements Validator<number>, Formatter<[number | null, boolean]> {
  private readonly dmsFormatter = new DmsFormatter();

  public nullValueString = '---°--.--';

  /** @inheritDoc */
  format([lat, isPilotEntry]: [number | null, boolean]): string {
    if (lat === null) {
      return this.nullValueString;
    }
    return this.dmsFormatter.getLatDmsStr(lat, false) + (isPilotEntry ? '[d-text]' : '[s-text]');
  }

  /** @inheritDoc */
  parse(text: string): number | null {
    const match = text.match(/^([NS])(\d{1,2})(\d{2}(\.\d{1,2})?)?$/);
    if (match === null) {
      return null;
    }

    const magnitude = parseInt(match[2]) + (match[3] ? parseFloat(match[3]) / 60 : 0);
    if (magnitude > 90) {
      return null;
    }

    return (match[1] === 'S' ? -1 : 1) * magnitude;
  }
}

/**
 * Format for longitude entry.
 */
class LonTextFormat implements Validator<number>, Formatter<[number | null, boolean]> {
  private readonly dmsFormatter = new DmsFormatter();

  public nullValueString = '----°--.--';

  /** @inheritDoc */
  format([lon, isPilotEntry]: [number | null, boolean]): string {
    if (lon === null) {
      return this.nullValueString;
    }
    return this.dmsFormatter.getLonDmsStr(lon, false) + (isPilotEntry ? '[d-text]' : '[s-text]');
  }

  /** @inheritDoc */
  parse(text: string): number | null {
    const match = text.match(/^([EW])(\d{1,3})(\d{2}(\.\d{1,2})?)?$/);
    if (match === null) {
      return null;
    }

    const magnitude = parseInt(match[2]) + (match[3] ? parseFloat(match[3]) / 60 : 0);
    if (magnitude > 180) {
      return null;
    }

    return (match[1] === 'W' ? -1 : 1) * magnitude;
  }
}
