/// <reference types="@microsoft/msfs-types/js/avionics" />
/// <reference types="@microsoft/msfs-types/js/common" />
/// <reference types="@microsoft/msfs-types/js/simvar" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/core/vcockpitlogic" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/systems/systems" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/utils/xmllogic" />
/// <reference types="@microsoft/msfs-types/pages/vcockpit/instruments/shared/baseinstrument" />

/** Epic2 screen swap VCockpit logic. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Systems_Epic2 extends Systems {
  private MFDUpperName: string | null = null;
  private MFDLowerName: string | null = null;

  private MFDUpperPanel?: VCockpitLogicInputPanel;
  private MFDLowerPanel?: VCockpitLogicInputPanel;

  private MFDUpperOutput = new VCockpitLogicOutputPanel();
  private MFDLowerOutput = new VCockpitLogicOutputPanel();

  private FinalOutput = new VCockpitLogicOutput();

  private bMFDUpperTurnedOn?: boolean;
  private bMFDLowerTurnedOn?: boolean;

  private bMFDUpperFailure?: boolean;
  private bMFDLowerFailure?: boolean;

  private bSwapScreens = false;

  /** @inheritdoc */
  public override init(_xmlConfig: Document, _logicData: VCockpitLogicInput): void {
    super.init(_xmlConfig, _logicData);

    if (this.MFDUpperName === null) {
      console.error('Missing MFDUpperName! Check panel.xml Logic element.');
    }
    if (this.MFDLowerName === null) {
      console.error('Missing MFDLowerName! Check panel.xml Logic element.');
    }
    if (this.MFDUpperName === null || this.MFDLowerName === null) {
      return;
    }

    // Look for MFD Panels
    for (let i = 0; i < _logicData.daPanels.length; i++) {
      const panel = _logicData.daPanels[i];

      for (let j = 0; j < panel.daInstruments.length; j++) {
        const instrument = panel.daInstruments[j];

        if (Name_Z.compareStr(instrument.nName, this.MFDUpperName)) {
          this.MFDUpperPanel = panel;
          this.MFDUpperOutput.iGUId = panel.iGUId;
        } else if (Name_Z.compareStr(instrument.nName, this.MFDLowerName)) {
          this.MFDLowerPanel = panel;
          this.MFDLowerOutput.iGUId = panel.iGUId;
        }
      }
    }

    if (this.MFDUpperPanel === undefined) {
      console.error('Could not find MFDUpper Instrument! Check panel.xml.');
    }
    if (this.MFDLowerPanel === undefined) {
      console.error('Could not find MFDLower Instrument! Check panel.xml.');
    }
  }

  /** @inheritdoc */
  protected override parseXML(): void {
    super.parseXML();

    const logicElement = this.xmlConfig.getElementsByTagName('Logic');
    if (logicElement.length > 0) {
      this.MFDUpperName = logicElement[0].getElementsByTagName('MFD_UPPER')[0].textContent;
      this.MFDLowerName = logicElement[0].getElementsByTagName('MFD_LOWER')[0].textContent;
    }
  }

  /** @inheritdoc */
  public override update(): void {
    super.update();

    if (
      this.MFDUpperName === null || this.MFDLowerName === null
      || this.MFDLowerPanel === undefined || this.MFDUpperPanel === undefined
    ) {
      return;
    }

    const bMFDUpperTurnedOn = this.isInstrumentTurnedOn(this.MFDUpperName);
    const bMFDLowerTurnedOn = this.isInstrumentTurnedOn(this.MFDLowerName);

    const bMFDUpperFailure = this.isScreenFailure(this.MFDUpperName);
    const bMFDLowerFailure = this.isScreenFailure(this.MFDLowerName);

    const bSwapScreens = this.areMfdsSwapped();

    const run = this.bMFDLowerTurnedOn !== bMFDLowerTurnedOn
      || this.bMFDUpperTurnedOn !== bMFDUpperTurnedOn
      || this.bMFDLowerFailure !== bMFDLowerFailure
      || this.bMFDUpperFailure !== bMFDUpperFailure
      || this.bSwapScreens !== bSwapScreens;

    if (run) {
      //Update Upper MFD
      if (this.MFDUpperOutput) {
        this.MFDUpperOutput.daTargetMaterials = [];
        this.MFDUpperOutput.daAttributes = [];

        if (bSwapScreens) {
          this.addMaterials(this.MFDUpperOutput, this.MFDLowerPanel.daOriginalMaterials);
        } else {
          this.addMaterials(this.MFDUpperOutput, this.MFDUpperPanel.daOriginalMaterials);
        }
      }

      //Update Lower MFD
      if (this.MFDLowerOutput) {
        this.MFDLowerOutput.daTargetMaterials = [];
        this.MFDLowerOutput.daAttributes = [];

        if (bSwapScreens) {
          this.addMaterials(this.MFDLowerOutput, this.MFDUpperPanel.daOriginalMaterials);
        } else {
          this.addMaterials(this.MFDLowerOutput, this.MFDLowerPanel.daOriginalMaterials);
        }
      }

      //Update
      this.FinalOutput.daPanels = [this.MFDUpperOutput, this.MFDLowerOutput];
      this.updateLogic(this.FinalOutput);

      this.bMFDUpperTurnedOn = bMFDUpperTurnedOn;
      this.bMFDLowerTurnedOn = bMFDLowerTurnedOn;
      this.bMFDUpperFailure = bMFDUpperFailure;
      this.bMFDLowerFailure = bMFDLowerFailure;
      this.bSwapScreens = bSwapScreens;
    }
  }

  /**
   * Checks if a named instrument is turned on.
   * @param _name The name of the instrument to check.
   * @returns true if the instrument is on.
   */
  protected isInstrumentTurnedOn(_name: string): boolean {
    if (this.allInstruments) {
      for (let i = 0; i < this.allInstruments.length; i++) {
        const instrument = this.allInstruments[i];
        if (instrument.name == _name) {
          if ((instrument.electrics as any).getValue() != 0) {
            return true;
          } else {
            return false;
          }
        }
      }

      //console.log("Instrument " + _name + " not found");
    }

    return false;
  }

  /**
   * Checks if a named instrument has failed.
   * @param _name The name of the instrument to check.
   * @returns True if the instrument has failed.
   */
  protected isScreenFailure(_name: string): boolean {
    if (_name == this.MFDUpperName) {
      // FIXME implement
      return false;
    } else if (_name == this.MFDLowerName) {
      // FIXME implement
      return false;
    }

    return false;
  }

  /**
   * Checks if the MFDs should be swapped.
   * @returns true is an MFD swap is desired.
   */
  protected areMfdsSwapped(): boolean {
    // The LVAR needs to match Epic2DuControlLocalVars.MfdSwap.
    // We don't want to import it here and drag the entirety of msfssdk and e2shared into VCockpitLogic.
    return SimVar.GetSimVarValue('L:WT_Epic2_MFD_Swap', 'Bool');
  }
}
