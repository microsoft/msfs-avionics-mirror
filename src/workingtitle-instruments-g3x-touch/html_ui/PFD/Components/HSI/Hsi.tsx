import {
  BasicNavAngleSubject, BasicNavAngleUnit, ComponentProps, DisplayComponent, FSComponent, MappedSubject, NavSourceType,
  NumberFormatter, SetSubject, SimVarValueType, Subject, Subscribable, Subscription, UserSettingManager, VNode,
  Vec2Math
} from '@microsoft/msfs-sdk';

import { BearingDisplay, ObsSuspModes, TouchButton, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';

import { SelectedCourseDialog } from '../../../MFD/Views/SelectedCourseDialog/SelectedCourseDialog';
import { SelectedHeadingDialog } from '../../../MFD/Views/SelectedHeadingDialog/SelectedHeadingDialog';
import { RadiosConfig } from '../../../Shared/AvionicsConfig/RadiosConfig';
import { GduFormat } from '../../../Shared/CommonTypes';
import { GduUserSettingTypes } from '../../../Shared/Settings/GduUserSettings';
import { PfdHsiUserSettingTypes } from '../../../Shared/Settings/PfdUserSettings';
import { UiService } from '../../../Shared/UiSystem/UiService';
import { UiViewKeys } from '../../../Shared/UiSystem/UiViewKeys';
import { UiViewStackLayer } from '../../../Shared/UiSystem/UiViewTypes';
import { HsiDataProvider } from './HsiDataProvider';
import { HsiRose, HsiRoseOptions } from './HsiRose';
import { HsiUpperDeviationIndicator, HsiUpperDeviationIndicatorProps } from './HsiUpperDeviationIndicator';

import './Hsi.css';

/**
 * Component props for {@link Hsi}.
 */
export interface HSIProps extends ComponentProps {
  /** The UI service. */
  uiService: UiService;

  /** A data provider for the HSI. */
  dataProvider: HsiDataProvider;

  /** A manager for GDU user settings. */
  gduSettingManager: UserSettingManager<GduUserSettingTypes>;

  /** A manager for HSI user settings. */
  hsiSettingManager: UserSettingManager<PfdHsiUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** A configuration object defining options for radios. */
  radiosConfig: RadiosConfig;

  /** Whether the HSI should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3X Touch HSI (horizontal situation indicator).
 */
export class Hsi extends DisplayComponent<HSIProps> {
  // TODO: support GDU470 (portrait)
  private static readonly ROSE_OPTIONS: Record<GduFormat, Readonly<HsiRoseOptions>> = {
    ['460']: {
      compassRadius: 133,
      bearingPointerCircleRadius: 75,
      turnRateIndicatorOptions: {
        height: 20,
        tickOffset: 3,
        tickLength: 12,
        vectorOffset: 0,
        vectorWidth: 6,
        vectorArrowWidth: 12,
        vectorArrowLength: 12
      },
      activeNavNeedleOptions: {
        deviationScaleLength: 150,
        deviationDotSize: 10,
        stemOuterRadius: 113,
        stemInnerRadius: 76,
        stemDeviationOuterRadius: 70,
        stemWidth: 6,
        arrowLength: 18,
        arrowWidth: 28,
        toFromArrowOuterRadius: 43,
        toFromArrowLength: 18,
        toFromArrowWidth: 22
      },
      bearingPointerOptions: {
        stemOuterRadius: 100,
        stemInnerRadius: 75,
        stemWidth: 8,
        arrowOuterRadius: 91,
        arrowLength: 8,
        arrowWidth: 16
      }
    },
    ['470']: {
      compassRadius: 133,
      bearingPointerCircleRadius: 75,
      turnRateIndicatorOptions: {
        height: 20,
        tickOffset: 3,
        tickLength: 12,
        vectorOffset: 0,
        vectorWidth: 6,
        vectorArrowWidth: 12,
        vectorArrowLength: 12
      },
      activeNavNeedleOptions: {
        deviationScaleLength: 150,
        deviationDotSize: 10,
        stemOuterRadius: 113,
        stemInnerRadius: 76,
        stemDeviationOuterRadius: 70,
        stemWidth: 6,
        arrowLength: 18,
        arrowWidth: 28,
        toFromArrowOuterRadius: 43,
        toFromArrowLength: 18,
        toFromArrowWidth: 22
      },
      bearingPointerOptions: {
        stemOuterRadius: 100,
        stemInnerRadius: 75,
        stemWidth: 10,
        arrowOuterRadius: 91,
        arrowLength: 8,
        arrowWidth: 16
      }
    },
  };

  private static readonly UPPER_CDI_OPTIONS: Record<GduFormat, Readonly<Pick<HsiUpperDeviationIndicatorProps, 'size' | 'dotSize'>>> = {
    ['460']: {
      size: Vec2Math.create(200, 20),
      dotSize: 10
    },
    ['470']: {
      size: Vec2Math.create(200, 20),
      dotSize: 10
    },
  };

  private readonly hdgButtonRef = FSComponent.createRef<TouchButton>();
  private readonly crsButtonRef = FSComponent.createRef<TouchButton>();
  private readonly hdgRef = FSComponent.createRef<BearingDisplay>();
  private readonly crsRef = FSComponent.createRef<BearingDisplay>();
  private readonly roseRef = FSComponent.createRef<HsiRose>();
  private readonly upperDeviationIndicatorRef = FSComponent.createRef<HsiUpperDeviationIndicator>();

  private readonly rootCssClass = SetSubject.create(['hsi']);

  private readonly isHdgCrsVisible = Subject.create(false);

  private readonly selectedHeadingState = MappedSubject.create(
    this.props.dataProvider.selectedHeadingMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly selectedHeadingValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(0));

  private readonly crsMag = Subject.create(0);
  private readonly crsState = MappedSubject.create(
    this.crsMag,
    this.props.dataProvider.magVar
  ).pause();
  private readonly crsValue = BasicNavAngleSubject.create(BasicNavAngleUnit.create(true).createNumber(NaN));

  private readonly crsSourceState = MappedSubject.create(
    this.props.dataProvider.activeNavIndicator.source,
    this.props.dataProvider.obsSuspMode
  ).pause();

  private readonly navCourseState = MappedSubject.create(
    this.props.dataProvider.activeNavIndicator.course,
    this.props.dataProvider.activeNavIndicator.isCourseHeading
  ).pause();

  private readonly isCrsButtonEnabled = Subject.create(false);

  private readonly showUpperDeviationIndicator = MappedSubject.create(
    ([showSetting, declutter]) => showSetting && !declutter,
    this.props.hsiSettingManager.getSetting('pfdHsiShowUpperDeviationIndicator'),
    this.props.declutter
  );

  private cdiSourceSub?: Subscription;
  private crsSourceStateSub?: Subscription;
  private navCoursePipe?: Subscription;
  private obsCoursePipe?: Subscription;
  private headingDataFailedSub?: Subscription;
  private gpsDataFailedSub?: Subscription;
  private declutterSub?: Subscription;

  /** @inheritDoc */
  public onAfterRender(): void {
    this.cdiSourceSub = this.props.dataProvider.activeNavIndicator.source.sub(source => {
      if (source?.getType() === NavSourceType.Gps) {
        this.rootCssClass.add('hsi-active-nav-gps');
        this.rootCssClass.delete('hsi-active-nav-nav');
        this.isCrsButtonEnabled.set(false);
      } else {
        this.rootCssClass.add('hsi-active-nav-nav');
        this.rootCssClass.delete('hsi-active-nav-gps');
        this.isCrsButtonEnabled.set(true);
      }
    }, true);

    this.selectedHeadingState.sub(([selectedHeadingMag, magVar]) => {
      this.selectedHeadingValue.set(selectedHeadingMag, magVar);
    }, true);

    this.crsState.sub(([dtkCrsMag, magVar]) => {
      this.crsValue.set(dtkCrsMag, magVar);
    }, true);

    this.navCoursePipe = this.navCourseState.pipe(this.crsMag, ([course, isCourseHeading]) => course === null || isCourseHeading ? NaN : course, true);
    this.obsCoursePipe = this.props.dataProvider.obsCourse.pipe(this.crsMag, true);

    this.crsSourceStateSub = this.crsSourceState.sub(([cdiSource, obsSuspMode]) => {
      if (cdiSource?.getType() === NavSourceType.Gps && obsSuspMode === ObsSuspModes.OBS) {
        this.navCourseState.pause();
        this.navCoursePipe!.pause();
        this.obsCoursePipe!.resume(true);
      } else {
        this.obsCoursePipe!.pause();
        this.navCourseState.resume();
        this.navCoursePipe!.resume(true);
      }
    }, false, true);

    this.headingDataFailedSub = this.props.dataProvider.isHeadingDataFailed.sub(isFailed => {
      this.rootCssClass.toggle('heading-data-failed', isFailed);
    }, true);

    this.gpsDataFailedSub = this.props.dataProvider.isGpsDataFailed.sub(isFailed => {
      this.rootCssClass.toggle('gps-data-failed', isFailed);
    }, true);

    this.declutterSub = this.props.declutter.sub(this.onDeclutterChanged.bind(this), true);
  }

  /**
   * Responds to when whether this HSI is decluttered changes.
   * @param declutter Whether this HSI is decluttered.
   */
  private onDeclutterChanged(declutter: boolean): void {
    if (declutter) {
      this.pauseDeclutterSubscriptions();

      this.isHdgCrsVisible.set(false);
    } else {
      this.selectedHeadingState.resume();

      this.crsSourceState.resume();
      this.crsSourceStateSub!.resume(true);

      this.crsState.resume();

      this.isHdgCrsVisible.set(true);
    }
  }

  /**
   * Pauses subscriptions that are not required when this HSI is decluttered.
   */
  private pauseDeclutterSubscriptions(): void {
    this.selectedHeadingState.pause();

    this.crsState.pause();

    this.crsSourceState.pause();
    this.crsSourceStateSub!.pause();

    this.navCourseState.pause();
    this.navCoursePipe!.pause();
    this.obsCoursePipe!.pause();
  }

  /**
   * Responds to when the rose is pressed.
   */
  private onRosePressed(): void {
    // Close PFD options menu if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.PfdOptions)) {
      return;
    }

    this.props.uiService.openMfdPopup(UiViewStackLayer.Overlay, UiViewKeys.PfdOptions, true, { popupType: 'slideout-bottom-full' });
  }

  /**
   * Responds to when the selected heading button is pressed.
   */
  private async onHdgPressed(): Promise<void> {
    // Close selected heading dialog if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.SelectedHeadingDialog)) {
      return;
    }

    const initialValue = this.selectedHeadingValue.get().number;
    const result = await this.props.uiService
      .openMfdPopup<SelectedHeadingDialog>(UiViewStackLayer.Overlay, UiViewKeys.SelectedHeadingDialog, true)
      .ref.request({
        initialValue
      });

    if (!result.wasCancelled) {
      const valueToSet = Math.round(result.payload);
      SimVar.SetSimVarValue('AUTOPILOT HEADING LOCK DIR', 'degree', valueToSet);
    }
  }

  /**
   * Responds to when the course button is pressed.
   */
  private async onCrsPressed(): Promise<void> {
    // Close selected course dialog if already open.
    if (this.props.uiService.closeMfdPopup(popup => popup.layer === UiViewStackLayer.Overlay && popup.key === UiViewKeys.SelectedCourseDialog)) {
      return;
    }

    const activeNavSource = this.props.dataProvider.activeNavIndicator.source.get();

    if (activeNavSource === null) {
      return;
    }

    const initialValue = this.crsValue.get().number;

    const result = await this.props.uiService
      .openMfdPopup<SelectedCourseDialog>(UiViewStackLayer.Overlay, UiViewKeys.SelectedCourseDialog, true)
      .ref.request({
        initialValue,
        navSource: activeNavSource
      });

    if (!result.wasCancelled && this.props.dataProvider.activeNavIndicator.source.get() === activeNavSource) {
      if (activeNavSource.getType() === NavSourceType.Nav) {
        const simRadioIndex = this.props.radiosConfig.navDefinitions[activeNavSource.index]?.simIndex;
        if (simRadioIndex !== undefined) {
          SimVar.SetSimVarValue(`K:VOR${simRadioIndex}_SET`, SimVarValueType.Number, result.payload);
        }
      }
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style='width: 0px; height: 0px;'>
        <HsiRose
          ref={this.roseRef}
          show={Subject.create(true)}
          dataProvider={this.props.dataProvider}
          unitsSettingManager={this.props.unitsSettingManager}
          radiosConfig={this.props.radiosConfig}
          onPressed={this.onRosePressed.bind(this)}
          options={Hsi.ROSE_OPTIONS[this.props.uiService.gduFormat]}
        />
        <div class='hsi-hdgcrs-container hsi-hdg-container'>
          <TouchButton
            ref={this.hdgButtonRef}
            isVisible={this.isHdgCrsVisible}
            onPressed={this.onHdgPressed.bind(this)}
            class='pfd-touch-button hsi-hdgcrs-button hsi-hdg-button'
          >
            <div class="hsi-hdgcrs-button-title">HDG</div>
            <BearingDisplay
              ref={this.hdgRef}
              value={this.selectedHeadingValue}
              displayUnit={this.props.unitsSettingManager.navAngleUnits}
              formatter={NumberFormatter.create({ precision: 1, pad: 3 })}
              unitFormatter={out => { out[0] = '°'; }}
              class='hsi-hdgcrs-button-value hsi-hdg-button-value'
            />
          </TouchButton>
        </div>
        <div class='hsi-hdgcrs-container hsi-crs-container'>
          <TouchButton
            ref={this.crsButtonRef}
            isEnabled={this.isCrsButtonEnabled}
            isVisible={this.isHdgCrsVisible}
            onPressed={this.onCrsPressed.bind(this)}
            class='pfd-touch-button hsi-hdgcrs-button hsi-crs-button'
          >
            <div class="hsi-hdgcrs-button-title">CRS</div>
            <BearingDisplay
              ref={this.crsRef}
              value={this.crsValue}
              displayUnit={this.props.unitsSettingManager.navAngleUnits}
              formatter={NumberFormatter.create({ precision: 1, pad: 3, nanString: '___' })}
              unitFormatter={out => { out[0] = '°'; }}
              class='hsi-hdgcrs-button-value hsi-crs-button-value'
            />
          </TouchButton>
        </div>
        <HsiUpperDeviationIndicator
          ref={this.upperDeviationIndicatorRef}
          show={this.showUpperDeviationIndicator}
          dataProvider={this.props.dataProvider}
          {...Hsi.UPPER_CDI_OPTIONS[this.props.uiService.gduFormat]}
        />
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.roseRef.getOrDefault()?.destroy();
    this.hdgButtonRef.getOrDefault()?.destroy();
    this.crsButtonRef.getOrDefault()?.destroy();
    this.hdgRef.getOrDefault()?.destroy();
    this.crsRef.getOrDefault()?.destroy();
    this.upperDeviationIndicatorRef.getOrDefault()?.destroy();

    this.selectedHeadingState.destroy();
    this.crsSourceState.destroy();
    this.navCourseState.destroy();

    this.showUpperDeviationIndicator.destroy();

    this.cdiSourceSub?.destroy();
    this.navCoursePipe?.destroy();
    this.obsCoursePipe?.destroy();
    this.headingDataFailedSub?.destroy();
    this.gpsDataFailedSub?.destroy();
    this.declutterSub?.destroy();

    super.destroy();
  }
}
