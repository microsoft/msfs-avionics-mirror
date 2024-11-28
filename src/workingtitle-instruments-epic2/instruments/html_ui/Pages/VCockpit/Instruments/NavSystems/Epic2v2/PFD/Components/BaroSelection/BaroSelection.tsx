import { DisplayComponent, EventBus, FSComponent, MappedSubject, UnitType, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { AltitudeDataProvider, BaroCorrectionUnit, PfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

import './BaroSelection.css';

/** The baro selection props. */
export interface BaroSelectionProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The altitude data provider to use. */
  altitudeDataProvider: AltitudeDataProvider;
  /** The aliased PFD settings manager. */
  pfdSettingsManager: UserSettingManager<PfdAliasedUserSettingTypes>;

}

/** The baro selection component. */
export class BaroSelection extends DisplayComponent<BaroSelectionProps> {

  private readonly baroUnitType = MappedSubject.create(
    ([isBaroInStd, baroType]) => {
      if (isBaroInStd === true) {
        return '';
      } else if (baroType === BaroCorrectionUnit.In) {
        return 'IN';
      } else {
        return 'HPA';
      }
    },
    this.props.altitudeDataProvider.isInStdMode,
    this.props.pfdSettingsManager.getSetting('baroCorrectionUnit')
  );


  private readonly baroDisplay = MappedSubject.create(
    ([isBaroInStd, baroValue, correctionUnit]) => {
      if (isBaroInStd) {
        return 'STD';
      } else if (baroValue === null) {
        return '---';
      } else if (correctionUnit === BaroCorrectionUnit.In) {
        return baroValue.toFixed(2);
      } else {
        return UnitType.HPA.convertFrom(baroValue, UnitType.IN_HG).toFixed(0);
      }
    },
    this.props.altitudeDataProvider.isInStdMode,
    this.props.altitudeDataProvider.baroCorrection,
    this.props.pfdSettingsManager.getSetting('baroCorrectionUnit'),
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{
      'border-box': true,
      'baro-selection': true,
      'std': this.baroDisplay.map(bd => bd === 'STD')
    }}>
      <span class={{
        'baro-value': true,
        'invalid': this.baroDisplay.map(bd => bd === '---')
      }}>{this.baroDisplay}</span>
      <span class={{
        'baro-type': true,
        'invalid': this.baroDisplay.map(bd => bd === '---')
      }}>{this.baroUnitType}</span>
    </div>;
  }
}
