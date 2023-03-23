import { FSComponent, MapLayer, MapLayerProps, NumberUnitInterface, Subscription, Unit, UnitFamily, UnitType, VNode } from '@microsoft/msfs-sdk';
import { MapDeclutterLevel } from '../../../Settings/MapSettingsProvider';

import { GNSNumberUnitDisplay } from '../../Controls/GNSNumberUnitDisplay';
import { GNSMapKeys, GNSMapModules } from './GNSMapSystem';

import './RangeLegendLayer.css';

/**
 * A map layer that shows the current displayed map range legend.
 */
export class RangeLegendLayer extends MapLayer<MapLayerProps<GNSMapModules>> {
  private rangeSub?: Subscription;
  private declutterSub?= this.props.model.getModule(GNSMapKeys.Declutter)?.declutterLevel.map(l => {
    switch (l) {
      case MapDeclutterLevel.None:
        return '';
      case MapDeclutterLevel.One:
        return '-1';
      case MapDeclutterLevel.Two:
        return '-2';
      case MapDeclutterLevel.Three:
        return '-3';
    }
  });

  private readonly overzoomEl = FSComponent.createRef<HTMLElement>();
  private readonly declutterEl = FSComponent.createRef<HTMLElement>();

  private readonly unitType = this.props.model.getModule(GNSMapKeys.Range).nominalRange.map(r => {
    if (r.asUnit(UnitType.NMILE) < 1) {
      return UnitType.FOOT;
    }

    return UnitType.NMILE;
  });

  /** @inheritdoc */
  public onAttached(): void {
    this.rangeSub = this.props.model.getModule(GNSMapKeys.Range).nominalRange.sub(this.onRangeChanged.bind(this), true);

    const declutterModule = this.props.model.getModule(GNSMapKeys.Declutter);
    if (declutterModule !== undefined) {
      this.declutterEl.instance.classList.remove('hide-element');
    }
  }

  /**
   * A callback called when the map range changes.
   * @param range The range of the map.
   */
  private onRangeChanged(range: NumberUnitInterface<UnitFamily.Distance, Unit<UnitFamily.Distance>>): void {
    const rangeNm = range.asUnit(UnitType.NMILE);
    if (rangeNm < 2) {
      this.overzoomEl.instance.classList.remove('hidden-element');
    } else {
      this.overzoomEl.instance.classList.add('hidden-element');
    }
  }

  /** @inheritdoc */
  public onDetached(): void {
    this.rangeSub?.destroy();
    this.declutterSub?.destroy();
    this.unitType.destroy();
  }

  /** @inheritdoc */
  public render(): VNode | null {
    return (
      <div class='map-range-legend'>
        <GNSNumberUnitDisplay class='map-range-legend-scale'
          value={this.props.model.getModule(GNSMapKeys.Range).nominalRange}
          formatter={(n): string => n.toFixed(0)}
          displayUnit={this.unitType} />
        <div class='map-range-declutter hide-element' ref={this.declutterEl}>{this.declutterSub}</div>
        <div class='map-range-legend-overzoom' ref={this.overzoomEl}>overzoom</div>
      </div>
    );
  }
}