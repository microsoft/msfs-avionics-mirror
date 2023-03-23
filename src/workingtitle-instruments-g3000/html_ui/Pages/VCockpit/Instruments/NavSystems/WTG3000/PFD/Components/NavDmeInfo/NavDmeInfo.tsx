import {
  ComponentProps, DisplayComponent, FSComponent, MappedSubject, MathUtils, NumberFormatter, NumberUnitSubject, ObjectSubject, SetSubject, Subscribable, Subscription,
  UnitFamily, UnitType, UserSettingManager, VNode
} from '@microsoft/msfs-sdk';

import { DmeTuneSettingMode, DmeUserSettingTypes, UnitsUserSettingManager } from '@microsoft/msfs-garminsdk';
import { G3000DmeInfoNavIndicator, G3000NavInfoNavIndicator, NavSourceFormatter, NumberUnitDisplay } from '@microsoft/msfs-wtg3000-common';

import './NavDmeInfo.css';

/**
 * Component props for NavDmeInfo.
 */
export interface NavDmeInfoProps extends ComponentProps {
  /** The nav info nav indicator. */
  navInfoIndicator: G3000NavInfoNavIndicator;

  /** The DME info nav indicator. */
  dmeInfoIndicator: G3000DmeInfoNavIndicator;

  /** The number of supported DME radios. */
  dmeRadioCount: 0 | 1 | 2;

  /** A manager for DME user settings. */
  dmeSettingManager: UserSettingManager<DmeUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 NAV/DME information display.
 */
export class NavDmeInfo extends DisplayComponent<NavDmeInfoProps> {
  private readonly distanceRef = FSComponent.createRef<NumberUnitDisplay<UnitFamily.Distance>>();

  private readonly rootStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly distanceStyle = ObjectSubject.create({
    display: 'none'
  });

  private readonly rootCssClass = SetSubject.create(['nav-dme-info']);

  private readonly sourceFormatter = NavSourceFormatter.createForSource('FMS', false, this.props.dmeRadioCount > 1, false);

  private readonly navSourceText = this.props.navInfoIndicator.source.map(source => source === null ? ' ' : this.sourceFormatter(source)).pause();

  private readonly navIdentText = MappedSubject.create(
    ([signalStrength, ident]): string => {
      return (signalStrength !== null && signalStrength > 0 ? ident : null) ?? ' ';
    },
    this.props.navInfoIndicator.signalStrength,
    this.props.navInfoIndicator.ident
  ).pause();

  private readonly navFreqText = this.props.navInfoIndicator.activeFrequency.map(freq => freq === null ? ' ' : freq.toFixed(2)).pause();

  private readonly dmeSourceText = this.props.dmeInfoIndicator.source.map(source => source === null ? ' ' : this.sourceFormatter(source)).pause();

  private readonly dmeDistance = NumberUnitSubject.create(UnitType.NMILE.createNumber(NaN));
  private readonly dmeDistancePrecision = this.props.unitsSettingManager.distanceUnitsLarge.map(unit => unit.convertTo(0.1, UnitType.NMILE)).pause();

  private readonly activeDmeTuneMode = MappedSubject.create(
    ([source, tuneMode1, tuneMode2]): DmeTuneSettingMode | null => {
      if (source === null) {
        return null;
      }

      return source.name === 'DME1' ? tuneMode1 : tuneMode2;
    },
    this.props.dmeInfoIndicator.source,
    this.props.dmeSettingManager.getSetting('dme1TuneMode'),
    this.props.dmeSettingManager.getSetting('dme2TuneMode')
  ).pause();
  private readonly isDmeTunedToNavSource = MappedSubject.create(
    ([navSource, dmeTuneMode]): boolean => {
      if (navSource === null || dmeTuneMode === DmeTuneSettingMode.Hold) {
        return false;
      }

      return navSource.index === 1 && dmeTuneMode === DmeTuneSettingMode.Nav1
        || navSource.index === 2 && dmeTuneMode === DmeTuneSettingMode.Nav2;
    },
    this.props.navInfoIndicator.source,
    this.activeDmeTuneMode
  ).pause();
  private readonly dmeFreqText = MappedSubject.create(
    ([frequency, tuneMode, isTunedToNavSource]): string => {
      if (frequency === null || isTunedToNavSource) {
        return ' ';
      }

      return `${frequency.toFixed(2)}${tuneMode === DmeTuneSettingMode.Hold ? 'H' : ''}`;
    },
    this.props.dmeInfoIndicator.activeFrequency,
    this.activeDmeTuneMode,
    this.isDmeTunedToNavSource
  ).pause();

  private declutterSub?: Subscription;
  private navPreviewSub?: Subscription;
  private dmePreviewSub?: Subscription;
  private dmeDistanceSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    const dmeDistanceSub = this.dmeDistanceSub = this.props.dmeInfoIndicator.distance.sub(distance => {
      if (distance === null) {
        this.distanceStyle.set('display', 'none');
      } else {
        this.distanceStyle.set('display', '');
        this.dmeDistance.set(MathUtils.round(distance, this.dmeDistancePrecision.get()));
      }
    }, false, true);

    this.isDmeTunedToNavSource.sub(value => {
      this.rootCssClass.toggle('nav-dme-info-source-mismatch', !value);
    }, true);

    this.navPreviewSub = this.props.navInfoIndicator.isPreview.sub(isPreview => {
      this.rootCssClass.toggle('nav-dme-info-nav-preview', isPreview);
    }, true);

    this.dmePreviewSub = this.props.dmeInfoIndicator.isPreview.sub(isPreview => {
      this.rootCssClass.toggle('nav-dme-info-dme-preview', isPreview);
    }, true);

    this.declutterSub = this.props.declutter.sub(declutter => {
      if (declutter) {
        this.rootStyle.set('display', 'none');

        this.navSourceText.pause();
        this.navIdentText.pause();
        this.navFreqText.pause();

        this.dmeSourceText.pause();
        this.dmeDistancePrecision.pause();
        dmeDistanceSub.pause();
        this.activeDmeTuneMode.pause();
        this.isDmeTunedToNavSource.pause();
        this.dmeFreqText.pause();
      } else {
        this.rootStyle.set('display', '');

        this.navSourceText.resume();
        this.navIdentText.resume();
        this.navFreqText.resume();

        this.dmeSourceText.resume();
        this.dmeDistancePrecision.resume();
        dmeDistanceSub.resume(true);
        this.activeDmeTuneMode.resume();
        this.isDmeTunedToNavSource.resume();
        this.dmeFreqText.resume();
      }
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class={this.rootCssClass} style={this.rootStyle}>
        <div class='nav-dme-info-row nav-dme-info-nav'>
          <div class='nav-dme-info-source'>
            {this.navSourceText}
          </div>
          <div class='nav-dme-info-nav-ident'>
            {this.navIdentText}
          </div>
          <div class='nav-dme-info-freq'>
            {this.navFreqText}
          </div>
        </div>
        <div class='nav-dme-info-row nav-dme-info-dme'>
          <div class='nav-dme-info-source'>
            {this.dmeSourceText}
          </div>
          <div class='nav-dme-info-dme-distance' style={this.distanceStyle}>
            <NumberUnitDisplay
              ref={this.distanceRef}
              value={this.dmeDistance}
              displayUnit={this.props.unitsSettingManager.distanceUnitsLarge}
              formatter={NumberFormatter.create({ precision: 0.1, maxDigits: 3 })}
              class='nav-dme-info-dme-distance-value'
            />
          </div>
          <div class='nav-dme-info-freq'>
            {this.dmeFreqText}
          </div>
        </div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.distanceRef.getOrDefault()?.destroy();

    this.navSourceText.destroy();
    this.navIdentText.destroy();
    this.navFreqText.destroy();

    this.dmeSourceText.destroy();
    this.dmeDistancePrecision.destroy();
    this.activeDmeTuneMode.destroy();
    this.isDmeTunedToNavSource.destroy();
    this.dmeFreqText.destroy();

    this.declutterSub?.destroy();
    this.navPreviewSub?.destroy();
    this.dmePreviewSub?.destroy();
    this.dmeDistanceSub?.destroy();

    super.destroy();
  }
}