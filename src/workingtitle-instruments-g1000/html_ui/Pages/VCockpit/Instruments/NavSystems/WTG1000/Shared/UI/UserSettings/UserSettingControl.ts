import { ComponentProps, UserSettingManager, UserSettingRecord } from 'msfssdk';

import { UiControl } from '../UiControl';

/**
 * Props for components that control a user setting.
 */
export interface UserSettingControlProps<T extends UserSettingRecord, K extends keyof T & string> extends ComponentProps {
  /** The setting manager associated with the controlled setting. */
  settingManager: UserSettingManager<T>

  /** The name of the controlled setting. */
  settingName: K;

  /** The function to use to register the UI control(s) used by the component. */
  registerFunc: (ctrl: UiControl, unregister?: boolean) => void;

  /** The CSS class(es) to apply to the root of the component. */
  class?: string;
}