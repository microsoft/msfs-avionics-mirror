
import { MappedSubject, MappedSubscribableInputs } from '../../../sub/MappedSubject';
import { MappedSubscribable, MutableSubscribable, Subscribable } from '../../../sub/Subscribable';
import { Subscription } from '../../../sub/Subscription';
import { MapSystemContext } from '../MapSystemContext';
import { MapSystemController } from '../MapSystemController';

/**
 * A binding from a source to a target.
 */
export type MapSimpleBinding<T> = {
  /** The source of the binding. */
  source: Subscribable<T>;

  /** The target of the binding. */
  target: MutableSubscribable<any, T>;
}

/**
 * A binding from a transformed source to a target.
 */
export type MapTransformedBinding<S, T> = {
  /** The source of the binding. */
  source: Subscribable<S>;

  /** The target of the binding. */
  target: MutableSubscribable<any, T>;

  /** A function which transforms source values before they are applied to the target. */
  map: (source: S) => T;
}

/**
 * A binding from multiple sources to a target.
 */
export type MapMultiTransformedBinding<I extends readonly any[], T> = {
  /** The sources of the binding. */
  sources: MappedSubscribableInputs<I>;

  /** The target of the binding. */
  target: MutableSubscribable<any, T>;

  /** A function which transforms source values, as a tuple, before they are applied to the target. */
  map: (sources: Readonly<I>) => T;
}

/**
 * A binding which can be maintained by {@link MapBindingsController}.
 */
export type MapBinding = MapSimpleBinding<any> | MapTransformedBinding<any, any> | MapMultiTransformedBinding<any, any>;

/**
 * A controller which maintains an arbitrary number of bindings.
 */
export class MapBindingsController extends MapSystemController {
  private readonly maps: MappedSubscribable<any>[] = [];
  private readonly pipes: Subscription[] = [];

  /**
   * Constructor.
   * @param context This controller's map context.
   * @param bindings This controller's bindings.
   * @param onDestroy A function to execute when the controller is destroyed.
   */
  constructor(
    context: MapSystemContext<any, any, any, any>,
    private readonly bindings: Iterable<MapBinding>,
    private readonly onDestroy?: () => void
  ) {
    super(context);
  }

  /** @inheritdoc */
  public onAfterMapRender(): void {
    for (const binding of this.bindings) {
      if ('map' in binding) {
        if ('sources' in binding) {
          const map = MappedSubject.create(...binding.sources);
          this.maps.push(map);
          this.pipes.push(map.pipe(binding.target, binding.map));
        } else {
          this.pipes.push(binding.source.pipe(binding.target, binding.map));
        }
      } else {
        this.pipes.push(binding.source.pipe(binding.target));
      }
    }
  }

  /** @inheritdoc */
  public onMapDestroyed(): void {
    this.destroy();
  }

  /** @inheritdoc */
  public onWake(): void {
    this.maps.forEach(map => { map.resume(); });
    this.pipes.forEach(pipe => { pipe.resume(true); });
  }

  /** @inheritdoc */
  public onSleep(): void {
    this.maps.forEach(map => { map.pause(); });
    this.pipes.forEach(pipe => { pipe.pause(); });
  }

  /** @inheritdoc */
  public destroy(): void {
    this.onDestroy && this.onDestroy();

    this.maps.forEach(map => { map.destroy(); });
    this.pipes.forEach(pipe => { pipe.destroy(); });

    super.destroy();
  }
}