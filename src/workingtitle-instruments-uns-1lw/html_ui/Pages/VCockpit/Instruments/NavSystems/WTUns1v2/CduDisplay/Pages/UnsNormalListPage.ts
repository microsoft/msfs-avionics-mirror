import {
  AirportFacility, AirwayData, DisplayField, Facility, FacilityType, FmcFormatterOutput, FmcPagingEvents, FmcRenderTemplate, GeoPointInterface, ICAO,
  IntersectionFacility, LegDefinition, MappedSubject, NdbFacility, NearestContext, NearestSubscription, RawFormatter, Subject, Subscribable, Subscription,
  UnitType, UserFacility, VorFacility
} from '@microsoft/msfs-sdk';

import { UnsFms } from '../../Fms';
import { UnsNearestContextEvents } from '../../Fms/Navigation/UnsNearestContext';
import { UnsDisplayField } from '../Components/UnsDisplayField';
import { MultiColumnPickListData, UnsMultiColumnPickList } from '../Components/UnsMultiColumnPickList';
import { PickListData, UnsPickList, UnsPickListBorder } from '../Components/UnsPickList';
import { UnsTextInputField, WritableUnsFieldState } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduParsers } from '../UnsCduIOUtils';
import { FmcDialogPageResult, UnsCduCursorPath, UnsFmcDialogPage } from '../UnsFmcPage';

/** The category to display on the list page. */
// TODO Add 'vor/plt', 'rte', and 'airways'
export type NormalListCategory = 'apt' | 'ndb' | 'int' | 'vor' | 'airways'; // | 'vor/plt' | 'rte'

/** Which category options to show on the page. */
export type NormalListSearchType = 'ALL' | 'ALL_FACILITIES' | NormalListCategory;

/** Input data for the UnsListPage */
export interface UnsListPageInput {
  /** The search type. */
  searchType: NormalListSearchType,
  /** The reference leg, or null. */
  referenceLeg: LegDefinition | undefined,
}

/** Item for a Normal List. */
interface NormalListItem<T extends Facility | AirwayData = Facility | AirwayData> {
  /** The facility or airway object. */
  object: T,
  /** The distance away of a facility in NM. */
  distance?: number,
  /** The facility or airway's ident. */
  ident: string,
}

/** Facility array pair */
type FacilityArrayPair = [NearestSubscription<Facility>, NormalListItem[]];

/** A UnsNormalListPage store. */
class UnsNormalListPageStore {
  private static SortFunction = (a: NormalListItem<Facility>, b: NormalListItem<Facility>): number => (a.distance || 0) - (b.distance || 0);

  public referenceLeg = Subject.create<LegDefinition | undefined>(undefined);
  public selectedAirway = Subject.create<AirwayData | undefined>(undefined);

  public static DEFAULT_DATA: PickListData = {
    data: [],
    itemsPerPage: 7,
    compactSideBorders: true,
    lowTopBorder: true,
  };

  public static DEFAULT_AIRWAY_WAYPOINT_DATA: PickListData = {
    data: [],
    itemsPerPage: 12,
  };

  private readonly airports: NormalListItem<AirportFacility>[] = [];
  private readonly ndbs: NormalListItem<NdbFacility>[] = [];
  private readonly intersections: NormalListItem<IntersectionFacility>[] = [];
  private readonly vors: NormalListItem<VorFacility>[] = [];
  private readonly plts: NormalListItem<UserFacility>[] = [];
  private airways: NormalListItem<AirwayData>[] = [];

  public readonly airwaysAvailable = Subject.create(false);

  private selectedArray: NormalListItem[];

  private categoryLocalArrayMap: Record<NormalListCategory, NormalListItem[]> = {
    apt: this.airports,
    ndb: this.ndbs,
    int: this.intersections,
    vor: this.vors,
    airways: this.airways,
    // 'vor/plt': this.plts, // FIXME Create combined array
  };

  private localArraySubMap: Map<NormalListItem[], Subscription> = new Map();

  private itemsForList: NormalListItem[] = [];
  private itemsForAirwayWaypointList: NormalListItem<Facility>[] = [];

  private readonly _pickListData = Subject.create<PickListData>(UnsNormalListPageStore.DEFAULT_DATA);
  public readonly pickListData: Subscribable<PickListData> = this._pickListData;

  private readonly _airwayWaypointPickListData = Subject.create<MultiColumnPickListData>(UnsNormalListPageStore.DEFAULT_DATA);
  public readonly airwayWaypointPickListData: Subscribable<MultiColumnPickListData> = this._airwayWaypointPickListData;

  private readonly _totalEntriesForCategory = Subject.create(0);
  public readonly totalEntriesForCategory: Subscribable<number> = this._totalEntriesForCategory;

  private readonly subs: Subscription[] = [];
  private readonly referencePosSub: Subscription;

  /**
   * Constructor
   * @param referencePositionSub Subscription to a position to use as a reference for distance calculations.
   * @param subPageIndexSub Subscription to the currently selected subpage.
   * @param currentCategorySub Subject of the currently selected category.
   * @param ListTitleField The list title field.
   * @param dataFormatter A function which returns the appropriate data formatting function.
   * @param fms The UnsFms class
   */
  constructor(
    private referencePositionSub: Subscribable<GeoPointInterface>,
    private subPageIndexSub: Subscribable<number>,
    private currentCategorySub: Subject<NormalListCategory>,
    private ListTitleField: UnsTextInputField<any>,
    private dataFormatter: () => (item: NormalListItem, index: number) => string,
    private fms: UnsFms
  ) {
    const initialCategory: NormalListCategory = currentCategorySub.get();
    this.selectedArray = this.categoryLocalArrayMap[initialCategory];

    // After array change -> duplicate the array -> recalculate all distances -> sort local array by distance -> set pickListData
    // After reference pos change       ->      /

    NearestContext.onInitialized(({ airports, ndbs, intersections, vors, usrs }: NearestContext): void => {
      const arrayPairs: FacilityArrayPair[] = [
        [airports, this.airports],
        [ndbs, this.ndbs],
        [intersections, this.intersections],
        [vors, this.vors],
        [usrs, this.plts],
      ];

      arrayPairs.forEach(([subArray, localArray]): void => {
        const sub: Subscription = subArray.sub(() => {
          this.updateLocalArray(
            subArray,
            localArray as NormalListItem<Facility>[],
            this.referencePositionSub.get(),
          );
        }, false, true);

        this.subs.push(sub);
        this.localArraySubMap.set(localArray, sub);
      });

      this.getSubForCategory(initialCategory).resume(true);
    });

    this.referencePosSub = this.referencePositionSub.sub((pos: GeoPointInterface): void => {
      if (this.selectedArray.find((object) => object.distance)) {
        this.recalculateDistances(pos, this.selectedArray as NormalListItem<Facility>[]);
      }
    });

    this.subPageIndexSub.sub(() => this.updatePickListData());
  }

  /**
   * Gets a subscription for a given list category.
   * @param category The category.
   * @returns A subscription.
   * @throws If subscription cannot be found.
   */
  private getSubForCategory(category: NormalListCategory): Subscription {
    const localArray: NormalListItem[] = this.categoryLocalArrayMap[category];
    const subscription: Subscription | undefined = this.localArraySubMap.get(localArray);

    if (!subscription) {
      throw new Error(`UnsNormalListPageStore: Subscription not found for category ${category}`);
    }

    return subscription;
  }

  /**
   * Clears all airways from the store; used when list page is closed
   */
  public clearAirways(): void {
    this.airways = [];
    this.airwaysAvailable.set(false);
  }

  /**
   * Updates a local array.
   * @param nearestSub A subscribable array of nearest facilities.
   * @param localArray The local array of nearest facilities.
   * @param referencePosition The reference position for distance calculations.
   */
  private updateLocalArray(
    nearestSub: NearestSubscription<Facility>,
    localArray: NormalListItem<Facility>[],
    referencePosition: GeoPointInterface,
  ): void {
    localArray.length = 0;
    nearestSub.getArray().forEach((facility: Facility) => localArray.push({
      object: facility,
      distance: -1,
      ident: ICAO.getIdent(facility.icao),
    }));
    this.recalculateDistances(referencePosition, localArray);
  }

  /**
   * Recalculates the distances from the list item to the reference position.
   * @param pos The reference position to calculate distances against.
   * @param array The facility array to recalculate against.
   */
  private recalculateDistances(pos: GeoPointInterface, array: NormalListItem<Facility>[]): void {
    array.forEach(item => {
      item.distance = UnitType.NMILE.convertFrom(pos.distance(item.object), UnitType.GA_RADIAN);
    });
    array.sort(UnsNormalListPageStore.SortFunction);

    // console.table(array.map(({ facility, distance }) => ({ name: facility.name, distance })));

    if (array === this.selectedArray) {
      this.updatePickListData();
    }
  }

  /** Updates the data rendered by the pick list. */
  private updatePickListData(): void {
    const pageIndex: number = this.subPageIndexSub.get();
    const startIndex: number = (pageIndex - 1) * 7;

    this.itemsForList = this.selectedArray
      .slice(startIndex, startIndex + 7)
      .sort((a, b) => a.ident.localeCompare(b.ident));

    this.formatAndSetPickListData();
    this._totalEntriesForCategory.set(this.selectedArray.length);
  }

  /** Set the pick list data. */
  public formatAndSetPickListData(): void {
    this._pickListData.set({
      ...UnsNormalListPageStore.DEFAULT_DATA,
      title: this.ListTitleField,
      data: this.itemsForList.map(this.dataFormatter()),
    });
  }

  /**
   * Sets the pick list data for the airway waypoints
   * @param waypoints List of all waypoints from the airway
   */
  public setAirwayWaypointPickListData(waypoints: Facility[]): void {
    this.itemsForAirwayWaypointList = waypoints.filter((waypoint) => waypoint.icao !== this.referenceLeg.get()?.leg.fixIcao).map((facility): NormalListItem<Facility> => ({
      object: facility,
      distance: undefined,
      ident: ICAO.getIdent(facility.icao),
    })).sort((a, b) => a.ident.localeCompare(b.ident));

    this._airwayWaypointPickListData.set({
      ...UnsNormalListPageStore.DEFAULT_AIRWAY_WAYPOINT_DATA,
      data: this.itemsForAirwayWaypointList.map(this.dataFormatter()),
    });

    this._totalEntriesForCategory.set(waypoints.length);
  }

  /**
   * Change the category supplying the pick list.
   * @param category The new category.
   */
  public changeCategory(category: NormalListCategory): void {
    this.selectedArray = this.categoryLocalArrayMap[category];
    this.currentCategorySub.set(category);

    this.manageSubscriptions('pause');
    if (category !== 'airways') {
      this.getSubForCategory(category).resume(true);
    }

    this.updatePickListData();
  }

  /**
   * Returns the facility or airway which corresponds to a given list index.
   * @param index The index to search.
   * @returns A facility or airway.
   */
  public getItemFromListIndex(index: number): Facility | AirwayData {
    return this.itemsForList[index].object;
  }

  /**
   * Returns the facility or airway which corresponds to a given list index.
   * @param selectedIndex The index to search.
   * @param subPageIndex The index of the sub page which the variable is stored on
   * @returns A facility or airway.
   */
  public getItemFromAirwayListIndex(selectedIndex: number, subPageIndex: number): NormalListItem<Facility> | undefined {
    const actualIndex = ((subPageIndex -1) * 12) + selectedIndex - 1;

    return this.itemsForAirwayWaypointList.find((_, index) => index === actualIndex);
  }

  /**
   * Returns the facility or airway which corresponds to a given list index.
   * @param ident The ident to search for
   * @returns A facility or airway.
   */
  public getIndexFromAirwayListIdent(ident: string): number {
    return this.itemsForAirwayWaypointList.findIndex((item) => item.ident === ident);
  }

  /**
   * Pause or resume all subs.
   * @param type Which operation to perform.
   */
  public manageSubscriptions(type: 'pause' | 'resumeCurrent'): void {
    if (type === 'pause') {
      this.subs.forEach((sub: Subscription) => sub.pause());
      this.referencePosSub.pause();
    } else if (this.currentCategorySub.get() !== 'airways') {
      this.getSubForCategory(this.currentCategorySub.get()).resume(true);
      this.referencePosSub.resume(true);
    }
  }

  /**
   * Sets the reference leg
   * @param leg A leg definition or `undefined`.
   */
  public async setReferenceLeg(leg?: LegDefinition): Promise<void> {
    const facilityIcao = leg?.leg.fixIcao;
    const facility = facilityIcao ? await this.fms.facLoader.getFacility(FacilityType.Intersection, facilityIcao) : undefined;

    this.referenceLeg.set(leg);
    if (facility && facilityIcao) {
      for (const airwaySegment of facility.routes) {
        this.fms.facLoader.getAirway(airwaySegment.name, airwaySegment.type, facilityIcao).then((airwayObject) => {
          this.airways.push({
            object: airwayObject,
            ident: airwayObject.name,
            distance: undefined,
          });
          this.airways.sort((a, b) => a.ident.localeCompare(b.ident));
          this.categoryLocalArrayMap.airways = this.airways;
        });
      }

      this.airwaysAvailable.set(facility.routes.length > 0);
    }
  }
}

/** A UNS List page. */
export class UnsNormalListPage extends UnsFmcDialogPage<UnsListPageInput, Facility | null> {
  private pageType = Subject.create<NormalListSearchType>('ALL_FACILITIES');

  private static DEFAULT_CATEGORY: NormalListCategory = 'vor';

  private static NormalTitleMap: Record<NormalListCategory, string> = {
    apt:     ' AIRPORTS',
    ndb:     '    NDBS',
    int:     '    INTS', // TODO Is this right?
    vor:     '    VORS',
    airways: '  AIRWAYS',
    // 'vor/plt': 'VOR/PLT',
  };

  private static PlainLanguageTitleMap: Record<NormalListCategory, string> = {
    apt: 'AIRPORTS',
    ndb: 'NDBS',
    int: 'INTERSECTIONS', // TODO Is this right?
    vor: 'VORS',
    airways: 'AIRWAYS',
    // 'vor/plt': 'VOR/PLT',
  };

  public currentCategory = Subject.create<NormalListCategory>('vor');

  override pageTitle = '  LIST';
  override displayedSubPagePadding = 2;

  private listMode = Subject.create<'normal' | 'plainLang'>('normal');

  private ListTitleField = new UnsTextInputField<NormalListCategory, number>(this, {
    maxInputCharacterCount: 1,
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositiveBounded(1, 1, 7, 1),
      format: ([value, , typedText]: WritableUnsFieldState<NormalListCategory>): FmcFormatterOutput => {
        const label: string = this.listMode.get() === 'normal' ?
          `${UnsNormalListPage.NormalTitleMap[value].padEnd(10, ' ')}# [cyan d-text]` :
          `    ${UnsNormalListPage.PlainLanguageTitleMap[value].padEnd(16, ' ')}[white d-text]#[cyan d-text]`;
        return `${label}${typedText || '-'}[r-white d-text]`;
      },
    },
    onModified: async (entry: number) => {
      if (this.currentCategory.get() === 'airways') {
        const airway = this.store.getItemFromListIndex(entry - 1) as AirwayData;
        this.store.selectedAirway.set(airway);
        this.pageTitle = 'AIRWAYS';
        this.store.setAirwayWaypointPickListData(airway.waypoints);
        this.displayedSubPageIndex.set(1);
        this.displayedSubPageCount.set(this.AirwayWaypointPickList.subPageCount.get());
      } else if (this.resolve) {
        this.resolve({
          wasCancelled: false,
          payload: this.store.getItemFromListIndex(entry - 1) as Facility,
        });
      }
      return true;
    },
  });

  /**
   * Returns a data formatter for the store.
   * @returns A formatting function.
   */
  private dataFormatter = (): (item: NormalListItem, index: number) => string => this.listMode.get() === 'normal' ?
    // Normal list formatter
    ({ distance, ident }: NormalListItem, index: number): string => {
      const identStr: string = ident.padEnd(6, ' ');
      const distStr: string = distance ? distance.toFixed().padStart(4, ' ') : ' '.padEnd(4, ' ');
      return ` ${(index % 12) + 1 } ${identStr}${distStr}[s-text]`;
    } :
    // Plain language formatter
    ({ ident, object }: NormalListItem, index: number): string => {
      const name: string = object.name;
      const identStr: string = ident.padEnd(6, ' ');
      const locationStr: string = name.startsWith('TT') ? Utils.Translate(name) : name; // limit 15 chars
      return ` ${index + 1}[white s-text] ${identStr}${locationStr}[cyan s-text]`;
    };

  private readonly store = new UnsNormalListPageStore(
    this.fms.nearestContext.referencePosition,
    this.displayedSubPageIndex,
    this.currentCategory,
    this.ListTitleField.bindWrappedData(this.currentCategory),
    this.dataFormatter,
    this.fms
  );

  /** @inheritDoc */
  override onInit(): void {
    // Needs to be in onInit so that it runs after UnsFmcPage.init,
    // which pipes an incorrect value into the subpage count.
    this.addBinding(
      this.store.totalEntriesForCategory.sub((total: number) => {
        const isAirwayPage: boolean = this.currentCategory.get() === 'airways' && this.store.selectedAirway.get() !== undefined;
        const itemsPerPage = isAirwayPage ? UnsNormalListPageStore.DEFAULT_AIRWAY_WAYPOINT_DATA.itemsPerPage : UnsNormalListPageStore.DEFAULT_DATA.itemsPerPage;
        this.displayedSubPageCount.set(Math.ceil(total / itemsPerPage));
      }, true)
    );

    this.addBinding(this.listMode.sub(mode => {
      UnsNormalListPageStore.DEFAULT_DATA.borders = mode === 'normal' ? UnsPickListBorder.All : UnsPickListBorder.None;
      UnsNormalListPageStore.DEFAULT_DATA.targetWidth = mode === 'normal' ? 14 : 24;

      this.store.formatAndSetPickListData();
      this.invalidate();
    }, true));

    this.addBinding(
      MappedSubject.create(this.AirwayWaypointPickList.subPageIndex, this.store.selectedAirway)
        .sub(([pageIndex, selectedAirway]) => {
          const isAirwayPage: boolean = this.currentCategory.get() === 'airways' && selectedAirway !== undefined;
          if (isAirwayPage) {
            this.displayedSubPageIndex.set(pageIndex);
          }
        })
    );

    this.addBinding(
      MappedSubject.create(this.AirwayWaypointPickList.subPageCount, this.store.selectedAirway)
        .sub(([pageIndex, selectedAirway]) => {
          const isAirwayPage: boolean = this.currentCategory.get() === 'airways' && selectedAirway !== undefined;
          if (isAirwayPage) {
            this.displayedSubPageIndex.set(pageIndex);
          }
        })
    );

    this.displayedSubPageIndexPipe?.destroy();
    this.displayedSubPageCountPipe?.destroy();
  }

  /** @inheritDoc */
  override onResume(): void {
    this.store.manageSubscriptions('resumeCurrent');
    this.listMode.set('normal');
    this.store.selectedAirway.set(undefined);
  }

  /** @inheritDoc */
  override request(input: UnsListPageInput): Promise<FmcDialogPageResult<Facility | null>> {
    const { searchType, referenceLeg } = input;

    this.store.setReferenceLeg(referenceLeg);

    this.pageType.set(searchType);
    this.changeCategory(searchType === 'ALL' || searchType === 'ALL_FACILITIES' ? UnsNormalListPage.DEFAULT_CATEGORY : searchType);

    return super.request(input);
  }

  /** @inheritDoc */
  override onPause(): void {
    this.changeCategory(UnsNormalListPage.DEFAULT_CATEGORY);
    this.pageTitle = '  LIST';
    this.store.setAirwayWaypointPickListData([]);
    this.store.clearAirways();
    this.store.manageSubscriptions('pause');
    this.bus.getPublisher<UnsNearestContextEvents>().pub('uns_search_reference_position', undefined);
    super.onPause(); // Call super to resolve the promise
  }

  /** @inheritDoc */
  override async onHandleScrolling(event: keyof FmcPagingEvents<this> & string): Promise<boolean | string> {
    const isAirwayPage: boolean = this.currentCategory.get() === 'airways' && this.store.selectedAirway.get() !== undefined;

    if (isAirwayPage) {
      switch (event) {
        case 'pageLeft':
          this.AirwayWaypointPickList.prevSubpage();
          break;
        case 'pageRight':
          this.AirwayWaypointPickList.nextSubpage();
          break;
      }
    } else {
      const dir: number = event === 'pageLeft' ? -1 : 1;
      const min = 1;
      const range: number = this.displayedSubPageCount.get() - min + 1;
      const newValue: number = ((this.displayedSubPageIndex.get() + dir - min) % range + range) % range + min;

      this.displayedSubPageIndex.set(newValue);
    }

    return true;
  }

  /**
   * Change the category supplying the pick list.
   * @param category The new category.
   */
  private changeCategory(category: NormalListCategory): void {
    if (category === this.currentCategory.get()) {
      return;
    }

    this.displayedSubPageIndex.set(1);
    this.store.changeCategory(category);
  }

  protected readonly PickList = new UnsPickList(this,
    this.store.pickListData,
    RawFormatter,
  );

  /**
   * Generates category change fields.
   * @param label The label to display.
   * @param category The search category to change to.
   * @param side Which side of the screen the field is on.
   * @returns A display field.
   */
  private categoryFieldBuilder(
    label: string,
    category: NormalListCategory,
    side: 'L' | 'R'
  ): DisplayField<readonly [NormalListCategory, NormalListSearchType]> {
    return new DisplayField<readonly [NormalListCategory, NormalListSearchType]>(this, {
      formatter: ([currentCategory, pageType]): FmcFormatterOutput =>
        pageType === 'ALL' || pageType === 'ALL_FACILITIES' || pageType === category ? (
          currentCategory === category && category !== 'int' ? [
            [`${side === 'L' ? UnsChars.ArrowLeft : ''}PLN${side === 'R' ? UnsChars.ArrowRight : ''}`],
            ['LANG'],
          ] : `${side === 'L' ? UnsChars.ArrowLeft : ''}${label}${side === 'R' ? UnsChars.ArrowRight : ''}`
          ) : '',
      onSelected: async () => {
        if (category === this.currentCategory.get() && category !== 'int') {
          this.listMode.set('plainLang');
        } else {
          this.changeCategory(category);
        }
        return true;
      },
    }).bind(MappedSubject.create(
      this.currentCategory,
      this.pageType,
    ));
  }

  private AirportField = this.categoryFieldBuilder('APT', 'apt', 'L');

  private NdbField = this.categoryFieldBuilder('NDB', 'ndb', 'L');

  private IntersectionField = this.categoryFieldBuilder('INT', 'int', 'L');

  private CopyRteField = new DisplayField(this, {
    formatter: (pageType): FmcFormatterOutput => pageType === 'ALL' ? [
      ['COPY'],
      [`${UnsChars.ArrowLeft}RTE`],
    ] : '',
  }).bind(this.pageType);

  private VorField = this.categoryFieldBuilder('VOR', 'vor', 'R');

  private AirwaysField = new UnsDisplayField<readonly [string, boolean]>(this, {
    formatter: ([[pageType, airwaysAvailable]]): FmcFormatterOutput => pageType === 'ALL' && airwaysAvailable === true ? [
        [`AIR${UnsChars.ArrowRight}`],
        ['WAYS'],
      ] : '',
    onSelected: async () => {
      this.changeCategory('airways');
      return true;
    },
  }).bindWrappedData(MappedSubject.create(this.pageType, this.store.airwaysAvailable));

  private GapField = new DisplayField(this, {
    formatter: (pageType): string => pageType === 'ALL' ? `GAP${UnsChars.ArrowRight}` : '',
  }).bind(this.pageType);

  private AirwayFromField = new DisplayField<LegDefinition | undefined>(this, {
    formatter: (fromLeg): string => `FRM[cyan s-text] ${fromLeg ? ICAO.getIdent(fromLeg.leg.fixIcao) : ''}[d-text]`,
  }).bind(this.store.referenceLeg);

  private AirwayField = new DisplayField<AirwayData | undefined>(this, {
    formatter: (airway): string => `VIA[cyan s-text] ${airway ? airway.name : ''}`,
  }).bind(this.store.selectedAirway);

  private AirwaySelectionField = new UnsTextInputField<unknown, number>(this, {
    maxInputCharacterCount: 5,
    formatter: {
      parse: (input) => {
        const index = Number(input);

        if (isNaN(index)) {
          const valid = this.store.getIndexFromAirwayListIdent(input) % 12;
          return valid > 0 ? valid + 1 : null;
        } else {
          return index > 0 && index <= 12 ? index : null;
        }
      },
      format: ([, isHighlighted, typedText]): string =>
        `TO [cyan s-text]${typedText && typedText.length > 0 ? typedText.padStart(5, ' ') : '-----'}[${isHighlighted && 'r-white '}d-text]`,
    },
    onModified: async (entry: number) => {
      const flightPlan = this.fms.getPrimaryFlightPlan();
      const referenceLeg = this.store.referenceLeg.get();
      const airway = this.store.selectedAirway.get();
      const waypoint = this.store.getItemFromAirwayListIndex(entry, this.displayedSubPageIndex.get());

      if (airway && waypoint && referenceLeg) {
        const referenceLegGlobalIndex = flightPlan.getLegIndexFromLeg(referenceLeg);
        const referenceFacility = await this.fms.facLoader.getFacility(FacilityType.Intersection, referenceLeg.leg.fixIcao);
        const waypointFacility = await this.fms.facLoader.getFacility(FacilityType.Intersection, waypoint.object.icao);

        this.fms.insertAirwaySegment(
          airway,
          referenceFacility,
          waypointFacility,
          flightPlan.getSegmentIndex(referenceLegGlobalIndex),
          flightPlan.getSegmentLegIndex(referenceLegGlobalIndex)
        );
      }

      this.store.clearAirways();

      if (this.resolve) {
        this.resolve({
          wasCancelled: false,
          payload: null,
        });
      }
      return true;
    },
  }).bindWrappedData(Subject.create(undefined));

  private AirwayWaypointPickList = new UnsMultiColumnPickList(this,
    this.store.airwayWaypointPickListData,
    RawFormatter,
  );

  private readonly ReturnPrompt = new DisplayField(this, {
    formatter: () => `${this.listMode.get() === 'normal' ? 'RTN' : 'RETURN'}${UnsChars.ArrowRight}`,
    onSelected: async () => {
      if (this.listMode.get() === 'normal') {
        this.screen.navigateBackShallow();
      } else {
        this.listMode.set('normal');
      }
      return true;
    },
  });

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    const isNormalMode: boolean = this.listMode.get() === 'normal';
    const isAirwayPage: boolean = this.currentCategory.get() === 'airways' && this.store.selectedAirway.get() !== undefined;

    if (isAirwayPage) {
      if (this.screen.currentCursorPosition !== this.AirwaySelectionField) {
        // If we try to set the focus field in the onModified of the text input field then it will revert to null
        // Therefore we have to check whether the cursor is currently focused on the airway selection field in render
        this.screen.tryFocusField(this.AirwaySelectionField);
      }

      return [[
        [this.TitleField, ''],
        [this.AirwayFromField, ''],
        [this.AirwayField, this.AirwaySelectionField],
        [''],
        [this.AirwayWaypointPickList],
        [''],
        [''],
        [''],
        [''],
        [''],
        ['', this.ReturnPrompt],
      ]];
    } else if (isNormalMode) {
      return [[
        ['', '', this.TitleField],
        ['', '', this.PickList],
        [this.AirportField, this.VorField],
        [''],
        [this.NdbField, this.AirwaysField],
        [''],
        [this.IntersectionField, this.GapField],
        [''],
        [''],
        [this.CopyRteField],
        ['', this.ReturnPrompt],
      ]];
    } else {
      // Plain language mode
      return [[
        ['', '', this.TitleField],
        [''],
        ['', '', this.PickList],
        [''],
        [''],
        [''],
        [''],
        [''],
        [''],
        [''],
        ['', this.ReturnPrompt],
      ]];
    }
  }

  public cursorPath: UnsCduCursorPath = {
    initialPosition: this.ListTitleField,
    rules: new Map([]),
  };
}
