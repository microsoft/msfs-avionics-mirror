import { ComponentProps, DisplayComponent, EventBus, FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { PfdAliasedUserSettingTypes } from '@microsoft/msfs-epic2-shared';

import { Annunciator } from '../Annunciator/Annunciator';
import './SynVisAnnunciator.css';

/** The properties for the {@link SynVisAnnunciators} component. */
interface SynVisAnnunciatorProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The settings manager to use. */
  settings: UserSettingManager<PfdAliasedUserSettingTypes>;
}

/** The HsiDisplay component. */
export class SynVisAnnunciator extends DisplayComponent<SynVisAnnunciatorProps> {
  /** SVS ON Checked state. */
  private readonly svsChecked = this.props.settings.getSetting('syntheticVisionEnabled');

  /** @inheritdoc */
  public render(): VNode {
    return (
      <Annunciator bus={this.props.bus} label="OFF" hideLabel={this.svsChecked.map(checked => checked === true)} mainTitle='SV' subTitle='SV' class="syn-vis" />
    );
  }
}
