import {
  APAltitudeModes, APEvents, APLateralModes, APVerticalModes, ConsumerSubject, EventBus, FlightDirectorEvents, Instrument, MappedSubject, MathUtils, Subject,
  Subscribable, SubscribableMapFunctions, Subscription, VNavEvents, VNavPathMode, VNavState
} from '@microsoft/msfs-sdk';

import { Epic2ApPanelEvents, FlightDirectorCouplingFlags } from '../Autopilot/Epic2ApPanelPublisher';
import { Epic2FmaEvents } from '../Autopilot/Epic2FmaEvents';
import { AutopilotConfig, FlightLevelChangeType } from '../AvionicsConfig/AutopilotConfig';
import { Epic2FlightArea, Epic2FmsEvents, FmsSpeedEvents, RnavMinima } from '../Fms';
import { DisplayUnitIndices } from '../InstrumentIndices';
import { Epic2LNavDataEvents } from '../Navigation';

export enum Epic2ApLateralMode {
  None = '',
  Roll = 'ROL',
  HeadingSelect = 'HDG',
  TrackSelect = 'TRK',
  ApproachVor = 'APR',
  NavVorLnav = 'NAV',
  Localiser = 'LOC',
  LocaliserBackCourse = 'BC',
}

/** The possible active lateral modes. */
export type Epic2ApLateralActiveMode = Epic2ApLateralMode;

/** The possible armed lateral modes. */
export type Epic2ApLateralArmedMode = Exclude<Epic2ApLateralMode, Epic2ApLateralMode.Roll | Epic2ApLateralMode.HeadingSelect | Epic2ApLateralMode.TrackSelect>;

export enum Epic2ApVerticalMode {
  None = '',
  Pitch = 'PIT',
  GoAround = 'GA',
  VerticalSpeed = 'VS',
  /** FLC mode can be replaced by SPD mode in some configs. */
  FlightLevelChange = 'FLC',
  AltitudeSelect = 'ASEL',
  AltitudeHold = 'ALT',
  GlideSlope = 'GS',
  /** SPD mode can be replaced by FLC mode in some configs. */
  Speed = 'SPD',
  VnavPath = 'VPTH',
  /** VFLC mode can be replaced by VSPD mode in some configs. */
  VnavFlightLevelChange = 'VFLC',
  VnavAltitudeSelect = 'VSEL',
  VnavAltitudeHold = 'VALT',
  VnavGlidePath = 'VGP',
  /** VSPD mode can be replaced by VFLC mode in some configs. */
  VnavSpeed = 'VSPD',
  /** VNAV (armed mode only). */
  Vnav = 'VNAV',
  Overspeed = 'MxSPD',
}

/** The possible active vertical modes. */
export type Epic2ApVerticalActiveMode = Exclude<Epic2ApVerticalMode, Epic2ApVerticalMode.Vnav>;

/** The possible primary slot armed vertical modes. */
export type Epic2ApVerticalPrimaryArmedMode = Epic2ApVerticalMode.Vnav | Epic2ApVerticalMode.VnavAltitudeSelect | Epic2ApVerticalMode.AltitudeSelect // these can be armed with a secondary armed mode
  | Epic2ApVerticalMode.GlideSlope | Epic2ApVerticalMode.VnavGlidePath | Epic2ApVerticalMode.None; //  these cannot be armed with a secondary armed mode

/** The possible secondary slot armed vertical modes. */
export type Epic2ApVerticalSecondaryArmedMode = Epic2ApVerticalMode.GlideSlope | Epic2ApVerticalMode.VnavGlidePath | Epic2ApVerticalMode.Vnav | Epic2ApVerticalMode.None;

/** An autopilot data provider. */
export interface AutopilotDataProvider {
  /** The active lateral mode from the SDK autopilot. */
  rawLateralActive: Subscribable<APLateralModes>;

  /** The active lateral mode, or '' when none. */
  lateralActive: Subscribable<Epic2ApLateralMode>;

  /** The armed lateral mode from the SDK autopilot. */
  rawLateralArmed: Subscribable<APLateralModes>;

  /** The armed  lateral mode, or '' when none. */
  lateralArmed: Subscribable<Epic2ApLateralMode>;

  /** The active vertical mode from the SDK autopilot. */
  rawVerticalActive: Subscribable<APVerticalModes>;

  /** The active vertical mode, or '' when none. */
  verticalActive: Subscribable<Epic2ApVerticalActiveMode>;

  /** The armed vertical mode from the SDK autopilot. */
  rawVerticalArmed: Subscribable<APVerticalModes>;

  /** The armed approach vertical mode from the SDK autopilot. */
  rawVerticalApproachArmed: Subscribable<APVerticalModes>;

  /** The primary armed vertical mode, or '' when none. */
  verticalArmedPrimary: Subscribable<Epic2ApVerticalPrimaryArmedMode>;

  /** The secondary armed vertical mode, or '' when none. */
  verticalArmedSecondary: Subscribable<Epic2ApVerticalSecondaryArmedMode>;

  /** The FMA text for the armed vertical mode(s), or '' when none. */
  verticalArmedText: Subscribable<string>;

  /** The FMA text for the RNAV minima */
  rnavMinimaText: Subscribable<string>;

  /** Flags indicating which FDs are currently coupled. Can be both during ILS approaches. */
  fdCoupling: Subscribable<FlightDirectorCouplingFlags>;

  /** Whether the flight director is engaged. */
  fdEngaged: Subscribable<boolean>;

  /** Whether the autopilot is engaged. */
  apEngaged: Subscribable<boolean>;

  /** Whether the autopilot is disengaged abnormally (cleared by yoke quick disconnect or re-engaging). */
  apAbnormalDisengage: Subscribable<boolean>;

  /** Whether the yaw damper is engaged. */
  ydEngaged: Subscribable<boolean>;

  /** Wheher touch control steering is engaged. */
  tcsEngaged: Subscribable<boolean>;

  /** Whether overspeed protection is currently active in place of the selected vertical mode. */
  overspeedProtectionActive: Subscribable<boolean>;

  /** The selected altitude in feet, or null when invalid. */
  selectedAltitude: Subscribable<number | null>;

  /** The AP/AT target airspeed in knots CAS, or null when invalid. */
  targetCas: Subscribable<number | null>;

  /** The AP/AT target mach number, or null when invalid. */
  targetMach: Subscribable<number | null>;

  /** Whether the AP/AT target speed is mach or not. */
  targetSpeedIsMach: Subscribable<boolean>;

  /** Whether the selected speed is in manual mode or not. */
  targetSpeedIsManual: Subscribable<boolean>;

  /** The FMS target airspeed in knots CAS, or null when invalid. */
  fmsTargetCas: Subscribable<number | null>;

  /** The FMS target mach number, or null when invalid. */
  fmsTargetMach: Subscribable<number | null>;

  /** Whether the FMS target speed is mach or not. */
  fmsTargetSpeedIsMach: Subscribable<boolean>;

  /** The selected vertical speed target, or null when invalid. */
  selectedVerticalSpeed: Subscribable<number | null>;

  /** The selected heading in degrees, undefined when not the currently selected mode, or null when invalid. */
  selectedHeading: Subscribable<number | undefined | null>;

  /** The selected track in degrees, undefined when not the currently selected mode, or null when invalid. */
  selectedTrack: Subscribable<number | undefined | null>;

  /** The selected heading or track in degrees, or null when invalid. */
  selectedHeadingOrTrack: Subscribable<number | null>;

  /** Whether FMS mode is selected. Manual speed target mode when false. */
  isFmsModeSelected: Subscribable<boolean | null>;

  /** Whether track mode is selected, heading mode selected when false, or null when invalid. */
  isTrackModeSelected: Subscribable<boolean | null>;

  /** The current vnav path mode, or null when invalid. */
  vnavPathMode: Subscribable<VNavPathMode | null>;

  /** VNAV target altitude in feet */
  vnavTargetAltitude: Subscribable<number>;

  /** VNAV target altitude for the next constraint in feet */
  vnavNextConstraintTargetAltitude: Subscribable<number>;

  /** The displayed VNAV target altitude in feet, this accounts for descents in VPTH mode */
  vnavDisplayedTargetAltitude: Subscribable<number>;

  /** Current flight area */
  flightArea: Subscribable<Epic2FlightArea>;
}

/** An implementation of the autopilot data provider. */
export class DefaultAutopilotDataProvider implements AutopilotDataProvider, Instrument {
  private readonly apSelectedHeading = ConsumerSubject.create<number | null>(null, null).pause();
  private readonly apHeadingTrackSelector = ConsumerSubject.create(null, false).pause();
  private readonly apFmsManTargetSelector = ConsumerSubject.create(null, false).pause();

  private readonly _rawLateralActive = Subject.create(APLateralModes.NONE);
  public readonly rawLateralActive = this._rawLateralActive as Subscribable<APLateralModes>;

  private readonly _rawLateralArmed = Subject.create(APLateralModes.NONE);
  public readonly rawLateralArmed = this._rawLateralArmed as Subscribable<APLateralModes>;

  private readonly _rnavMinimaText = Subject.create('');
  public readonly rnavMinimaText = this._rnavMinimaText as Subscribable<string>;

  private readonly _rawVerticalActive = Subject.create(APVerticalModes.NONE);
  public readonly rawVerticalActive = this._rawVerticalActive as Subscribable<APVerticalModes>;

  private readonly _overspeedProtectionActive = Subject.create(false);
  public readonly overspeedProtectionActive = this._overspeedProtectionActive as Subscribable<boolean>;

  private readonly _rawVerticalArmed = Subject.create(APVerticalModes.NONE);
  public readonly rawVerticalArmed = this._rawVerticalArmed as Subscribable<APVerticalModes>;

  private readonly _rawVerticalApproachArmed = Subject.create(APVerticalModes.NONE);
  public readonly rawVerticalApproachArmed = this._rawVerticalApproachArmed as Subscribable<APVerticalModes>;

  private readonly _fdCoupling = ConsumerSubject.create(null, FlightDirectorCouplingFlags.Left);
  public readonly fdCoupling = this._fdCoupling as Subscribable<FlightDirectorCouplingFlags>;

  private readonly _fdEngaged = ConsumerSubject.create(null, false).pause();
  public readonly fdEngaged = this._fdEngaged as Subscribable<boolean>;

  private readonly _apEngaged = ConsumerSubject.create(null, false).pause();
  public readonly apEngaged = this._apEngaged as Subscribable<boolean>;

  private readonly _apAbnormalDisengage = Subject.create(false);
  public readonly apAbnormalDisengage = this._apAbnormalDisengage as Subscribable<boolean>;

  private readonly _ydEngaged = ConsumerSubject.create(null, false).pause();
  public readonly ydEngaged = this._ydEngaged as Subscribable<boolean>;

  // FIXME add to FMA data and plumb in
  private readonly _tcsEngaged = Subject.create(false);
  public readonly tcsEngaged = this._tcsEngaged as Subscribable<boolean>;

  private readonly _selectedAltitude = ConsumerSubject.create<number | null>(null, null);
  public readonly selectedAltitude = this._selectedAltitude as Subscribable<number | null>;

  private readonly _vnavTargetAltitude = ConsumerSubject.create<number>(null, 0);
  public readonly vnavTargetAltitude = this._vnavTargetAltitude as Subscribable<number>;

  private readonly _vnavNextConstraintTargetAltitude = ConsumerSubject.create<number>(null, 0);
  public readonly vnavNextConstraintTargetAltitude = this._vnavNextConstraintTargetAltitude as Subscribable<number>;

  private readonly _targetCas = ConsumerSubject.create<number | null>(null, null).pause();
  public readonly targetCas = this._targetCas as Subscribable<number | null>;

  private readonly _targetMach = ConsumerSubject.create<number | null>(null, 0).pause();
  public readonly targetMach = this._targetMach as Subscribable<number | null>;

  private readonly _targetSpeedIsMach = ConsumerSubject.create(null, false).pause();
  public readonly targetSpeedIsMach = this._targetSpeedIsMach as Subscribable<boolean>;

  private readonly _targetSpeedIsManual = ConsumerSubject.create(null, true);
  public readonly targetSpeedIsManual = this._targetSpeedIsManual as Subscribable<boolean>;

  private readonly _fmsTargetCas = ConsumerSubject.create<number | null>(null, null).pause();
  public readonly fmsTargetCas = this._fmsTargetCas as Subscribable<number | null>;

  private readonly _fmsTargetMach = ConsumerSubject.create<number | null>(null, 0).pause();
  public readonly fmsTargetMach = this._fmsTargetMach as Subscribable<number | null>;

  private readonly _fmsTargetSpeedIsMach = ConsumerSubject.create(null, false).pause();
  public readonly fmsTargetSpeedIsMach = this._fmsTargetSpeedIsMach as Subscribable<boolean>;

  private readonly _selectedVerticalSpeed = ConsumerSubject.create<number | null>(null, null);
  public readonly selectedVerticalSpeed = this._selectedVerticalSpeed as Subscribable<number | null>;

  private readonly _selectedHeading = Subject.create<number | undefined | null>(null);
  public readonly selectedHeading = this._selectedHeading as Subscribable<number | undefined | null>;

  private readonly _selectedTrack = Subject.create<number | undefined | null>(null);
  public readonly selectedTrack = this._selectedTrack as Subscribable<number | undefined | null>;

  public readonly selectedHeadingOrTrack = this.apSelectedHeading as Subscribable<number | null>;

  public readonly isTrackModeSelected = this.apHeadingTrackSelector as Subscribable<boolean | null>;

  public readonly isFmsModeSelected = this.apFmsManTargetSelector.map((v) => !v) as Subscribable<boolean | null>;

  private readonly selectedHeadingPipe = this.apSelectedHeading.pipe(this._selectedHeading, true);
  private readonly selectedTrackPipe = this.apSelectedHeading.pipe(this._selectedTrack, true);

  private readonly altCapType = Subject.create(APAltitudeModes.NONE);
  private readonly altCapArmed = Subject.create(false);
  private readonly altCapValue = Subject.create(0);

  public readonly vnavPathMode = ConsumerSubject.create<VNavPathMode>(null, VNavPathMode.None).pause();
  private readonly vnavState = ConsumerSubject.create<VNavState>(null, VNavState.Disabled).pause();

  private readonly apOrFdEngaged = MappedSubject.create(SubscribableMapFunctions.or(), this._apEngaged, this._fdEngaged);

  private readonly _lateralActive = MappedSubject.create<[APLateralModes, boolean], Epic2ApLateralActiveMode>(
    ([apActiveMode, apOrFdEngaged]) => {
      if (!apOrFdEngaged) {
        return Epic2ApLateralMode.None;
      }

      switch (apActiveMode) {
        case APLateralModes.BC:
          return Epic2ApLateralMode.LocaliserBackCourse;
        case APLateralModes.GPSS:
        case APLateralModes.NAV:
        case APLateralModes.VOR:
          return Epic2ApLateralMode.NavVorLnav;
        case APLateralModes.HEADING:
          return Epic2ApLateralMode.HeadingSelect;
        case APLateralModes.LOC:
          return Epic2ApLateralMode.Localiser;
        case APLateralModes.ROLL:
          return Epic2ApLateralMode.Roll;
        case APLateralModes.TRACK:
          return Epic2ApLateralMode.TrackSelect;
        default:
      }

      return Epic2ApLateralMode.None;
    },
    this._rawLateralActive,
    this.apOrFdEngaged,
  );
  public readonly lateralActive = this._lateralActive as Subscribable<Epic2ApLateralActiveMode>;

  private readonly _lateralArmed = MappedSubject.create<[APLateralModes, boolean], Epic2ApLateralArmedMode>(
    ([apArmedMode, apOrFdEngaged]) => {
      if (!apOrFdEngaged) {
        return Epic2ApLateralMode.None;
      }

      switch (apArmedMode) {
        case APLateralModes.BC:
          return Epic2ApLateralMode.LocaliserBackCourse;
        case APLateralModes.GPSS:
        case APLateralModes.NAV:
        case APLateralModes.VOR:
          return Epic2ApLateralMode.NavVorLnav;
        case APLateralModes.LOC:
          return Epic2ApLateralMode.Localiser;
        default:
      }

      return Epic2ApLateralMode.None;
    },
    this._rawLateralArmed,
    this.apOrFdEngaged,
  );
  public readonly lateralArmed = this._lateralArmed as Subscribable<Epic2ApLateralArmedMode>;

  private readonly _verticalActiveText = MappedSubject.create(
    ([apActiveMode, vnavState, apOrFdEngaged]) => {
      if (!apOrFdEngaged) {
        return Epic2ApVerticalMode.None;
      }

      if (vnavState === VNavState.Enabled_Active) {
        switch (apActiveMode) {
          case APVerticalModes.ALT:
            if (this.altCapValue.get() === this.selectedAltitude.get()) {
              return Epic2ApVerticalMode.AltitudeHold;
            } else {
              return Epic2ApVerticalMode.VnavAltitudeHold;
            }
          case APVerticalModes.CAP:
            return Epic2ApVerticalMode.VnavAltitudeSelect;
          case APVerticalModes.FLC:
            return this.autopilotConfig.flcType === FlightLevelChangeType.SPD ? Epic2ApVerticalMode.VnavSpeed : Epic2ApVerticalMode.VnavFlightLevelChange;
          case APVerticalModes.PATH:
            return Epic2ApVerticalMode.VnavPath;
          default:
        }
      }

      switch (apActiveMode) {
        case APVerticalModes.ALT:
          return Epic2ApVerticalMode.AltitudeHold;
        case APVerticalModes.CAP:
          return Epic2ApVerticalMode.AltitudeSelect;
        case APVerticalModes.FLC:
          // FLC or SPD depending on AP config.
          return this.autopilotConfig.flcType;
        case APVerticalModes.TO:
        case APVerticalModes.GA:
          return Epic2ApVerticalMode.GoAround;
        case APVerticalModes.GP:
          return Epic2ApVerticalMode.VnavGlidePath;
        case APVerticalModes.GS:
          return Epic2ApVerticalMode.GlideSlope;
        case APVerticalModes.PITCH:
          return Epic2ApVerticalMode.Pitch;
        case APVerticalModes.VS:
          return Epic2ApVerticalMode.VerticalSpeed;
        default:
      }

      return Epic2ApVerticalMode.None;
    },
    this._rawVerticalActive,
    this.vnavState,
    this.apOrFdEngaged,
  );
  public readonly verticalActive = this._verticalActiveText as Subscribable<Epic2ApVerticalActiveMode>;

  private _verticalArmedPrimary = MappedSubject.create(
    ([apActiveMode, apArmedMode, vnavMode, vnavState, apOrFdEngaged, altCapArmed, altCapType]) => {
      if (!apOrFdEngaged) {
        return Epic2ApVerticalMode.None;
      }

      if (vnavMode === VNavPathMode.PathArmed && apArmedMode === APVerticalModes.PATH) {
        return Epic2ApVerticalMode.Vnav;
      }

      if (vnavState === VNavState.Enabled_Active && altCapType === APAltitudeModes.ALTV) {
        return Epic2ApVerticalMode.VnavAltitudeSelect;
      }

      switch (apArmedMode) {
        case APVerticalModes.GP:
          return Epic2ApVerticalMode.VnavGlidePath;
        case APVerticalModes.GS:
          return Epic2ApVerticalMode.GlideSlope;
        default:
      }

      if (altCapArmed && apActiveMode !== APVerticalModes.CAP) {
        return Epic2ApVerticalMode.AltitudeSelect;
      }

      return Epic2ApVerticalMode.None;
    },
    this._rawVerticalActive,
    this._rawVerticalArmed,
    this.vnavPathMode,
    this.vnavState,
    this.apOrFdEngaged,
    this.altCapArmed,
    this.altCapType,
  );
  public verticalArmedPrimary = this._verticalArmedPrimary as Subscribable<Epic2ApVerticalPrimaryArmedMode>;

  private _verticalArmedSecondary = MappedSubject.create<[APVerticalModes, VNavPathMode, boolean], Epic2ApVerticalSecondaryArmedMode>(
    ([apArmedMode, vnavMode, apOrFdEngaged]) => {
      if (!apOrFdEngaged) {
        return Epic2ApVerticalMode.None;
      }

      if (vnavMode === VNavPathMode.PathArmed && apArmedMode === APVerticalModes.PATH) {
        return Epic2ApVerticalMode.Vnav;
      }

      switch (apArmedMode) {
        case APVerticalModes.GP:
          return Epic2ApVerticalMode.VnavGlidePath;
        case APVerticalModes.GS:
          return Epic2ApVerticalMode.GlideSlope;
        default:
      }

      return Epic2ApVerticalMode.None;
    },
    this._rawVerticalApproachArmed, // FIXME we really need a proper second slot here to cover the VNAV PATH as well as approach modes
    this.vnavPathMode,
    this.apOrFdEngaged,
  );
  public verticalArmedSecondary = this._verticalArmedSecondary as Subscribable<Epic2ApVerticalSecondaryArmedMode>;

  private readonly _verticalArmedText = MappedSubject.create((inputs) => this.getVerticalArmedText(...inputs), this._verticalArmedPrimary, this._verticalArmedSecondary);
  public readonly verticalArmedText = this._verticalArmedText as Subscribable<string>;

  public readonly vnavDisplayedTargetAltitude = MappedSubject.create(([vnavTarget, vnavNextConstraintTarget, apVerticalActiveMode]) => {
    return apVerticalActiveMode === Epic2ApVerticalMode.VnavPath ? MathUtils.round(vnavNextConstraintTarget, 10) : vnavTarget;
  }, this._vnavTargetAltitude, this._vnavNextConstraintTargetAltitude, this.verticalActive);

  private readonly fmaSub: Subscription;

  private readonly _flightArea = ConsumerSubject.create(this.bus.getSubscriber<Epic2LNavDataEvents>().on('lnavdata_flight_area'), Epic2FlightArea.EnRoute);
  public readonly flightArea = this._flightArea as Subscribable<Epic2FlightArea>;

  private readonly pausable: Subscription[] = [
    this._apEngaged,
    this._fdEngaged,
    this._ydEngaged,
    this._vnavTargetAltitude,
    this._selectedAltitude,
    this._targetCas,
    this._targetMach,
    this._targetSpeedIsMach,
    this._targetSpeedIsManual,
    this._fmsTargetCas,
    this._fmsTargetMach,
    this._fmsTargetSpeedIsMach,
    this.apSelectedHeading,
    this.apHeadingTrackSelector,
    this.apFmsManTargetSelector,
    this.vnavPathMode,
    this.vnavState,
  ];

  /**
   * Ctor.
   * @param bus The instrument event bus.
   * @param displayUnitIndex The index of this display unit.
   * @param autopilotConfig The autopilot config
   */
  constructor(
    private readonly bus: EventBus,
    private readonly displayUnitIndex: DisplayUnitIndices,
    private readonly autopilotConfig: AutopilotConfig,
  ) {
    const sub = this.bus.getSubscriber<APEvents & FlightDirectorEvents & Epic2ApPanelEvents & Epic2FmaEvents & Epic2FmsEvents & FmsSpeedEvents & VNavEvents>();

    this.fmaSub = sub.on('epic2_fma_data').handle((fma) => {
      this._rawLateralActive.set(fma.lateralActive);
      this._rawLateralArmed.set(fma.lateralArmed);

      this._rawVerticalActive.set(fma.verticalActive);
      this._rawVerticalArmed.set(fma.verticalArmed);
      // FIXME not just approach modes live here
      this._rawVerticalApproachArmed.set(fma.verticalApproachArmed);

      this.altCapType.set(fma.verticalAltitudeArmed);
      this.altCapArmed.set(fma.altitideCaptureArmed);
      this.altCapValue.set(fma.altitideCaptureValue);

      this._overspeedProtectionActive.set(fma.isOverspeedProtectionActive);
      this._apAbnormalDisengage.set(fma.isAbnormalDisengageActive);
    }, true);
    this.pausable.push(this.fmaSub);

    this.apHeadingTrackSelector.sub((trackSelected) => {
      if (trackSelected) {
        this.selectedHeadingPipe.pause();
        this._selectedHeading.set(undefined);
        this.selectedTrackPipe.resume(true);
      } else {
        this.selectedTrackPipe.pause();
        this._selectedTrack.set(undefined);
        this.selectedHeadingPipe.resume(true);
      }
    }, true);

    this._fdEngaged.setConsumer(sub.on('flight_director_is_active_1'));
    this._apEngaged.setConsumer(sub.on('ap_master_status'));
    this._ydEngaged.setConsumer(sub.on('ap_yd_status'));
    this._fdCoupling.setConsumer(sub.on('epic2_ap_fd_coupling'));

    this._vnavTargetAltitude.setConsumer(sub.on('vnav_target_altitude').withPrecision(0));
    this._vnavNextConstraintTargetAltitude.setConsumer(sub.on('vnav_constraint_altitude').withPrecision(0));
    this._selectedAltitude.setConsumer(sub.on('ap_altitude_selected'));
    this._targetCas.setConsumer(sub.on('fms_speed_autopilot_target_ias'));
    this._targetMach.setConsumer(sub.on('fms_speed_autopilot_target_mach'));
    this._targetSpeedIsMach.setConsumer(sub.on('fms_speed_autopilot_target_is_mach'));
    this._targetSpeedIsManual.setConsumer(sub.on('ap_selected_speed_is_manual'));
    this._fmsTargetCas.setConsumer(sub.on('fms_speed_computed_target_ias'));
    this._fmsTargetMach.setConsumer(sub.on('fms_speed_computed_target_mach'));
    this._fmsTargetSpeedIsMach.setConsumer(sub.on('fms_speed_computed_target_is_mach'));

    this._selectedVerticalSpeed.setConsumer(sub.on('ap_vs_selected'));

    this.vnavPathMode.setConsumer(sub.on('vnav_path_mode'));
    this.vnavState.setConsumer(sub.on('vnav_state'));
    this.apSelectedHeading.setConsumer(sub.on('ap_heading_selected'));
    this.apHeadingTrackSelector.setConsumer(sub.on('epic2_ap_hdg_trk_selector'));
    this.apFmsManTargetSelector.setConsumer(sub.on('epic2_ap_fms_man_selector'));

    this.pausable.push(sub.on('epic2_fms_approach_details_set').handle(details => {
      this._rnavMinimaText.set(details.selectedRnavMinima === RnavMinima.LNAV ? 'VNAV' : RnavMinima[details.selectedRnavMinima]);
    }, true));
  }

  /** @inheritdoc */
  public init(): void {
    this.resume();
  }

  /** @inheritdoc */
  public onUpdate(): void {
    // noop
  }

  /** Pause the data provider. */
  public pause(): void {
    for (const sub of this.pausable) {
      sub.pause();
    }
  }

  /** Resume the data provider. */
  public resume(): void {
    for (const sub of this.pausable) {
      sub.resume(true);
    }
  }

  /**
   * Get the FMA text for a pair of armed modes.
   * @param primary The primary armed mode.
   * @param secondary The secondary armed mode.
   * @returns FMA text.
   */
  private getVerticalArmedText(primary: Epic2ApVerticalPrimaryArmedMode, secondary: Epic2ApVerticalSecondaryArmedMode): string {
    switch (primary) {
      case Epic2ApVerticalMode.AltitudeSelect: {
        switch (secondary) {
          case Epic2ApVerticalMode.GlideSlope:
            return 'AL-GS';
          case Epic2ApVerticalMode.VnavGlidePath:
            return 'AL-VG';
          case Epic2ApVerticalMode.Vnav:
            return 'AL-VN';
          default:
            return primary;
        }
      }
      case Epic2ApVerticalMode.VnavAltitudeSelect: {
        switch (secondary) {
          case Epic2ApVerticalMode.GlideSlope:
            return 'VL-GS';
          case Epic2ApVerticalMode.VnavGlidePath:
            return 'VL-VG';
          case Epic2ApVerticalMode.Vnav:
            console.warn('AutopilotDataProvider: Invalid armed vertical mode combo', primary, secondary);
            return 'VL-VN';
          default:
            return primary;
        }
      }
      case Epic2ApVerticalMode.Vnav: {
        switch (secondary) {
          case Epic2ApVerticalMode.GlideSlope:
            return 'VN-GS';
          case Epic2ApVerticalMode.VnavGlidePath:
            return 'VN-VG';
          case Epic2ApVerticalMode.Vnav:
            console.warn('AutopilotDataProvider: Invalid armed vertical mode combo', primary, secondary);
            return 'VN-VN';
          default:
            return primary;
        }
      }
      default:
        if (secondary !== Epic2ApVerticalMode.None) {
          console.warn('AutopilotDataProvider: Invalid armed vertical mode combo', primary, secondary);
          // hax because the AP isn't fixed yet...
          if (primary === Epic2ApVerticalMode.None) {
            return secondary;
          }
        }
        return primary;
    }
  }
}
