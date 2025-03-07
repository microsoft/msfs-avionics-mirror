import {
  ComponentProps, DisplayComponent, EventBus, FSComponent, HEvent, SetSubject, Subject, TcasAdvisoryDataProvider, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import {
  CheckBox, DisplayUnitIndices, Epic2BezelButtonEvents, PfdAliasedUserSettingTypes, RadioButton, TerrWxState, TouchButton
} from '@microsoft/msfs-epic2-shared';

import './HsiDisplay.css';

/** The properties for the {@link HsiDisplay} component. */
interface HsiDisplayProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The settings manager to use. */
  settings: UserSettingManager<PfdAliasedUserSettingTypes>;
  /** Display unit index. */
  index: DisplayUnitIndices;
  /** The side of the DU that the AHI is on. */
  ahiSide: 'left' | 'right';
  /** A TCAS Advisory data provider */
  tcasAdvisoryDataProvider: TcasAdvisoryDataProvider
}

/**
 * Holds map weather options
 */
enum TerrWxOptions {
  WX = 'WX',
  TERR = 'TERR',
  OFF = 'OFF',
}

/** The HsiDisplay component. */
export class HsiDisplay extends DisplayComponent<HsiDisplayProps> {
  private readonly classList = SetSubject.create(['hsi-display-lower', 'hidden']);
  /** SVS ON Checked state. */
  readonly svsChecked = this.props.settings.getSetting('syntheticVisionEnabled');
  /** TRFC Checked state. */
  readonly trfcChecked = this.props.settings.getSetting('trafficEnabled');
  /** LX Checked state. */
  readonly lxChecked = this.props.settings.getSetting('lightningEnabled');
  /** Terr Wx State */
  private readonly radioOptionList = Subject.create<TerrWxOptions>(this.props.settings.getSetting('terrWxState').get() as TerrWxOptions);
  /** Manages visibility of the traffic button */
  private readonly trafficButtonClasses = SetSubject.create(['trfc-btn', 'hidden']);

  private readonly lskNameStrings: Epic2BezelButtonEvents[] =
    this.props.ahiSide === 'left' ? [
      Epic2BezelButtonEvents.LSK_L7,
      Epic2BezelButtonEvents.LSK_L8,
      Epic2BezelButtonEvents.LSK_L9,
      Epic2BezelButtonEvents.LSK_L10,
      Epic2BezelButtonEvents.LSK_L11,
      Epic2BezelButtonEvents.LSK_L12,
    ] : [
      Epic2BezelButtonEvents.LSK_R7,
      Epic2BezelButtonEvents.LSK_R8,
      Epic2BezelButtonEvents.LSK_R9,
      Epic2BezelButtonEvents.LSK_R10,
      Epic2BezelButtonEvents.LSK_R11,
      Epic2BezelButtonEvents.LSK_R12,
    ];

  /** @inheritDoc */
  onAfterRender(): void {
    this.props.bus.getSubscriber<HEvent>().on('hEvent').handle(this.handleBezelButton);

    /** Handle traffic icon visibility. Hidden when there are no active RA or TA intruders */
    this.props.tcasAdvisoryDataProvider.raIntruders.sub((set) => {
      this.trafficButtonClasses.toggle('ra-btn', set.size >= 1);
      this.trafficButtonClasses.toggle('hidden', set.size === 0 && !this.trafficButtonClasses.has('ta-btn'));
    });
    this.props.tcasAdvisoryDataProvider.taIntruders.sub((set) => {
      this.trafficButtonClasses.toggle('ta-btn', set.size >= 1);
      this.trafficButtonClasses.toggle('hidden', set.size === 0 && !this.trafficButtonClasses.has('ra-btn'));
    });
  }

  /**
   * Handles Bezel Button events
   * @param event Key Name
   */
  private handleBezelButton = (event: string): void => {
    if (event === this.lskNameStrings[0]) {
      this.toggleMenu(this.props.index);
    }

    if (!this.classList.has('hidden')) {
      switch (event) {
        case this.lskNameStrings[1]:
          //Run SVS BRT
          this.svsChecked.set(!this.svsChecked.get());
          break;
        case this.lskNameStrings[2]:
          //Toggle TRFC
          this.trfcChecked.set(!this.trfcChecked.get());
          break;
        case this.lskNameStrings[3]:
          //Toggle WX/TAWS/OFF
          this.handleRadioToggleClick();
          break;
        case this.lskNameStrings[4]:
          //Toggle LX - Disabled
          break;
        case this.lskNameStrings[5]:
          //Run LX CLR
          break;
      }
    } else if (!this.trfcChecked.get() && !this.trafficButtonClasses.has('hidden')) {
      // handle event only when traffic icon visible
      if (event === this.lskNameStrings[1]) {
        this.trfcChecked.set(true);
      }
    }
  };

  /**
   * Cycle through the radio options
   */
  public handleRadioToggleClick = (): void => {
    const values = Object.values(TerrWxOptions);
    const currentIndex = values.indexOf(this.radioOptionList.get());
    const nextIndex = (currentIndex + 1) % values.length;
    const nextOption = values[nextIndex];
    this.radioOptionList.set(nextOption as TerrWxOptions);
    this.props.settings.getSetting('terrWxState').set(nextOption as TerrWxState);
  };

  /**
   * Toggle the HSI Display menu visibility
   * @param displayUnitIndex selected display unit
   */
  public toggleMenu(displayUnitIndex: DisplayUnitIndices): void {
    if (this.props.index === displayUnitIndex) {
      this.classList.toggle('hidden');
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={`hsi-display ${this.props.ahiSide === 'left' ? 'hsi-display-left' : 'hsi-display-right'}`}>
        <TouchButton variant={'bar-menu'} class="overly-btn" onPressed={() => this.toggleMenu(this.props.index)}>OVRLY</TouchButton>
        <TouchButton variant={'bar-menu'} class={this.trafficButtonClasses} onPressed={() => this.trfcChecked.set(true)}>TRFC</TouchButton>
        <div class={this.classList}>
          <div class="menu-block">
            <TouchButton variant={'bar-menu'} onPressed={() => this.svsChecked.set(!this.svsChecked.get())}>
              <div class="menu-option-svs-brt">
                <span class="menu-label">SVS BRT<br />SVS ON</span>
                <CheckBox isChecked={this.svsChecked} isEnabled={true} />
              </div>
            </TouchButton>
          </div>
          <div class="menu-block">
            <TouchButton variant={'bar-menu'} onPressed={() => this.trfcChecked.set(!this.trfcChecked.get())}>
              <span class="menu-label">TRFC</span>
              <CheckBox isChecked={this.trfcChecked} isEnabled={true} />
            </TouchButton>
          </div>
          <div class="menu-block">
            <TouchButton variant={'bar-menu'} onPressed={() => this.handleRadioToggleClick()}>
              <div class="menu-radio">
                <span class="menu-label">{TerrWxOptions.WX}</span>
                <RadioButton value={TerrWxOptions.WX} selectedValue={this.radioOptionList} />
              </div>
              <div class="menu-radio">
                <span class="menu-label">TAWS</span>
                <RadioButton value={TerrWxOptions.TERR} selectedValue={this.radioOptionList} />
              </div>
              <div class="menu-radio">
                <span class="menu-label">{TerrWxOptions.OFF}</span>
                <RadioButton value={TerrWxOptions.OFF} selectedValue={this.radioOptionList} />
              </div>
            </TouchButton>
          </div>
          <div class="menu-block menu-block-lx">
            <TouchButton variant={'bar-menu'} isActive={false}>
              <span class="menu-label">LX</span>
              <CheckBox isChecked={this.lxChecked} isEnabled={false} />
            </TouchButton>
          </div>
          <div class="menu-block menu-block-last">
            <TouchButton variant={'bar-menu'}>
              <span class="menu-label">LX CLR</span>
            </TouchButton>
          </div>
        </div>
      </div>
    );
  }
}
