import {
  BitFlags, ComponentProps, DebounceTimer, DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, SubscribableMapFunctions, SubscribableUtils,
  VNode
} from '@microsoft/msfs-sdk';

import { AutopilotDataProvider, Epic2ApLateralMode, Epic2ApVerticalMode, FlightDirectorCouplingFlags } from '@microsoft/msfs-epic2-shared';

import './Fma.css';

/** The flight mode annunciator props. */
export interface FmaProps extends ComponentProps {
  /** An autopilot data provider. */
  autopilotDataProvider: AutopilotDataProvider,
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The flight mode annunciator component. */
export class Fma extends DisplayComponent<FmaProps> {
  private static readonly AP_FLASH_TIME = 3000;

  private readonly apShortFlashActive = Subject.create(false);
  private readonly apFlashActive = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.apShortFlashActive,
    this.props.autopilotDataProvider.apAbnormalDisengage,
  );
  private readonly apFlashTimer = new DebounceTimer();
  private readonly apText = this.props.autopilotDataProvider.tcsEngaged.map((v) => v ? 'TCS' : 'AP');
  private readonly apHidden = MappedSubject.create(
    SubscribableMapFunctions.nor(),
    this.props.autopilotDataProvider.apEngaged,
    this.apFlashActive,
  );
  private readonly activeVerticalMode = MappedSubject.create(
    ([verticalActive, isOverspeedActive]) => isOverspeedActive ? 'MxSPD' : verticalActive,
    this.props.autopilotDataProvider.verticalActive,
    this.props.autopilotDataProvider.overspeedProtectionActive,
  );

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.autopilotDataProvider.apEngaged.sub((v) => {
      if (v) {
        this.apFlashTimer.clear();
        this.apShortFlashActive.set(false);
      } else if (!this.apFlashActive.get()) {
        this.apShortFlashActive.set(true);
        this.apFlashTimer.schedule(() => this.apShortFlashActive.set(false), Fma.AP_FLASH_TIME);
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{ 'fma': true, 'hidden': this.props.declutter }}>
      <FmaSlot
        slotType='lateral'
        activeModeText={this.props.autopilotDataProvider.lateralActive}
        activeModeHidden={this.props.autopilotDataProvider.lateralActive.map((v) => v === Epic2ApLateralMode.None)}
        armedModeText={this.props.autopilotDataProvider.lateralArmed}
        armedModeHidden={this.props.autopilotDataProvider.lateralArmed.map((v) => v === Epic2ApLateralMode.None)}
      />
      <div class={{
        'coupling-arrow': true,
        'visibility-hidden': this.props.autopilotDataProvider.fdCoupling.map((v) => !BitFlags.isAll(v, FlightDirectorCouplingFlags.Left)),
      }}>
        <svg viewBox="0 0 16 38" style="width: 16px; height: 38px;">
          <path d="M 1,19 l 14,-17 l0,34 l-14,-17" />
        </svg>
      </div>
      <div class={{
        'ap': true,
        'active': true,
        'shaded-box': true,
        'visibility-hidden': this.apHidden,
        'flash-red': this.apFlashActive,
        'amber': this.props.autopilotDataProvider.tcsEngaged,
      }}>
        {this.apText}
      </div>
      <div class={{
        'yd': true,
        'active': true,
        'shaded-box': true,
        'visibility-hidden': this.props.autopilotDataProvider.ydEngaged.map((v) => !v),
      }}>
        YD
      </div>
      <div class={{
        'coupling-arrow': true,
        'visibility-hidden': this.props.autopilotDataProvider.fdCoupling.map((v) => !BitFlags.isAll(v, FlightDirectorCouplingFlags.Right)),
      }}>
        <svg viewBox="0 0 18 38" style="width: 18px; height: 38px;" visibility={this.props.autopilotDataProvider.fdCoupling.map((v) => v & FlightDirectorCouplingFlags.Right ? 'inherit' : 'hidden')}>
          <path d="M 15,19 l -14,-17 l0,34 l14,-17" />
        </svg>
      </div>
      <FmaSlot
        slotType='vertical'
        activeModeText={this.activeVerticalMode}
        activeModeHidden={this.props.autopilotDataProvider.verticalActive.map((v) => v === Epic2ApVerticalMode.None)}
        activeModeAmber={this.props.autopilotDataProvider.overspeedProtectionActive}
        armedModeText={this.props.autopilotDataProvider.verticalArmedText}
        armedModeHidden={this.props.autopilotDataProvider.verticalArmedText.map((v) => v === '')}
      />
    </div>;
  }
}

/** Props for the FMA slot. */
export interface FmaSlotProps extends ComponentProps {
  /** Whether the slot is a lateral or vertical mode. */
  slotType: 'lateral' | 'vertical',
  /** The text to display for the currently active mode. */
  activeModeText: Subscribable<string>,
  /** Whether the active mode is currently hidden. */
  activeModeHidden: Subscribable<boolean>,
  /** Whether the active mode should be shown in amber rather than green. */
  activeModeAmber?: Subscribable<boolean>,
  /** The text to display for the currently armed mode. */
  armedModeText: Subscribable<string>,
  /** Whether the armed mode is currently hidden. */
  armedModeHidden: Subscribable<boolean>,
}

/** An FMA lateral or vertical mode slot, including both armed and active mode annunciation. */
export class FmaSlot extends DisplayComponent<FmaSlotProps> {
  private static readonly SLIDE_TIME = 550;
  private static readonly FLASH_TIME = 4000;
  private static readonly ARMED_MODE_DEBOUNCE_TIME = 500;

  private readonly activeModeFlashActive = Subject.create(false);
  private readonly activeModeFlashTimer = new DebounceTimer();
  private readonly activeModeSlideActive = Subject.create(false);
  private readonly activeModeSlideTimer = new DebounceTimer();

  private readonly activeModeAmber = SubscribableUtils.toSubscribable(this.props.activeModeAmber ?? false, true);
  private readonly activeModeFlashAmber = MappedSubject.create(SubscribableMapFunctions.and(), this.activeModeFlashActive, this.activeModeAmber);
  private readonly activeModeFlashGreen = MappedSubject.create(([flash, amber]) => flash && !amber, this.activeModeFlashActive, this.activeModeAmber);

  private readonly armedModeHidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.armedModeHidden,
    this.activeModeSlideActive,
  );

  private armedModeDebounceTimer = new DebounceTimer();
  private armedModeDebounced = Subject.create<string>('');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.armedModeText.sub((v) => {
      this.armedModeDebounceTimer.schedule(() => this.armedModeDebounced.set(v), FmaSlot.ARMED_MODE_DEBOUNCE_TIME);
    }, true);

    this.props.activeModeText.sub((v) => {
      if (v === '') {
        return;
      }

      if (this.armedModeDebounced.get() === v) {
        // The armed mode transitioned into the active mode.
        // We need a smoooooth slide animation.
        if (!this.activeModeSlideTimer.isPending()) {
          this.activeModeFlashActive.set(false);
          this.activeModeSlideActive.set(true);

          this.activeModeSlideTimer.schedule(() => {
            this.activeModeSlideActive.set(false);

            // After the slide we still need to flash the new mode.
            if (!this.activeModeFlashTimer.isPending()) {
              this.activeModeFlashActive.set(true);
              this.activeModeFlashTimer.schedule(() => this.activeModeFlashActive.set(false), FmaSlot.FLASH_TIME);
            }
          }, FmaSlot.SLIDE_TIME);
        }
      } else if (!this.activeModeSlideTimer.isPending()) {
        // The active mode changed directly so we just need a regular flash.
        if (!this.activeModeFlashTimer.isPending()) {
          this.activeModeFlashActive.set(true);
          this.activeModeFlashTimer.schedule(() => this.activeModeFlashActive.set(false), FmaSlot.FLASH_TIME);
        }
      }
    });
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{
      'fma-slot': true,
      [this.props.slotType]: true,
      'shaded-box': this.activeModeSlideActive,
    }}>
      <div class={{
        'armed': true,
        'shaded-box': true,
        'visibility-hidden': this.armedModeHidden,
      }}>
        {this.props.armedModeText}
      </div>
      <div class={{
        'active': true,
        'shaded-box': this.activeModeSlideActive.map((v) => !v),
        'visibility-hidden': this.props.activeModeHidden,
        'flash-amber': this.activeModeFlashAmber,
        'flash-green': this.activeModeFlashGreen,
        'slide': this.activeModeSlideActive,
        'amber': this.props.activeModeAmber ? this.props.activeModeAmber : false,
      }}>
        {this.props.activeModeText}
      </div>
    </div>;
  }
}
