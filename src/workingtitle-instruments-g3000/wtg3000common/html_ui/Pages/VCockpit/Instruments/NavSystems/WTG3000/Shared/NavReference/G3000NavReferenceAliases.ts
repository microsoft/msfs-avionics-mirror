// Aliases provided for backwards compatibility.

export {
  // NavBase.ts
  type NavReferenceBase as NavBase, AbstractNavReferenceBase as AbstractNavBase,

  // source/NavSource.ts
  type NavReferenceSource as NavSource, type NavReferenceSources as NavSources,

  // source/AdfNavSource.ts
  AdfRadioNavSource as AdfRadioSource,

  // source/GpsNavSource.ts
  GpsNavSource as GpsSource,

  // source/NavRadioNavSource.ts
  NavRadioNavSource,

  // indicator/NavIndicators.ts
  BasicNavReferenceIndicator as BasicNavIndicator, type NavReferenceIndicator as NavIndicator,
  type NavReferenceIndicators as NavIndicators, NavReferenceIndicatorsCollection as NavIndicatorsCollection
} from '@microsoft/msfs-garminsdk';

/**
 * Just the fields that can have control events generated for them.
 * @deprecated This interface has no practical use and will be removed at some point in the future.
 */
export interface NavIndicatorControlFields<NavSourceName extends string> {
  /** The name of the source to set, or null to remove the source. */
  readonly source: NavSourceName | null;
}