import {
  ArraySubject, MappedSubject, MappedSubscribable, Subject, Subscribable, SubscribableArray, Subscription,
  UserSettingManager
} from '@microsoft/msfs-sdk';

import { InstrumentType } from '../../../Shared/CommonTypes';
import {
  CnsDataBarAudioItemDef, CnsDataBarComRadioItemDef, CnsDataBarItemData, CnsDataBarItemType, CnsDataBarNavRadioItemDef,
  CnsDataBarSimpleItemDef
} from '../../../Shared/Components/CnsDataBar/CnsDataBarItem';
import { CnsDataBarUtils } from '../../../Shared/Components/CnsDataBar/CnsDataBarUtils';
import {
  CnsDataBarButtonSizeSettingMode, CnsDataBarModeButtonSideSettingMode, CnsDataBarScreenSideSettingMode,
  CnsDataBarShowSettingMode, CnsDataBarUserSettingTypes
} from '../../../Shared/Settings/CnsDataBarUserSettings';
import { DisplayLocationSettingMode, DisplayUserSettingTypes } from '../../../Shared/Settings/DisplayUserSettings';
import { UiService } from '../../../Shared/UiSystem/UiService';

/**
 * Configuration options for {@link Gdu460CnsDataBarItemManager}.
 */
export type Gdu460CnsDataBarItemManagerOptions = {
  /** The number of supported COM radios. */
  comCount: 0 | 1 | 2;

  /** The number of supported NAV radios. */
  navCount: 0 | 1 | 2;

  /** Whether to include the audio panel button. */
  includeAudioButton: boolean;

  /**
   * The shape with which the audio panel button should render its MIC/COM indicators. Ignored if `includeAudioButton`
   * is `false`. Defaults to `'triangle'`.
   */
  audioButtonIndicatorShape?: 'square' | 'triangle';

  /** Whether to include the transponder button. */
  includeTransponder: boolean;
};

/**
 * A manager that keeps track of the items to render and display on a GDU 460 CNS data bar.
 */
export class Gdu460CnsDataBarItemManager {
  private static readonly BAR_WIDTH = 1280; // px
  private static readonly ITEM_MARGIN = 7; // px
  private static readonly DATA_FIELD_MIN_WIDTH = 95; // px

  private static readonly isItemVisibleFromDisplayLocationMap = ([operatingType, displayLocation]: readonly [InstrumentType, DisplayLocationSettingMode]): boolean => {
    switch (displayLocation) {
      case DisplayLocationSettingMode.PFD:
        return operatingType === 'PFD';
      case DisplayLocationSettingMode.MFD:
        return operatingType === 'MFD';
      default:
        return true;
    }
  };

  private readonly desiredDataFieldCount = this.dataBarSettingManager.getSetting('cnsDataBarMaxFieldCount');

  private readonly splitItemSide = MappedSubject.create(
    ([setting, operatingType, pfdPaneSide]) => {
      switch (setting) {
        case CnsDataBarModeButtonSideSettingMode.Left:
          return 'left';
        case CnsDataBarModeButtonSideSettingMode.Right:
          return 'right';
        default: // Auto
          return (pfdPaneSide === 'left') === (operatingType === 'PFD')
            ? 'right'
            : 'left';
      }
    },
    this.dataBarSettingManager.getSetting('cnsDataBarSplitButtonSide'),
    this.uiService.operatingType,
    this.uiService.gdu460PfdPaneSide
  );
  private readonly splitItem: CnsDataBarItemData<CnsDataBarSimpleItemDef> = {
    type: CnsDataBarItemType.Split,
    width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Split]
  };

  private readonly timerItemSide = this.dataBarSettingManager.getSetting('cnsDataBarUserTimerShow').map(show => {
    switch (show) {
      case CnsDataBarShowSettingMode.Left:
        return 'left';
      case CnsDataBarShowSettingMode.Right:
        return 'right';
      default:
        return 'none';
    }
  });
  private readonly timerItem: CnsDataBarItemData<CnsDataBarSimpleItemDef> = {
    type: CnsDataBarItemType.Timer,
    width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Timer]
  };

  private readonly comCount: 0 | 1 | 2;
  private readonly isComVisible: Subscribable<boolean>;
  private readonly com1ItemSide: Subscribable<'left' | 'right'>;
  private readonly isComMinimizedNominal = this.dataBarSettingManager.getSetting('cnsDataBarComRadioButtonSize').map(mode => {
    return mode === CnsDataBarButtonSizeSettingMode.Minimized;
  });
  private readonly forceCom1Minimized = Subject.create(false);
  private readonly forceCom2Minimized = Subject.create(false);
  private readonly comRadioNormalItems: Record<1 | 2, CnsDataBarItemData<CnsDataBarComRadioItemDef>>;
  private readonly comRadioMinimizedItems: Record<1 | 2, CnsDataBarItemData<CnsDataBarComRadioItemDef>>;

  private readonly navCount: 0 | 1 | 2;
  private readonly isNavVisible: Subscribable<boolean>;
  private readonly nav1ItemSide: Subscribable<'left' | 'right'>;
  private readonly isNavMinimizedNominal = this.dataBarSettingManager.getSetting('cnsDataBarNavRadioButtonSize').map(mode => {
    return mode === CnsDataBarButtonSizeSettingMode.Minimized;
  });
  private readonly forceNav1Minimized = Subject.create(false);
  private readonly forceNav2Minimized = Subject.create(false);
  private readonly navRadioNormalItems: Record<1 | 2, CnsDataBarItemData<CnsDataBarNavRadioItemDef>>;
  private readonly navRadioMinimizedItems: Record<1 | 2, CnsDataBarItemData<CnsDataBarNavRadioItemDef>>;

  private readonly includeAudioButton: boolean;
  private readonly audioButtonIndicatorShape: 'square' | 'triangle';
  private readonly isAudioVisible: Subscribable<boolean>;
  private readonly audioItemSide = this.dataBarSettingManager.getSetting('cnsDataBarAudioButtonScreenSide').map(side => {
    return side === CnsDataBarScreenSideSettingMode.Right ? 'right' : 'left';
  });
  private readonly nominalAudioType: Subscribable<CnsDataBarAudioItemDef['type']>;
  private readonly forceAudioMinimized = Subject.create(false);
  private readonly forceAudioOnly = Subject.create(false);
  private readonly audioItems: Record<CnsDataBarAudioItemDef['type'], CnsDataBarItemData<CnsDataBarAudioItemDef>>;

  private readonly includeTransponder: boolean;
  private readonly isTransponderVisible: Subscribable<boolean>;
  private readonly transponderItemSide = this.dataBarSettingManager.getSetting('cnsDataBarTransponderScreenSide').map(side => {
    return side === CnsDataBarScreenSideSettingMode.Right ? 'right' : 'left';
  });
  private readonly transponderItem: CnsDataBarItemData<CnsDataBarSimpleItemDef>;

  private readonly _leftItems = ArraySubject.create<CnsDataBarItemData>([]);
  /** The CNS data bar items to render on the left side. */
  public readonly leftItems = this._leftItems as SubscribableArray<Readonly<CnsDataBarItemData>>;

  private readonly _rightItems = ArraySubject.create<CnsDataBarItemData>([]);
  /** The CNS data bar items to render on the right side. */
  public readonly rightItems = this._rightItems as SubscribableArray<Readonly<CnsDataBarItemData>>;

  private readonly _maxDataFieldCount = Subject.create(0);
  /**
   * The maximum number of nav data fields that can be displayed on the CNS data bar given the currently rendered data
   * bar items.
   */
  public readonly maxDataFieldCount = this._maxDataFieldCount as Subscribable<number>;

  private readonly subscriptions: Subscription[] = [
    this.splitItemSide,
    this.timerItemSide,
    this.isComMinimizedNominal,
    this.isNavMinimizedNominal,
    this.audioItemSide,
    this.transponderItemSide
  ];

  /**
   * Creates a new instance of Gdu460CnsDataBarItemManager.
   * @param uiService The UI service.
   * @param displaySettingManager A manager for display user settings.
   * @param dataBarSettingManager A manager for CNS data bar user settings.
   * @param options Options with which to configure the manager.
   */
  public constructor(
    private readonly uiService: UiService,
    private readonly displaySettingManager: UserSettingManager<DisplayUserSettingTypes>,
    private readonly dataBarSettingManager: UserSettingManager<CnsDataBarUserSettingTypes>,
    options: Readonly<Gdu460CnsDataBarItemManagerOptions>,
  ) {
    this.comCount = options.comCount;
    this.navCount = options.navCount;
    this.includeAudioButton = options.includeAudioButton;
    this.audioButtonIndicatorShape = options.audioButtonIndicatorShape ?? 'triangle';
    this.includeTransponder = options.includeTransponder;

    this.isComVisible = this.comCount > 0
      ? MappedSubject.create(
        Gdu460CnsDataBarItemManager.isItemVisibleFromDisplayLocationMap,
        this.uiService.operatingType,
        this.displaySettingManager.getSetting('displayComRadioLocation')
      )
      : Subject.create(false);
    this.com1ItemSide = this.comCount === 1
      ? this.dataBarSettingManager.getSetting('cnsDataBarComRadioScreenSide').map(side => {
        return side === CnsDataBarScreenSideSettingMode.Right ? 'right' : 'left';
      })
      : Subject.create('left');
    this.comRadioNormalItems = this.createRadioItems(
      CnsDataBarItemType.Com,
      this.isComVisible,
      this.isComMinimizedNominal,
      this.forceCom1Minimized,
      this.forceCom2Minimized
    );
    this.comRadioMinimizedItems = this.createRadioItems(
      CnsDataBarItemType.ComMinimized,
      this.isComVisible,
      this.isComMinimizedNominal,
      this.forceCom1Minimized,
      this.forceCom2Minimized
    );

    this.isNavVisible = this.navCount > 0
      ? MappedSubject.create(
        Gdu460CnsDataBarItemManager.isItemVisibleFromDisplayLocationMap,
        this.uiService.operatingType,
        this.displaySettingManager.getSetting('displayNavRadioLocation')
      )
      : Subject.create(false);
    this.nav1ItemSide = this.navCount === 1
      ? this.dataBarSettingManager.getSetting('cnsDataBarNavRadioScreenSide').map(side => {
        return side === CnsDataBarScreenSideSettingMode.Right ? 'right' : 'left';
      })
      : Subject.create('left');
    this.navRadioNormalItems = this.createRadioItems(
      CnsDataBarItemType.Nav,
      this.isNavVisible,
      this.isNavMinimizedNominal,
      this.forceNav1Minimized,
      this.forceNav2Minimized
    );
    this.navRadioMinimizedItems = this.createRadioItems(
      CnsDataBarItemType.NavMinimized,
      this.isNavVisible,
      this.isNavMinimizedNominal,
      this.forceNav1Minimized,
      this.forceNav2Minimized
    );

    this.isAudioVisible = this.includeAudioButton
      ? MappedSubject.create(
        Gdu460CnsDataBarItemManager.isItemVisibleFromDisplayLocationMap,
        this.uiService.operatingType,
        this.displaySettingManager.getSetting('displayAudioPanelLocation')
      )
      : Subject.create(false);
    this.nominalAudioType = this.includeAudioButton && this.comCount > 1
      ? this.dataBarSettingManager.getSetting('cnsDataBarAudioButtonSize').map(mode => {
        return mode === CnsDataBarButtonSizeSettingMode.Minimized
          ? CnsDataBarItemType.AudioMinimized
          : CnsDataBarItemType.Audio;
      })
      : Subject.create(CnsDataBarItemType.AudioOnly);
    this.audioItems = this.createAudioItems(
      this.isAudioVisible,
      this.nominalAudioType,
      this.forceAudioMinimized,
      this.forceAudioOnly
    );

    this.isTransponderVisible = this.includeTransponder
      ? MappedSubject.create(
        Gdu460CnsDataBarItemManager.isItemVisibleFromDisplayLocationMap,
        this.uiService.operatingType,
        this.displaySettingManager.getSetting('displayTransponderLocation')
      )
      : Subject.create(false);
    this.transponderItem = {
      type: CnsDataBarItemType.Xpdr,
      width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Xpdr],
      isVisible: this.isTransponderVisible
    };

    this.setItemSide(this.splitItem, this.splitItemSide.get());
    this.setItemSide(this.timerItem, this.timerItemSide.get());

    this.splitItemSide.sub(this.setItemSide.bind(this, this.splitItem));
    this.timerItemSide.sub(this.onTimerItemSideChanged.bind(this));

    const reconcileItemFitHandler = this.reconcileItemFit.bind(this);

    this.subscriptions.push(
      this.desiredDataFieldCount.sub(reconcileItemFitHandler)
    );

    if (this.comCount > 0) {
      this.subscriptions.push(this.isComVisible as MappedSubscribable<boolean>);
      this.isComVisible.sub(reconcileItemFitHandler);
      this.isComMinimizedNominal.sub(reconcileItemFitHandler);

      if (this.comCount === 1) {
        const com1ItemSide = this.com1ItemSide.get();
        this.setItemSide(this.comRadioNormalItems[1], com1ItemSide);
        this.setItemSide(this.comRadioMinimizedItems[1], com1ItemSide);

        this.subscriptions.push(this.com1ItemSide as MappedSubscribable<'left' | 'right'>);
        this.com1ItemSide.sub(this.onCom1ItemSideChanged.bind(this));
      } else {
        this.setItemSide(this.comRadioNormalItems[1], 'left');
        this.setItemSide(this.comRadioMinimizedItems[1], 'left');
        this.setItemSide(this.comRadioNormalItems[2], 'right');
        this.setItemSide(this.comRadioMinimizedItems[2], 'right');
      }
    }

    if (this.navCount > 0) {
      this.subscriptions.push(this.isNavVisible as MappedSubscribable<boolean>);
      this.isNavVisible.sub(reconcileItemFitHandler);
      this.isNavMinimizedNominal.sub(reconcileItemFitHandler);

      if (this.navCount === 1) {
        const nav1ItemSide = this.nav1ItemSide.get();
        this.setItemSide(this.navRadioNormalItems[1], nav1ItemSide);
        this.setItemSide(this.navRadioMinimizedItems[1], nav1ItemSide);

        this.subscriptions.push(this.nav1ItemSide as MappedSubscribable<'left' | 'right'>);
        this.nav1ItemSide.sub(this.onNav1ItemSideChanged.bind(this));
      } else {
        this.setItemSide(this.navRadioNormalItems[1], 'left');
        this.setItemSide(this.navRadioMinimizedItems[1], 'left');
        this.setItemSide(this.navRadioNormalItems[2], 'right');
        this.setItemSide(this.navRadioMinimizedItems[2], 'right');
      }
    }

    if (this.includeAudioButton) {
      const itemSide = this.audioItemSide.get();
      this.setItemSide(this.audioItems[CnsDataBarItemType.Audio], itemSide);
      this.setItemSide(this.audioItems[CnsDataBarItemType.AudioMinimized], itemSide);
      this.setItemSide(this.audioItems[CnsDataBarItemType.AudioOnly], itemSide);

      this.subscriptions.push(this.isAudioVisible as MappedSubscribable<boolean>);
      this.isAudioVisible.sub(reconcileItemFitHandler);
      this.audioItemSide.sub(this.onAudioItemSideChanged.bind(this));

      if (this.comCount > 1) {
        this.subscriptions.push(this.nominalAudioType as MappedSubscribable<CnsDataBarAudioItemDef['type']>);
        this.nominalAudioType.sub(reconcileItemFitHandler);
      }
    }

    if (this.includeTransponder) {
      this.setItemSide(this.transponderItem, this.transponderItemSide.get());

      this.subscriptions.push(this.isTransponderVisible as MappedSubscribable<boolean>);
      this.isTransponderVisible.sub(reconcileItemFitHandler);
      this.transponderItemSide.sub(this.setItemSide.bind(this, this.transponderItem));
    }

    this.reconcileItemFit();
  }

  /**
   * Creates a record of CNS data bar radio item data, keyed by radio index.
   * @param type The type of radio items to create.
   * @param isVisible Whether the radio items are visible.
   * @param isMinimizedNominal Whether the radio items should nominally be displayed as minimized.
   * @param force1Minimized Whether to force the item for radio 1 to be displayed as minimized.
   * @param force2Minimized Whether to force the item for radio 2 to be displayed as minimized.
   * @returns A record of CNS data bar radio item data, keyed by radio index.
   */
  private createRadioItems<T extends (CnsDataBarComRadioItemDef | CnsDataBarNavRadioItemDef)['type']>(
    type: T,
    isVisible: Subscribable<boolean>,
    isMinimizedNominal: Subscribable<boolean>,
    force1Minimized: Subscribable<boolean>,
    force2Minimized: Subscribable<boolean>,
  ): Record<1 | 2, CnsDataBarItemData<T extends CnsDataBarComRadioItemDef['type'] ? CnsDataBarComRadioItemDef : CnsDataBarNavRadioItemDef>> {
    const isMinimized = type === CnsDataBarItemType.ComMinimized || type === CnsDataBarItemType.NavMinimized;

    const isVisibleMap = ([isVisibleVal, isMinimizedNominalVal, forceMinimizedVal]: readonly [boolean, boolean, boolean]): boolean => {
      return isVisibleVal && (isMinimizedNominalVal || forceMinimizedVal) === isMinimized;
    };

    return {
      [1]: {
        type,
        index: 1,
        width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[type],
        isVisible: MappedSubject.create(
          isVisibleMap,
          isVisible,
          isMinimizedNominal,
          force1Minimized
        )
      } as any,

      [2]: {
        type,
        index: 2,
        width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[type],
        isVisible: MappedSubject.create(
          isVisibleMap,
          isVisible,
          isMinimizedNominal,
          force2Minimized
        )
      } as any
    };
  }

  /**
   * Creates a record of CNS data bar audio panel item data, keyed by item type.
   * @param isVisible Whether the audio panel item is visible.
   * @param nominalType The nominal displayed audio panel item type.
   * @param forceMinimized Whether to force the item to be displayed as minimized.
   * @param forceAudioOnly Whether to force the item to be displayed as audio-only.
   * @returns A record of CNS data bar audio panel item data, keyed by item type.
   */
  private createAudioItems(
    isVisible: Subscribable<boolean>,
    nominalType: Subscribable<CnsDataBarAudioItemDef['type']>,
    forceMinimized: Subscribable<boolean>,
    forceAudioOnly: Subscribable<boolean>,
  ): Record<CnsDataBarAudioItemDef['type'], CnsDataBarItemData<CnsDataBarAudioItemDef>> {
    return {
      [CnsDataBarItemType.Audio]: {
        type: CnsDataBarItemType.Audio,
        shape: this.audioButtonIndicatorShape,
        width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Audio],
        isVisible: MappedSubject.create(
          ([isVisibleVal, nominalTypeVal, forceMinimizedVal, forceAudioOnlyVal]) => {
            return isVisibleVal && nominalTypeVal === CnsDataBarItemType.Audio && !forceMinimizedVal && !forceAudioOnlyVal;
          },
          isVisible,
          nominalType,
          forceMinimized,
          forceAudioOnly
        )
      },

      [CnsDataBarItemType.AudioMinimized]: {
        type: CnsDataBarItemType.AudioMinimized,
        shape: this.audioButtonIndicatorShape,
        width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.AudioMinimized],
        isVisible: MappedSubject.create(
          ([isVisibleVal, nominalTypeVal, forceMinimizedVal, forceAudioOnlyVal]) => {
            return isVisibleVal && (nominalTypeVal === CnsDataBarItemType.AudioMinimized || forceMinimizedVal) && !forceAudioOnlyVal;
          },
          isVisible,
          nominalType,
          forceMinimized,
          forceAudioOnly
        )
      },

      [CnsDataBarItemType.AudioOnly]: {
        type: CnsDataBarItemType.AudioOnly,
        shape: this.audioButtonIndicatorShape,
        width: CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.AudioOnly],
        isVisible: MappedSubject.create(
          ([isVisibleVal, nominalTypeVal, forceAudioOnlyVal]) => {
            return isVisibleVal && (nominalTypeVal === CnsDataBarItemType.AudioOnly || forceAudioOnlyVal);
          },
          isVisible,
          nominalType,
          forceAudioOnly
        )
      }
    };
  }

  /**
   * Responds to when the side on which to render the User Timer item changes.
   * @param side The new side on which to render the User Timer item.
   */
  private onTimerItemSideChanged(side: 'left' | 'right' | 'none'): void {
    this.setItemSide(this.timerItem, side);
    this.reconcileItemFit();
  }

  /**
   * Responds to when the side on which to render the COM 1 radio item changes.
   * @param side The new side on which to render the COM 1 radio item.
   */
  private onCom1ItemSideChanged(side: 'left' | 'right'): void {
    this.setItemSide(this.comRadioNormalItems[1], side);
    this.setItemSide(this.comRadioMinimizedItems[1], side);
  }

  /**
   * Responds to when the side on which to render the NAV 1 radio item changes.
   * @param side The new side on which to render the NAV 1 radio item.
   */
  private onNav1ItemSideChanged(side: 'left' | 'right'): void {
    this.setItemSide(this.navRadioNormalItems[1], side);
    this.setItemSide(this.navRadioMinimizedItems[1], side);
  }

  /**
   * Responds to when the side on which to render the audio panel item changes.
   * @param side The new side on which to render the audio panel item.
   */
  private onAudioItemSideChanged(side: 'left' | 'right'): void {
    this.setItemSide(this.audioItems[CnsDataBarItemType.Audio], side);
    this.setItemSide(this.audioItems[CnsDataBarItemType.AudioMinimized], side);
    this.setItemSide(this.audioItems[CnsDataBarItemType.AudioOnly], side);
  }

  /**
   * Sets the side on which an item is rendered.
   * @param item The item to change.
   * @param side The side on which to render the item.
   */
  private setItemSide(item: CnsDataBarItemData, side: 'left' | 'right' | 'none'): void {
    this._leftItems.removeItem(item);
    this._rightItems.removeItem(item);

    if (side === 'left') {
      this._leftItems.insert(item);
    } else if (side === 'right') {
      this._rightItems.insert(item);
    }
  }

  /**
   * Ensures that all the currently rendered items fit properly on the data bar.
   */
  private reconcileItemFit(): void {
    // Allotted width for items is the width that allows for a number of data fields equal to the user-selected maximum.
    const allottedWidth = Gdu460CnsDataBarItemManager.BAR_WIDTH - Gdu460CnsDataBarItemManager.DATA_FIELD_MIN_WIDTH * this.desiredDataFieldCount.get();

    // Calculate total width of all items if no items were minimized.

    let totalWidth = this.splitItem.width + Gdu460CnsDataBarItemManager.ITEM_MARGIN; // Split item is always visible.
    if (this.timerItemSide.get() !== 'none') {
      totalWidth += this.timerItem.width + Gdu460CnsDataBarItemManager.ITEM_MARGIN;
    }
    if (this.isComVisible.get()) {
      const width = CnsDataBarUtils.GDU_460_ITEM_WIDTHS[this.isComMinimizedNominal.get() ? CnsDataBarItemType.ComMinimized : CnsDataBarItemType.Com];
      totalWidth += this.comCount * (width + Gdu460CnsDataBarItemManager.ITEM_MARGIN);
    }
    if (this.isNavVisible.get()) {
      const width = CnsDataBarUtils.GDU_460_ITEM_WIDTHS[this.isNavMinimizedNominal.get() ? CnsDataBarItemType.NavMinimized : CnsDataBarItemType.Nav];
      totalWidth += this.navCount * (width + Gdu460CnsDataBarItemManager.ITEM_MARGIN);
    }
    if (this.isAudioVisible.get()) {
      const width = CnsDataBarUtils.GDU_460_ITEM_WIDTHS[this.nominalAudioType.get()];
      totalWidth += width + Gdu460CnsDataBarItemManager.ITEM_MARGIN;
    }
    if (this.isTransponderVisible.get()) {
      totalWidth += this.transponderItem.width + Gdu460CnsDataBarItemManager.ITEM_MARGIN;
    }

    let forceCom1Minimized = false;
    let forceCom2Minimized = false;
    let forceNav1Minimized = false;
    let forceNav2Minimized = false;
    let forceAudioMinimized = false;
    let forceAudioOnly = false;

    while (totalWidth > allottedWidth) {
      // The total width of all items exceeds the allotted width -> we need to minimize items until the total width is
      // less than or equal to the allotted width.

      // Minimize NAV2 radio button.
      if (this.isNavVisible.get() && this.navCount > 1 && !this.isNavMinimizedNominal.get() && !forceNav2Minimized) {
        forceNav2Minimized = true;
        totalWidth += CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.NavMinimized] - CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Nav];
        continue;
      }

      // Minimize COM2 radio button.
      if (this.isComVisible.get() && this.comCount > 1 && !this.isComMinimizedNominal.get() && !forceCom2Minimized) {
        forceCom2Minimized = true;
        totalWidth += CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.ComMinimized] - CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Com];
        continue;
      }

      // Minimize NAV1 radio button.
      if (this.isNavVisible.get() && !this.isNavMinimizedNominal.get() && !forceNav1Minimized) {
        forceNav1Minimized = true;
        totalWidth += CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.NavMinimized] - CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Nav];
        continue;
      }

      // Minimize COM1 radio button.
      if (this.isComVisible.get() && !this.isComMinimizedNominal.get() && !forceCom1Minimized) {
        forceCom1Minimized = true;
        totalWidth += CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.ComMinimized] - CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Com];
        continue;
      }

      // Minimize audio panel button.
      if (this.isAudioVisible.get() && this.nominalAudioType.get() === CnsDataBarItemType.Audio && !forceAudioMinimized) {
        forceAudioMinimized = true;
        totalWidth += CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.AudioMinimized] - CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.Audio];
        continue;
      }

      // Force audio panel button to 'Audio Only' mode.
      if (this.isAudioVisible.get() && (this.nominalAudioType.get() === CnsDataBarItemType.AudioMinimized || forceAudioMinimized) && !forceAudioOnly) {
        forceAudioOnly = true;
        totalWidth += CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.AudioOnly] - CnsDataBarUtils.GDU_460_ITEM_WIDTHS[CnsDataBarItemType.AudioMinimized];
        continue;
      }

      // If we've reached here, that means we are still exceeding the allotted width even after forcibly minimizing all
      // all items. However, the total width of all items is guaranteed to be less than the width of the entire bar
      // (see below). Therefore, we can bail out of the loop and then decrease the maximum data field count below the
      // user-selected value in order to ensure all items and data fields fit in the bar.

      // Width with all items minimized:
      // Split: 80 (+7 margin)
      // Timer: 100 (+7 margin)
      // 2x COM: 240 (+14 margin)
      // 2x NAV: 240 (+14 margin)
      // Audio: 78 (+7 margin)
      // XPDR: 216 (+7 margin)
      // Total: 1010
      break;
    }

    this.forceCom1Minimized.set(forceCom1Minimized);
    this.forceCom2Minimized.set(forceCom2Minimized);
    this.forceNav1Minimized.set(forceNav1Minimized);
    this.forceNav2Minimized.set(forceNav2Minimized);
    this.forceAudioMinimized.set(forceAudioMinimized);
    this.forceAudioOnly.set(forceAudioOnly);

    this._maxDataFieldCount.set(
      Math.min(Math.floor((Gdu460CnsDataBarItemManager.BAR_WIDTH - totalWidth) / Gdu460CnsDataBarItemManager.DATA_FIELD_MIN_WIDTH), 8)
    );
  }

  /**
   * Destroys this manager. Once destroyed, the manager will no longer automatically keep track of items to render and
   * display.
   */
  public destroy(): void {
    for (const sub of this.subscriptions) {
      sub.destroy();
    }
  }
}
