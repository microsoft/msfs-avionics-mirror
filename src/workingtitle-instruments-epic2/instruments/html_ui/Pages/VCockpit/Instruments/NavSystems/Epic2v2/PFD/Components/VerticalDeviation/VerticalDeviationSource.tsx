import { ComponentProps, DisplayComponent, FSComponent, MappedSubject, Subscribable, SubscribableMapFunctions, VNode } from '@microsoft/msfs-sdk';

import { DefaultVerticalDeviationDataProvider, Epic2VerticalDeviationLabel } from '@microsoft/msfs-epic2-shared';

import './VerticalDeviationSource.css';

/** The vertical deviation source props. */
export interface VerticalDeviationSourceProps extends ComponentProps {
  /** A provider of vertical deviation data. */
  verticalDeviationDataProvider: DefaultVerticalDeviationDataProvider;
  /** Whether the PFD is being decluttered */
  declutter: Subscribable<boolean>;
}

/** The vertical deviation source component. */
export class VerticalDeviationSource extends DisplayComponent<VerticalDeviationSourceProps> {
  private readonly hidden = MappedSubject.create(
    SubscribableMapFunctions.or(),
    this.props.verticalDeviationDataProvider.approachPointerLabel.map((label) => label === Epic2VerticalDeviationLabel.None),
    this.props.declutter
  );

  /** @inheritdoc */
  public render(): VNode | null {
    return <div class={{
      'vertical-deviation-source': true,
      'border-box': true,
      'hidden': this.hidden
    }}>
      <span class="deviation-source-text">{this.props.verticalDeviationDataProvider.approachPointerLabel}</span>
    </div>;
  }

}
