import { AirportFacility, FacilityLoader, Metar, MutableSubscribable, SimVarValueType, Subject } from '@microsoft/msfs-sdk';

/**
 * An interface for METAR weather requests.
 */
interface WeatherRequest {
  /** The ident of the airport this request is for */
  airport: AirportFacility | undefined,
  /** The object containing weather information */
  metar: Metar | undefined,
  /** Indicating if this request has been received */
  dataState: MutableSubscribable<WeatherRequestState>,
  /** Holds the timeout when a request is pending */
  currentRequest: NodeJS.Timeout | null,
}

export enum WeatherRequestState {
  NONE = 0,
  SENT = 1,
  RCVD = 2,
}

/**
 * A system managing the datalink weather requests in the WT21
 */
export class FmcWeatherRequestSystem {
  private static readonly DL_RCVD_LVAR = 'L:WT_CMU_DATALINK_RCVD';
  private static readonly MetarRequests: WeatherRequest[] = [];
  public static isRequestActive = Subject.create<boolean>(false);
  public static hasUnread = Subject.create<boolean>(false);
  public static vhfIsSending = Subject.create<boolean>(false);

  /**
   * Ctor
   * @param facLoader The facility loader.
   */
  constructor(private readonly facLoader: FacilityLoader) {
    if (FmcWeatherRequestSystem.MetarRequests.length === 0) {
      for (let i = 0; i < 6; i++) {
        FmcWeatherRequestSystem.MetarRequests.push({
          airport: undefined,
          metar: undefined,
          dataState: Subject.create(WeatherRequestState.NONE),
          currentRequest: null,
        });
      }
    }
  }

  /**
   * Get the array of weather requests.
   * @returns An array of weather requests.
   */
  public getRequests(): WeatherRequest[] {
    return FmcWeatherRequestSystem.MetarRequests;
  }

  /**
   * Get a boolean indicating if there is currently an active wx request.
   * @returns True if there is an active request, false otherwise.
   */
  public getIsRequestActive(): Subject<boolean> {
    return FmcWeatherRequestSystem.isRequestActive;
  }

  /**
   * Adds an airport to wx requests
   * @param airport The airport.
   * @param index The index of where the request should be in the requests array.
   */
  public addRequest(airport: AirportFacility, index: number): void {
    const req = FmcWeatherRequestSystem.MetarRequests[index];
    req.airport = airport;
    req.metar = undefined;
    req.dataState.set(WeatherRequestState.NONE);
  }

  /**
   * Request METAR for an airport.
   */
  public requestMetar(): void {
    if (!FmcWeatherRequestSystem.isRequestActive.get()) {
      FmcWeatherRequestSystem.isRequestActive.set(true);
      for (let i = 0; i < 6; i++) {
        const req = FmcWeatherRequestSystem.MetarRequests[i];
        if (req.airport) {
          req.dataState.set(WeatherRequestState.SENT);
        }
      }
      this.queueRequest();
    }
  }

  /**
   * Finds the first pending wx request and executes it.
   */
  private queueRequest(): void {
    const reqIndex = FmcWeatherRequestSystem.MetarRequests.findIndex(request => request.dataState.get() === WeatherRequestState.SENT);
    if (reqIndex > -1) {
      this.executeRequest(reqIndex);
    } else {
      FmcWeatherRequestSystem.isRequestActive.set(false);
    }
  }

  /**
   * Executes a weather request.
   * @param index The index of the wx request.
   */
  private executeRequest(index: number): void {
    const req = FmcWeatherRequestSystem.MetarRequests[index];
    if (req.airport) {
      req.dataState.set(WeatherRequestState.SENT);
      FmcWeatherRequestSystem.vhfIsSending.set(true);
      const rndVhfTime = (Math.floor(Math.random() * 4) + 2) * 1000;
      setTimeout(() => { FmcWeatherRequestSystem.vhfIsSending.set(false); }, rndVhfTime);
      const rndReqTime = (Math.floor(Math.random() * (10 - 3 + 1)) + 3) * 1000;
      req.currentRequest = setTimeout(async () => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const metar = await this.facLoader.getMetar(req.airport!);
        req.metar = metar;
        req.dataState.set(WeatherRequestState.RCVD);
        req.currentRequest = null;
        FmcWeatherRequestSystem.hasUnread.set(FmcWeatherRequestSystem.getHasUnread());
        SimVar.SetSimVarValue(FmcWeatherRequestSystem.DL_RCVD_LVAR, SimVarValueType.Bool, FmcWeatherRequestSystem.hasUnread.get());
        this.queueRequest();
      }, rndReqTime);
    }
  }

  /**
   * Cancels all pending metar requests.
   */
  public static cancelRequest(): void {
    for (let i = 0; i < 6; i++) {
      const req = FmcWeatherRequestSystem.MetarRequests[i];
      if (req.dataState.get() !== WeatherRequestState.RCVD) {
        req.dataState.set(WeatherRequestState.NONE);
        if (req.currentRequest !== null) {
          clearTimeout(req.currentRequest);
        }
      }
    }
    FmcWeatherRequestSystem.isRequestActive.set(false);
  }

  /**
   * Sets the request state to none, indicating that received data has been viewed.
   * @param index The index of the wx request.
   */
  public static setViewed(index: number): void {
    const req = FmcWeatherRequestSystem.MetarRequests[index];
    if (req.dataState.get() !== WeatherRequestState.SENT) {
      req.dataState.set(WeatherRequestState.NONE);
      FmcWeatherRequestSystem.hasUnread.set(FmcWeatherRequestSystem.getHasUnread());
      SimVar.SetSimVarValue(FmcWeatherRequestSystem.DL_RCVD_LVAR, SimVarValueType.Bool, FmcWeatherRequestSystem.hasUnread.get());
    }
  }

  /**
   * Gets a boolean indicating if there are unread wx messages.
   * @returns true when there are unread wx messages, false otherwise.
   */
  private static getHasUnread(): boolean {
    return FmcWeatherRequestSystem.MetarRequests.some((v) => { return v.dataState.get() === WeatherRequestState.RCVD; });
  }
}