import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subject, Subscribable, Subscription, UserSettingManager, VNode } from '@microsoft/msfs-sdk';

import { UnitsUserSettingManager, WindDataProvider, WindDisplay as BaseWindDisplay, WindDisplayOption } from '@microsoft/msfs-garminsdk';
import { WindDisplaySettingMode, WindDisplayUserSettingTypes } from '@microsoft/msfs-wtg3000-common';

import './WindDisplay.css';

/**
 * Component props for WindDisplay.
 */
export interface WindDisplayProps extends ComponentProps {
  /** A provider of wind data. */
  dataProvider: WindDataProvider;

  /** A manager for wind display user settings. */
  windDisplaySettingManager: UserSettingManager<WindDisplayUserSettingTypes>;

  /** A manager for display units user settings. */
  unitsSettingManager: UnitsUserSettingManager;

  /** Whether the display should be decluttered. */
  declutter: Subscribable<boolean>;
}

/**
 * A G3000 PFD wind display.
 */
export class WindDisplay extends DisplayComponent<WindDisplayProps> {
  private static readonly MODE_MAP = {
    [WindDisplaySettingMode.Option1]: WindDisplayOption.Option1,
    [WindDisplaySettingMode.Option2]: WindDisplayOption.Option2,
    [WindDisplaySettingMode.Option3]: WindDisplayOption.Option3
  };

  private readonly ref = FSComponent.createRef<BaseWindDisplay>();

  private readonly declutter = MappedSubject.create(
    ([declutter, displayMode]) => declutter || displayMode === WindDisplaySettingMode.Off,
    this.props.declutter,
    this.props.windDisplaySettingManager.getSetting('windDisplayMode')
  );

  private readonly option = Subject.create(WindDisplayOption.Option1);

  private displayModeSub?: Subscription;

  /** @inheritdoc */
  public onAfterRender(): void {
    this.displayModeSub = this.props.windDisplaySettingManager.getSetting('windDisplayMode').sub(mode => {
      if (mode === WindDisplaySettingMode.Off) {
        return;
      }

      this.option.set(WindDisplay.MODE_MAP[mode]);
    }, true);
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <BaseWindDisplay
        ref={this.ref}
        dataProvider={this.props.dataProvider}
        option={this.option}
        unitsSettingManager={this.props.unitsSettingManager}
        declutter={this.declutter}
      />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.ref.getOrDefault()?.destroy();

    this.declutter.destroy();
    this.displayModeSub?.destroy();

    super.destroy();
  }
}