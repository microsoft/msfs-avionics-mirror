import {
  DisplayComponent, FSComponent, VNode, ComponentProps,
  LegDefinition, FlightPlanUtils, ICAO, LegType, StringUtils,
  Subscribable, SubscribableUtils, MappedSubject,
} from '@microsoft/msfs-sdk';
import { GtcOrientation } from '../..';

/** The properties for the {@link LegNameDisplay} component. */
interface LegNameDisplayProps extends ComponentProps {
  /** The leg to display the name for. */
  leg?: LegDefinition | Subscribable<LegDefinition | undefined>;
  /** The leg name. Takes priority over the leg prop. */
  legName?: string | Subscribable<string | undefined>;
  /** The leg type. Takes priority over the leg prop. */
  legType?: LegType | Subscribable<LegType | undefined>;
  /** The leg fix ICAO. Takes priority over the leg prop. */
  fixIcao?: string | Subscribable<string | undefined>;
  /** The leg name display data. Takes priority over all the other leg props. */
  legNameDisplayData?: LegNameDisplayData | Subscribable<LegNameDisplayData | undefined>;
  /** The GTC orientation. Defaults to horizontal. */
  gtcOrientation?: GtcOrientation;
  /** Optional string to use when leg is null. */
  nullText?: string;
}

/** The leg data. */
export interface LegNameDisplayData {
  /** The leg name. */
  name: string;
  /** The leg type. */
  type: LegType;
  /** The fix icao. */
  fixIcao: string;
}

/** The LegNameDisplay component. */
export class LegNameDisplay extends DisplayComponent<LegNameDisplayProps> {
  private readonly ref = FSComponent.createRef<HTMLSpanElement>();

  private readonly legProp = SubscribableUtils.toSubscribable(this.props.leg, true) as Subscribable<LegDefinition | undefined>;
  private readonly legNameProp = SubscribableUtils.toSubscribable(this.props.legName, true) as Subscribable<string | undefined>;
  private readonly legTypeProp = SubscribableUtils.toSubscribable(this.props.legType, true) as Subscribable<LegType | undefined>;
  private readonly fixIcaoProp = SubscribableUtils.toSubscribable(this.props.fixIcao, true) as Subscribable<string | undefined>;
  private readonly legNameDisplayDataProp = SubscribableUtils.toSubscribable(this.props.legNameDisplayData, true) as Subscribable<LegNameDisplayData | undefined>;

  private readonly legName = this.props.legName
    ? this.legNameProp.map(x => x)
    : this.legProp.map(x => x?.name);
  private readonly legType = this.props.legType
    ? this.legTypeProp.map(x => x)
    : this.legProp.map(x => x?.leg.type);
  private readonly fixIcao = this.props.fixIcao
    ? this.fixIcaoProp.map(x => x)
    : this.legProp.map(x => x?.leg.fixIcao);

  private readonly legData = this.props.legNameDisplayData
    ? this.legNameDisplayDataProp.map(x => x)
    : MappedSubject.create(([legName, legType, fixIcao]) => {
      if (legName === undefined || legType === undefined || fixIcao === undefined) { return undefined; }
      return { name: legName, type: legType, fixIcao } as LegNameDisplayData;
    }, this.legName, this.legType, this.fixIcao);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.legData.sub(legData => {
      this.ref.instance.innerHTML = '';
      FSComponent.render(this.renderLegName(legData), this.ref.instance);
    }, true);
  }

  /**
   * Renders the leg name as a VNode.
   * @param leg The leg definition.
   * @returns the leg rendered as vnode.
   */
  private renderLegName(leg?: LegNameDisplayData): VNode {
    if (leg) {
      const legName = leg.name && StringUtils.useZeroSlash(leg.name);
      const isProcTurn = leg.type === LegType.PI;
      const isHoldLeg = FlightPlanUtils.isHoldLeg(leg.type);

      if (FlightPlanUtils.isAltitudeLeg(leg.type)) {
        return <span>{legName?.replace(/FT/, '')}<span style="font-size: 0.75em;">FT</span></span>;
      } else if (isHoldLeg) {
        return <span>{ICAO.getIdent(leg.fixIcao)}</span>;
      } else if (isProcTurn) {
        return <span style={`font-size: ${this.props.gtcOrientation === 'vertical' ? '0.95' : '0.85'}em;`}>{legName}</span>;
      } else {
        return <span>{legName}</span>;
      }
    } else {
      return <span>{this.props.nullText ?? '_____'}</span>;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <span ref={this.ref} class="leg-name-display" />
    );
  }

  /** @inheritdoc */
  public destroy(): void {
    this.legName.destroy();
    this.legType.destroy();
    this.fixIcao.destroy();
    this.legData.destroy();
  }
}