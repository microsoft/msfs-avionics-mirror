import { EventBus, Publisher } from '../../data/EventBus';
import { EventSubscriber } from '../../data/EventSubscriber';
import { GameStateProvider } from '../../data/GameStateProvider';
import { DebounceTimer } from '../time/DebounceTimer';
import { Wait } from '../time/Wait';

/**
 * A sound packet that can be played by {@link SoundServer}.
 */
export type SoundPacket = {
  /** The key of this packet. Only one packet with any given key can be playing at a time. */
  key: string;

  /**
   * The sequence of sound atoms to play for this packet, as either a single ID or an array of IDs. Each atom is a
   * single sound file.
   */
  sequence: string | readonly string[];

  /** Whether this packet should loop from the beginning when its sequence is finished playing. */
  continuous: boolean;

  /**
   * The amount of time, in milliseconds, after this packet starts playing at which to forcibly stop this packet. This
   * value is required in case any sound atoms could not be played or sim does not notify the sound server that a sound
   * atom has stopped playing. It is recommended to set this value to be at least several seconds longer than the
   * expected length of this packet's entire sequence. If this packet is continuous, the timeout is reset with each
   * loop. Defaults to 10000 milliseconds.
   */
  timeout?: number;
};

/**
 * Events published by {@link SoundServer}.
 */
export interface SoundServerEvents {
  /** Whether the sound server is initialized. The sound server will only respond to commands when it has been initialized. */
  sound_server_initialized: boolean;

  /** A sound packet has started playing. The event data is the key of the packet. */
  sound_server_packet_started: string;

  /** A sound packet has finished playing. The event data is the key of the packet. */
  sound_server_packet_ended: string;
}

/**
 * Events used to send commands to a {@link SoundServer}.
 */
export interface SoundServerControlEvents {
  /**
   * Requests a sound packet to be played if there is no existing packet with the same key currently being played.
   */
  sound_server_play: Readonly<SoundPacket>;

  /**
   * Requests a sound packet to be queued. If there is no existing packet with the same key currently being played, the
   * packet will begin playing immediately. Otherwise, the new packet will begin playing after the existing packet and
   * any other queued packets with the same key are finished playing.
   */
  sound_server_queue: Readonly<SoundPacket>;

  /**
   * Requests a sound packet to be played at the earliest opportunity. If there is no existing packet with the same key
   * currently being played, the packet will begin playing immediately. Otherwise, the existing packet will be stopped
   * the next time one of its sound atoms finishes playing, any queued packets with the same key will be discarded, and
   * the new packet will begin playing at that time.
   */
  sound_server_interrupt: Readonly<SoundPacket>;

  /**
   * Requests that a continuous sound packet stop playing instead of looping the next time its sequence finishes. The
   * event data should be the key of the packet to stop. This also prevents any queued packets with the same key from
   * playing.
   */
  sound_server_stop: string;

  /**
   * Requests that a sound packet stop playing at the earliest opportunity (the next time one of its sound atoms
   * finishes playing). The event data should be the key of the packet to kill. This also prevents any queued packets
   * with the same key from playing.
   */
  sound_server_kill: string;

  /**
   * Requests that all currently playing continuous sound packets stop playing instead of looping the next time their
   * sequences finish. This also clears all queued packets.
   */
  sound_server_stop_all: void;

  /**
   * Requests that all currently playing sound packets stop playing at the earliest opportunity (the next time one of
   * their sound atoms finishes playing). This also clears all queued packets.
   */
  sound_server_kill_all: void;

  /**
   * Requests a single sound atom to be played non-continuously. The event data should be the ID of the sound atom to
   * play. Publishing this command is an alias for publishing a `sound_server_play` command with the packet:
   * `{ key: id, sequence: id, continuous: false }`.
   */
  sound_server_play_sound: string;

  /**
   * Requests a single sound atom to be played continuously. The event data should be the ID of the sound atom to play.
   * Publishing this command is an alias for publishing a `sound_server_play` command with the packet:
   * `{ key: id, sequence: id, continuous: true }`.
   */
  sound_server_start_sound: string;

  /**
   * Requests that a continuous sound packet stop playing instead of looping the next time its sequence finishes. The
   * event data should be the key of the packet to stop. This command is an alias for `sound_server_stop`.
   */
  sound_server_stop_sound: string;
}

/**
 * An entry describing a sound packet to be played by SoundServer.
 */
type SoundPacketEntry = {
  /** The key of the packet. */
  key: string;

  /** The sequence of sound atoms to play, as an array of `Name_Z` objects. */
  sequence: Name_Z[];

  /** Whether the packet should loop from the beginning when its sequence is finished playing. */
  continuous: boolean;

  /** The index of the currently playing sound atom. */
  currentIndexPlaying: number;

  /** The amount of time, in milliseconds, after the packet starts playing to foricbly stop the packet from playing. */
  timeout: number;

  /**
   * Whether the packet is alive. Packets that are not alive will be stopped the next time a sound atom is finished
   * playing.
   */
  alive: boolean;

  /** The timeout timer. */
  timer: DebounceTimer;

  /** The callback to forcibly end the packet if it times out. */
  timeoutCallback: () => void;
};

/**
 * A server which plays and manages sounds. Commands to start or stop playing sounds can be sent to the server via the
 * event bus.
 * 
 * The server plays sounds as _packets_. Each sound packet consists of a string key and zero or more _sound atoms_ that
 * are played in sequence. Each sound atom represents a single playable sound file from within the sim. Sound packets
 * can be played as a one-shot or be looped continuously. Only one packet with a given key can be played at a time.
 * Queueing of packets with the same key is supported.
 */
export class SoundServer {
  public static readonly DEFAULT_TIMEOUT = 10000;

  private readonly controlSub = this.bus.getSubscriber<SoundServerControlEvents>();
  private readonly publisher = this.bus.getPublisher<SoundServerEvents>();

  private readonly active = new Map<string, SoundPacketEntry>();

  private readonly queued = new Map<string, SoundPacketEntry[]>();

  /**
   * Creates a new instance of SoundServer.
   * @param bus The event bus.
   */
  public constructor(private readonly bus: EventBus) {
    this.publisher.pub('sound_server_initialized', false, true, true);
    this.init();
  }

  /**
   * Waits until the sim has entered the in-game state and initializes this server. Once initialized, this server will
   * respond to commands over the event bus.
   */
  private async init(): Promise<void> {
    // Wait for game to reach "ingame" state. THEN wait a short duration and wait again for game to reach "ingame"
    // state because during load the game will go from loading -> ingame -> briefing.
    await Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.ingame, true);
    await Wait.awaitDelay(500);
    await Wait.awaitSubscribable(GameStateProvider.get(), state => state === GameState.ingame, true);

    this.controlSub.on('sound_server_play').handle(this.playPacket.bind(this));
    this.controlSub.on('sound_server_queue').handle(this.queuePacket.bind(this));
    this.controlSub.on('sound_server_interrupt').handle(this.interruptPacket.bind(this));
    this.controlSub.on('sound_server_stop').handle(this.stopPacket.bind(this));
    this.controlSub.on('sound_server_kill').handle(this.killPacket.bind(this));
    this.controlSub.on('sound_server_stop_all').handle(this.stopAllPackets.bind(this));
    this.controlSub.on('sound_server_kill_all').handle(this.killAllPackets.bind(this));

    this.controlSub.on('sound_server_play_sound').handle(this.playSound.bind(this));
    this.controlSub.on('sound_server_start_sound').handle(this.startSound.bind(this));
    this.controlSub.on('sound_server_stop_sound').handle(this.stopPacket.bind(this));

    this.publisher.pub('sound_server_initialized', true, true, true);
  }

  /**
   * A callback method that responds to when the sim notifies the JS instrument that a sound file has stopped playing.
   * This method needs to be manually called for `SoundServer` to function properly.
   * @param id The ID of the sound file that stopped playing.
   */
  public onSoundEnd(id: Name_Z): void {
    // Create a copy of the active entries because the map can be mutated while we are iterating.
    const activeEntries = Array.from(this.active.values());
    for (let i = 0; i < activeEntries.length; i++) {
      const entry = activeEntries[i];
      const entrySoundPlaying = entry.sequence[entry.currentIndexPlaying];

      if (!entrySoundPlaying) {
        this.cleanupPacket(entry);
      } else if (Name_Z.compare(entrySoundPlaying, id)) {
        this.advancePacket(entry);
      }
    }
  }

  /**
   * Plays a sound packet if and only if there is no currently playing packet with the same key.
   * @param packet The packet to play.
   */
  private playPacket(packet: Readonly<SoundPacket>): void {
    if (!this.active.get(packet.key)) {
      this.queuePacket(packet);
    }
  }

  /**
   * Plays a sound packet at the earliest opportunity. If there is no currently playing packet with the same key, it
   * will begin playing immediately. Otherwise, all queued packets with the same key are cleared, the existing packet
   * will be stopped the next time one of its sound atoms finishes playing, and the new packet will begin playing at
   * that time.
   * @param packet The packet to play.
   */
  private interruptPacket(packet: Readonly<SoundPacket>): void {
    const active = this.active.get(packet.key);
    if (active) {
      active.alive = false;
    }

    this.queued.delete(packet.key);
    this.queuePacket(packet);
  }

  /**
   * Queues a sound packet. The queued packet will immediately start playing if there is no currently playing packet
   * with the same key. Otherwise it will be queued to play once all currently playing and previously queued packets
   * with the same key have finished playing.
   * @param packet The packet to queue.
   */
  private queuePacket(packet: Readonly<SoundPacket>): void {
    const sequence = SoundServer.getSoundSequence(packet);

    const entry: SoundPacketEntry = {
      key: packet.key,
      sequence,
      continuous: packet.continuous,
      currentIndexPlaying: 0,
      timeout: packet.timeout ?? SoundServer.DEFAULT_TIMEOUT,
      alive: true,
      timer: new DebounceTimer(),
      timeoutCallback: () => { this.cleanupPacket(entry); }
    };

    if (this.active.get(packet.key)) {
      let queue = this.queued.get(entry.key);
      if (!queue) {
        this.queued.set(entry.key, queue = []);
      }
      queue.push(entry);
    } else {
      this.startPacket(entry);
    }
  }

  /**
   * Stops a continuous packet from looping the next time its sequence finishes and clears any packets queued behind
   * it.
   * @param key The key of the packet to stop.
   */
  private stopPacket(key: string): void {
    this.queued.delete(key);

    const active = this.active.get(key);
    if (active) {
      active.continuous = false;
    }
  }

  /**
   * Stops a packet from playing the next time one of its sound atoms finishes playing and clears any packets queued
   * behind it.
   * @param key The key of the packet to kill.
   */
  private killPacket(key: string): void {
    this.queued.delete(key);

    const active = this.active.get(key);
    if (active) {
      active.alive = false;
    }
  }

  /**
   * Stops all currently playing continuous packets from looping the next time their sequences finish and clears all
   * queued packets.
   */
  private stopAllPackets(): void {
    this.queued.clear();

    for (const entry of this.active.values()) {
      entry.continuous = false;
    }
  }

  /**
   * Stops all packets from playing the next time one of their sound atoms finishes playing and clears all queued
   * packets.
   */
  private killAllPackets(): void {
    this.queued.clear();

    for (const entry of this.active.values()) {
      entry.alive = false;
    }
  }

  /**
   * Plays a non-continuous sound packet consisting of a single sound atom and whose key matches the ID of the sound
   * atom.
   * @param id The ID of the sound atom to play.
   */
  private playSound(id: string): void {
    this.playPacket({ key: id, sequence: id, continuous: false });
  }

  /**
   * Plays a continuous sound packet consisting of a single sound atom and whose key matches the ID of the sound atom.
   * @param id The ID of the sound atom to play.
   */
  private startSound(id: string): void {
    this.playPacket({ key: id, sequence: id, continuous: true });
  }

  /**
   * Starts playing a packet from the beginning of its sequence.
   * @param entry The entry of the packet to start playing.
   */
  private startPacket(entry: SoundPacketEntry): void {
    this.active.set(entry.key, entry);

    this.publisher.pub('sound_server_packet_started', entry.key, true, false);

    if (entry.sequence.length === 0) {
      this.cleanupPacket(entry);
    } else {
      Coherent.call('PLAY_INSTRUMENT_SOUND', entry.sequence[0].originalStr);
      entry.currentIndexPlaying = 0;
      entry.timer.schedule(entry.timeoutCallback, entry.timeout);
    }
  }

  /**
   * Attempts to advance a packet to the next sound atom in its sequence. If the end of the sequence is reached, the
   * packet will loop to the beginning if it is continuous. Otherwise it will finish playing.
   * @param entry The entry of the packet to advance.
   */
  private advancePacket(entry: SoundPacketEntry): void {
    if (!entry.alive) {
      this.cleanupPacket(entry);
      return;
    }

    let nextSoundToPlayIndex = entry.currentIndexPlaying + 1;

    if (nextSoundToPlayIndex >= entry.sequence.length) {
      // We have reached the end of the sequence. If the packet is continuous, loop to the beginning. Otherwise, end the packet.
      if (entry.continuous) {
        nextSoundToPlayIndex = 0;
        entry.timer.schedule(entry.timeoutCallback, entry.timeout);
      } else {
        this.cleanupPacket(entry);
        return;
      }
    }

    const soundToPlay = entry.sequence[nextSoundToPlayIndex];
    Coherent.call('PLAY_INSTRUMENT_SOUND', soundToPlay.originalStr);
    entry.currentIndexPlaying = nextSoundToPlayIndex;
  }

  /**
   * Finishes playing a packet and automatically starts playing the packet queued behind the finished packet, if one
   * exists.
   * @param entry The entry of the packet to finish.
   */
  private cleanupPacket(entry: SoundPacketEntry): void {
    entry.alive = false;
    entry.timer.clear();

    const deleted = this.active.delete(entry.key);
    if (!deleted) {
      return;
    }

    this.publisher.pub('sound_server_packet_ended', entry.key, true, false);

    // Dequeue the next packet, if any.
    const queue = this.queued.get(entry.key);
    if (queue) {
      const next = queue.shift();
      if (queue.length === 0) {
        this.queued.delete(entry.key);
      }
      if (next) {
        this.startPacket(next);
      }
    }
  }

  /**
   * Gets a sound atom sequence as an array of `Name_Z` objects from a sound packet.
   * @param packet The packet defining the sound atom sequence.
   * @returns The sound atom sequence defined by a packet, as an array of `Name_Z` objects.
   */
  private static getSoundSequence(packet: Readonly<SoundPacket>): Name_Z[] {
    const sequence: Name_Z[] = [];

    if (typeof packet.sequence === 'string') {
      if (packet.sequence !== '') {
        sequence.push(new Name_Z(packet.sequence));
      }
    } else {
      for (let i = 0; i < packet.sequence.length; i++) {
        if (packet.sequence[i] !== '') {
          sequence.push(new Name_Z(packet.sequence[i]));
        }
      }
    }

    return sequence;
  }
}

/**
 * A controller which provides a convenient interface with which to send commands to {@link SoundServer}.
 */
export class SoundServerController {
  private readonly publisher: Publisher<SoundServerControlEvents>;
  private readonly subscriber: EventSubscriber<SoundServerEvents>;

  /**
   * Creates a new instance of SoundServerController.
   * @param bus The event bus.
   */
  public constructor(bus: EventBus) {
    this.publisher = bus.getPublisher<SoundServerControlEvents>();
    this.subscriber = bus.getSubscriber<SoundServerEvents>();
  }

  /**
   * Waits for the sound server to finish initialization.
   * @returns A Promise which fulfills with a value of `true` when the sound server finishes initialization.
   */
  public awaitInitialized(): Promise<boolean> {
    return Wait.awaitConsumer(this.subscriber.on('sound_server_initialized'), init => init, true);
  }

  /**
   * Requests a sound packet to be played if there is no existing packet with the same key currently being played.
   * @param packet The sound packet to play.
   */
  public play(packet: Readonly<SoundPacket>): void {
    this.publisher.pub('sound_server_play', packet, true, false);
  }

  /**
   * Requests a sound packet to be queued. If there is no existing packet with the same key currently being played, the
   * packet will begin playing immediately. Otherwise, the new packet will begin playing after the existing packet and
   * any other queued packets with the same key are finished playing.
   * @param packet The sound packet to queue.
   */
  public queue(packet: Readonly<SoundPacket>): void {
    this.publisher.pub('sound_server_queue', packet, true, false);
  }

  /**
   * Requests a sound packet to be played at the earliest opportunity. If there is no existing packet with the same key
   * currently being played, the packet will begin playing immediately. Otherwise, the existing packet will be stopped
   * the next time one of its sound atoms finishes playing, any queued packets with the same key will be discarded, and
   * the new packet will begin playing at that time.
   * @param packet The sound packet to play.
   */
  public interrupt(packet: Readonly<SoundPacket>): void {
    this.publisher.pub('sound_server_interrupt', packet, true, false);
  }

  /**
   * Requests that a continuous sound packet stop playing instead of looping the next time its sequence finishes. This
   * also prevents any queued packets with the same key from
   * playing.
   * @param key The key of the sound packet to stop.
   */
  public stop(key: string): void {
    this.publisher.pub('sound_server_stop', key, true, false);
  }

  /**
   * Requests that a sound packet stop playing at the earliest opportunity (the next time one of its sound atoms
   * finishes playing). This also prevents any queued packets with the same key from playing.
   * @param key The key of the sound packet to kill.
   */
  public kill(key: string): void {
    this.publisher.pub('sound_server_kill', key, true, false);
  }

  /**
   * Requests that all currently playing continuous sound packets stop playing instead of looping the next time their
   * sequences finish. This also clears all queued packets.
   */
  public stopAll(): void {
    this.publisher.pub('sound_server_stop_all', undefined, true, false);
  }

  /**
   * Requests that all currently playing sound packets stop playing at the earliest opportunity (the next time one of
   * their sound atoms finishes playing). This also clears all queued packets.
   */
  public killAll(): void {
    this.publisher.pub('sound_server_kill_all', undefined, true, false);
  }

  /**
   * Requests a single sound atom to be played non-continuously. Calling this method is an alias for calling
   * `play({ key: id, sequence: id, continuous: false })`.
   * @param id The ID of the sound atom to play.
   */
  public playSound(id: string): void {
    this.publisher.pub('sound_server_play_sound', id, true, false);
  }

  /**
   * Requests a single sound atom to be played continuously. Calling this method is an alias for calling
   * `play({ key: id, sequence: id, continuous: true })`.
   * @param id The ID of the sound atom to play.
   */
  public startSound(id: string): void {
    this.publisher.pub('sound_server_start_sound', id, true, false);
  }
}