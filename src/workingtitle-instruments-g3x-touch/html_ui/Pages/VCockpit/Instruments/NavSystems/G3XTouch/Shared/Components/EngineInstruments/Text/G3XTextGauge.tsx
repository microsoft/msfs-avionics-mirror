import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode, XMLHostedLogicGauge } from '@microsoft/msfs-sdk';

import { G3XBaseGauge } from '../G3XBaseGauge';
import { G3XGaugeStyle } from '../../G3XGaugesConfigFactory';

import './G3XTextGauge.css';

/** THIS IS CLONE FROM G1000, WILL BE UPDATED IN NEXT PR's */
/** The props for a text column. */
interface ColumnProps extends Partial<G3XTextColumnProps> {
  /** Which column this text is located in. */
  location: 'left' | 'center' | 'right';
}

/** The configuration of an individual column of text. */
export interface G3XTextColumnProps {
  /** The HTML class of the element. */
  class?: string,
  /** The text content of the column. */
  content: CompositeLogicXMLElement,
  /** The color of the text. */
  color?: CompositeLogicXMLElement,
  /** The font size to use. */
  fontSize?: string
}

/** The props for a text element. */
export interface G3XTextElementProps extends ComponentProps {
  /** The HTML class of the element. */
  class?: string,
  /** The left side text. */
  left?: G3XTextColumnProps,
  /** The central text. */
  center?: G3XTextColumnProps,
  /** The right side text. */
  right?: G3XTextColumnProps
  /** Style information. */
  style?: Partial<G3XGaugeStyle>
}

/** Draw a single column of text. */
class XMLTextColumn extends DisplayComponent<ColumnProps & XMLHostedLogicGauge> {
  private readonly contentRef = FSComponent.createRef<HTMLDivElement>();
  private readonly textValue = Subject.create('');

  /** @inheritDoc */
  public onAfterRender(): void {
    if (this.props.content !== undefined) {
      this.textValue.set(this.props.logicHost.addLogicAsString(
        this.props.content, (content: string) => {
          this.textValue.set(content);
        }
      ));
    } else {
      // If a column has no content, we remove its flex weight to make room for the others.
      this.contentRef.instance.style.flex = '0';
    }

    if (this.props.color !== undefined) {
      this.contentRef.instance.style.color = this.props.logicHost.addLogicAsString(
        this.props.color, (content: string) => {
          this.contentRef.instance.style.color = content;
        }
      );
    }

    if (this.props.fontSize !== undefined) {
      // The original code uses 10px for main text.  We're using 16.
      // In order to keep thigns proportional, font sizes that are
      // explicity set will be scaled up by the same factor.
      this.contentRef.instance.style.fontSize = `${parseFloat(this.props.fontSize) * 1.6}px`;
    }

    if (this.props.class !== undefined) {
      this.contentRef.instance.classList.add(this.props.class);
    }
  }

  /** @inheritDoc */
  public render(): VNode {
    return <div ref={this.contentRef} class={'text_column_' + this.props.location}>{this.textValue}</div>;
  }
}

/** A text gauge display element. */
export class G3XTextGauge extends G3XBaseGauge<G3XTextElementProps & XMLHostedLogicGauge> {

  /** @inheritDoc */
  protected initGauge(): void {
    // Just satisfying the base class.
    return;
  }

  /** @inheritDoc */
  protected renderGauge(): VNode {
    return (
      <div class='text_gauge_container'>
        <XMLTextColumn location={'left'} logicHost={this.props.logicHost} {...this.props.left} />
        <XMLTextColumn location={'center'} logicHost={this.props.logicHost} {...this.props.center} />
        <XMLTextColumn location={'right'} logicHost={this.props.logicHost} {...this.props.right} />
      </div>
    );
  }
}