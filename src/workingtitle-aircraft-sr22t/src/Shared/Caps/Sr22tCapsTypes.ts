/**
 * Cirrus SR22T CAPS states.
 */
export enum Sr22tCapsState {
  /** The system is idle. */
  Idle = 'Idle',

  /** The system has been activated and is waiting to deploy the parachute. */
  Activated = 'Activated',

  /** The system is in the process of deploying the parachute. */
  Deploying = 'Deploying',

  /** The system has deployed the parachute. */
  Deployed = 'Deployed',
}
