import {
  ComSpacing, ConsumerSubject, EventBus, FSComponent, MathUtils, MutableSubscribable, Subject, Subscribable, VNode, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import {
  AdfMode, DisplayUnitIndices, Epic2BezelButtonEvents, Epic2DuController, Epic2TransponderEvents, NavComUserSettingManager, NavMode, TcasOperatingModeSetting,
  TcasRelativeAbsoluteMode, TcasVerticalRange, TouchButton, TrafficUserSettings, XpdrSelectMode
} from '@microsoft/msfs-epic2-shared';

import { DetailPageOption } from './AbstractDetailPage';

export enum RadioSubWindowDetailPage {
  NONE,
  COM1,
  COM2,
  NAV1,
  NAV2,
  ADF,
  DME,
  XPDR,
  TCAS,
}

export enum DmeHoldMode {
  OFF,
  ON,
}

export enum DmePairMode {
  NAV1,
  NAV2,
}

export enum AdsBroadcastOutMode {
  OFF,
  ON,
}

/** The type of a radio detail page's row option. */
export type RadioDetailSelectedValue<T> = MutableSubscribable<T>;

/** The type of all selectable values for a radio detail page's row option. */
export type RadioDetailSelectableValues<T> = Array<T>;

/** The type of an option of this row. */
export type DetailPageOptionRowOption = {
  /** The display title of the row option. */
  label: string;
  /** The optional suffix of the title. */
  labelSuffix?: string;
  /** The value of the row option. */
  value: any;
}

/** The type of an option row display of a detail page. */
export type DetailPageOptionRow = {
  /** The display title of this row. */
  rowTitle: string;
  /** The selectable options of this row. */
  rowOptions: Array<DetailPageOptionRowOption>;
  /** The selected value of this row. */
  selectedValue: RadioDetailSelectedValue<any>;
  /** The callback function for when the row is selected. */
  rowCallback?: () => void;
}

/** The type of a text row display of a detail page. */
export type DetailPageTextRow = {
  /** The display title of this row. */
  rowTitle: string;
  /** The display text of this row. */
  rowText: string;
  /** The callback function for when the row is selected. */
  rowCallback?: () => void;
}

/** The type of a text row display of a detail page. */
export type DetailPageVNodeRow = {
  /** The display title of this row. */
  rowTitle: string;
  /** The VNode content of this row. */
  vnode: VNode;
  /** The callback function for when the row is selected. */
  rowCallback?: () => void;
}

/** The type of the Detail Page Display Data. */
export type DetailPageDisplayData = Record<number, Array<DetailPageOptionRow>>;

/** Controls a Radio Management Detail Page's display data. */
export class DetailPagesController {

  private readonly trafficUserSettings = TrafficUserSettings.getManager(this.bus);

  public rows: (DetailPageOptionRow | DetailPageTextRow | DetailPageVNodeRow)[] = [];

  public readonly xpdrCode = ConsumerSubject.create(
    this.bus.getSubscriber<XPDRSimVarEvents>().on('xpdr_code_1').whenChanged(),
    0,
  ) as Subscribable<number>;

  public readonly currentPage = Subject.create<RadioSubWindowDetailPage>(RadioSubWindowDetailPage.NONE);
  private readonly _currentRowIndex = Subject.create<number>(0);
  public readonly currentRowIndex = this._currentRowIndex as Subscribable<number>;

  public readonly currentComSpacings = [
    Subject.create<ComSpacing>(ComSpacing.Spacing833Khz),
    Subject.create<ComSpacing>(ComSpacing.Spacing833Khz),
  ];

  public readonly currentNavModes = [
    Subject.create<NavMode>(NavMode.STBY),
    Subject.create<NavMode>(NavMode.STBY),
  ];

  public readonly currentAdfModes = [
    Subject.create<AdfMode>(AdfMode.ADF),
  ];

  public readonly currentDmeModes = [
    Subject.create<DmePairMode>(DmePairMode.NAV1),
    Subject.create<DmeHoldMode>(DmeHoldMode.OFF),
    Subject.create<DmePairMode>(DmePairMode.NAV2),
    Subject.create<DmeHoldMode>(DmeHoldMode.OFF),
  ];

  public readonly currentXpdrModes = [
    Subject.create<XpdrSelectMode>(XpdrSelectMode.XPDR1),
    Subject.create<AdsBroadcastOutMode>(AdsBroadcastOutMode.ON),
  ];

  public readonly currentTcasModes = [
    Subject.create<TcasOperatingModeSetting>(TcasOperatingModeSetting.TA_RA),
    Subject.create<TcasVerticalRange>(TcasVerticalRange.Norm),
    Subject.create<TcasRelativeAbsoluteMode>(TcasRelativeAbsoluteMode.REL),
  ];

  private readonly softKeyClass = 'soft-key-ident';

  private readonly lskNameStrings: Epic2BezelButtonEvents[] =
    this.displayUnitIndex === DisplayUnitIndices.PfdLeft ? [
      Epic2BezelButtonEvents.LSK_R7,
      Epic2BezelButtonEvents.LSK_R8,
      Epic2BezelButtonEvents.LSK_R9,
      Epic2BezelButtonEvents.LSK_R10,
      Epic2BezelButtonEvents.LSK_R11,
      Epic2BezelButtonEvents.LSK_R12,
    ] : [
      Epic2BezelButtonEvents.LSK_L7,
      Epic2BezelButtonEvents.LSK_L8,
      Epic2BezelButtonEvents.LSK_L9,
      Epic2BezelButtonEvents.LSK_L10,
      Epic2BezelButtonEvents.LSK_L11,
      Epic2BezelButtonEvents.LSK_L12,
    ];

  /**
   * The constructor
   * @param bus An instance of the Event Bus.
   * @param displayUnitIndex Index of the current display unit.
   * @param navComSettingsManager A manager for NavCom user settings.
   */
  constructor(
    private readonly bus: EventBus,
    private readonly displayUnitIndex: DisplayUnitIndices,
    private readonly navComSettingsManager: NavComUserSettingManager,
  ) {
    this.currentPage.sub(() => { this._currentRowIndex.set(0); });

    this.currentComSpacings[0].sub((spacing) => this.handleComSpacingChange(spacing, 1));
    this.currentComSpacings[1].sub((spacing) => this.handleComSpacingChange(spacing, 2));

    this.navComSettingsManager.getSetting('comSpacing_1').sub((spacing: ComSpacing) => {
      this.currentComSpacings[0].set(spacing);
    });

    this.navComSettingsManager.getSetting('comSpacing_2').sub((spacing: ComSpacing) => {
      this.currentComSpacings[1].set(spacing);
    });

    this.navComSettingsManager.getSetting('navMode_1').sub((mode: NavMode) => {
      this.currentNavModes[0].set(mode);
    });

    this.navComSettingsManager.getSetting('navMode_2').sub((mode: NavMode) => {
      this.currentNavModes[1].set(mode);
    });

    this.navComSettingsManager.getSetting('dmePairSwapped').sub((swapped) => {
      (this.currentDmeModes[0] as MutableSubscribable<DmePairMode>).set(swapped ? DmePairMode.NAV2 : DmePairMode.NAV1);
      (this.currentDmeModes[2] as MutableSubscribable<DmePairMode>).set(swapped ? DmePairMode.NAV1 : DmePairMode.NAV2);
    }, true);

    this.navComSettingsManager.getSetting('dme1HoldOn').sub((hold) => {
      (this.currentDmeModes[1] as MutableSubscribable<DmeHoldMode>).set(hold ? DmeHoldMode.ON : DmeHoldMode.OFF);
    }, true);
    this.navComSettingsManager.getSetting('dme2HoldOn').sub((hold) => {
      (this.currentDmeModes[3] as MutableSubscribable<DmeHoldMode>).set(hold ? DmeHoldMode.ON : DmeHoldMode.OFF);
    }, true);


    (this.currentTcasModes[0] as Subject<TcasOperatingModeSetting>).sub((mode) => {
      this.trafficUserSettings.getSetting('trafficOperatingMode').set(mode);
    });
    this.trafficUserSettings.getSetting('trafficOperatingMode').sub((mode: TcasOperatingModeSetting) => {
      (this.currentTcasModes[0] as Subject<TcasOperatingModeSetting>).set(mode);
    });

    (this.currentTcasModes[1] as Subject<TcasVerticalRange>).sub((mode) => {
      this.trafficUserSettings.getSetting('tcasVerticalRange').set(mode);
    });
    this.trafficUserSettings.getSetting('tcasVerticalRange').sub((mode: TcasVerticalRange) => {
      (this.currentTcasModes[1] as Subject<TcasVerticalRange>).set(mode);
    });

    (this.currentTcasModes[2] as Subject<TcasRelativeAbsoluteMode>).sub((mode) => {
      this.trafficUserSettings.getSetting('trafficAltitudeRelative').set(mode === TcasRelativeAbsoluteMode.REL);
    });
    this.trafficUserSettings.getSetting('trafficAltitudeRelative').sub((isRelativeAbsolute: boolean) => {
      (this.currentTcasModes[2] as Subject<TcasRelativeAbsoluteMode>).set(
        isRelativeAbsolute ? TcasRelativeAbsoluteMode.REL : TcasRelativeAbsoluteMode.ABS
      );
    });

    (this.currentDmeModes[0] as MutableSubscribable<DmePairMode>).sub((v) => {
      this.navComSettingsManager.getSetting('dmePairSwapped').set(v === DmePairMode.NAV2);
    });
    (this.currentDmeModes[2] as MutableSubscribable<DmePairMode>).sub((v) => {
      this.navComSettingsManager.getSetting('dmePairSwapped').set(v === DmePairMode.NAV1);
    });
    (this.currentDmeModes[1] as MutableSubscribable<DmeHoldMode>).sub((v) => {
      this.navComSettingsManager.getSetting('dme1HoldOn').set(v === DmeHoldMode.ON);
    });
    (this.currentDmeModes[3] as MutableSubscribable<DmeHoldMode>).sub((v) => {
      this.navComSettingsManager.getSetting('dme2HoldOn').set(v === DmeHoldMode.ON);
    });

    (this.currentXpdrModes[1] as Subject<AdsBroadcastOutMode>).sub((mode) => {
      this.trafficUserSettings.getSetting('trafficAdsbEnabled').set(mode === AdsBroadcastOutMode.ON);
    });
    this.trafficUserSettings.getSetting('trafficAdsbEnabled').sub((mode) => {
      (this.currentXpdrModes[1] as Subject<AdsBroadcastOutMode>).set(mode ? AdsBroadcastOutMode.ON : AdsBroadcastOutMode.OFF);
    });
  }

  /**
   * Sets a new transponder code.
   * @param increment Whether the increment should be coarse (leftmost 2 digits), or fine (rightmost 2 digits).
   * @param sign The sign of the increment.
   */
  public handleVfrCodeChange(increment: 'COARSE' | 'FINE', sign: 1 | -1): void {
    const vfrCode = this.navComSettingsManager.getSetting('vfrCode');
    const newCode = MathUtils.clamp(
      vfrCode.get() + Math.sign(sign) * (increment === 'COARSE' ? 64 : 1),
      0,
      4095, // 7777 octal
    );
    this.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_set_vfr_code', newCode);
  }

  /**
   * The handler to call when DETAIL button is pressed.
   * @param page A Radio Detail Page.
   */
  public handleDetailButtonPressed(page: RadioSubWindowDetailPage): void {
    if (page === this.currentPage.get()) {
      this.currentPage.set(RadioSubWindowDetailPage.NONE);
    } else {
      this.currentPage.set(page);
    }
  }

  /** The handler to call when the DME button is pressed. */
  public handleDmeButtonPressed(): void {
    if (this.currentPage.get() === RadioSubWindowDetailPage.DME) {
      this.currentPage.set(RadioSubWindowDetailPage.NONE);
    } else {
      this.currentPage.set(RadioSubWindowDetailPage.DME);
    }
  }

  /** The handler to call when the VFR button is pressed */
  public handleVfrButtonPress(): void {
    this.bus.getPublisher<Epic2TransponderEvents>().pub('epic2_xpdr_toggle_vfr_code', true);
  }

  /** Callback handler when a soft key button of the right side of the screen is pressed. */
  public handleSelKnobPressed(): void {
    // Disable this HEvent handler if a Detail Page is not being displayed.
    if (this.currentPage.get() === RadioSubWindowDetailPage.NONE) {
      return;
    }
    // Disable this HEvent handler if a Detail Page is not being displayed.
    if (this.currentPage.get() === RadioSubWindowDetailPage.NONE) {
      return;
    }

    this.rows[this._currentRowIndex.get()].rowCallback?.();
  }

  /**
   * Callback handler when an HEvent happens.
   * @param event The key event.
   */
  public handleHEvent(event: string): void {
    // Disable this HEvent handler if a Detail Page is not being displayed.
    if (this.currentPage.get() === RadioSubWindowDetailPage.NONE) {
      return;
    }

    let index: number | undefined;

    // TODO Update with new H event names
    switch (event) {
      case this.lskNameStrings[0]:
      case this.lskNameStrings[1]:
      case this.lskNameStrings[2]:
      case this.lskNameStrings[3]:
      case this.lskNameStrings[4]:
      case this.lskNameStrings[5]:
        index = Epic2DuController.getSoftKeyIndexFromSoftKeyHEvent(event) - 7;
        break;
    }

    if (index !== undefined && index <= this.rows.length - 1) {
      const previousSelectedRowIndex = this._currentRowIndex.get();

      const selectedRowCallback = this.rows[index].rowCallback;
      if (selectedRowCallback &&
        (previousSelectedRowIndex === index || !Object.keys(this.rows[index]).includes('rowOptions'))
      ) {
        selectedRowCallback();
        return;
      }

      this._currentRowIndex.set(index);
    }
  }

  /**
   * Updates the Com Spacing of the target COM radio.
   * @param spacing the new Com Spacing.
   * @param index the user setting index.
   */
  private handleComSpacingChange(spacing: ComSpacing, index: 1 | 2): void {
    this.navComSettingsManager.getSetting(`comSpacing_${index}`).set(spacing);
  }

  /**
   * Renders an option row.
   * @param row A DetailPageOptionRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  public renderOptionRow(row: DetailPageOptionRow, isSelected: Subscribable<boolean>): VNode {
    return (
      <div class={{
        'radio-sub-window': true,
        'sub-window-selected': isSelected,
      }}>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={() => row.rowCallback && row.rowCallback()}
        >
          <span class="radio-sub-window-soft-key-label">
            {row.rowTitle.replace(' ', '\n')}
          </span>
        </TouchButton>
        <div class="epic2-radio-detail-options-container">
          {row.rowOptions.map((option) => (
            <DetailPageOption
              label={option.label}
              labelSuffix={option.labelSuffix}
              value={option.value}
              selectedValue={row.selectedValue}
            />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Renders a text row.
   * @param row A DetailPageOptionRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  public renderTextRow(row: DetailPageTextRow, isSelected: Subscribable<boolean>): VNode {
    return (
      <div class={{
        'radio-sub-window': true,
        'sub-window-selected': isSelected,
      }}>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={() => row.rowCallback && row.rowCallback()}
        >
          <span class="radio-sub-window-soft-key-label">
            {row.rowTitle.replace(' ', '\n')}
          </span>
        </TouchButton>
        <div class="epic2-radio-detail-text-container">
          {row.rowText}
        </div>
      </div>
    );
  }

  /**
   * Renders a text row.
   * @param row A DetailPageVNodeRow.
   * @param isSelected Whether this row is selected.
   * @returns A VNode.
   */
  public renderVNodeRow(row: DetailPageVNodeRow, isSelected: Subscribable<boolean>): VNode {
    return (
      <div class={{
        'radio-sub-window': true,
        'sub-window-selected': isSelected,
      }}>
        <TouchButton
          variant='base'
          class={this.softKeyClass}
          onPressed={() => row.rowCallback && row.rowCallback()}
        >
          <span class="radio-sub-window-soft-key-label">
            {row.rowTitle.replace(' ', '\n')}
          </span>
        </TouchButton>
        <div class="epic2-radio-detail-vnode-container">
          {row.vnode}
        </div>
      </div>
    );
  }
}
