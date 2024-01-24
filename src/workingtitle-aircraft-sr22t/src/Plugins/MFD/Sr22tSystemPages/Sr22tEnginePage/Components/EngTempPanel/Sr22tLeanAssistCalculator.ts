import { ArraySubject, ConsumerSubject, EventBus, MappedSubject, ObjectSubject, Subject, Subscribable, SubscribableArray, Subscription } from '@microsoft/msfs-sdk';
import { Sr22tSimvarEvents } from '../../../../Sr22tSimvarPublisher/Sr22tSimvarPublisher';
import { G1000ControlEvents } from '@microsoft/msfs-wtg1000';
import { Sr22tEngineComputerEvents } from '../../../../Sr22tEcu/Sr22tEngineComputer';

/** The type of the peak EGT data for each cylinder. */
export type PeakEgtData = {
  /** The cylinder's index, from 1 to 6. */
  index: number;
  /** The peaked EGT. */
  value: number;
  /** A value of `x` indicates that this EGT peak is the `x`th peak, from 1 to 6. */
  order: number;
  /** The current EGT, used to detect a peak. */
  current_temp: number;
}

/** The phases of the Lean Assisting Mode.*/
export enum LeanAssistPhase {
  /** Lean Assisting Mode not activated. */
  OFF,
  /** Highlights the hottest cylinder. */
  HOTTEST_CYLINDER,
  /** Highlight the most current detected EGT peak; */
  CURRENT_PEAK,
}

/** Calculates the LOP (lean of peak) of each engine cylinder, used in SR22T's Leaning Assist Mode. */
export class Sr22tLeanAssistCalculator {

  private readonly sub = this.bus.getSubscriber<Sr22tSimvarEvents & G1000ControlEvents & Sr22tEngineComputerEvents>();

  private readonly _leanAssistActivated = ConsumerSubject.create(this.sub.on('eis_lean_assist'), false);
  public readonly leanAssistActivated = this._leanAssistActivated as Subscribable<boolean>;

  private readonly _leanAssistPhase = Subject.create<LeanAssistPhase>(LeanAssistPhase.OFF);
  public readonly leanAssistPhase = this._leanAssistPhase as Subscribable<LeanAssistPhase>;

  public readonly EGT_1 = ConsumerSubject.create(this.sub.on('c1_exhaust_temp').withPrecision(0), 0);  // Fahrenheit
  public readonly EGT_2 = ConsumerSubject.create(this.sub.on('c2_exhaust_temp').withPrecision(0), 0);  // Fahrenheit
  public readonly EGT_3 = ConsumerSubject.create(this.sub.on('c3_exhaust_temp').withPrecision(0), 0);  // Fahrenheit
  public readonly EGT_4 = ConsumerSubject.create(this.sub.on('c4_exhaust_temp').withPrecision(0), 0);  // Fahrenheit
  public readonly EGT_5 = ConsumerSubject.create(this.sub.on('c5_exhaust_temp').withPrecision(0), 0);  // Fahrenheit
  public readonly EGT_6 = ConsumerSubject.create(this.sub.on('c6_exhaust_temp').withPrecision(0), 0);  // Fahrenheit

  public readonly EGTs = [
    this.EGT_1,
    this.EGT_2,
    this.EGT_3,
    this.EGT_4,
    this.EGT_5,
    this.EGT_6
  ];

  private readonly _peakedEgtIndexArray = ArraySubject.create<number>([]);
  public readonly peakedEgtIndexArray = this._peakedEgtIndexArray as SubscribableArray<number>;

  private readonly EGT_1_Peak = ObjectSubject.create<PeakEgtData>({ index: 0, value: -1, order: -1, current_temp: -1 });
  private readonly EGT_2_Peak = ObjectSubject.create<PeakEgtData>({ index: 1, value: -1, order: -1, current_temp: -1 });
  private readonly EGT_3_Peak = ObjectSubject.create<PeakEgtData>({ index: 2, value: -1, order: -1, current_temp: -1 });
  private readonly EGT_4_Peak = ObjectSubject.create<PeakEgtData>({ index: 3, value: -1, order: -1, current_temp: -1 });
  private readonly EGT_5_Peak = ObjectSubject.create<PeakEgtData>({ index: 4, value: -1, order: -1, current_temp: -1 });
  private readonly EGT_6_Peak = ObjectSubject.create<PeakEgtData>({ index: 5, value: -1, order: -1, current_temp: -1 });

  private _egtPeaks = [
    this.EGT_1_Peak,
    this.EGT_2_Peak,
    this.EGT_3_Peak,
    this.EGT_4_Peak,
    this.EGT_5_Peak,
    this.EGT_6_Peak,
  ];
  public readonly egtPeaks: Subscribable<PeakEgtData>[] = this._egtPeaks;

  private readonly _peakInFocusIndex = Subject.create<number>(-1);
  public readonly peakInFocusIndex = this._peakInFocusIndex as Subscribable<number>;

  private readonly _peakInFocusLabel = Subject.create<string>('');
  public readonly peakInFocusLabel = this._peakInFocusLabel as Subscribable<string>;

  private readonly _deltaPeak = Subject.create<number>(0);
  public readonly deltaPeak = this._deltaPeak as Subscribable<number>;

  private subscriptions: Subscription[] = [];

  /**
   * The constructor
   * @param bus An instance of the event bus.
   */
  constructor(private readonly bus: EventBus) {

    this.subscriptions = [
      this._leanAssistActivated.sub((leanAssistActivated) => {
        if (leanAssistActivated === false) {
          this.resetPeakData();
        } else {
          this._leanAssistPhase.set(LeanAssistPhase.HOTTEST_CYLINDER);
        }
      }, true),

      MappedSubject.create(
        ([leanAssistPhase, ...EGTs]) => {
          if (leanAssistPhase === LeanAssistPhase.HOTTEST_CYLINDER) {
            this._peakInFocusIndex.set(this.findHottestIndex(EGTs));
          }
        },
        this._leanAssistPhase,
        ...this.EGTs,
      ),

      this.EGT_1.sub((v) => this.setPeak(v, this.EGT_1_Peak), true),
      this.EGT_2.sub((v) => this.setPeak(v, this.EGT_2_Peak), true),
      this.EGT_3.sub((v) => this.setPeak(v, this.EGT_3_Peak), true),
      this.EGT_4.sub((v) => this.setPeak(v, this.EGT_4_Peak), true),
      this.EGT_5.sub((v) => this.setPeak(v, this.EGT_5_Peak), true),
      this.EGT_6.sub((v) => this.setPeak(v, this.EGT_6_Peak), true),

      this.EGT_1_Peak.sub(this.onEgtPeakChange.bind(this)),
      this.EGT_2_Peak.sub(this.onEgtPeakChange.bind(this)),
      this.EGT_3_Peak.sub(this.onEgtPeakChange.bind(this)),
      this.EGT_4_Peak.sub(this.onEgtPeakChange.bind(this)),
      this.EGT_5_Peak.sub(this.onEgtPeakChange.bind(this)),
      this.EGT_6_Peak.sub(this.onEgtPeakChange.bind(this)),

      MappedSubject.create(
        ([index, egt1, egt2, egt3, egt4, egt5, egt6, ...egtPeaks]) => {
          if (index > -1) {
            const egtValues = [egt1, egt2, egt3, egt4, egt5, egt6];
            const peak = egtPeaks[index]?.value;
            const current = egtValues[index];
            this._deltaPeak.set(peak > 0 ? current - peak : 0);
          }
        },
        this._peakInFocusIndex,
        this.EGT_1,
        this.EGT_2,
        this.EGT_3,
        this.EGT_4,
        this.EGT_5,
        this.EGT_6,
        ...this._egtPeaks,
      )
    ];
  }

  /** Resets the data of EGT peaks to their initial values. */
  private resetPeakData(): void {
    this._egtPeaks.map((peak) => peak.set({ value: -1, order: -1, current_temp: -1 }));
    this._peakedEgtIndexArray.clear();
    this._peakInFocusIndex.set(-1);
    this._peakInFocusLabel.set('');
    this._deltaPeak.set(0);
    this._leanAssistPhase.set(LeanAssistPhase.OFF);
  }

  /**
   * Callback when a PeakEgtData object changes its values.
   * Decides whether this EGT should be in focus, or whether this EGT peak should be marked as the first/last peak.
   * @param peak The PeakEgtData object
   */
  private onEgtPeakChange(peak: PeakEgtData): void {
    if (peak.value !== -1) {
      this._leanAssistPhase.set(LeanAssistPhase.CURRENT_PEAK);

      if (!this._peakedEgtIndexArray.getArray().includes(peak.index)) {
        this._peakedEgtIndexArray.insert(peak.index);
        const orderOfPeak = this._peakedEgtIndexArray.length;
        this._egtPeaks[peak.index].set('order', orderOfPeak);
        this._peakInFocusIndex.set(peak.index);

        switch (orderOfPeak) {
          case 1:
            this._peakInFocusLabel.set('1st');
            return;
          case 6:
            this._peakInFocusLabel.set('Last');
            return;
          default:
            this._peakInFocusLabel.set('');
            return;
        }
      }
    }
  }

  /**
   * Returns the index of the hottest cylinder.
   * @param values The temperature values.
   * @returns The index of the hottest cylinder.
   */
  private findHottestIndex(values: readonly number[]): number {
    let hottestIndex = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > values[hottestIndex]) {
        hottestIndex = i;
      }
    }
    return hottestIndex;
  }

  /**
   * Sets the newest peak temperature of a cylinder.
   * @param currentTemp The current EGT of the cylinder.
   * @param peakData The EGT data object of the cylinder.
   */
  private setPeak(currentTemp: number, peakData: ObjectSubject<PeakEgtData>): void {
    if (this.leanAssistActivated.get() && currentTemp > 1000) {
      if (currentTemp > peakData.get().current_temp) {
        peakData.set('current_temp', currentTemp);
      }

      if (currentTemp < peakData.get().current_temp - 10) {
        peakData.set('value', peakData.get().current_temp);
        return;
      }
    }
  }

  /** Pauses the subscriptions when the DisplayComponent is paused. */
  public pause(): void {
    this.subscriptions.map((sub) => sub.pause());
  }

  /** Resumes the subscriptions when the DisplayComponent is resumed. */
  public resume(): void {
    this.subscriptions.map((sub) => sub.resume(true));
  }

  /** Destroys the subscriptions when the DisplayComponent is destroyed. */
  public destroy(): void {
    this.subscriptions.map((sub) => sub.destroy());
  }
}

