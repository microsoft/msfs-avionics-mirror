import { ComponentProps, DisplayComponent, EventBus, FSComponent, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { MapSettingsMfdAliased } from '../../Map/MapUserSettings';

import './NextradInfo.css';

/** @inheritdoc */
interface NextradInfoProps extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
  /** The map user settings */
  mapSettingsManager: UserSettingManager<MapSettingsMfdAliased>
}

/** The NextradInfo component. */
export class NextradInfo extends DisplayComponent<NextradInfoProps> {
  private readonly nexradInfoRef = FSComponent.createRef<HTMLDivElement>();

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.mapSettingsManager.whenSettingChanged('nexradEnabled').handle(this.updateVisiblity);
    this.props.mapSettingsManager.whenSettingChanged('hsiFormat').handle(this.updateVisiblity);
  }

  private readonly updateVisiblity = (): void => {
    const nexradEnabled = this.props.mapSettingsManager.getSetting('nexradEnabled').value;
    const isPlanFormat = this.props.mapSettingsManager.getSetting('hsiFormat').value === 'PLAN';
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
