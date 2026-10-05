/**
 * Frame Loader and Cache System for SEUSL HASHCORE '26
 * Manages 240 cinematic frames with:
 * - Intelligent window preloading
 * - Immediate critical first-frame rendering
 * - Non-blocking background progressive loading
 * - Closest-frame fallback (zero flicker / no blank screens)
 * - Hardware decode acceleration where supported
 */

// Dynamically import all 240 frame asset URLs via Vite (optimized WebP format)
const frameModules = import.meta.glob('/src/frame/*.webp', {
  eager: true,
  query: '?url',
  import: 'default'
});

export const TOTAL_FRAMES = 240;

// Resolve ordered array of frame URLs (0 to 239)
export const FRAME_URLS = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const padded = String(i + 1).padStart(5, '0');
  const key = `/src/frame/${padded}.webp`;
  return frameModules[key] || `/src/frame/${padded}.webp`;
});

class FrameLoader {
  constructor() {
    this.cache = new Map(); // index -> HTMLImageElement
    this.loadingPromises = new Map(); // index -> Promise<HTMLImageElement>
    this.listeners = new Set();
    this.backgroundQueue = [];
    this.isBackgroundLoading = false;
    this.lastDirection = 1;
    this.lastCenter = 0;
    this.maxConcurrentBg = 2; // Keep main thread & network queue free
    this.activeBgRequests = 0;

    // Build the initial background loading sequence
    this.initQueue();
  }

  initQueue() {
    // Populate indices: 0 to TOTAL_FRAMES - 1
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      this.backgroundQueue.push(i);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(index, image) {
    for (const listener of this.listeners) {
      try {
        listener(index, image);
      } catch (err) {
        console.error('FrameLoader listener error:', err);
      }
    }
  }

  isLoaded(index) {
    return this.cache.has(index);
  }

  getLoadedFrame(index) {
    return this.cache.get(index) || null;
  }

  /**
   * Returns the exact frame if loaded, or finds the closest loaded frame.
   * Guarantees canvas always has something smooth to display.
   */
  getClosestFrame(targetIndex) {
    const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(targetIndex)));
    if (this.cache.has(clamped)) {
      return { frame: this.cache.get(clamped), index: clamped, isExact: true };
    }

    // Search outwards from clamped index
    let step = 1;
    while (clamped - step >= 0 || clamped + step < TOTAL_FRAMES) {
      // Prioritize looking back if we're moving forward, or vice versa
      const lookBack = clamped - step;
      const lookAhead = clamped + step;

      if (this.lastDirection >= 0) {
        if (lookBack >= 0 && this.cache.has(lookBack)) {
          return { frame: this.cache.get(lookBack), index: lookBack, isExact: false };
        }
        if (lookAhead < TOTAL_FRAMES && this.cache.has(lookAhead)) {
          return { frame: this.cache.get(lookAhead), index: lookAhead, isExact: false };
        }
      } else {
        if (lookAhead < TOTAL_FRAMES && this.cache.has(lookAhead)) {
          return { frame: this.cache.get(lookAhead), index: lookAhead, isExact: false };
        }
        if (lookBack >= 0 && this.cache.has(lookBack)) {
          return { frame: this.cache.get(lookBack), index: lookBack, isExact: false };
        }
      }
      step++;
    }

    return { frame: null, index: -1, isExact: false };
  }

  /**
   * Loads a single frame with caching and deduplication.
   */
  loadFrame(index, priority = false) {
    const idx = Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
    if (this.cache.has(idx)) {
      return Promise.resolve(this.cache.get(idx));
    }
    if (this.loadingPromises.has(idx)) {
      return this.loadingPromises.get(idx);
    }

    const promise = new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const finish = () => {
        this.cache.set(idx, img);
        this.loadingPromises.delete(idx);
        this.notify(idx, img);
        resolve(img);
      };

      img.onload = () => {
        // Attempt GPU pre-decode if supported
        if (typeof img.decode === 'function') {
          img.decode().then(finish).catch(finish);
        } else {
          finish();
        }
      };

      img.onerror = () => {
        console.warn(`[FrameLoader] Failed to load frame ${idx} from ${FRAME_URLS[idx]}`);
        this.loadingPromises.delete(idx);
        resolve(null);
      };

      img.src = FRAME_URLS[idx];
    });

    this.loadingPromises.set(idx, promise);
    return promise;
  }

  /**
   * Preloads a dynamic window around the user's current scroll frame.
   * @param {number} centerIndex Current target frame
   * @param {number} direction 1 for scrolling down, -1 for scrolling up
   * @param {number} windowSize Number of frames ahead to preload
   */
  preloadWindow(centerIndex, direction = 1, windowSize = 25) {
    const center = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(centerIndex)));
    this.lastDirection = direction >= 0 ? 1 : -1;
    this.lastCenter = center;

    const framesToPreload = [];

    // 1. Current frame first
    if (!this.cache.has(center)) {
      framesToPreload.push(center);
    }

    // 2. Look ahead in scroll direction
    for (let i = 1; i <= windowSize; i++) {
      const ahead = center + (direction >= 0 ? i : -i);
      if (ahead >= 0 && ahead < TOTAL_FRAMES && !this.cache.has(ahead)) {
        framesToPreload.push(ahead);
      }
    }

    // 3. Look slightly behind in case user reverses scroll
    for (let i = 1; i <= 6; i++) {
      const behind = center + (direction >= 0 ? -i : i);
      if (behind >= 0 && behind < TOTAL_FRAMES && !this.cache.has(behind)) {
        framesToPreload.push(behind);
      }
    }

    // Dispatch priority loads
    framesToPreload.forEach((idx) => {
      this.loadFrame(idx, true);
    });

    // Resume background loading if queue has idle capacity
    this.processBackgroundQueue();
  }

  /**
   * Starts background progressive loading using requestIdleCallback / setTimeout
   */
  startBackgroundLoading() {
    if (this.isBackgroundLoading) return;
    this.isBackgroundLoading = true;
    this.processBackgroundQueue();
  }

  processBackgroundQueue() {
    if (this.activeBgRequests >= this.maxConcurrentBg) return;

    // Pick next un-cached frame from the background sequence
    while (this.backgroundQueue.length > 0 && this.cache.has(this.backgroundQueue[0])) {
      this.backgroundQueue.shift();
    }

    if (this.backgroundQueue.length === 0) {
      this.isBackgroundLoading = false;
      return;
    }

    const nextIndex = this.backgroundQueue.shift();
    this.activeBgRequests++;

    const scheduleNext = () => {
      this.activeBgRequests--;
      if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => this.processBackgroundQueue(), { timeout: 150 });
      } else {
        setTimeout(() => this.processBackgroundQueue(), 30);
      }
    };

    this.loadFrame(nextIndex, false)
      .then(scheduleNext)
      .catch(scheduleNext);

    // If we have capacity for a 2nd concurrent background item, spawn it
    if (this.activeBgRequests < this.maxConcurrentBg && this.backgroundQueue.length > 0) {
      this.processBackgroundQueue();
    }
  }

  /**
   * Critical Initial Load:
   * 1. Loads frame 0 immediately (first visible visual)
   * 2. Preloads frames 1..10 for immediate slow scroll
   * 3. Preloads frame 239 (final state) for rock-solid bottom destination
   * 4. Kicks off progressive background queue
   */
  async loadCriticalFrames(onFirstFrameReady) {
    // 1. First frame (top priority)
    const first = await this.loadFrame(0, true);
    if (onFirstFrameReady && first) {
      onFirstFrameReady(first);
    }

    // 2. Preload frames 1 through 10
    const initialBatch = [];
    for (let i = 1; i <= 10; i++) {
      initialBatch.push(this.loadFrame(i, true));
    }

    // 3. Preload final frame (Frame 240, index 239) so it is rock-solid
    initialBatch.push(this.loadFrame(TOTAL_FRAMES - 1, false));

    await Promise.allSettled(initialBatch);

    // 4. Begin smooth background progressive loading
    this.startBackgroundLoading();
  }
}

// Export singleton instance
export const frameLoader = new FrameLoader();
