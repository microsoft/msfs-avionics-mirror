import {
  APAltitudeModes, APEvents, APLateralModes, APLockType, ApproachGuidanceMode, APVerticalModes, ComponentProps, ComputedSubject, ConsumerSubject, DisplayComponent, EventBus,
  FSComponent, MappedSubject, NavEvents, NavSourceType, Subject, VNavAltCaptureType, VNavEvents, VNavPathMode, VNode
} from '@microsoft/msfs-sdk';

import { FmaData, WT21ControlEvents } from '../../../Shared/WT21ControlEvents';

import './FlightModeAnnunciator.css';

/**
 * The properties for the Flight Mode Annunciator component.
 */
interface FlightModeAnnunciatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/**
 * The Altimeter component.
 */
export class FlightModeAnnunciator extends DisplayComponent<FlightModeAnnunciatorProps> {
  private readonly apFlc = FSComponent.createRef<HTMLElement>();
  private readonly apFlcVisible = Subject.create<boolean>(false);

  private readonly apVerticalSpeed = FSComponent.createRef<HTMLDivElement>();
  private readonly apVerticalSpeedVisible = Subject.create<boolean>(false);

  private readonly apVerticalSpeedArrow = FSComponent.createRef<HTMLElement>();
  private readonly apVerticalSpeedArrowVisible = Subject.create<boolean>(false);

  private readonly verticalActiveRef = FSComponent.createRef<HTMLDivElement>();
  private readonly lateralActiveRef = FSComponent.createRef<HTMLDivElement>();
  private readonly verticalArmedRef = FSComponent.createRef<HTMLDivElement>();

  private readonly apMode = FSComponent.createRef<HTMLDivElement>();
  private readonly apMode2 = FSComponent.createRef<HTMLDivElement>();
  private readonly arrow = FSComponent.createRef<HTMLDivElement>();

  private autopilotModes: FmaData = {
    verticalActive: APVerticalModes.NONE,
    verticalArmed: APVerticalModes.NONE,
    verticalApproachArmed: APVerticalModes.NONE,
    verticalAltitudeArmed: APAltitudeModes.NONE,
    altitideCaptureArmed: false,
    altitideCaptureValue: 0,
    lateralActive: APLateralModes.NONE,
    lateralArmed: APLateralModes.NONE,
    lateralModeFailed: false,
    pathArmedError: false,
    apApproachModeOn: false
  };

  private selectedVs = 0;
  private isSelectedSpeedMach = false;
  private selectedIas = 0;
  private selectedMach = 0;
  private selectedPitch = 0;

  private readonly cdiSource = ConsumerSubject.create(this.props.bus.getSubscriber<NavEvents>().on('cdi_select'), {
    type: NavSourceType.Gps,
    index: 0
  });

  private readonly lateralActiveMode = Subject.create(APLateralModes.NONE);

  private readonly lateralArmedMode = Subject.create(APLateralModes.NONE);

  private readonly verticalActiveModeSubject = ComputedSubject.create<APVerticalModes, string>(APVerticalModes.NONE, (v) => {
    return this.getVerticalActiveString(v);
  });

  private readonly lateralActiveModeMappedSubject = MappedSubject.create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([mode, cdiSource]) => {
      return this.getLateralActiveString(mode);
    },
    this.lateralActiveMode,
    this.cdiSource
  );

  private readonly lateralArmedModeMappedSubject = MappedSubject.create(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([mode, cdiSource]) => {
      return this.getLateralArmedString(mode);
    },
    this.lateralArmedMode,
    this.cdiSource
  );

  private readonly apMasterSubject = Subject.create('');
  private readonly altitudeArmedSubject = Subject.create('');
  private readonly verticalArmedSubject = Subject.create('');
  private readonly verticalApproachArmedSubject = Subject.create('');
  private readonly verticalValueSubject = Subject.create('');
  private readonly pathArmedError = Subject.create<boolean>(false);

  private vnavAltCapType = VNavAltCaptureType.None;
  private vnavPathMode = VNavPathMode.None;
  private approachMode = ApproachGuidanceMode.None;

  private readonly lateralModeFailed = Subject.create<boolean>(false);
  private readonly verticalModeFailed = Subject.create<boolean>(false);

  private readonly flightDirectorOn = Subject.create<boolean>(false);
  private readonly yawDamperOn = Subject.create<boolean>(false);
  private readonly apMaster = Subject.create<boolean>(false);
  private readonly vnavState = Subject.create<boolean>(false);


  /**
   * A callback called after the component renders.
   */
  public onAfterRender(): void {
    //Auto and Manual cancels for the autopilot and yaw damper.

    //When you turn off the autopilot manually, it will flash red for 1.5s then disappear.
    // Use "fma-ap-manual-cancel"

    //When the AP is turned off automatically (you moved the controls and overcome it),
    //it will flash red infinitely until you cancel it.  Use "fma-auto-cancel"

    //Yaw damper flashes in yellow for 1.5s upon disconnect.  Use "fma-yd-manual-cancel"
    //The source arrow is white when AP is not on, green when AP is on,
    //and flashes red when AP is disconnected then goes back to white. Use "fma-arrow-colors"

    const ap = this.props.bus.getSubscriber<APEvents>();
    ap.on('ap_master_on').handle(() => {
      this.apMaster.set(true);
      this.onApFdYdChange();
    });
    ap.on('ap_master_off').handle(() => {
      this.apMaster.set(false);
      this.onApFdYdChange();
      this.apMode.instance.classList.add('hidden');
      this.apMode2.instance.classList.remove('hidden');
      this.apMode2.instance.classList.add('fma-ap-manual-cancel');
      setTimeout(() => {
        this.apMode.instance.classList.remove('hidden');
        this.apMode2.instance.classList.remove('fma-ap-manual-cancel');
        this.apMode2.instance.classList.add('hidden');
      }, 1500);
    });

    ap.on('flight_director_is_active_1').whenChanged().handle((state) => {
      this.flightDirectorOn.set(state);
      this.onApFdYdChange();
    });
    ap.on('ap_yd_status').whenChanged().handle((state) => {
      this.yawDamperOn.set(state);
      this.onApFdYdChange();
    });
    ap.on('ap_vs_selected').withPrecision(0).handle((vs) => {
      this.selectedVs = vs;
      this.handleVerticalValueChanged();
    });
    ap.on('ap_selected_speed_is_mach').whenChanged().handle((isMach) => {
      this.isSelectedSpeedMach = isMach;
      this.handleVerticalValueChanged();
    });
    ap.on('ap_ias_selected').whenChangedBy(1).handle((ias) => {
      this.selectedIas = ias;
      !this.isSelectedSpeedMach && this.handleVerticalValueChanged();
    });
    ap.on('ap_mach_selected').withPrecision(2).handle((mach) => {
      this.selectedMach = mach;
      this.isSelectedSpeedMach && this.handleVerticalValueChanged();
    });
    ap.on('ap_pitch_selected').whenChanged().handle((pit) => {
      this.selectedPitch = -pit;
      this.handleVerticalValueChanged();
    });
    ap.on('ap_lock_set').handle(lock => {
      if (lock === APLockType.VNav) {
        this.vnavState.set(true);
      }
    });
    ap.on('ap_lock_release').handle(lock => {
      if (lock === APLockType.VNav) {
        this.vnavState.set(false);
      }
    });

    const vnav = this.props.bus.getSubscriber<VNavEvents>();

    vnav.on('vnav_path_mode').whenChanged().handle(mode => this.onVNavUpdate(mode, this.vnavAltCapType, this.approachMode));
    vnav.on('vnav_altitude_capture_type').whenChanged().handle(type => this.onVNavUpdate(this.vnavPathMode, type, this.approachMode));
    // vnav.on('vnavApproachMode').whenChanged().handle(mode => this.onVNavUpdate(this.vnavPathMode, this.vnavAltCapType, mode));

    this.props.bus.getSubscriber<WT21ControlEvents>().on('fma_modes').handle((v) => {
      this.autopilotModes = v;
      let verticalModeFailed = false;
      if (v.lateralModeFailed) {
        this.lateralModeFailed.set(true);
        const verticalMode = this.verticalActiveModeSubject.getRaw();
        if (verticalMode === APVerticalModes.GP || verticalMode === APVerticalModes.GS) {
          verticalModeFailed = true;
          this.verticalModeFailed.set(true);
        }
      } else {
        this.lateralModeFailed.set(false);
        this.verticalModeFailed.set(false);
      }
      if (!v.lateralModeFailed) {
        this.lateralActiveMode.set(this.autopilotModes.lateralActive);
      }
      if (!verticalModeFailed) {
        this.verticalActiveModeSubject.set(this.autopilotModes.verticalActive);
      }
      this.lateralArmedMode.set(this.autopilotModes.lateralArmed);
      this.pathArmedError.set(v.pathArmedError);
      this.verticalArmedSubject.set(this.getVerticalArmedString(this.autopilotModes.verticalArmed));
      this.verticalApproachArmedSubject.set(this.getVerticalApproachArmedString(this.autopilotModes.verticalApproachArmed));
      this.handleVerticalValueChanged();
    });

    this.apVerticalSpeedArrowVisible.sub(v => {
      this.apVerticalSpeedArrow.instance.classList.toggle('hidden', !v);
    });

    this.apVerticalSpeedVisible.sub(v => {
      this.apVerticalSpeed.instance.classList.toggle('hidden', !v);
    });

    this.apFlcVisible.sub(v => {
      this.apFlc.instance.classList.toggle('hidden', !v);
    });

    this.vnavState.sub(() => this.verticalActiveModeSubject.set(this.autopilotModes.verticalActive));

    this.pathArmedError.sub(this.handleNoPath);

    this.verticalArmedSubject.sub(this.handleNoPath);

    this.lateralActiveModeMappedSubject.sub(() => {
      this.lateralActiveRef.instance?.classList.remove('fma-blinking');
      setTimeout(() => {
        this.lateralActiveRef.instance?.classList.add('fma-blinking');
      }, 1);
    });

    this.verticalActiveModeSubject.sub(() => {
      this.verticalActiveRef.instance?.classList.remove('fma-blinking');
      this.apFlc.instance?.classList.remove('fma-blinking');
      this.apVerticalSpeed.instance?.classList.remove('fma-blinking');
      setTimeout(() => {
        this.verticalActiveRef.instance?.classList.add('fma-blinking');
        this.apFlc.instance?.classList.add('fma-blinking');
        this.apVerticalSpeed.instance?.classList.add('fma-blinking');
      }, 1);
    });
  }

  /**
   * A callback called when the AP, YD or FD State changes from the event bus.
   */
  private onApFdYdChange(): void {
    const apState = this.apMaster.get();
    const fdState = this.flightDirectorOn.get();
    const ydState = this.yawDamperOn.get();

    if (!apState) {
      this.arrow.instance.classList.remove('fma-arrow-green');
    } else {
      this.arrow.instance.classList.add('fma-arrow-green');
    }

    if (!apState && !fdState) {
      this.lateralArmedMode.set(APLateralModes.NONE);
      this.lateralActiveMode.set(APLateralModes.NONE);
      this.verticalActiveModeSubject.set(APVerticalModes.NONE);
      this.verticalArmedSubject.set('');
      this.verticalApproachArmedSubject.set('');
      this.verticalValueSubject.set('');
      this.apVerticalSpeedArrowVisible.set(false);
      this.apVerticalSpeedVisible.set(false);
      this.apFlcVisible.set(false);
    }

    this.apMasterSubject.set(apState ? 'AP' : ydState ? 'YD' : '');
  }

  /**
   * Gets the FMA display string from an AP Vertical Active Mode.
   * @param v The computed subject input value.
   * @returns the string to display on the FMA
   */
  private getVerticalActiveString(v: APVerticalModes): string {
    const vnavState = this.vnavState !== undefined && this.vnavState.get();
    const vnavChar = vnavState ? 'V' : ' ';
    switch (v) {
      case APVerticalModes.VS:
        return `${vnavChar}VS`;
      case APVerticalModes.TO:
        return `${vnavChar}TO`;
      case APVerticalModes.GA:
        return `${vnavChar}GA`;
      case APVerticalModes.FLC:
        return `${vnavChar}FLC`;
      case APVerticalModes.ALT:
        return `${vnavChar}ALT`;
      case APVerticalModes.GS:
        return ' GS';
      case APVerticalModes.PATH:
        return `${vnavChar}PATH`;
      case APVerticalModes.GP:
        return ' GP';
      case APVerticalModes.PITCH:
        return `${vnavChar}PTCH`;
      case APVerticalModes.CAP: {
        const alt = this.autopilotModes.verticalAltitudeArmed;
        return alt === APAltitudeModes.ALTS ? `${vnavChar}ALTS CAP` : alt === APAltitudeModes.ALTV ? `${vnavChar}ALTV CAP` : `${vnavChar}ALT CAP`;
      }
      default:
        return ' ';
    }
  }

  /**
   * Gets the FMA display string from an AP Vertical Armed Mode.
   * @param v The computed subject input value.
   * @returns the string to display on the FMA
   */
  private getVerticalArmedString(v: APVerticalModes): string {
    switch (v) {
      case APVerticalModes.PATH:
        if (this.vnavPathMode === VNavPathMode.PathArmed) {

          return 'PATH';
        }
        return ' ';
      case APVerticalModes.FLC:
        return 'FLC';
      default:
        return ' ';
    }
  }

  /**
   * Gets the FMA display string from an AP Altitude Armed Mode.
   * @returns the string to display on the FMA
   */
  private getAltitudeArmedString(): string {
    if (this.autopilotModes.altitideCaptureArmed || this.autopilotModes.verticalActive === APVerticalModes.PATH) {
      const alt = this.autopilotModes.verticalAltitudeArmed;
      return alt === APAltitudeModes.ALTS ? 'ALTS' : alt === APAltitudeModes.ALTV ? 'ALTV' : 'ALT';
    } else {
      return '';
    }
  }

  /**
   * Gets the FMA display string from an AP Vertical Approach Armed Mode.
   * @param v The computed subject input value.
   * @returns the string to display on the FMA
   */
  private getVerticalApproachArmedString(v: APVerticalModes): string {
    switch (v) {
      case APVerticalModes.GP:
        return 'GP';
      case APVerticalModes.GS:
        return 'GS';
      default:
        return ' ';
    }
  }

  /**
   * Gets the FMA display string from an AP Lateral Active Mode.
   * @param v The computed subject input value.
   * @returns the string to display on the FMA
   */
  private getLateralActiveString(v: APLateralModes): string {
    const apprString = this.autopilotModes.apApproachModeOn ? 'APPR ' : '';
    const cdiSource = this.cdiSource.get();
    const navIndex = cdiSource.index ?? 1;
    switch (v) {
      case APLateralModes.HEADING:
        return 'HDG';
      case APLateralModes.LOC:
        return apprString + 'LOC' + navIndex;
      case APLateralModes.VOR:
        return apprString + 'VOR' + navIndex;
      case APLateralModes.BC:
        return 'BC';
      case APLateralModes.GPSS:
        return apprString + 'LNV1';
      case APLateralModes.ROLL:
        return 'ROLL';
      case APLateralModes.LEVEL:
        return 'LVL';
      case APLateralModes.TO:
        return 'TO';
      case APLateralModes.GA:
        return 'GA';
      default:
        return '';
    }
  }

  /**
   * Gets the FMA display string from an AP Lateral Armed Mode.
   * @param v The computed subject input value.
   * @returns the string to display on the FMA
   */
  private getLateralArmedString(v: APLateralModes): string {
    const apprString = this.autopilotModes.apApproachModeOn ? 'APPR ' : '';
    const cdiSource = this.cdiSource.get();
    const navIndex = cdiSource.index ?? 1;
    switch (v) {
      case APLateralModes.HEADING:
        return 'HDG';
      case APLateralModes.LOC:
        return apprString + 'LOC' + navIndex;
      case APLateralModes.VOR:
        return apprString + 'VOR' + navIndex;
      case APLateralModes.GPSS:
        return apprString + 'LNV1';
      case APLateralModes.ROLL:
        return 'ROL';
      case APLateralModes.LEVEL:
        return 'LVL';
      case APLateralModes.BC:
        return 'BC';
      default:
        return '';
    }
  }

  /**
   * A callback called when the active VNAV path mode changes.
   * @param mode The new path mode.
   * @param type The new alt capture type.
   * @param approachMode The new approach mode.
   */
  private onVNavUpdate(mode: VNavPathMode, type: VNavAltCaptureType, approachMode: ApproachGuidanceMode): void {
    this.vnavPathMode = mode;
    this.vnavAltCapType = type;
    this.approachMode = approachMode;
  }

  private handleNoPath = (): void => {
    if (this.verticalArmedSubject.get() === 'PATH' && this.pathArmedError.get()) {
      this.verticalArmedRef.instance?.classList.add('fma-invalid-mode');
    } else {
      this.verticalArmedRef.instance?.classList.remove('fma-invalid-mode');
    }
  };

  /**
   * Handles the vertical value subjects on inputs from the event bus.
   */
  private handleVerticalValueChanged(): void {
    this.altitudeArmedSubject.set(this.getAltitudeArmedString());

    if (this.autopilotModes.verticalActive === APVerticalModes.VS) {
      this.apVerticalSpeedVisible.set(true);
      const vsValue = Math.abs(this.selectedVs);
      this.verticalValueSubject.set(`${(vsValue)}`);
      this.apFlcVisible.set(false);
      if (this.selectedVs < -1) {
        this.apVerticalSpeedArrowVisible.set(true);
        this.apVerticalSpeedArrow.instance.style.transform = 'rotate(180deg)';
      } else if (this.selectedVs > 1) {
        this.apVerticalSpeedArrowVisible.set(true);
        this.apVerticalSpeedArrow.instance.style.transform = 'rotate(0deg)';
      } else {
        this.apVerticalSpeedArrowVisible.set(false);
      }
    } else if (this.autopilotModes.verticalActive === APVerticalModes.ALT || this.autopilotModes.verticalActive === APVerticalModes.CAP) {
      this.verticalValueSubject.set('');
      this.apFlcVisible.set(false);
      this.apVerticalSpeedVisible.set(false);
    } else if (this.autopilotModes.verticalActive === APVerticalModes.FLC) {
      this.verticalValueSubject.set(this.isSelectedSpeedMach ? `M${this.selectedMach.toFixed(2).replace(/^0+/, '')}` : `${Math.round(this.selectedIas)}`);
      this.apVerticalSpeedVisible.set(false);
      this.apFlcVisible.set(true);
    } else if (this.autopilotModes.verticalActive === APVerticalModes.PITCH) {
      this.verticalValueSubject.set(`${(Math.round(this.selectedPitch))}`);
      this.apVerticalSpeedVisible.set(false);
      this.apFlcVisible.set(false);
    } else {
      this.apVerticalSpeedVisible.set(false);
      this.apFlcVisible.set(false);
      this.verticalValueSubject.set('');
    }
  }


  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="fma-container">
        <div class="fma-ap-mode fma-active" ref={this.apMode}>{this.apMasterSubject}</div>
        <div class="fma-ap-mode fma-active hidden" ref={this.apMode2}>AP</div>
        <div class="fma-ap-source-arrow" ref={this.arrow}>
          <svg>
            <path d="M 0 8 l 12 -5 l 0 10 z" />
            <path d="M 12 8 l 22 0" stroke-width="2" fill="none" />
            {/* <path d="M 12 8 l 22 0 m 1 0 l -8 -5 m 8 5 l -8 5" stroke-width="2" fill="none" /> HAS THE 2ND ARROW ON IT */}
          </svg>
        </div>
        <div class="fma-active-vertical-mode fma-active" ref={this.verticalActiveRef}>{this.verticalActiveModeSubject}</div>
        <div class="fma-active-lateral-mode fma-active" ref={this.lateralActiveRef}>{this.lateralActiveModeMappedSubject}</div>
        {/* <div class="fma-armed-vertical-mode fma-armed fma-invalid-mode">{this.altitudeArmedSubject}</div> */}
        <div class="fma-armed-vertical-mode fma-armed">{this.altitudeArmedSubject}</div>
        <div class="fma-armed-lateral-mode fma-armed">{this.lateralArmedModeMappedSubject}</div>
        <div class="fma-armed-vertical-path fma-armed" ref={this.verticalArmedRef}>{this.verticalArmedSubject}</div>
        <div class="fma-armed-glideslope fma-armed">{this.verticalApproachArmedSubject}</div>
        <div class="fma-flc-speed hidden" ref={this.apFlc}>
          <svg width="31" height="20">
            <path d="M 1 11 l 18 -8 l 11 0 l 0 16 l -11 0 l -18 -8" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="2" />
          </svg>
          <div>{this.verticalValueSubject}</div>
        </div>
        <div class="fma-vs-speed hidden" ref={this.apVerticalSpeed}>
          <svg width="14" height="17">
            <path d="M 3 0 l 11 8.5 l -11 8.5 l 0 -5.5 l -3 0 l 0 -6 l 3 0 z" fill="var(--wt21-colors-cyan)" />
          </svg>
          <div class="fma-vs-speed-value">{this.verticalValueSubject}</div>
          <div class="fma-vs-arrow hidden" ref={this.apVerticalSpeedArrow}>
            <svg viewBox="0 0 8 17" height="18" width="8">
              <path d="M 4 1 l 0 16 m 0 -16 l -3 6 m 3 -6 l 3 6" fill="none" stroke="var(--wt21-colors-cyan)" stroke-width="2"></path>
            </svg>
          </div>
        </div>
        <div class="fma-control-wheel-steering fma-armed"></div>
      </div>
    );
  }
}
