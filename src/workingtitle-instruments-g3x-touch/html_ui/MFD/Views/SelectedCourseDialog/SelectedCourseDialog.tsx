import {
  FSComponent, MappedSubject, MathUtils, MutableSubscribable, NodeReference, Subject, SubscribableUtils, Subscription,
  VNode
} from '@microsoft/msfs-sdk';

import { NavReferenceSource } from '@microsoft/msfs-garminsdk';

import { DigitInputSlot } from '../../../Shared/Components/NumberInput/DigitInputSlot';
import { NumberInput } from '../../../Shared/Components/NumberInput/NumberInput';
import { UiTouchButton } from '../../../Shared/Components/TouchButton/UiTouchButton';
import { G3XTouchNavSourceName } from '../../../Shared/NavReference/G3XTouchNavReference';
import { UiKnobId } from '../../../Shared/UiSystem/UiKnobTypes';
import { AbstractSimpleUiNumberDialog } from '../../Dialogs/AbstractSimpleUiNumberDialog';
import { UiNumberDialogInput } from '../../Dialogs/AbstractUiNumberDialog';

import './SelectedCourseDialog.css';

/**
 * A request input for {@link SelectedCourseDialog}.
 */
export interface SelectedCourseDialogInput extends UiNumberDialogInput {
  /** The navigation reference source from which to retrieve course sync data. */
  navSource: NavReferenceSource<G3XTouchNavSourceName>;
}

/**
 * A dialog that allows the user to enter a selected course value.
 */
export class SelectedCourseDialog extends AbstractSimpleUiNumberDialog<SelectedCourseDialogInput, number> {
  private readonly syncCourseRef = FSComponent.createRef<UiTouchButton>();

  private readonly navSource = Subject.create<NavReferenceSource<G3XTouchNavSourceName> | null>(null);

  private readonly navSourceIsLocalizer = Subject.create(false);
  private readonly navSourceLocalizerCourse = Subject.create<number | null>(null);
  private readonly navSourceBearing = Subject.create<number | null>(null);
  private readonly syncCourseValue = MappedSubject.create(
    ([isLocalizer, localizerCourse, bearing]) => isLocalizer ? localizerCourse : bearing,
    this.navSourceIsLocalizer,
    this.navSourceLocalizerCourse,
    this.navSourceBearing
  );

  private readonly subscriptions: Subscription[] = [];

  /** @inheritDoc */
  public onAfterRender(): void {
    super.onAfterRender();

    this.title.set('Select VOR Course');

    this._knobLabelState.set([
      [UiKnobId.SingleOuter, 'Select Course'],
      [UiKnobId.SingleInner, 'Select Course'],
      [UiKnobId.LeftOuter, 'Select Course'],
      [UiKnobId.LeftInner, 'Select Course'],
      [UiKnobId.RightOuter, 'Select Course'],
      [UiKnobId.RightInner, 'Select Course'],
    ]);

    this.value.pipe(this.isEnterButtonEnabled, this.isValueValid.bind(this));

    this.subscriptions.push(
      SubscribableUtils.pipeOptionalMappedSource(
        this.navSource,
        this.navSourceIsLocalizer,
        to => { to.set(false); },
        source => source?.isLocalizer
      ),

      SubscribableUtils.pipeOptionalMappedSource(
        this.navSource,
        this.navSourceLocalizerCourse,
        to => { to.set(null); },
        source => source?.localizerCourse
      ),

      SubscribableUtils.pipeOptionalMappedSource(
        this.navSource,
        this.navSourceBearing,
        to => { to.set(null); },
        source => source?.bearing
      )
    );
  }

  /** @inheritDoc */
  protected onRequest(input: SelectedCourseDialogInput): number {
    this.navSource.set(input.navSource);

    const initialValue = MathUtils.clamp(input.initialValue, 0, 360);

    // Focus the Enter button.
    this.focusController.setFocusIndex(1);

    return initialValue;
  }

  /** @inheritDoc */
  protected isValueValid(value: number): boolean {
    return value >= 0 && value <= 360;
  }

  /** @inheritDoc */
  protected getInvalidValueMessage(): string | VNode {
    return 'Invalid Entry\nValue must be between\n0 and 360';
  }

  /** @inheritDoc */
  protected getPayload(value: number): number {
    return value;
  }

  /** @inheritDoc */
  protected onCleanupRequest(): void {
    this.navSource.set(null);
  }

  /** @inheritDoc */
  protected getRootCssClassName(): string {
    return 'selected-crs-dialog';
  }

  /**
   * Responds to when this dialog's 'Sync Course' is pressed.
   */
  private onSyncCoursePressed(): void {
    const course = this.syncCourseValue.get();

    if (course === null) {
      return;
    }

    const roundedCourse = MathUtils.clamp(Math.round(course), 0, 360);
    this.inputRef.instance.setValue(roundedCourse === 0 ? 360 : roundedCourse);
    this.setBackButtonStyle('cancel');
  }

  /** @inheritDoc */
  protected renderOtherContents(): VNode | null {
    return (
      <UiTouchButton
        ref={this.syncCourseRef}
        label={'Sync\nCourse'}
        isEnabled={this.syncCourseValue.map(value => value !== null)}
        onPressed={this.onSyncCoursePressed.bind(this)}
        class='selected-crs-dialog-sync'
      />
    );
  }

  /** @inheritDoc */
  protected renderInput(ref: NodeReference<NumberInput>, value: MutableSubscribable<number>): VNode {
    return (
      <NumberInput
        ref={ref}
        value={value}
        digitizeValue={(currentValue, setSignValues, setDigitValues): void => {
          const clamped = MathUtils.clamp(Math.round(currentValue), 0, 999);

          setDigitValues[0](Math.trunc((clamped) / 1e1), true);
          setDigitValues[1](clamped % 1e1, true);
        }}
        renderInactiveValue={currentValue => `${MathUtils.clamp(Math.round(currentValue), 0, 999).toString().padStart(3, '0')}°`}
        allowBackFill={true}
        class='number-dialog-input selected-crs-dialog-input'
      >
        <DigitInputSlot
          characterCount={2}
          minValue={0}
          maxValue={37}
          increment={1}
          wrap={true}
          scale={1e1}
          defaultCharValues={[0, 0]}
        />
        <DigitInputSlot
          characterCount={1}
          minValue={0}
          maxValue={10}
          increment={1}
          wrap={true}
          scale={1}
          defaultCharValues={[0]}
        />
        <div>°</div>
      </NumberInput>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.syncCourseRef.getOrDefault()?.destroy();

    for (const sub of this.subscriptions) {
      sub.destroy();
    }

    super.destroy();
  }
}
