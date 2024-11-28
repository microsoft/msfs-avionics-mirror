import { ComRadioTuneEvents, ConsumerSubject, FSComponent, MarkerBeaconTuneEvents, NavComEvents, Subject, VNode } from '@microsoft/msfs-sdk';

import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { GenericTabbedContent } from '../../../Shared/Components/TabbedContainer/GenericTabbedContent';
import { TabbedContainer } from '../../../Shared/Components/TabbedContainer/TabbedContainer';
import { UiImgTouchButton } from '../../../Shared/Components/TouchButton/UiImgTouchButton';
import { UiToggleTouchButton } from '../../../Shared/Components/TouchButton/UiToggleTouchButton';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { G3XRadioUtils } from '../../../Shared/Radio/G3XRadioUtils';
import { AbstractUiView } from '../../../Shared/UiSystem/AbstractUiView';
import { UiViewProps } from '../../../Shared/UiSystem/UiView';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';

import './AudioPopup.css';

/**
 * Component props for {@link AudioPopup}.
 */
export interface AudioViewProps extends UiViewProps {
  /**
   * The radios config.
   */
  radiosConfig: RadiosConfig;
}

/**
 * A UI popup which allows the user to control the audio system.
 */
export class AudioPopup extends AbstractUiView<AudioViewProps> {
  private readonly tabsRef = FSComponent.createRef<TabbedContainer>();

  private readonly sub = this.props.uiService.bus.getSubscriber<ComRadioTuneEvents & NavComEvents & MarkerBeaconTuneEvents>();

  private readonly comDefs = this.props.radiosConfig.comDefinitions;
  private readonly navDefs = this.props.radiosConfig.navDefinitions;

  private readonly isCom1Selected = ConsumerSubject.create(
    this.comDefs[1] ? this.sub.on(`com_receive_${this.comDefs[1].simIndex}`) : null,
    false
  ).pause();
  private readonly isCom2Selected = ConsumerSubject.create(
    this.comDefs[2] ? this.sub.on(`com_receive_${this.comDefs[2].simIndex}`) : null,
    false
  ).pause();
  private readonly isCom1MicSelected = ConsumerSubject.create(
    this.comDefs[1] ? this.sub.on(`com_transmit_${this.comDefs[1].simIndex}`) : null,
    false
  ).pause();
  private readonly isCom2MicSelected = ConsumerSubject.create(
    this.comDefs[2] ? this.sub.on(`com_transmit_${this.comDefs[2].simIndex}`) : null,
    false
  ).pause();
  private readonly isNav1Selected = ConsumerSubject.create(
    this.navDefs[1] ? this.sub.on(`nav_sound_${this.navDefs[1].simIndex}`) : null,
    false
  ).pause();
  private readonly isNav2Selected = ConsumerSubject.create(
    this.navDefs[2] ? this.sub.on(`nav_sound_${this.navDefs[2].simIndex}`) : null,
    false
  ).pause();
  private readonly isMarkerBeaconSelected = ConsumerSubject.create(this.sub.on('marker_beacon_sound'), false).pause();

  private readonly subscriptions = [
    this.isCom1Selected,
    this.isCom2Selected,
    this.isCom1MicSelected,
    this.isCom2MicSelected,
    this.isNav1Selected,
    this.isNav2Selected,
    this.isMarkerBeaconSelected,
  ];

  private thisNode?: VNode;

  /** On back button pressed handler */
  private onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /** On COM 1 button pressed handler */
  private onCom1Pressed(): void {
    if (!this.comDefs[1]) {
      return;
    }

    if (this.isCom1Selected.get()) {
      if (!this.isCom1MicSelected.get()) {
        G3XRadioUtils.setComRadioReceiveState(this.comDefs[1].simIndex, false);
      }
    } else {
      G3XRadioUtils.setComRadioReceiveState(this.comDefs[1].simIndex, true);
    }
  }

  /** On COM 2 button pressed handler */
  private onCom2Pressed(): void {
    if (!this.comDefs[2]) {
      return;
    }

    if (this.isCom2Selected.get()) {
      if (!this.isCom2MicSelected.get()) {
        G3XRadioUtils.setComRadioReceiveState(this.comDefs[2].simIndex, false);
      }
    } else {
      G3XRadioUtils.setComRadioReceiveState(this.comDefs[2].simIndex, true);
    }
  }

  /** On COM 1 MIC button pressed handler */
  private onCom1MicPressed(): void {
    if (!this.comDefs[1]) {
      return;
    }

    if (!this.isCom1Selected.get()) {
      G3XRadioUtils.setComRadioReceiveState(this.comDefs[2].simIndex, false);
    }
    G3XRadioUtils.setTransmittingComIndex(this.comDefs[1].simIndex);
    G3XRadioUtils.setComRadioReceiveState(this.comDefs[1].simIndex, true);
  }

  /** On COM 2 MIC button pressed handler */
  private onCom2MicPressed(): void {
    if (!this.comDefs[2]) {
      return;
    }

    if (!this.isCom2Selected.get()) {
      G3XRadioUtils.setComRadioReceiveState(this.comDefs[1].simIndex, false);
    }
    G3XRadioUtils.setTransmittingComIndex(this.comDefs[2].simIndex);
    G3XRadioUtils.setComRadioReceiveState(this.comDefs[2].simIndex, true);
  }

  /** On NAV 1 button pressed handler */
  private onNav1Pressed(): void {
    if (!this.navDefs[1]) {
      return;
    }

    G3XRadioUtils.setNavRadioIdentReceiveState(this.navDefs[1].simIndex, !this.isNav1Selected.get());
  }

  /** On NAV 2 button pressed handler */
  private onNav2Pressed(): void {
    if (!this.navDefs[2]) {
      return;
    }

    G3XRadioUtils.setNavRadioIdentReceiveState(this.navDefs[2].simIndex, !this.isNav2Selected.get());
  }

  /** On marker beacon button pressed handler */
  private onMarkerBeaconPressed(): void {
    G3XRadioUtils.setMarkerBeaconSoundState();
  }

  /** On more options button pressed handler */
  private onMoreOptionsPressed(): void {
    this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.AudioRadiosPopup, false);
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    this.thisNode = thisNode;
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.subscriptions.forEach((subscription) => subscription.resume());
  }

  /** @inheritDoc */
  public onClose(): void {
    this.subscriptions.forEach((subscription) => subscription.pause());
  }

  /** @inheritDoc */
  public render(): VNode | null {
    return (
      <div class='audio-popup ui-view-panel'>
        <div class='audio-popup-title'>Audio/Intercom</div>
        <TabbedContainer
          ref={this.tabsRef}
          bus={this.props.uiService.bus}
          validKnobIds={this.props.uiService.validKnobIds}
          tabsPerListPage={4}
          tabLength={125}
          tabSpacing={6}
          gduFormat={this.props.uiService.gduFormat}
          tabPosition='top'
        >
          <GenericTabbedContent tabLabel='Radios'>
            <div class='audio-popup-radios'>
              <div class='audio-popup-column audio-popup-column-left'>
                <div class='ui-view-box audio-popup-ui-view-box'>
                  <div class='ui-view-box-title audio-popup-ui-view-box-title'>COM Radios</div>
                  <div class='audio-popup-radios-buttons-row'>
                    <UiToggleTouchButton
                      class='audio-popup-com-1-button'
                      label='COM 1'
                      state={this.isCom1Selected}
                      onPressed={this.onCom1Pressed.bind(this)}
                    />
                    <UiToggleTouchButton
                      label='COM 2'
                      state={this.isCom2Selected}
                      onPressed={this.onCom2Pressed.bind(this)}
                    />
                  </div>
                  <div class='audio-popup-radios-buttons-row'>
                    <UiToggleTouchButton
                      class='audio-popup-com-1-mic-button'
                      label={'COM 1\nMIC'}
                      state={this.isCom1MicSelected}
                      onPressed={this.onCom1MicPressed.bind(this)}
                    />
                    <UiToggleTouchButton
                      label={'COM 2\nMIC'}
                      state={this.isCom2MicSelected}
                      onPressed={this.onCom2MicPressed.bind(this)}
                    />
                  </div>
                  <div class='audio-popup-radios-buttons-row'>
                    <UiToggleTouchButton
                      label={'Split\nCOM'}
                      state={Subject.create(false)}
                      isEnabled={false}
                    />
                  </div>
                </div>
                <div class='audio-popup-radios-buttons-row'>
                  <UiImgTouchButton
                    class='audio-popup-back-button'
                    label='Back'
                    imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_back.png`}
                    onPressed={this.onBackPressed.bind(this)}
                  />
                  <UiImgTouchButton
                    label='Play'
                    isEnabled={Subject.create(false)}
                    imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_play.png`}
                  />
                </div>
              </div>
              <div class='audio-popup-column audio-popup-column-right'>
                <div class='ui-view-box audio-popup-ui-view-box'>
                  <div class='ui-view-box-title'>NAV Radios</div>
                  <UiToggleTouchButton
                    label='NAV 1'
                    state={this.isNav1Selected}
                    onPressed={this.onNav1Pressed.bind(this)}
                  />
                  <UiToggleTouchButton
                    label='NAV 2'
                    state={this.isNav2Selected}
                    onPressed={this.onNav2Pressed.bind(this)}
                  />
                </div>
                {this.props.radiosConfig.hasMarkerBeacon ? (
                  <UiToggleTouchButton
                    label={'Marker\nBeacon'}
                    state={this.isMarkerBeaconSelected}
                    onPressed={this.onMarkerBeaconPressed.bind(this)}
                  />
                ) : (
                  <UiToggleTouchButton
                    label='Speaker'
                    state={Subject.create(false)}
                    isEnabled={false}
                  />
                )}

                <UiTouchButton
                  label={'More\nOptions...'}
                  onPressed={this.onMoreOptionsPressed.bind(this)}
                  isEnabled={this.props.radiosConfig.hasMarkerBeacon}
                />
              </div>
            </div>
          </GenericTabbedContent>
          <GenericTabbedContent tabLabel='Intercom' isEnabled={false}>
            Intercom
          </GenericTabbedContent>
          <GenericTabbedContent tabLabel={'Phone\n& Media'} isEnabled={false}>
            Phone & Media
          </GenericTabbedContent>
          <GenericTabbedContent tabLabel={'Music\nInput'} isEnabled={false}>
            Music Input
          </GenericTabbedContent>
        </TabbedContainer>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.subscriptions.forEach((subscription) => subscription.destroy());
    if (this.thisNode) {
      FSComponent.shallowDestroy(this.thisNode);
    }
  }
}
