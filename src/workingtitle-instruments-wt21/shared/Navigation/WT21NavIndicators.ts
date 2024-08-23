/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ControlEvents, EventBus, ExtractSubjectTypes, NavEvents, NavSourceType, Publisher, SimVarValueType, Subject } from '@microsoft/msfs-sdk';

import { WT21DisplayUnitFsInstrument, WT21DisplayUnitType } from '../WT21DisplayUnitFsInstrument';
import { NavBaseEvents, NavBaseFields } from './NavBase';
import { NavIndicator, NavIndicatorControlEvents, NavIndicatorEvents, NavIndicators } from './NavIndicators/NavIndicators';
import { NavSourceBase, NavSources } from './NavSources/NavSourceBase';
import { WT21NavigationUserSettings } from './WT21NavigationUserSettings';

/** The names of the available nav sources in the WT21. */
const navSourceNames = [
  'NAV1',
  'NAV2',
  'ADF',
  'FMS1',
  'FMS2'
] as const;

/** The names of the available nav sources in the WT21 for the course needle. */
const courseNeedleNavSourceNames = [
  'FMS1',
  'NAV1',
  'NAV2',
] as const;

/** The names of the nav indicators in the WT21. */
const navIndicatorNames = [
  'bearingPointer1',
  'bearingPointer2',
  'courseNeedle',
  'ghostNeedle'
] as const;

/** The names of the available nav sources in the WT21. */
export type WT21NavSourceNames = typeof navSourceNames;
/** */
export type WT21NavSourceName = WT21NavSourceNames[number];
/** The names of the available nav sources in the WT21 for the course needle. */
export type WT21CourseNeedleNavSourceNames = typeof courseNeedleNavSourceNames;
/** */
export type WT21CourseNeedleNavSourceName = WT21CourseNeedleNavSourceNames[number];
/** */
export type WT21NavSource = NavSourceBase<WT21NavSourceNames>;
/** */
export type WT21NavSources = NavSources<WT21NavSourceNames>;
/** */
export type WT21CourseNeedleNavSources = NavSources<WT21CourseNeedleNavSourceNames>;
/** */
export type WT21CourseNeedleNavSource = NavSourceBase<WT21CourseNeedleNavSourceNames>;

/** The names of the nav indicators in the WT21. */
export type WT21NavIndicatorNames = typeof navIndicatorNames;
/** */
export type WT21NavIndicatorName = WT21NavIndicatorNames[number];
/** */
export type WT21NavIndicator = NavIndicator<WT21NavSourceNames>;
/** */
export type WT21NavIndicators = NavIndicators<WT21NavSourceNames, WT21NavIndicatorNames>;

/** Field changed events for WT21 Nav Source fields. */
export type WT21NavSourceEvents<Source extends WT21NavSourceNames[number], Index extends number> =
  NavBaseEvents<`nav_src_${Source}_${Index}`, NavBaseFields>

/** Field changed events for WT21 Nav Indicator fields. */
export type WT21NavIndicatorEvents<Indicator extends WT21NavIndicatorNames[number]> =
  NavIndicatorEvents<WT21NavSourceNames, Indicator>

/** Control events allowing setting values of WT21 Nav Indicator fields. */
type WT21NavIndicatorControlEvents<Indicator extends WT21NavIndicatorNames[number], Fields extends { [key: string]: any } = {}> =
  NavIndicatorControlEvents<WT21NavSourceNames, WT21NavIndicatorNames, Indicator, Fields>

/** @inheritdoc */
export class WT21CourseNeedleNavIndicator extends NavIndicator<WT21NavSourceNames> {
  public readonly standbyPresetSource: Subject<WT21NavSource>;
  public readonly standbyPresetSourceLabel = Subject.create('');
  private readonly standbySources: WT21NavSource[] = [];
  private readonly navEventsPublisher: Publisher<NavEvents>;
  private standbySourceIndex = 0;

  /** NavIndicator constructor.
   * @param navSources The possible nav sources that could be pointed to.
   * @param displayUnit The parent display unit.
   * @param bus The bus.
   */
  public constructor(navSources: WT21NavSources, private readonly displayUnit: WT21DisplayUnitFsInstrument, readonly bus: EventBus) {
    super(navSources, 'FMS1');

    this.navEventsPublisher = this.bus.getPublisher<NavEvents>();

    this.standbySources = [
      this.navSources.get('NAV1'),
      this.navSources.get('NAV2'),
    ];
    this.standbyPresetSource = Subject.create(this.getStandbySource());

    this.updateStandbySource();

    if (this.displayUnit.displayUnitType === WT21DisplayUnitType.Pfd) {
      this.source.sub(x => this.handleSourceChange(x!), true);

      this.bus.getSubscriber<ControlEvents>().on('cdi_src_set').handle((src) => {
        if (src.type === NavSourceType.Gps) {
          this.setNewSource('FMS1');
        } else if (src.type === NavSourceType.Nav) {
          this.setNewSource(`NAV${src.index}` as 'NAV1' | 'NAV2');
        }
      });
    }
  }

  public readonly setNewSource = (newSourceName: WT21CourseNeedleNavSourceName): void => {
    if (this.source.get()!.name === newSourceName) { return; }
    if (this.standbySources[this.standbySourceIndex].name === newSourceName) {
      this.navSwap();
    } else {
      this.presetIncrease();
      this.navSwap();
    }
  };

  private readonly handleSourceChange = (newSource: NavSourceBase<WT21NavSourceNames>): void => {
    SimVar.SetSimVarValue('GPS DRIVES NAV1', SimVarValueType.Bool, newSource.getType() === NavSourceType.Gps);
    if (newSource.getType() === NavSourceType.Nav) {
      SimVar.SetSimVarValue('AUTOPILOT NAV SELECTED', SimVarValueType.Number, newSource.index);
    }

    // Publishing this so AP stuff can use it on the FMC.
    this.navEventsPublisher.pub('cdi_select', {
      index: newSource.index,
      type: newSource.getType(),
    }, true);
  };

  public readonly navSwap = (): void => {
    const activeSource = this.source.get()!;
    const newActiveSource = this.getStandbySource();
    this.setSource(newActiveSource.name);
    this.standbySources[this.standbySourceIndex] = activeSource;
    this.updateStandbySource();
  };

  public readonly presetIncrease = (): void => {
    this.standbySourceIndex++;
    if (this.standbySourceIndex === this.standbySources.length) {
      this.standbySourceIndex = 0;
    }
    this.updateStandbySource();
  };

  public readonly presetDecrease = (): void => {
    this.standbySourceIndex--;
    if (this.standbySourceIndex < 0) {
      this.standbySourceIndex = this.standbySources.length - 1;
    }
    this.updateStandbySource();
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private getStandbySource(): WT21NavSource {
    return this.standbySources[this.standbySourceIndex];
  }

  // eslint-disable-next-line jsdoc/require-jsdoc
  private updateStandbySource(): void {
    this.standbyPresetSource.get().isLocalizer.unsub(this.updateStandbySourceLabel);
    this.standbyPresetSource.set(this.getStandbySource());
    this.standbyPresetSource.get().isLocalizer.sub(this.updateStandbySourceLabel);
    this.updateStandbySourceLabel();
  }

  private readonly updateStandbySourceLabel = (): void => {
    this.standbyPresetSourceLabel.set(this.createStandbySourceLabel());
  };

  // eslint-disable-next-line jsdoc/require-jsdoc
  private createStandbySourceLabel(): string {
    const source = this.getStandbySource();
    if (source.getType() === NavSourceType.Nav) {
      if (source.isLocalizer.get()) {
        return 'LOC' + source.index;
      } else {
        return 'VOR' + source.index;
      }
    } else {
      return 'FMS' + source.index;
    }
  }
}

/** Events for controlling the ghost needle. */
export type WT21GhostNeedleControlEvents =
  WT21NavIndicatorControlEvents<'ghostNeedle', ExtractSubjectTypes<Pick<WT21GhostNeedleNavIndicator, 'isArmed' | 'isVisible'>>>

/** @inheritdoc */
export class WT21GhostNeedleNavIndicator extends NavIndicator<WT21NavSourceNames> {
  /** Nav-to-nav is armed and we are receiving a localizer signal. */
  public readonly isArmed = Subject.create(false);
  /** If nav-to-nav is armed and waiting for a localizer signal. */
  public readonly isVisible = Subject.create(false);

  /** NavIndicator constructor.
   * @param navSources The possible nav sources that could be pointed to.
   * @param bus The bus.
   */
  public constructor(navSources: WT21NavSources, private readonly bus: EventBus) {
    super(navSources, 'NAV1');

    const ghostControl = this.bus.getSubscriber<WT21GhostNeedleControlEvents>();
    ghostControl.on('nav_ind_ghostNeedle_set_isArmed').handle(this.isArmed.set.bind(this.isArmed));
    ghostControl.on('nav_ind_ghostNeedle_set_isVisible').handle(this.isVisible.set.bind(this.isVisible));

    this.isArmed.sub(this.updateVisibility, true);
    this.hasLocalizer.sub(this.updateVisibility, true);
  }

  private readonly updateVisibility = (): void => {
    const shouldBeVisible = this.isArmed.get() && this.hasLocalizer.get();
    this.isVisible.set(!!shouldBeVisible);
  };
}

// eslint-disable-next-line jsdoc/require-jsdoc
type WT21BearingPointer1ControlEvents = WT21NavIndicatorControlEvents<'bearingPointer1'>;
// eslint-disable-next-line jsdoc/require-jsdoc
type WT21BearingPointer2ControlEvents = WT21NavIndicatorControlEvents<'bearingPointer2'>;

/** Events for controlling the WT21 bearing pointers. Sync should always be true for these events. */
export type WT21BearingPointerControlEvents = WT21BearingPointer1ControlEvents & WT21BearingPointer2ControlEvents;

/** @inheritdoc */
export class WT21BearingPointerNavIndicator extends NavIndicator<WT21NavSourceNames> {

  /** @inheritdoc */
  public constructor(
    navSources: NavSources<WT21NavSourceNames>,
    bus: EventBus,
    index: 1 | 2,
    sourceName: WT21NavSourceNames[number] | null = null,
  ) {
    super(navSources, sourceName);

    // If the source is tuned to a localizer, then turn the bearing pointer off
    this.isLocalizer.sub(isLocalizer => {
      if (this.source.get() !== null && isLocalizer) {
        this.setSource(null);
      }
    });

    const bearingControl = bus.getSubscriber<WT21BearingPointerControlEvents>();
    // TODO Find a fancy way to have the NavIndicator base class handle this event
    bearingControl.on(`nav_ind_bearingPointer${index}_set_source`).handle(newSource => {
      this.setSource(newSource);
    });

    const navIndicatorSettings = WT21NavigationUserSettings.getManager(bus);
    const bearingPointerSourceSetting = navIndicatorSettings.getSetting(`bearingPointer${index}Source`);

    const loadedSource = bearingPointerSourceSetting.value === false ? null : bearingPointerSourceSetting.value;
    this.setSource(loadedSource);

    this.source.sub(x => {
      bearingPointerSourceSetting.value = x === null ? false : x.name;
    });
  }
}
