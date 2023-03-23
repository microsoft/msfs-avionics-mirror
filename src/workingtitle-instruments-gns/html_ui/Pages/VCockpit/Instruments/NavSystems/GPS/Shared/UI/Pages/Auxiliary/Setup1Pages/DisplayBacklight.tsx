import { CombinedSubject, FocusPosition, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';
import { OptionDialog } from '../../../Controls/OptionDialog';
import { SelectableText } from '../../../Controls/SelectableText';
import { GNSUiControl } from '../../../GNSUiControl';
import { MenuDefinition, MenuEntry, ViewService } from '../../Pages';
import { AuxPage, AuxPageProps } from '../AuxPages';

import './DisplayBacklight.css';

/**
 * DISPLAY BACKLIGHT page menu
 */
class DisplayBacklightMenu extends MenuDefinition {
  /**
   * Ctor
   *
   * @param page the display backlight page instance
   */
  constructor(private readonly page: DisplayBacklight) {
    super();
  }

  public readonly entries: readonly MenuEntry[] = [
    {
      label: 'Reset Defaults?',
      disabled: Subject.create<boolean>(false),
      action: (): void => {
        this.page.resetDefaults();
        ViewService.back();
      },
    },
  ];

  /** @inheritDoc */
  updateEntries(): void {
    // noop
  }
}

/**
 * Backlight control modes
 */
enum BacklightMode {
  Auto = 'Auto',
  Manual = 'Manual',
}

/**
 * Props for {@link DisplayBacklight}
 */
export interface DisplayBacklightProps extends AuxPageProps {
  /**
   * A document for the panel XML config
   */
  xmlConfig: Document,
}

/**
 * DISPLAY BACKLIGHT page
 */
export class DisplayBacklight extends AuxPage<DisplayBacklightProps> {
  protected readonly menu = new DisplayBacklightMenu(this);

  private readonly scrollContainerRef = FSComponent.createRef<GNSUiControl>();
  private readonly scrollContainerRef2 = FSComponent.createRef<GNSUiControl>();
  private readonly modeRef = FSComponent.createRef<SelectableText>();
  private readonly modeRef2 = FSComponent.createRef<SelectableText>();
  private readonly dialogRef = FSComponent.createRef<OptionDialog>();

  private readonly mode = Subject.create(BacklightMode.Auto);
  private readonly brightness = Subject.create(8_000);

  private readonly manualBrightnessEnabledLVar: string | undefined;
  private readonly manualBrightnessValueLVar: string | undefined;

  /** @inheritDoc */
  constructor(props: DisplayBacklightProps) {
    super(props);

    // Figure out the manual brightness LVars based on the provided panel XML config

    const xml = this.props.xmlConfig;

    const targetName = this.props.gnsType === 'wt530' ? 'AS530' : 'AS430';
    const instrumentTags = Array.from(xml.querySelectorAll('Instrument'));

    const matchingInstrumentTag = instrumentTags.find((it) => it.querySelector('Name')?.textContent?.trim() === targetName);

    const name = matchingInstrumentTag?.querySelector('Name')?.textContent;
    const comIndex = matchingInstrumentTag?.querySelector('ComIndex')?.textContent;
    const navIndex = matchingInstrumentTag?.querySelector('NavIndex')?.textContent;

    if (name !== undefined && comIndex !== undefined && navIndex !== undefined) {
      this.manualBrightnessEnabledLVar = `L:${name}_ManualBrightness_Enabled${navIndex}_${comIndex}`;
      this.manualBrightnessValueLVar = `L:${name}_ManualBrightness_Value${navIndex}_${comIndex}`;
    }
  }

  /** @inheritDoc */
  focus(focusPosition: FocusPosition): boolean {
    return this.scrollContainerRef.instance.focus(focusPosition);
  }

  /**
   * Resets settings to default
   */
  resetDefaults(): void {
    this.mode.set(BacklightMode.Auto);
    this.brightness.set(8000);
  }

  /**
   * Updates the backlight related LVars
   */
  private updateToLVars(): void {
    // If the LVars do not exist, we do nothing
    if (!this.manualBrightnessEnabledLVar || !this.manualBrightnessValueLVar) {
      return;
    }

    const mode = this.mode.get();

    if (mode === BacklightMode.Auto) {
      SimVar.SetSimVarValue(this.manualBrightnessEnabledLVar, 'Boolean', false);
    } else {
      const brightness = this.brightness.get();

      SimVar.SetSimVarValue(this.manualBrightnessEnabledLVar, 'Boolean', true);
      SimVar.SetSimVarValue(this.manualBrightnessValueLVar, 'percent over 100', brightness);
    }
  }

  /**
   * handles opening the popup
   *
   * @returns true
   */
  private handleOpenPopup(): boolean {
    this.scrollContainerRef.instance.blur();
    this.dialogRef.instance.openPopout(0);
    this.dialogRef.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * handles opening the popup
   *
   * @returns true
   */
  private handleClosePopup(): boolean {
    this.dialogRef.instance.closePopout();
    this.dialogRef.instance.blur();
    this.scrollContainerRef.instance.focus(FocusPosition.First);
    return true;
  }

  /**
   * Handles incrementing the brightness by 1
   *
   * @returns true
   */
  private handleIncrementBrightness(): boolean {
    const value = this.brightness.get();
    this.brightness.set(Math.min(8_000, value + 1));

    return true;
  }

  /**
   * Handles decrementing the brightness by 1
   *
   * @returns true
   */
  private handleDecrementBrightness(): boolean {
    const value = this.brightness.get();
    this.brightness.set(Math.min(8_000, value - 1));

    return true;
  }

  /**
   * Handles changing the backlight mode using the dialog
   *
   * @param mode the new mode to set
   */
  private handleModChange(mode: BacklightMode): void {
    this.mode.set(mode);

    if (mode === BacklightMode.Auto) {
      this.modeRef.instance.setIsolated(true);
    } else {
      this.modeRef.instance.setIsolated(false);
    }

    this.handleClosePopup();
  }

  /** @inheritDoc */
  onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.dialogRef.instance.setItems([BacklightMode.Auto, BacklightMode.Manual]);

    // Update backlight LVars every time mode or brightness change
    CombinedSubject.create(this.mode, this.brightness).sub(() => this.updateToLVars());
  }

  /**
   * Renders the Contrast in the display in the 430
   * @returns a div that will render certain controls
   */
  private renderContrast(): VNode {
    if (this.props.gnsType === 'wt430') {
      return (<div>
        <div class="display-backlight-table-header2 cyan">
          <span>MODE</span>
          <span>{this.props.gnsType === 'wt430' ? 'LVL' : 'LEVEL'}</span>
        </div>
        <div class="display-backlight-side-title2 cyan">CONTRAST</div>
        <div class="aux-table display-backlight-table2">
          <GNSUiControl ref={this.scrollContainerRef2} isolateScroll>
            <SelectableText
              ref={this.modeRef2}
              class="aux-entry display-backlight-mode2"
              data={this.mode}
              onRightInnerInc={this.handleOpenPopup.bind(this)}
              onRightInnerDec={this.handleOpenPopup.bind(this)}
            />
            <SelectableText
              class="aux-entry display-backlight-brightness2"
              data={this.brightness.map((it) => it.toString())}
              onRightInnerInc={this.handleIncrementBrightness.bind(this)}
              onRightInnerDec={this.handleDecrementBrightness.bind(this)}
            />
          </GNSUiControl>
          <OptionDialog
            ref={this.dialogRef}
            class="backlight-mode-option-dialog"
            label="MODE"
            onSelected={(index): void => this.handleModChange(index === 0 ? BacklightMode.Auto : BacklightMode.Manual)}
          />
        </div>
      </div>);
    } else {
      return (<div></div>);
    }
  }

  /** @inheritDoc */
  render(): VNode {
    return (
      <div class="page aux-page hide-element" ref={this.el}>
        <div class='aux-page-header'>
        </div>
        <div class='aux-table-header'>
          DISPLAY
        </div>
        <div class="display-backlight-container">
          <div />
          <div class="display-backlight-table-header cyan">
            <span>MODE</span>
            <span>{this.props.gnsType === 'wt430' ? 'LVL' : 'LEVEL'}</span>
          </div>
          <div class="display-backlight-side-title cyan">BACKLIGHT</div>
          <div class="aux-table display-backlight-table">
            <GNSUiControl ref={this.scrollContainerRef} isolateScroll>
              <SelectableText
                ref={this.modeRef}
                class="aux-entry display-backlight-mode"
                data={this.mode}
                onRightInnerInc={this.handleOpenPopup.bind(this)}
                onRightInnerDec={this.handleOpenPopup.bind(this)}
              />
              <SelectableText
                class="aux-entry display-backlight-brightness"
                data={this.brightness.map((it) => it.toString())}
                onRightInnerInc={this.handleIncrementBrightness.bind(this)}
                onRightInnerDec={this.handleDecrementBrightness.bind(this)}
              />
            </GNSUiControl>
            <OptionDialog
              ref={this.dialogRef}
              class="backlight-mode-option-dialog"
              label="MODE"
              onSelected={(index): void => this.handleModChange(index === 0 ? BacklightMode.Auto : BacklightMode.Manual)}
            />
          </div>
          {this.renderContrast()}
        </div>
      </div>
    );
  }
}
