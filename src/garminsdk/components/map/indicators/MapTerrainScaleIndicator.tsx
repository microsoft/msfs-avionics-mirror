import { ArrayUtils, ComponentProps, DisplayComponent, FSComponent, Subject, Subscribable, Subscription, VNode } from '@microsoft/msfs-sdk';

import { UnitsAltitudeSettingMode } from '../../../settings/UnitsUserSettings';
import { MapTerrainMode } from '../modules/MapTerrainModule';

/**
 * Component props for MapTerrainScaleIndicator.
 */
export interface MapTerrainScaleIndicatorProps extends ComponentProps {
  /** Whether to show the indicator. */
  show: Subscribable<boolean>;

  /** The current map terrain mode. */
  terrainMode: Subscribable<MapTerrainMode>;

  /** The altitude display units mode. */
  altitudeUnitsMode: Subscribable<UnitsAltitudeSettingMode>;
}

/**
 * Displays a terrain color scale.
 */
export class MapTerrainScaleIndicator extends DisplayComponent<MapTerrainScaleIndicatorProps> {
  private static readonly LABEL_TEXT_FT = {
    abs: [
      '27⁰',
      '10⁵',
      '8⁰',
      '6⁰',
      '3⁰',
      '2⁰',
      '500',
      '−500',
      '−2⁰'
    ],

    rel: [
      '−100',
      '−1000',
      '−2000'
    ],

    ground: [
      '400',
      '−100',
      '−1000',
      '−2000'
    ],

    unit: 'FT'
  };

  private static readonly LABEL_TEXT_MT = {
    abs: [
      '8230',
      '3200',
      '2438',
      '1828',
      '914',
      '609',
      '152',
      '−152',
      '−610'
    ],

    rel: [
      '−30',
      '−305',
      '−610'
    ],

    ground: [
      '122',
      '−30',
      '−305',
      '−610'
    ],

    unit: 'MT'
  };

  private readonly rootRef = FSComponent.createRef<HTMLDivElement>();

  private readonly absLabelText = ArrayUtils.create(9, () => Subject.create(''));
  private readonly relLabelText = ArrayUtils.create(3, () => Subject.create(''));
  private readonly groundLabelText = ArrayUtils.create(4, () => Subject.create(''));
  private readonly unitText = Subject.create('');
  private readonly unitTextShown = Subject.create('');

  private showSub?: Subscription;
  private terrainModeSub?: Subscription;
  private altitudeUnitsModeSub?: Subscription;
  private unitTextPipe?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.unitTextPipe = this.unitText.pipe(this.unitTextShown, true);

    this.showSub = this.props.show.sub(this.updateDisplay.bind(this));
    this.terrainModeSub = this.props.terrainMode.sub(this.updateDisplay.bind(this), true);
    this.altitudeUnitsModeSub = this.props.altitudeUnitsMode.sub(this.updateUnits.bind(this), true);
  }

  /**
   * Updates the display of this indicator.
   */
  private updateDisplay(): void {
    if (this.props.show.get()) {
      switch (this.props.terrainMode.get()) {
        case MapTerrainMode.None:
          this.rootRef.instance.style.display = 'none';
          this.rootRef.instance.classList.remove('terrain-abs', 'terrain-rel', 'terrain-ground');
          break;
        case MapTerrainMode.Absolute:
          this.rootRef.instance.style.display = '';
          this.rootRef.instance.classList.remove('terrain-rel', 'terrain-ground');
          this.rootRef.instance.classList.add('terrain-abs');
          if (this.props.altitudeUnitsMode.get() === UnitsAltitudeSettingMode.Meters || this.props.altitudeUnitsMode.get() === UnitsAltitudeSettingMode.MetersMps) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.unitTextPipe!.resume(true);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.unitTextPipe!.pause();
            this.unitTextShown.set('');
          }
          break;
        case MapTerrainMode.Relative:
          this.rootRef.instance.style.display = '';
          this.rootRef.instance.classList.remove('terrain-abs', 'terrain-ground');
          this.rootRef.instance.classList.add('terrain-rel');
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.unitTextPipe!.resume(true);
          break;
        case MapTerrainMode.Ground:
          this.rootRef.instance.style.display = '';
          this.rootRef.instance.classList.remove('terrain-abs', 'terrain-rel');
          this.rootRef.instance.classList.add('terrain-ground');
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.unitTextPipe!.resume(true);
          break;
      }
    } else {
      this.rootRef.instance.style.display = 'none';
      this.rootRef.instance.classList.remove('terrain-abs', 'terrain-rel', 'terrain-ground');
    }
  }

  /**
   * Updates this indicator's display units.
   * @param mode The current altitude display units mode.
   */
  private updateUnits(mode: UnitsAltitudeSettingMode): void {
    // eslint-disable-next-line jsdoc/require-jsdoc
    let textSource: { abs: string[], rel: string[], ground: string[], unit: string };

    if (mode === UnitsAltitudeSettingMode.Meters || mode === UnitsAltitudeSettingMode.MetersMps) {
      textSource = MapTerrainScaleIndicator.LABEL_TEXT_MT;

      if (this.props.terrainMode.get() === MapTerrainMode.Absolute) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.unitTextPipe!.resume(true);
      }
    } else {
      textSource = MapTerrainScaleIndicator.LABEL_TEXT_FT;

      if (this.props.terrainMode.get() === MapTerrainMode.Absolute) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.unitTextPipe!.pause();
        this.unitTextShown.set('');
      }
    }

    for (let i = 0; i < this.absLabelText.length; i++) {
      this.absLabelText[i].set(textSource.abs[i]);
    }
    for (let i = 0; i < this.relLabelText.length; i++) {
      this.relLabelText[i].set(textSource.rel[i]);
    }
    for (let i = 0; i < this.groundLabelText.length; i++) {
      this.groundLabelText[i].set(textSource.ground[i]);
    }

    this.unitText.set(textSource.unit);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div ref={this.rootRef} class='map-terrainscale'>
        <div class='map-terrainscale-scale terrainscale-abs'>
          <div class='map-terrainscale-color' style='background: #cccccc;' />
          <div class='map-terrainscale-color' style='background: #979797;'>
            <div class='map-terrainscale-label'>{this.absLabelText[0]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #8b3c05;'>
            <div class='map-terrainscale-label'>{this.absLabelText[1]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #8d4b16;'>
            <div class='map-terrainscale-label'>{this.absLabelText[2]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #966324;'>
            <div class='map-terrainscale-label'>{this.absLabelText[3]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #c49440;'>
            <div class='map-terrainscale-label'>{this.absLabelText[4]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #c8b146;'>
            <div class='map-terrainscale-label'>{this.absLabelText[5]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #41690f;'>
            <div class='map-terrainscale-label'>{this.absLabelText[6]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #509993;'>
            <div class='map-terrainscale-label'>{this.absLabelText[7]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #255469;'>
            <div class='map-terrainscale-label'>{this.absLabelText[8]}</div>
          </div>
        </div>
        <div class='map-terrainscale-scale terrainscale-rel'>
          <div class='map-terrainscale-color' style='background: #aa0000' />
          <div class='map-terrainscale-color' style='background: #d2d200;'>
            <div class='map-terrainscale-label'>{this.relLabelText[0]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #00a000;'>
            <div class='map-terrainscale-label'>{this.relLabelText[1]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #000000;'>
            <div class='map-terrainscale-label'>{this.relLabelText[2]}</div>
          </div>
        </div>
        <div class='map-terrainscale-scale terrainscale-ground'>
          <div class='map-terrainscale-color' style='background: #aa0000' />
          <div class='map-terrainscale-color' style='background: #000000;'>
            <div class='map-terrainscale-label'>{this.groundLabelText[0]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #000000;'>
            <div class='map-terrainscale-label'>{this.groundLabelText[1]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #000000;'>
            <div class='map-terrainscale-label'>{this.groundLabelText[2]}</div>
          </div>
          <div class='map-terrainscale-color' style='background: #000000;'>
            <div class='map-terrainscale-label'>{this.groundLabelText[3]}</div>
          </div>
        </div>
        <div class='map-terrainscale-unit'>{this.unitTextShown}</div>
      </div>
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.showSub?.destroy();
    this.terrainModeSub?.destroy();
    this.altitudeUnitsModeSub?.destroy();
    this.unitTextPipe?.destroy();

    super.destroy();
  }
}