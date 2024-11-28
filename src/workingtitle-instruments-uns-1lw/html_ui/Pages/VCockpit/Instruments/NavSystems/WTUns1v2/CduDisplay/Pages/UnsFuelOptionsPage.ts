import { FmcRenderTemplate, FSComponent, PageLinkField, SimpleUnit, Subject, UnitFamily, UnitType } from '@microsoft/msfs-sdk';

import { UnsTextInputField, WritableUnsFieldState } from '../Components/UnsTextInputField';
import { UnsChars } from '../UnsCduDisplay';
import { UnsCduFormatters, UnsCduParsers } from '../UnsCduIOUtils';
import { UnsFmcPage } from '../UnsFmcPage';

/** A UNS FuelOptions page */
export class UnsFuelOptionsPage extends UnsFmcPage {
  private ReturnLink = PageLinkField.createLink(this, `RETURN${UnsChars.ArrowRight}`, '/fuel');

  // TODO Pax weight persists
  private readonly perfPlan = this.fms.activePerformancePlan;

  private readonly weightValueLbs = Subject.create<number | null>(null);

  private readonly units: SimpleUnit<UnitFamily.Weight>[] = [
    UnitType.POUND,
    UnitType.KILOGRAM,
    UnitType.GALLON_FUEL,
    UnitType.IMP_GALLON_FUEL,
    UnitType.LITER_FUEL,
  ];

  private WeightConverterField: UnsTextInputField<number | null>[] = [0, 1, 2, 3, 4].map((unitIndex: number): UnsTextInputField<number | null> => {
    return new UnsTextInputField<number | null, number | null>(this, {
      maxInputCharacterCount: 6,
      formatter: {
        nullValueString: '------',
        parse: val => {
          const result = UnsCduParsers.NumberIntegerPositive(6)(val) as number | null;
          return result === null ? null : UnitType.POUND.convertFrom(result, this.units[unitIndex]);
        },
        format: ([value, isHighlighted, typedText]: WritableUnsFieldState<number | null>) => {
          const weight = value === null ? null : UnitType.POUND.convertTo(value, this.units[unitIndex]);
          return UnsCduFormatters.NumberHyphen(6, 'input')([weight, isHighlighted, typedText]);
        },
      },
      onSelected: async () => {
        this.screen.toggleFieldFocused(this.WeightConverterField[unitIndex]);
        return true;
      },
      onModified: async () => {
        this.screen.toggleFieldFocused(this.WeightConverterField[unitIndex]);
        return false;
      },
    }).bindWrappedData(this.weightValueLbs);
  });

  private readonly AvgPaxWtField = new UnsTextInputField(this, {
    maxInputCharacterCount: 3,
    formatter: {
      parse: UnsCduParsers.NumberIntegerPositive(3),
      format: UnsCduFormatters.NumberHyphen(3, 'input'),
    },
    suffix: ' ',
    onSelected: async () => {
      this.screen.toggleFieldFocused(this.AvgPaxWtField);
      return true;
    },
    onModified: async () => {
      this.screen.toggleFieldFocused(this.AvgPaxWtField);
      return false;
    },
  }).bindWrappedData(this.perfPlan.paxAvgWeight);

  protected pageTitle = ' FUEL OPTIONS';
  protected doShowSubpage = false;

  /** @inheritDoc */
  render(): FmcRenderTemplate[] {
    return [
      [
        [this.TitleField],
        ['LBS[cyan]'],
        [this.WeightConverterField[0]], // `XFILL${UnsChars.ArrowRight}[disabled]`
        ['KGS[cyan]'],
        [this.WeightConverterField[1]],
        ['US GAL[cyan]', 'FUEL ENTRY[disabled]'],
        [this.WeightConverterField[2], 'BY TOTAL[disabled]'],
        ['IMP GAL[cyan]', 'AVG PAX WT[cyan]'],
        [this.WeightConverterField[3], this.AvgPaxWtField],
        ['LITERS[cyan]'],
        [this.WeightConverterField[4], this.ReturnLink],
      ],
    ];
  }
}
