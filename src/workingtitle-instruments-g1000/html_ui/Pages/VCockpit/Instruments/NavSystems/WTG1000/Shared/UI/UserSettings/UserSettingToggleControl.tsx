import { DisplayComponent, FSComponent, UserSettingRecord, UserSettingValueFilter, VNode } from 'msfssdk';

import { UserSettingControlProps } from './UserSettingControl';
import { UserSettingToggleEnumControl } from './UserSettingToggleEnumControl';

/**
 * Component props for UserSettingToggleControl.
 */
export interface UserSettingToggleControlProps<T extends UserSettingRecord, K extends keyof UserSettingValueFilter<T, boolean> & string> extends UserSettingControlProps<T, K> {
  /** The text representation of the `false` setting value. Defaults to `'false'`. */
  falseText?: string;

  /** The text representation fo the `true` setting value. Defaults to `'true'`. */
  trueText?: string;
}

/**
 * A component which controls the value of a boolean setting using an ArrowToggle.
 */
export class UserSettingToggleControl<
  T extends UserSettingRecord,
  K extends keyof UserSettingValueFilter<T, boolean> & string,
  P extends UserSettingToggleControlProps<T, K> = UserSettingToggleControlProps<T, K>> extends DisplayComponent<P> {

  /** @inheritdoc */
  public render(): VNode {
    return (
      <UserSettingToggleEnumControl<T, K>
        settingManager={this.props.settingManager}
        settingName={this.props.settingName}
        registerFunc={this.props.registerFunc}
        values={[false, true] as NonNullable<T[K]>[]}
        valueText={[this.props.falseText ?? 'false', this.props.trueText ?? 'true']}
        class={this.props.class ?? ''}
      />
    );
  }
}