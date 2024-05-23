/** A cylinder gauge style definition. */
export interface G3XGaugeStyle {
  /** Text increment for numeric text values */
  textIncrement: number,
  /** The precision for numeric text values */
  valuePrecision: number
  /** The scaling ratio on the gauge */
  sizePercent: number,
  /** Left margin. */
  marginLeft: string,
  /** Right margin. */
  marginRight: string,
  /** Top margin. */
  marginTop: string,
  /** Bottom margin. */
  marginBottom: string
  /** Height */
  height: string,
  /** Display plus sign for positive values. */
  displayPlus: boolean,
}
