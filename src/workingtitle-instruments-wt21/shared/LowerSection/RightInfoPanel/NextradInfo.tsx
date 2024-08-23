import { ComponentProps, DisplayComponent, EventBus, FSComponent, VNode } from '@microsoft/msfs-sdk';

import { MapUserSettings } from '../../Map/MapUserSettings';

import './NextradInfo.css';

/** @inheritdoc */
interface NextradInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** The NextradInfo component. */
export class NextradInfo extends DisplayComponent<NextradInfoProps> {
  private readonly nexradInfoRef = FSComponent.createRef<HTMLDivElement>();
  private readonly mapSettingsManager = MapUserSettings.getAliasedManager(this.props.bus, 'MFD');

  /** @inheritdoc */
  public onAfterRender(): void {
    this.mapSettingsManager.whenSettingChanged('nexradEnabled').handle(this.updateVisiblity);
    this.mapSettingsManager.whenSettingChanged('hsiFormat').handle(this.updateVisiblity);
  }

  private readonly updateVisiblity = (): void => {
    const nexradEnabled = this.mapSettingsManager.getSetting('nexradEnabled').value;
    const isPlanFormat = this.mapSettingsManager.getSetting('hsiFormat').value === 'PLAN';
    const shouldBeVisible = nexradEnabled && isPlanFormat;
    this.nexradInfoRef.instance.classList.toggle('hidden', !shouldBeVisible);
  };

  /** @inheritdoc */
  public render(): VNode {
    return (
      <div class="nexrad-info" ref={this.nexradInfoRef}>
        <div class="nexrad-label">NEXRAD</div>
      </div>
    );
  }
}