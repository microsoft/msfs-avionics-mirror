import { DisplayField, FmcFormatter, FmcRenderTemplate, ObjectSubject, Wait } from '@microsoft/msfs-sdk';

import { UnsFmcPage } from '../UnsFmcPage';

/**
 * UNS self-test item data
 */
interface SelfTestItemState {
  /** The name of the element being tested */
  name: string,

  /** The sub-steps of this test */
  subSteps?: {
    /** The name of the sub-step */
    name: string,
    /** A bias for the sub-step's duration */
    durationBias?: number,
  }[],

  /** The current sub-step index of this test */
  subStepIndex?: number,

  /** The progress made on the test, in integer percentage  */
  state: number | 'fail',

  /** A bias for the test's duration */
  durationBias?: number,
}


/**
 * A formatter for {@link SelfTestItemState}
 */
class SelfTestPageItemFormatter implements FmcFormatter<SelfTestItemState> {
  private readonly render: FmcRenderTemplate = [
    ['', ''],
  ];

  /** @inheritDoc */
  format(value: SelfTestItemState): FmcRenderTemplate {
    if (value.subSteps && value.subStepIndex !== undefined && value.subStepIndex !== -1) {
      this.render[0][0] = `  ${value.subSteps[value.subStepIndex].name}`;
    } else {
      this.render[0][0] = `  ${value.name}`;
    }

    if (value.state === 0) {
      this.render[0][1] = '';
    } else if (value.state === 100 && (!value.subSteps || value.subStepIndex === (value.subSteps.length - 1))) {
      this.render[0][1] = 'PASS[d-text]  ';
    } else if (value.state === 'fail') {
      this.render[0][1] = 'FAIL[amber d-text]  ';
    } else {
      this.render[0][1] = `${value.state.toFixed(0)}%[d-text]  `;
    }

    this.render[0][0] += '[d-text]';

    return this.render;
  }
}

const SELF_TESTS_INIT: SelfTestItemState[] = [
  { name: 'CPU', state: 0, durationBias: 0.25 },
  { name: 'RAM', state: 0 },
  { name: 'DATABASE', subSteps: [{ name: 'DATABASE BANK 1', durationBias: 0.2 }, { name: 'DATABASE BANK 2', durationBias: 1.1 }], subStepIndex: -1, state: 0 },
  { name: 'CONFIG MODULE', state: 0, durationBias: 0.05 },
  { name: 'AUXILIARY', state: 0, durationBias: 0.05 },
  { name: 'WAAS/ARINC', state: 0, durationBias: 0.05 },
  { name: 'ANALOG', state: 0, durationBias: 0.05 },
];

/**
 * A UNS-1 self-test page
 */
export class UnsSelfTestPage extends UnsFmcPage {
  private SelfTestData = SELF_TESTS_INIT.map((init) => ObjectSubject.create<SelfTestItemState>(init));

  private SelfTestFields = this.SelfTestData.map((data) => new DisplayField(this, {
    formatter: new SelfTestPageItemFormatter(),
  }).bind(data));

  /** @inheritDoc */
  protected override onResume(): void {
    for (const test of this.SelfTestData) {
      test.set('subStepIndex', 0);
      test.set('state', 0);
    }

    this.runTests();
  }

  /**
   * Runs the self-tests
   */
  private async runTests(): Promise<void> {
    for (const test of this.SelfTestData) {
      const errors = Array.from(this.fmsConfigErrors.entries())
          .filter(([, value]) => value === true);

      if (test.get().name.includes('CONFIG') && errors.length > 0) {
        await Wait.awaitDelay(250 + (100 * Math.random()));
        test.set('state', 'fail');
        continue;
      }

      const subSteps = test.get().subSteps;

      if (subSteps) {
        for (let i = 0; i < subSteps.length; i++) {
          const subStep = subSteps[i];

          test.set('subStepIndex', i);
          test.set('state', 10);

          for (let percentage = 0; percentage <= 100; percentage += 10) {
            await Wait.awaitDelay((250 + (100 * Math.random())) * (subStep.durationBias ?? 1));

            test.set('state', Math.max(percentage, 10));
          }
        }
      } else {
        for (let percentage = 0; percentage <= 100; percentage += 10) {
          await Wait.awaitDelay((250 + (100 * Math.random())) * (test.get().durationBias ?? 1));
        }

        test.set('state', 100);
      }
    }

    await Wait.awaitDelay(500);

    // FIXME this should go to the INIT page or STANDBY RESUME page
    this.screen.navigateTo('/init', { bypassSelfTestLock: true });
  }

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        ['        UNS - 1'],
        [''],
        [this.fmsConfig.airframe.name],
        [''],
        ...this.SelfTestFields.map((field) => [field]),
      ],
    ];
  }
}
