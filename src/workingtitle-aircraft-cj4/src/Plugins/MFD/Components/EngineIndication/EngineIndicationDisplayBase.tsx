import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { EisEngineData, EisFadecData, EisSurfacesData } from './EisData';

import './CompressedEngineIndicationDisplay.css';

/**
 * The EngineIndicationDisplayBase component.
 */
export abstract class EngineIndicationDisplayBase extends DisplayComponent<ComponentProps> {
  protected readonly containerRef = FSComponent.createRef<HTMLDivElement>();
  protected readonly isOnGround = Subject.create<boolean>(true);

  /**
   * Update this display's engine indications.
   * @param prop The key of the property that changed.
   * @param value The new value of the property.
   */
  abstract updateEngineData(prop: keyof EisEngineData, value: number): void;

  /**
   * Update this display's surfaces indications.
   * @param prop The key of the property that changed.
   * @param value The new value of the property.
   */
  abstract updateSurfacesData(prop: keyof EisSurfacesData, value: number): void;

  /**
   * Update this display's FADEC indications.
   * @param prop The key of the property that changed.
   * @param value The new value of the property.
   */
  abstract updateFadecData(prop: keyof EisFadecData, value: string): void;

  /**
   * Sets the on-ground state.
   * @param value The value.
   */
  public updateOnGround(value: boolean): void {
    this.isOnGround.set(value);
  }

  /**
   * Pauses the display.
   */
  public pause(): void {
    this.containerRef.instance.classList.add('hidden');
  }

  /**
   * Resumes the display.
   */
  public resume(): void {
    this.containerRef.instance.classList.remove('hidden');
  }


  /** @inheritdoc */
  abstract render(): VNode;
}