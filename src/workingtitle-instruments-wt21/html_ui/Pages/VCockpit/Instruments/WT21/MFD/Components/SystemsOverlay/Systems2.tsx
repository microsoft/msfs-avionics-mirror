import { ComponentProps, DisplayComponent, FSComponent, Subject, VNode } from '@microsoft/msfs-sdk';

import { EisInstrument, EisSurfacesData } from '../EngineIndication/EisData';
import { TrimGroup } from './SystemsComponents/TrimGroup';

/**
 * The properties for the Systems2 component.
 */
interface Systems2Props extends ComponentProps {
  /** The engine data instrument */
  eis: EisInstrument;
}

/**
 * The SystemsOverlay2 component.
 */
export class Systems2 extends DisplayComponent<Systems2Props> {
  private readonly trimRef = FSComponent.createRef<TrimGroup>();
  private readonly isOnGround = Subject.create(true);

  /** @inheritdoc */
  public onAfterRender(): void {
    this.props.eis.surfacesData.sub(this.onSurfacesDataUpdate.bind(this), true);
    this.isOnGround.sub((v: boolean) => {
      this.trimRef.instance.setGreenboxVisibility(v);
    }, true);
  }

  public readonly setVisibility = (isVisible: boolean): void => {
    this.trimRef.instance.setVisibility(isVisible);
  };

  /**
   * Sets the on-ground state.
   * @param value The value.
   */
  public updateOnGround(value: boolean): void {
    this.isOnGround.set(value);
  }

  /**
   * Called when the surfaces data updates.
   * @param data The surfaces data.
   * @param prop The surfaces property that changed.
   * @param newValue The new value of the property.
   */
  public onSurfacesDataUpdate(data: EisSurfacesData, prop: keyof EisSurfacesData, newValue: number): void {
    switch (prop) {
      case 'elevator_trim_pct':
        this.trimRef.instance.updateElevatorTrim(newValue);
        break;
      case 'aileron_trim_pct':
        this.trimRef.instance.updateAileronTrim(newValue);
        break;
      case 'rudder_trim_pct':
        this.trimRef.instance.updateRudderTrim(newValue);
        break;
    }
  }

  /** @inheritdoc */
  public render(): VNode {
    return (
      <TrimGroup ref={this.trimRef} />
    );
  }
}