/* eslint-disable jsdoc/require-jsdoc,@typescript-eslint/no-unused-vars */
import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { GtcService } from '../GtcService/GtcService';
import mfdHorizontalFlightPlanTrainerImage from './gtc-horizontal-mfd-flight-plan-tbm-trainer.png';
import mfdHorizontalFlightPlanAirwayTrainerImage from './gtc-horizontal-mfd-flight-plan-airway-tbm-trainer.png';
import mfdHorizontalPhoto from './gtc-horizontal-mfd-ref-photo-skewed.png';
import mfdHorizontalTrainerImage from './gtc-horizontal-mfd-tbm-trainer.png';
import minimumsNumPadHorizontal from './gtc-horizontal-minimums-numpad-tbm-trainer.png';
import navComHorizontalTrainerImage from './gtc-horizontal-nav-com-tbm-trainer.png';
import navComTransponderHorizontalTrainerImage from './gtc-horizontal-nav-com-transponder-tbm-trainer.png';
import navComAudioRadiosHorizontalTrainerImage from './gtc-horizontal-nav-com-audio-radios-tbm-trainer.png';
import navComAudioRadiosBtmHorizontalTrainerImage from './gtc-horizontal-nav-com-audio-radios-btm-tbm-trainer.png';
import pfdHorizontalTrainerImage from './gtc-horizontal-pfd-tbm-trainer.png';
import mfdVerticalTrainerImage from './gtc-vertical-mfd-tbm-trainer.png';
import keyboardAlphaHorizontalImage from './gtc-horizontal-keyboard-alpha-trainer.png';
import keyboardAlphaVerticalImage from './gtc-vertical-keyboard-alpha-trainer.png';
import horizontalDepartureImage from './gtc-horizontal-departure.png';
import verticalFlightPlan from './gtc-vertical-flight-plan-1.png';
import verticalDeparture from './gtc-vertical-departure-1.png';
import timeOffsetDialogVertical from './gtc-vertical-gtc-local-time-offset-dialog.png';
import weightFuelOperatingWeightHor from './weight-fuel-operating-weight-hor.png';
import weightFuelPayloadHor from './weight-fuel-payload-hor.png';
import weightFuelTakeoffHor from './weight-fuel-takeoff-hor.png';
import weightFuelTakeoffVolHor from './weight-fuel-takeoff-vol-hor.png';
import weightFuelTakeoffVolHorOW from './weight-fuel-takeoff-vol-hor-overweight.png';
import weightFuelLandingHor from './weight-fuel-landing-hor.png';
import weightFuelLandingVolHor from './weight-fuel-landing-vol-hor.png';
import weightFuelLandingVrt from './weight-fuel-landing-vrt.png';

/** Letting typescript know about the global debugger. */
declare const g_modDebugMgr: any;

interface GtcReferenceOverlayProps extends ComponentProps {
  gtcService: GtcService;
}

/** The GtcReferenceOverlay component. */
export class GtcReferenceOverlay extends DisplayComponent<GtcReferenceOverlayProps> {
  private readonly referencePhotoOverlayRef = FSComponent.createRef<HTMLDivElement>();
  private readonly imgSrc = Subject.create(
    // navComHorizontalTrainerImage
    // navComTransponderHorizontalTrainerImage
    // navComAudioRadiosHorizontalTrainerImage
    // navComAudioRadiosBtmHorizontalTrainerImage
    // mfdVerticalTrainerImage
    // audioRadiosVertical
    // audioRadiosVertical2
    // transponderVertical
    // verticalPfd
    // weightFuelOperatingWeightHor
    // weightFuelPayloadHor
    // weightFuelTakeoffHor
    // weightFuelTakeoffVolHor
    // weightFuelTakeoffVolHorOW
    // weightFuelLandingHor
    // weightFuelLandingVolHor

    // weightFuelOperatingWeightVrt

    // weightFuelPayloadVrt

    // weightFuelTakeoffVrt
    // weightFuelTakeoffVolVrt
    // weightFuelTakeoffVolVrtOW

    weightFuelLandingVrt
    // weightFuelLandingVolVrt
  );
  private overlayEnabled = false;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.setupReferenceOverlayToggle();
  }

  private addDebugButton(name: string, image: any): void {
    g_modDebugMgr.AddDebugButton(name, (): void => {
      if (this.overlayEnabled) {
        if (this.imgSrc.get() === image) {
          this.hideOverlay();
        } else {
          this.imgSrc.set(image);
        }
      } else {
        this.enableOverlay();
        this.imgSrc.set(image);
      }
    });
  }

  /** Adds a debug button to toggle the reference photo overlay. */
  private setupReferenceOverlayToggle(): void {
    if (typeof g_modDebugMgr !== 'undefined') {
      g_modDebugMgr.AddDebugButton('Disable Overlay', this.hideOverlay);

      if (this.props.gtcService.orientation === 'horizontal') {
        this.addDebugButton('PFD Trainer Overlay', pfdHorizontalTrainerImage);
        this.addDebugButton('MFD Trainer Overlay', mfdHorizontalTrainerImage);
        this.addDebugButton('MFD Flight Plan', mfdHorizontalFlightPlanTrainerImage);
        this.addDebugButton('MFD Flight Plan Airway', mfdHorizontalFlightPlanAirwayTrainerImage);
        this.addDebugButton('MFD Departure', horizontalDepartureImage);
        this.addDebugButton('Alpha Keyboard', keyboardAlphaHorizontalImage);
        this.addDebugButton('NAV/COM Home Trainer Overlay', navComHorizontalTrainerImage);
        this.addDebugButton('NAV/COM Transponder Trainer Overlay', navComTransponderHorizontalTrainerImage);
        this.addDebugButton('NAV/COM Audio & Radios Trainer Overlay', navComAudioRadiosHorizontalTrainerImage);
        this.addDebugButton('NAV/COM Audio & Radios Trainer Overlay, Bottom', navComAudioRadiosBtmHorizontalTrainerImage);
        this.addDebugButton('Minimums NumPad Trainer Overlay', minimumsNumPadHorizontal);
        this.addDebugButton('MFD Photo Overlay', mfdHorizontalPhoto);
      } else {
        this.addDebugButton('MFD Trainer Overlay', mfdVerticalTrainerImage);
        this.addDebugButton('Alpha Keyboard', keyboardAlphaVerticalImage);
        this.addDebugButton('Select Time Offset', timeOffsetDialogVertical);
        this.addDebugButton('Flight Plan', verticalFlightPlan);
        this.addDebugButton('Departure', verticalDeparture);
        this.addDebugButton('WF OpWt H', weightFuelOperatingWeightHor);
        this.addDebugButton('WF Payload H', weightFuelPayloadHor);
        this.addDebugButton('WF TkOff H', weightFuelTakeoffHor);
        this.addDebugButton('WF TkOff H Vol', weightFuelTakeoffVolHor);
        this.addDebugButton('WF TkOff H Vol OW', weightFuelTakeoffVolHorOW);
        this.addDebugButton('WF Landing H', weightFuelLandingHor);
        this.addDebugButton('WF Landing H Vol', weightFuelLandingVolHor);
      }
    }
  }

  private readonly enableOverlay = (): void => {
    this.referencePhotoOverlayRef.instance.style.display = 'block';
    this.overlayEnabled = true;
  };

  private readonly hideOverlay = (): void => {
    this.referencePhotoOverlayRef.instance.style.display = 'none';
    this.overlayEnabled = false;
  };

  /** @inheritdoc */
  public render(): VNode {
    const display = 'display: none;';
    // const display = 'display: unset;';
    return (
      <div
        class="reference-photo-overlay"
        ref={this.referencePhotoOverlayRef}
        style={display + 'position: absolute; width: 100%; height: 100%; top: 0; left: 0; z-index: 10000; opacity: 0.5; pointer-events: none;'}
      >
        <img alt="" src={this.imgSrc} />
      </div>
    );
  }
}