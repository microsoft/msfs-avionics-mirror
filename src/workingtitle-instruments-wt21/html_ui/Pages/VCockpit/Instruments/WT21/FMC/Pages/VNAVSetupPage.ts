import { CombinedSubject } from '@microsoft/msfs-sdk';

import { DisplayField } from '../Framework/Components/DisplayField';
import { PageLinkField } from '../Framework/Components/PageLinkField';
import { TextInputField } from '../Framework/Components/TextInputField';
import { DataInterface } from '../Framework/FmcDataBinding';
import { AltitudeInputFormat, IasMachEntry, IasMachFormat, NumberAndUnitFormat, SimpleStringFormat } from '../Framework/FmcFormats';
import { FmcPage } from '../Framework/FmcPage';
import { FmcRenderTemplate } from '../Framework/FmcRenderer';

/**
 * VNAV Setup page
 */
export class VNAVSetupPage extends FmcPage {
  // private readonly speedLimitIasSetting = this.page.defaultsSettings.getSetting('speedLimitIas');
  // private readonly altitudeLimitSetting = this.page.defaultsSettings.getSetting('altitudeLimit');

  private readonly climbSpeedSub = CombinedSubject.create(this.fms.performancePlanProxy.climbTargetSpeedIas, this.fms.performancePlanProxy.climbTargetSpeedMach);
  private readonly cruiseSpeedSub = CombinedSubject.create(this.fms.performancePlanProxy.cruiseTargetSpeedIas, this.fms.performancePlanProxy.cruiseTargetSpeedMach);
  private readonly descentSpeedSub = CombinedSubject.create(this.fms.performancePlanProxy.descentTargetSpeedIas, this.fms.performancePlanProxy.descentTargetSpeedMach);

  private readonly Header = new DisplayField<readonly [boolean, number]>(this, {
    formatter: {
      nullValueString: '',

      /** @inheritDoc */
      format([planInMod, pageIndex]: [boolean, number]): string {
        let pageTitle;
        switch (pageIndex) {
          case 1:
            pageTitle = 'CLIMB';
            break;
          case 2:
            pageTitle = 'CRUISE';
            break;
          case 3:
            pageTitle = 'DESCENT';
            break;
        }

        return ` ${planInMod ? 'MOD' : 'ACT'} VNAV ${pageTitle}[blue];`;
      }
    }
  }).bind(CombinedSubject.create(this.fms.planInMod, this.router.currentSubpageIndex));

  private readonly climbSpeedInput = new TextInputField(this, {
    formatter: new IasMachFormat(),
    onDelete: async (): Promise<string | boolean> => {
      this.fms.performancePlanProxy.climbTargetSpeedIas.resetToDefault();
      this.fms.performancePlanProxy.climbTargetSpeedMach.resetToDefault();
      return true;
    }
  }).bindSource(new DataInterface<IasMachEntry>(this.climbSpeedSub, (value: IasMachEntry) => {
    this.fms.performancePlanProxy.climbTargetSpeedIas.set(value[0] ?? this.fms.performancePlanProxy.climbTargetSpeedIas.get());
    this.fms.performancePlanProxy.climbTargetSpeedMach.set(value[1] ?? this.fms.performancePlanProxy.climbTargetSpeedMach.get());
  }));

  private readonly cruiseSpeedInput = new TextInputField(this, {
    formatter: new IasMachFormat(),
    onDelete: async (): Promise<string | boolean> => {
      this.fms.performancePlanProxy.cruiseTargetSpeedIas.resetToDefault();
      this.fms.performancePlanProxy.cruiseTargetSpeedMach.resetToDefault();
      return true;
    }
  }).bindSource(new DataInterface<IasMachEntry>(this.cruiseSpeedSub, (value: IasMachEntry) => {
    this.fms.performancePlanProxy.cruiseTargetSpeedIas.set(value[0] ?? this.fms.performancePlanProxy.cruiseTargetSpeedIas.get());
    this.fms.performancePlanProxy.cruiseTargetSpeedMach.set(value[1] ?? this.fms.performancePlanProxy.cruiseTargetSpeedMach.get());
  }));

  private readonly descentSpeedInput = new TextInputField(this, {
    formatter: new IasMachFormat(),
    onDelete: async (): Promise<string | boolean> => {
      this.fms.performancePlanProxy.descentTargetSpeedIas.resetToDefault();
      this.fms.performancePlanProxy.descentTargetSpeedMach.resetToDefault();
      return true;
    }
  }).bindSource(new DataInterface<IasMachEntry>(this.descentSpeedSub, (value: IasMachEntry) => {
    this.fms.performancePlanProxy.descentTargetSpeedIas.set(value[0] ?? this.fms.performancePlanProxy.descentTargetSpeedIas.get());
    this.fms.performancePlanProxy.descentTargetSpeedMach.set(value[1] ?? this.fms.performancePlanProxy.descentTargetSpeedMach.get());
  }));

  private readonly descentVpaInput = new TextInputField(this, {
    formatter: new NumberAndUnitFormat('°', { precision: 1, minValue: 1, maxValue: 6, spaceBetween: false }),
    onDelete: async (): Promise<string | boolean> => {
      this.fms.performancePlanProxy.descentVPA.resetToDefault();
      return true;
    }
  }).bind(this.fms.performancePlanProxy.descentVPA);

  private readonly cruiseAltInput = new TextInputField(this, {
    formatter: new AltitudeInputFormat(),
  }).bind(this.fms.performancePlanProxy.cruiseAltitude);

  private readonly transitionAltInput = new TextInputField(this, {
    formatter: new AltitudeInputFormat(),
    onDelete: async (): Promise<string | boolean> => {
      this.fms.performancePlanProxy.transitionAltitude.resetToDefault();
      return true;
    }
  }).bind(this.fms.performancePlanProxy.transitionAltitude);

  private readonly perfInitLink = PageLinkField.createLink(this, 'PERF INIT>', '/perf-init');
  private readonly descInfoLink = PageLinkField.createLink(this, '<DESC INFO', '/desc-info', true);

  private readonly cancelModField = new DisplayField(this, {
    formatter: new SimpleStringFormat('<CANCEL MOD'),
    onSelected: async (): Promise<string | boolean> => {
      this.fms.cancelMod();
      return true;
    }
  });

  /** @inheritDoc */
  public render(): FmcRenderTemplate[] {
    return [
      [
        [this.Header, this.PagingIndicator],
        [' TGT SPEED[blue]', 'TRANS ALT [blue]'],
        [this.climbSpeedInput, this.transitionAltInput],
        ['', ''],
        ['', ''],
        // [' SPD/ALT LIMIT[blue]', ''],
        // ['250/10000', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', '------------------------[blue]'],
        [this.fms.planInMod.get() ? this.cancelModField : '', this.perfInitLink]
      ],
      [
        [this.Header, this.PagingIndicator],
        [' TGT SPEED[blue]', 'CRZ ALT [blue]'],
        [this.cruiseSpeedInput, this.cruiseAltInput],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', '------------------------[blue]'],
        [this.fms.planInMod.get() ? this.cancelModField : '', this.perfInitLink]
      ],
      [
        [this.Header, this.PagingIndicator],
        [' TGT SPEED[blue]', 'TRANS FL [blue]'],
        [this.descentSpeedInput, this.transitionAltInput],
        ['', ''],
        ['', ''],
        // [' SPD/ALT LIMIT[blue]', ''],
        // ['250/10000', ''],
        ['', 'VPA [blue]'],
        ['', this.descentVpaInput],
        // ['---/-----', '3.0°'],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '', '------------------------[blue]'],
        [this.fms.planInMod.get() ? this.cancelModField : this.descInfoLink, this.perfInitLink]
      ]
    ];
  }
}
