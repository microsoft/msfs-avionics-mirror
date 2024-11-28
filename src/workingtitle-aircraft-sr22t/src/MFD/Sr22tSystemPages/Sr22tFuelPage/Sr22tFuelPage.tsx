import { FSComponent, EventBus, VNode, Subject, MathUtils, SimVarValueType, MappedSubject, Subscription } from '@microsoft/msfs-sdk';
import { FmsHEvent, G1000ControlEvents, MFDUiPage, MFDUiPageProps } from '@microsoft/msfs-wtg1000';

import './Sr22tFuelPage.css';

/**
 * Component props for {@link Sr22tFuelPage}.
 */
export interface Sr22tFuelPageProps extends MFDUiPageProps {
  /** The event bus. */
  bus: EventBus;
}

/**
 * A page which displays the SR22T fuel data.
 */
export class Sr22tFuelPage extends MFDUiPage<Sr22tFuelPageProps> {
  private static readonly FUEL_BAR_HEIGHT = 387; //pixels

  private readonly _temporaryUsableFuel = Subject.create(this.fetchRemainingTotalizerFuel());
  private readonly fuelDelta = Subject.create(0);

  private readonly controlPublisher = this.props.bus.getPublisher<G1000ControlEvents>();

  private readonly startingFuelLevelDisplay = FSComponent.createRef<HTMLDivElement>();
  private readonly temporaryFuelLevelDisplay = FSComponent.createRef<HTMLDivElement>();

  private readonly subs: Subscription[] = [];

  /** @inheritDoc */
  constructor(props: Sr22tFuelPageProps) {
    super(props);

    this._title.set('Initial Usable Fuel');
  }

  /** @inheritDoc */
  public onAfterRender(thisNode: VNode): void {
    super.onAfterRender(thisNode);

    this.subs.push(MappedSubject.create(this._temporaryUsableFuel, this.fuelDelta).sub(([temp, delta]) => {
      const initialValueHeight = MathUtils.round(((temp - delta) / 92) * Sr22tFuelPage.FUEL_BAR_HEIGHT);
      this.startingFuelLevelDisplay.instance.style.height = `${initialValueHeight}px`;
      this.temporaryFuelLevelDisplay.instance.classList.toggle('hidden', !delta);
      if (delta) {
        const deltaHeight = MathUtils.round((Math.abs(delta) / 92) * Sr22tFuelPage.FUEL_BAR_HEIGHT);
        this.temporaryFuelLevelDisplay.instance.style.bottom = `${delta > 0 ? initialValueHeight : initialValueHeight - deltaHeight}px`;
        this.temporaryFuelLevelDisplay.instance.style.height = `${deltaHeight}px`;
      }
    }, true));
  }

  /** @inheritDoc */
  public onInteractionEvent(evt: FmsHEvent): boolean {
    switch (evt) {
      case FmsHEvent.UPPER_INC:
        this.changeUsableFuelByAmount(1);
        break;
      case FmsHEvent.UPPER_DEC:
        this.changeUsableFuelByAmount(-1);
        break;
      case FmsHEvent.LOWER_INC:
        this.changeUsableFuelByAmount(10);
        break;
      case FmsHEvent.LOWER_DEC:
        this.changeUsableFuelByAmount(-10);
        break;
      case FmsHEvent.ENT:
        this.saveInitialUsableFuel();
        this.props.viewService.open('Sr22tWeightBalancePage');
        this.props.menuSystem.back();
        break;
    }
    return false;
  }

  /** @inheritDoc */
  protected onViewResumed(): void {
    super.onViewResumed();

    this.subs.forEach(sub => sub.resume(true));
  }

  /** @inheritDoc */
  protected onViewPaused(): void {
    super.onViewPaused();

    this.subs.forEach(sub => sub.pause());
  }

  /**
   * Provides the value of the currently set unsaved initial usable fuel on the fuel page
   * @returns The currently set value of usable fuel
   **/
  public get temporaryUsableFuel(): number {
    return this._temporaryUsableFuel.get();
  }

  /**
   * Sets the value of the unsaved initial usable fuel on the fuel page to a specific number
   * @param value a number to set as initial usable fuel
   **/
  public setTemporaryUsableFuel(value: number): void {
    this.fuelDelta.set(this.fuelDelta.get() + (value - this._temporaryUsableFuel.get()));
    this._temporaryUsableFuel.set(value);
  }

  /**
   * Resets the changes made to the usable fuel value (to be used when exiting without saving)
   **/
  public resetTemporaryUsableFuel(): void {
    this.fuelDelta.set(0);
    this._temporaryUsableFuel.set(this.fetchRemainingTotalizerFuel());
  }

  /**
   * Saves the changes made to the usable fuel value (when pressing the W&B button or the Enter key)
   **/
  public saveInitialUsableFuel(): void {
    this.fuelDelta.set(0);
    this.controlPublisher.pub('fuel_adjustment', { amount: this.temporaryUsableFuel, direction: 'set' });
  }

  /**
   * Changes the initial usable fuel value by the given amount
   * @param change the positive or negative amount in gallons with which the initial usable fuel should be changed
   */
  private changeUsableFuelByAmount(change: number): void {
    const newValue = MathUtils.clamp(this.temporaryUsableFuel + change, 0, 92);
    this.fuelDelta.set(this.fuelDelta.get() + (newValue - this.temporaryUsableFuel));
    this._temporaryUsableFuel.set(newValue);
  }

  /**
   * Returns the current SimVar value of the remaining fuel in the totalizer in gallons.
   * This might be different from the actual fuel on board since it can be set by the user.
   * @returns remaining fuel in gallons
   */
  private fetchRemainingTotalizerFuel(): number {
    return MathUtils.round(SimVar.GetSimVarValue('L:WT1000_Fuel_GalRemaining', SimVarValueType.GAL), 1);
  }

  /** @inheritDoc */
  public render(): VNode {
    return (
      <div class='mfd-page' ref={this.viewContainerRef}>
        <div class='sr22t-fuel-page-container'>
          <div class='sr22t-fuel-page-title'>Cirrus SR22 Turbo</div>
          <div class='sr22t-system-page-section sr22t-fuel-page-initial-fuel-display'>
            <div class='sr22t-system-page-section-title initial-fuel-display-title'>Initial Usable Fuel</div>
            <div class='initial-fuel-display-value'>{this._temporaryUsableFuel}</div>
          </div>
          <div class='sr22t-fuel-page-bar-container'>
            <div class='sr22t-fuel-bar-display'>
              <div class='fuel-bar-starting-level' ref={this.startingFuelLevelDisplay}></div>
              <div class='fuel-bar-temporary-level' ref={this.temporaryFuelLevelDisplay}></div>
              <div class='sr22t-fuel-bar-scale'>
                <div class='fuel-bar-scale-box fuel-bar-scale-box-12'></div>
                <div class='fuel-bar-scale-box fuel-bar-scale-box-20'></div>
                <div class='fuel-bar-scale-box fuel-bar-scale-box-20'></div>
                <div class='fuel-bar-scale-box fuel-bar-scale-box-20'></div>
                <div class='fuel-bar-scale-box fuel-bar-scale-box-20 fuel-bar-scale-box-bottom'></div>
                <div class='fuel-bar-scale-label fuel-bar-scale-label-92'>92 GAL</div>
                <div class='fuel-bar-scale-label fuel-bar-scale-label-80'>80 GAL</div>
                <div class='fuel-bar-scale-label fuel-bar-scale-label-60'>60 GAL</div>
                <div class='fuel-bar-scale-label fuel-bar-scale-label-40'>40 GAL</div>
                <div class='fuel-bar-scale-label fuel-bar-scale-label-20'>20 GAL</div>
                <div class='fuel-bar-scale-label fuel-bar-scale-label-0'>0 GAL</div>
              </div>
            </div>
          </div>
          <div class='sr22t-system-page-section sr22t-fuel-page-delta-fuel-display'>
            <div class='sr22t-system-page-section-title delta-fuel-display-title'>Fuel Added</div>
            <div class='delta-fuel-display-value'>{this.fuelDelta}</div>
          </div>
          <div class='sr22t-fuel-page-info'>
            <div>Adjust level with FMS knob</div>
            <div>Inner knob: 1 GAL</div>
            <div>Outer knob: 10 GAL</div>
          </div>
        </div>
      </div>
    );
  }

  /** @inheritDoc */
  public destroy(): void {
    this.subs.forEach(sub => sub.destroy());
  }
}
