import {
  ConsumerSubject, ControlEvents, DisplayComponent, FSComponent, MappedSubject, Subject, SubscribableMapFunctions,
  Subscription, VNode, XPDRMode, XPDRSimVarEvents
} from '@microsoft/msfs-sdk';

import { UiService } from '../../../UiSystem/UiService';
import { UiViewKeys } from '../../../UiSystem/UiViewKeys';
import { RenderedUiViewEntry, UiViewStackLayer } from '../../../UiSystem/UiViewTypes';
import { CombinedTouchButton } from '../../TouchButton/CombinedTouchButton';
import { UiToggleTouchButton } from '../../TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../TouchButton/UiTouchButton';
import { TransponderViewEvents } from '../../../../MFD/Views/TransponderView/TransponderViewEvents';
import { TransponderViewControlEvents } from '../../../../MFD/Views/TransponderView/TransponderViewControlEvents';

import './CnsXpdrButtonGroup.css';

/**
 * Component props for {@link CnsXpdrButtonGroup}.
 */
export interface CnsXpdrButtonGroupProps {
  /** The ui service */
  uiService: UiService,
}

/**
 * A CNS data bar transponder button.
 */
export class CnsXpdrButtonGroup extends DisplayComponent<CnsXpdrButtonGroupProps> {
  private readonly controlPublisher = this.props.uiService.bus.getPublisher<ControlEvents & TransponderViewControlEvents>();

  private readonly combinedButtonRef = FSComponent.createRef<CombinedTouchButton>();

  private readonly xpdrMode = ConsumerSubject.create(null, XPDRMode.OFF);
  private readonly xpdrCode = ConsumerSubject.create(null, 0);
  private readonly isIdent = ConsumerSubject.create(null, false);
  private readonly xpdrViewCodeState = ConsumerSubject.create(null, 'unchanged');

  private readonly isInTransmittingMode = this.xpdrMode.map(mode => mode !== XPDRMode.OFF && mode !== XPDRMode.STBY && mode !== XPDRMode.TEST);
  private readonly isCodeStateValid = this.xpdrViewCodeState.map(state => state !== 'invalid');

  private readonly transponderModeText = this.xpdrMode.map((mode) => {
    switch (mode) {
      case XPDRMode.ON:
        return 'ON';
      case XPDRMode.GROUND:
        return 'GND';
      case XPDRMode.ALT:
        return 'ALT';
      case XPDRMode.STBY:
        return 'STBY';
      case XPDRMode.TEST:
        return 'TEST';
      default:
        return '';
    }
  });

  private readonly xpdrCodeText = this.xpdrCode.map((code) => code.toFixed(0).padStart(4, '0'));

  private readonly isIdentButtonEnabled = MappedSubject.create(
    SubscribableMapFunctions.and(),
    this.isInTransmittingMode,
    this.isCodeStateValid
  );
  private readonly identButtonLabel = this.xpdrViewCodeState.map(state => state === 'unchanged' ? 'IDENT' : 'ENT+ID');

  private readonly interrogationSymbolIsHidden = Subject.create(true);

  private readonly subscriptions: Subscription[] = [
    this.xpdrMode,
    this.xpdrCode,
    this.isIdent,
    this.xpdrViewCodeState
  ];

  /** @inheritDoc */
  public onAfterRender(): void {
    const sub = this.props.uiService.bus.getSubscriber<XPDRSimVarEvents & TransponderViewEvents>();

    this.xpdrMode.setConsumer(sub.on('xpdr_mode_1'));
    this.xpdrCode.setConsumer(sub.on('xpdr_code_1'));
    this.isIdent.setConsumer(sub.on('xpdr_ident_1'));
    this.xpdrViewCodeState.setConsumer(sub.on('xpdr_view_code_state'));
  }

  /**
   * Handle code side pressed
   */
  private handleCodeSidePressed(): void {
    if (!this.props.uiService.closeMfdPopup((popup: RenderedUiViewEntry) => popup.key === UiViewKeys.Transponder)) {
      this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.Transponder, true, { popupType: 'slideout-bottom-full' });
    }
  }

  /**
   * Send ident event to a bus
   */
  private ident(): void {
    if (this.xpdrViewCodeState.get() === 'changed') {
      this.controlPublisher.pub('xpdr_view_enter_plus_ident', undefined);
    } else {
      this.controlPublisher.pub('xpdr_send_ident_1', true, true, false);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='cns-xpdr'>
        <CombinedTouchButton ref={this.combinedButtonRef} orientation='row' class='cns-xpdr-combined-button'>
          <UiTouchButton
            isEnabled={this.isCodeStateValid}
            onPressed={this.handleCodeSidePressed.bind(this)}
            class={{
              'cns-xpdr-code-button': true,
              'cns-xdpr-code-button-transmit-mode': this.isInTransmittingMode
            }}
          >
            <div class='cns-xpdr-code-title'>XPDR</div>
            <div class={{ 'cns-xpdr-code-interrogation': true, 'hidden': this.interrogationSymbolIsHidden }}>
              R
            </div>
            <div class='cns-xpdr-bottom-container'>
              <span class='cns-xpdr-code'>{this.xpdrCodeText}</span>
              <span class={{ 'cns-xpdr-mode': true }}>{this.transponderModeText}</span>
            </div>
          </UiTouchButton>

          <UiToggleTouchButton
            state={this.isIdent}
            label={this.identButtonLabel}
            isEnabled={this.isIdentButtonEnabled}
            onPressed={this.ident.bind(this)}
            class='cns-xpdr-ident-button'
          />
        </CombinedTouchButton>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.combinedButtonRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
