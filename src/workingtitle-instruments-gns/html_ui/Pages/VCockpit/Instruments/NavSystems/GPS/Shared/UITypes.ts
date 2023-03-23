import { ComponentProps, EventBus } from '@microsoft/msfs-sdk';

/** A set of component props that includes the event bus. */
export interface PropsWithBus extends ComponentProps {
  /** An instance of the event bus. */
  bus: EventBus;
}

/** A type describing which GNS instrument is in use. */
export type GNSType = 'wt430' | 'wt530';