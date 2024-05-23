import { ConsumerSubject, FSComponent, MarkerBeaconTuneEvents, SimVarValueType, Subject, VNode } from '@microsoft/msfs-sdk';

import { AbstractUiView, UiViewProps } from '../../../Shared/UiSystem';
import { UiImgTouchButton, UiToggleTouchButton, UiValueTouchButton } from '../../../Shared/Components';
import { G3XTouchFilePaths } from '../../../Shared/G3XTouchFilePaths';
import { RadiosConfig } from '../../../Shared/AvionicsConfig';

import './AudioRadiosPopup.css';

/**
 * Component props for {@link AudioRadiosPopup}.
 */
export interface AudioRadiosPopupProps extends UiViewProps {
  /**
   * The radios config.
   */
  radiosConfig: RadiosConfig;
}

/**
 * A UI popup which allows the user to control radios of audio system.
 */
export class AudioRadiosPopup extends AbstractUiView<AudioRadiosPopupProps> {

  private readonly isMarkerSensitivityHigh = ConsumerSubject.create(this.props.uiService.bus.getSubscriber<MarkerBeaconTuneEvents>().on('marker_beacon_hisense_on'), false);

  private thisNode?: VNode;

  /** On marker sensitivity pressed handler */
  private onMarkerSensitivityPressed(): void {
    SimVar.SetSimVarValue('K:MARKER_BEACON_SENSITIVITY_HIGH', SimVarValueType.Number, this.isMarkerSensitivityHigh.get() ? 0 : 1);
  }

  /** On back button pressed handler */
  private onBackPressed(): void {
    this.props.uiService.goBackMfd();
  }

  /** @inheritDoc */
  public onAfterRender(node: VNode): void {
    this.thisNode = node;
    this.isMarkerSensitivityHigh.pause();
    super.onAfterRender(node);
  }

  /** @inheritDoc */
  public onOpen(): void {
    this.isMarkerSensitivityHigh.resume();
  }

  /** @inheritDoc */
  public onClose(): void {
    this.isMarkerSensitivityHigh.pause();
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class='audio-radios-popup ui-view-panel'>
        <div class='audio-radios-popup-title'>Radios</div>
        <div class='ui-view-box audio-radios-popup-ui-view-box'>
          <div class='ui-view-box-title audio-radios-popup-ui-view-box-title'>AUX Radios</div>
          <UiToggleTouchButton label='AUX' state={Subject.create(false)} isEnabled={false} />
        </div>
        <div class='audio-radios-popup-buttons-row audio-radios-popup-buttons-row-first'>
          <UiValueTouchButton
            label='Marker Sensitivity'
            state={this.isMarkerSensitivityHigh}
            renderValue={isMarkerSensitivityHigh => isMarkerSensitivityHigh ? 'High' : 'Low'}
            class='audio-radios-popup-marker-sensitivity-button'
            onPressed={this.onMarkerSensitivityPressed.bind(this)}
          />
          <UiToggleTouchButton label={'COM Receive\nMonitor Mute'} state={Subject.create(false)} isEnabled={false} />
        </div>
        <div class='audio-radios-popup-buttons-row audio-radios-popup-buttons-row-second'>
          <UiImgTouchButton
            class='audio-radios-popup-back-button'
            label='Back'
            imgSrc={`${G3XTouchFilePaths.ASSETS_PATH}/Images/icon_back.png`}
            onPressed={this.onBackPressed.bind(this)}
          />
          {this.props.radiosConfig.hasMarkerBeacon && (
            <UiToggleTouchButton
              label='Speaker'
              state={Subject.create(false)}
              isEnabled={false}
            />
            // otherwise this button is displayed in AudioView.tsx
          )}
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    super.destroy();
    this.isMarkerSensitivityHigh.destroy();
    if (this.thisNode) {
      FSComponent.shallowDestroy(this.thisNode);
    }
  }
}