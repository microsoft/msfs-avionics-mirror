import { ComponentProps, DisplayComponent, FSComponent, VNode } from '@microsoft/msfs-sdk';

import './OxygenPressure.css';

/**
 * The OxygenPressure component.
 */
export class OxygenPressure extends DisplayComponent<ComponentProps> {

  /**
   * Renders the component.
   * @returns The component VNode.
   */
  public render(): VNode {
    return (
      <div class="systems-oxy-psi">
        <svg height="135" width="100">
          <line x1="0" y1="10" x2="12" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="50" y="17" text-anchor="middle" font-size="20px" fill="var(--wt21-colors-white)">OXY PSI</text>
          <line x1="88" y1="10" x2="100" y2="10" stroke="var(--wt21-colors-white)" />
          <text x="50" y="37" text-anchor="end" font-size="20px" fill="var(--wt21-colors-white)">2400</text>
          <text x="50" y="85" text-anchor="end" font-size="20px" fill="var(--wt21-colors-white)">1200</text>
          <text x="50" y="127" text-anchor="end" font-size="20px" fill="var(--wt21-colors-white)">0</text>
          <line x1="56" y1="30" x2="72" y2="30" stroke="var(--wt21-colors-white)" />
          <line x1="64" y1="54" x2="72" y2="54" stroke="var(--wt21-colors-white)" />
          <line x1="56" y1="78" x2="72" y2="78" stroke="var(--wt21-colors-white)" />
          <line x1="64" y1="102" x2="72" y2="102" stroke="var(--wt21-colors-white)" />
          <line x1="56" y1="127" x2="72" y2="127" stroke="var(--wt21-colors-white)" />
          <rect x="69" y="29" height="99" width="8" fill="var(--wt21-colors-green)" />
          <rect x="69" y="110" height="18" width="8" fill="var(--wt21-colors-yellow)" />
        </svg>
        <div class="systems-oxy-psi-pointer">
          <svg height="12" width="18">
            <path d="M 0 6 l 18 -6 l 0 12 z" fill="var(--wt21-colors-green)" />
          </svg>
        </div>
      </div>
    );
  }
}