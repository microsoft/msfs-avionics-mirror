/** Definition for a single scheduled speed definition */
export interface ScheduleSpeedDefinition {
  /** IAS for that schedule */
  ias: number;
  /** Mach for that schedule */
  mach?: number
}

/** Definition for the climb schedule */
export interface ClimbScheduleDefinition {
  /** The V Speed setting used for determing takeoff speeds */
  vSpeedSetting: string;
  /** The speed used within the departure volume */
  departureSpeed: ScheduleSpeedDefinition;
  /** The speed used when not within the departure volume */
  climbSpeed: ScheduleSpeedDefinition
}

/** Definition for a single scheduled speed definition */
export interface ApproachSpeedDefinition {
  /** The flap angle for the relevant schedule */
  flapAngle: number;
  /** Relevant speed schedule */
  schedule: ScheduleSpeedDefinition
}

/** Definition for the descent schedule */
export interface DescentScheduleDefinition {
  /** The speed used when not within the approach volume */
  descentSpeed: ScheduleSpeedDefinition
  /** The speeds used within the approach volume */
  approachSpeed: ApproachSpeedDefinition[];
}

/**
 * A configuration object which defines options related to various aircraft sensors.
 */
export class SpeedScheduleConfig {
  static readonly DEFAULT_CROSSOVER_ALT: number = 23000;
  static readonly DEFAULT_CLIMB_SCHEDULE: ClimbScheduleDefinition = {
    vSpeedSetting: 'y',
    departureSpeed: { ias: 130 },
    climbSpeed: { ias: 140, mach: 0.33 }
  };
  static readonly DEFAULT_CRUISE_SCHEDULE: ScheduleSpeedDefinition = { ias: 230, mach: 0.47 };
  static readonly DEFAULT_DESCENT_SCHEDULE: DescentScheduleDefinition = {
    descentSpeed: { ias: 230, mach: 0.47 },
    approachSpeed: [{flapAngle: 0, schedule: { ias: 150 }}]
  };

  /** The aircrafts climb schedule */
  public climbSchedule: ClimbScheduleDefinition = SpeedScheduleConfig.DEFAULT_CLIMB_SCHEDULE;
  /** The aircrafts cruise schedule */
  public cruiseSchedule: ScheduleSpeedDefinition = SpeedScheduleConfig.DEFAULT_CRUISE_SCHEDULE;
  /** The aircrafts descent schedule */
  public descentSchedule: DescentScheduleDefinition = SpeedScheduleConfig.DEFAULT_DESCENT_SCHEDULE;

  /**
   * Creates a new SpeedScheduleConfig from a configuration document element.
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   */
  constructor(baseInstrument: BaseInstrument, element: Element | undefined) {
    if (element !== undefined) {
      if (element.tagName !== 'SpeedSchedules') {
        throw new Error(`Invalid SpeedScheduleConfig definition: expected tag name 'SpeedSchedules' but was '${element.tagName}'`);
      }

      this.climbSchedule = this.parseClimbSchedule(baseInstrument, element);
      this.cruiseSchedule = this.parseCruiseSchedule(baseInstrument, element);
      this.descentSchedule = this.parseDescentSchedule(baseInstrument, element);
    }
  }

  /**
   * Parses a speed element
   * @param element A configuration document element
   * @returns A speed definition
   */
  private parseSpeedElement(element: Element): ScheduleSpeedDefinition {
    const def: ScheduleSpeedDefinition = { ias: 0 };

    const ias = element.getAttribute('IAS');
    def.ias = Number(ias);

    if (def.ias <= 0) {
      def.ias = 0;
      console.warn(`Invalid IAS has been provided in ${element.tagName}, defaulting value to 0; ensure the IAS value is a positive integer`);
    }

    const mach = element.getAttribute('MACH');
    def.mach = mach ? Number(mach) : undefined;

    return def;
  }

  /**
   * Parses the climb schedule definition from config document elements
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns A climb schedule definition defined by the configuration document element.
   */
  private parseClimbSchedule(baseInstrument: BaseInstrument, element: Element): ClimbScheduleDefinition {
    const climbSchedElement = element.querySelector(':scope>ClimbSchedule');
    const def = SpeedScheduleConfig.DEFAULT_CLIMB_SCHEDULE;

    const VSpeedElement = climbSchedElement?.querySelector(':scope>VSpeed');
    const VSpeedType = VSpeedElement?.getAttribute('type');
    if (VSpeedType) {
      def.vSpeedSetting = VSpeedType.toLocaleLowerCase();
    } else {
      console.warn('No VSpeed type was provided in the climb schedule. Defaulting to use Vy (which may not be present in your aircraft).');
    }

    const departureSpeedElement = climbSchedElement?.querySelector(':scope>DepartureSpeed');
    const departureSpeed = departureSpeedElement && this.parseSpeedElement(departureSpeedElement);
    if (departureSpeed) {
      def.departureSpeed = departureSpeed;
    } else {
      console.warn('No DepartureSpeed element has been found, resorting to default value');
    }

    const climbSpeedElement = climbSchedElement?.querySelector(':scope>ClimbSpeed');
    const climbSpeed = climbSpeedElement && this.parseSpeedElement(climbSpeedElement);
    if (climbSpeed) {
      def.climbSpeed = climbSpeed;
    } else {
      console.warn('No ClimbSpeed element has been found, resorting to default value');
    }

    return def;
  }

  /**
   * Parses the cruise schedule definition from config document elements
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns A cruise schedule definition defined by the configuration document element.
   */
  private parseCruiseSchedule(baseInstrument: BaseInstrument, element: Element): ScheduleSpeedDefinition {
    let def = SpeedScheduleConfig.DEFAULT_CRUISE_SCHEDULE;

    const cruiseSpeedElement = element.querySelector(':scope>CruiseSpeed');
    const cruiseSpeed = cruiseSpeedElement && this.parseSpeedElement(cruiseSpeedElement);
    if (cruiseSpeed) {
      def = cruiseSpeed;
    } else {
      console.warn('No CruiseSpeed element has been found, resorting to default value');
    }

    return def;
  }

  /**
   * Parses the descent schedule definition from config document elements
   * @param baseInstrument The `BaseInstrument` element associated with the configuration.
   * @param element A configuration document element.
   * @returns A descent schedule definition defined by the configuration document element.
   */
  private parseDescentSchedule(baseInstrument: BaseInstrument, element: Element): DescentScheduleDefinition {
    const schedElement = element.querySelector(':scope>DescentSchedule');
    const def = SpeedScheduleConfig.DEFAULT_DESCENT_SCHEDULE;

    const descentSpeedElement = schedElement?.querySelector(':scope>DescentSpeed');
    const descentSpeed = descentSpeedElement && this.parseSpeedElement(descentSpeedElement);
    if (descentSpeed) {
      def.descentSpeed = descentSpeed;
    } else {
      console.warn('No DescentSpeed element has been found, resorting to default value');
    }

    const apprSpeedElement = schedElement?.querySelector(':scope>ApproachSpeeds');
    const speedElements = apprSpeedElement?.querySelectorAll(':scope>FlapsSpeed');
    if (speedElements) {
      def.approachSpeed = [];
      for (const speedElement of speedElements) {
        const flapAngle = Number(speedElement.getAttribute('flapAngle'));
        const schedule = this.parseSpeedElement(speedElement);

        def.approachSpeed.push({ flapAngle, schedule });
      }

      def.approachSpeed.sort((a, b) => b.flapAngle - a.flapAngle);
    } else {
      console.warn('ApproachSpeeds or FlapsSpeed elements are missing from the config, resorting to default values');
    }

    return def;
  }
}
