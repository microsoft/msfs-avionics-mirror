import { AdcEvents, ConsumerSubject, ControlEvents, SimVarValueType, Subject, XPDRMode, XPDRSimVarEvents } from '@microsoft/msfs-sdk';

import { DisplayField } from '../Framework/Components/DisplayField';
import { SwitchLabel } from '../Framework/Components/SwitchLabel';
import { TextInputField } from '../Framework/Components/TextInputField';
import { TransponderCodeFormat } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * The FMC ATC Control page.
 */
export class AtcControlPage extends FmcPage {
  private readonly identSub = Subject.create(false);
  private readonly codeSub = Subject.create(0);
  private readonly altReportSub = Subject.create(0);
  private readonly modeSub = Subject.create(0);

  private readonly pressureAlt = ConsumerSubject.create(null, 0);

  private readonly CodeInput = new TextInputField(this, {
    formatter: new TransponderCodeFormat(),
    style: '[green]',
    onSelected: async (scratchpadContents): Promise<boolean> => {
      if (scratchpadContents.length === 0) {
        this.setActiveRoute('/tune/1');
        return true;
      }

      return false;
    }
  }).bind(this.codeSub);

  private readonly AltReportSwitch = new SwitchLabel(this, {
    optionStrings: ['ON', 'OFF'],
    activeStyle: 'blue'
  }).bind(this.altReportSub);

  private readonly PressureAltField = new DisplayField(this, {
    formatter: {
      nullValueString: 'ALT [white] ---- FT[green]',

      /** @inheritDoc */
      format(value: number): string {
        return `ALT[white] ${value} FT[green]`;
      },
    },
  }).bind(this.pressureAlt);

  private readonly IdentButton = new DisplayField(this, {
    formatter: {
      nullValueString: 'IDENT',

      /** @inheritDoc */
      format(value: boolean): string {
        return `IDENT[${value ? 'blue' : 'white'} s-text]`;
      },
    },

    onSelected: async () => {
      await SimVar.SetSimVarValue('K:XPNDR_IDENT_ON', SimVarValueType.Bool, true);
      return true;
    },
  }).bind(this.identSub);

  private readonly XpdrSwitch = new SwitchLabel(this, {
    optionStrings: ['ATC1', 'ATC2'],
    activeStyle: 'blue',
    disabled: true
  });

  private readonly ModeSwitch = new SwitchLabel(this, {
    optionStrings: ['ON', 'STBY'],
    activeStyle: 'blue'
  }).bind(this.modeSub);

  /** @inheritdoc */
  protected onInit(): void {
    // TODO: Support two transponders

    const pub = this.eventBus.getPublisher<ControlEvents>();
    const sub = this.eventBus.getSubscriber<XPDRSimVarEvents & AdcEvents>();

    // Update code input field from transponder code
    this.addBinding(sub.on('xpdr_code_1').whenChanged().handle((code => {
      this.codeSub.set(code);
    })));

    // Update mode and alt reporting switches from transponder mode
    this.addBinding(sub.on('xpdr_mode_1').whenChanged().handle(mode => {
      switch (mode) {
        case XPDRMode.ON:
          this.modeSub.set(0);
          this.altReportSub.set(1);
          break;
        case XPDRMode.ALT:
          this.modeSub.set(0);
          this.altReportSub.set(0);
          break;
        case XPDRMode.OFF:
        case XPDRMode.STBY:
          this.modeSub.set(1);
          break;
      }
    }));

    // Update transponder ident
    this.addBinding(sub.on('xpdr_ident_1').whenChanged().handle((ident) => this.identSub.set(ident)));

    // Update transponder code from code input
    this.addBinding(this.codeSub.sub(code => {
      pub.pub('publish_xpdr_code_1', code, true, false);
    }));

    // Update transponder mode from mode switch
    this.addBinding(this.modeSub.sub(val => {
      const mode = val === 0
        ? this.altReportSub.get() === 0 ? XPDRMode.ALT : XPDRMode.ON
        : XPDRMode.STBY;
      pub.pub('publish_xpdr_mode_1', mode, true, false);
    }));

    // Update transponder mode from alt reporting switch
    this.addBinding(this.altReportSub.sub(val => {
      if (this.modeSub.get() === 0) {
        pub.pub('publish_xpdr_mode_1', val === 0 ? XPDRMode.ALT : XPDRMode.ON, true, false);
      }
    }));

    this.pressureAlt.setConsumer(sub.on('pressure_alt').withPrecision(-2));
  }

  /** @inheritdoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        ['ATC CONTROL[blue]'],
        [' ATC1', 'ALT REPORT '],
        [this.CodeInput, this.AltReportSwitch],
        ['', '', this.PressureAltField],
        [this.IdentButton, 'TEST[s-text]'],
        [''],
        [''],
        [' SELECT', ''],
        [this.XpdrSwitch, ''],
        [' MODE'],
        [this.ModeSwitch, '']
      ]
    ];
  }

  /** @inheritdoc */
  protected onDestroy(): void {
    this.pressureAlt.destroy();
  }
}