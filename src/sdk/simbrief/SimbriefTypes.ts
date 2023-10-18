/** Simbrief flight stages */
export enum SimbriefFlightStage {
  Climb = 'CLB',
  Cruise = 'CLZ',
  Descent = 'DSC',
}

/** Fix wind entry */
export interface SimbriefNavLogFixWindLevel {
  /** Wind entry altitude */
  altitude: string,

  /** Wind entry direction */
  wind_dir: string,

  /** Wind entry speed */
  wind_spd: string,

  /** Wind entry OAT */
  oat: string,
}

/** Simbrief navlog fix */
export interface SimbriefNavlogFix {
  /** Fix ident */
  ident: string,

  /** Whether the fix is part of a SID or STAR */
  is_sid_star: string,

  /** Airway the fix is on, if applicable */
  via_airway: string | 'DCT',

  /** The type of the fix */
  type: string | 'ltlg',

  /** Fix position latitude */
  pos_lat: string,

  /** Fix position longitude */
  pos_long: string,

  /** Fix wind data */
  wind_data: {
    /** Wind entries */
    level: SimbriefNavLogFixWindLevel[],
  },

  /** Flight stage of the fix */
  stage: SimbriefFlightStage,

  /** Sltitude expected at this fix in feet */
  altitude_feet: string,

  /** Length of this leg in NM */
  distance: string;
}

/** Simbrief OFP airport */
export interface SimbriefAirport {
  /** 4-letter ICAO code */
  icao_code: string,

  /** Planned runway */
  plan_rwy: string,

  /** Airport latitude */
  pos_lat: string,

  /** Airport longitude */
  pos_long: string,

  /** Airport reference elevation in feet */
  elevation: string,
}

/** Simbrief OFP */
export interface SimbriefOfp {
  /** Fetch info */
  fetch: {
    /** User ID */
    userid: string,

    /** Request status */
    status: `Error: ${string}` | 'Success',
  },

  /** OFP parameters. */
  params: {
    /** Request ID for the OFP. */
    request_id: 'string',
    /** Unit of the weights in the OFP. */
    units: string,
  },

  /** Origin airport */
  origin: SimbriefAirport,

  /** Destination airport */
  destination: SimbriefAirport,

  /** Alternate airport */
  alternate: SimbriefAirport | Record<never, never>,

  /** Navlog */
  navlog: {
    /** Navlog fixes */
    fix: SimbriefNavlogFix[],
  },

  /** Planned fuel weight */
  fuel: {
    /** Fuel weight when fully fueled at the ramp */
    plan_ramp: string,
  }

  /** Payload data */
  weights: {
    /** pax count */
    pax_count: string,

    /** Zfw in the unit as reported under params.units */
    est_zfw: string,

    /** Cargo weight in the unit as reported under params.units */
    cargo: string,

    /** Payload weight in the unit as reported under params.units */
    payload: string,
  },

  /** General data */
  general: {
    /** ICAO airline */
    icao_airline: string | Record<never, never>,

    /** Flight number */
    flight_number: string | Record<never, never>,

    /** Initial altitude, used as cruise level for now */
    initial_altitude: string,
  },
}
