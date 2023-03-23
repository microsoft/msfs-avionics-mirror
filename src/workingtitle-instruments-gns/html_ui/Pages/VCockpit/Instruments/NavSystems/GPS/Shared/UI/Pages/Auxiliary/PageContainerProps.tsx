import { PropsWithBus } from '../../../UITypes';

/**
 * 
 */
export interface PageContainerProps extends PropsWithBus {
  /** A callback called when the page group is changed. */
  onPageGroupChanged: (label: string, pages: number) => void;

  /** A callback called when the page is changed. */
  onPageChanged: (index: number) => void;
}