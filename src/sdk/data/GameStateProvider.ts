import { Subject } from '../sub/Subject';
import { Subscribable } from '../sub/Subscribable';

/**
 * A utility class which provides the current game state.
 */
export class GameStateProvider {
  private static INSTANCE?: GameStateProvider;

  private readonly gameState = Subject.create<GameState | undefined>(undefined);

  /**
   * Constructor.
   */
  private constructor() {
    window.document.addEventListener('OnVCockpitPanelAttributesChanged', this.onAttributesChanged.bind(this));
    this.onAttributesChanged();
  }

  /**
   * Responds to changes in document attributes.
   */
  private onAttributesChanged(): void {
    if (window.parent?.document.body.hasAttribute('gamestate')) {
      const attribute = window.parent.document.body.getAttribute('gamestate');
      if (attribute !== null) {
        const state = (GameState as any)[attribute];

        // The game state is set briefly to ingame after loading is finished before changing to briefing. In order to
        // not notify subscribers of this erroneous ingame state, we will debounce any state changes into ingame by two
        // frames.
        if (state === GameState.ingame && this.gameState.get() !== GameState.ingame) {
          setTimeout(() => {
            setTimeout(() => {
              const newAttribute = window.parent.document.body.getAttribute('gamestate');
              if (newAttribute !== null) {
                this.gameState.set((GameState as any)[newAttribute]);
              }
            });
          });
        } else {
          this.gameState.set(state);
        }

        return;
      }
    }

    this.gameState.set(undefined);
  }

  /**
   * Gets a subscribable which provides the current game state.
   * @returns A subscribable which provides the current game state.
   */
  public static get(): Subscribable<GameState | undefined> {
    return (GameStateProvider.INSTANCE ??= new GameStateProvider()).gameState;
  }
}