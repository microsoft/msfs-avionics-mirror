import { ComponentProps, DisplayComponent, FSComponent, Subscribable, VNode } from '@microsoft/msfs-sdk';

/** Props for {@link OutlinedElement}. */
export interface OutlinedElementProps extends ComponentProps {
  /** The element tag to use, like `path` or `circle`. */
  tag: string;
  /** The class to use on both paths. */
  className?: string;
  /** The class to use on the first path. */
  outlineClass?: string;
  /** Props to apply to the outlined element. */
  outlineProps?: {
    [x: string]: any,
  }
  /** The path string. */
  d?: string | Subscribable<string>;
  /** Allows for user to pass in any props they want. */
  [x: string]: any;
}

/**
 * Renders 2 elements, both with the passed class, and the first element with the outlineClass.
 * Saves you from having to write out 2 elements everytime you want an outline in svg.
 */
export class OutlinedElement extends DisplayComponent<OutlinedElementProps> {
  /** @inheritdoc*/
  public render(): VNode {
    const { tag, className, outlineClass, outlineProps, ...other } = this.props;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const OutlinedTag = tag;

    return (
      <>
        <OutlinedTag
          class={(className ?? '') + ' ' + (outlineClass ?? '')}
          {...other}
          {...outlineProps}
        />
        <OutlinedTag
          class={className ?? ''}
          {...other}
        />
      </>
    );
  }
}
