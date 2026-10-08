import { useEffect, useRef } from 'react';

/**
 * Dynamic Flank Smoke & Wispy Mist System
 * - Matches the pre-rendered 3D cinematic scene smoke:
 *   Emanates along the LEFT and RIGHT flanks and ground corners.
 * - Center corridor (figure, castle, text) remains pristine and clear!
 * - Ambient gentle curling wisps when idle.
 * - Dynamically rushes outward/backward along the flanks when scrolling forward,
 *   giving a powerful slipstream sensation of moving through the citadel gates.
 */
export default function SmokeCanvas({ scrollVelocityRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Wispy smoke particle definition for Left and Right flanks
    const PARTICLE_COUNT = 44; // 22 on left, 22 on right
    const particles = [];

    const createParticle = (side, initialY = null) => {
      const isLeft = side === 'left';
      // Flank bounds: left 0 -> 28%, right 72% -> 100%
      const x = isLeft
        ? Math.random() * (width * 0.28)
        : width * 0.72 + Math.random() * (width * 0.28);
      
      const y = initialY !== null ? initialY : height * 0.35 + Math.random() * (height * 0.65);

      return {
        side,
        x,
        y,
        baseX: x,
        radius: 100 + Math.random() * 160,
        vy: -(0.4 + Math.random() * 0.6), // Rises upwards
        vx: (isLeft ? -1 : 1) * (0.1 + Math.random() * 0.25), // Drifts gently outward
        curlFreq: 0.015 + Math.random() * 0.02,
        curlAmp: 25 + Math.random() * 35,
        time: Math.random() * 100,
        alpha: 0.06 + Math.random() * 0.12,
        maxAlpha: 0.12 + Math.random() * 0.10,
        colorTone: Math.random() > 0.3 ? 'emerald' : 'darkMint',
      };
    };

    // Initialize particles equally on left and right
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const side = i % 2 === 0 ? 'left' : 'right';
      particles.push(createParticle(side, Math.random() * height));
    }

    let smoothedVelocity = 0;

    const render = () => {
      const rawVelocity = scrollVelocityRef ? scrollVelocityRef.current || 0 : 0;
      smoothedVelocity += (rawVelocity - smoothedVelocity) * 0.14;

      ctx.clearRect(0, 0, width, height);

      const absVel = Math.abs(smoothedVelocity);
      const velFactor = Math.min(absVel * 0.05, 12);
      const speedMultiplier = 1 + velFactor * 0.8;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.time += 0.03 * speedMultiplier;

        // Upward flow + serpentine curl
        p.y += p.vy * speedMultiplier;
        const wave = Math.sin(p.time * p.curlFreq * 50) * p.curlAmp;

        // Keep left smoke on left, right smoke on right
        if (p.side === 'left') {
          p.x = p.baseX + wave - (smoothedVelocity * 0.08);
          // Keep away from center corridor
          if (p.x > width * 0.30) p.x = width * 0.30;
          if (p.x < -p.radius * 0.5) p.x = width * 0.05;
        } else {
          p.x = p.baseX + wave + (smoothedVelocity * 0.08);
          // Keep away from center corridor
          if (p.x < width * 0.70) p.x = width * 0.70;
          if (p.x > width + p.radius * 0.5) p.x = width * 0.95;
        }

        // Dissolve as it rises or when it reaches top/bottom
        const lifeProgress = p.y / height; // 1 at bottom, 0 at top
        let currentAlpha = p.alpha;
        if (lifeProgress < 0.25) {
          currentAlpha *= (lifeProgress / 0.25); // Fade out near top
        } else if (lifeProgress > 0.85) {
          currentAlpha *= ((1 - lifeProgress) / 0.15); // Fade in from bottom
        }

        // Slight glow boost during scroll rush
        currentAlpha = Math.min(currentAlpha * (1 + velFactor * 0.25), 0.32);

        // Respawn when particle floats off top
        if (p.y < -p.radius || currentAlpha <= 0.005) {
          particles[i] = createParticle(p.side, height + p.radius * 0.5);
          continue;
        }

        // Draw soft volumetric wispy smoke puff
        const currentRadius = p.radius * (1 + (1 - lifeProgress) * 0.5) * (1 + velFactor * 0.1);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius);

        if (p.colorTone === 'emerald') {
          grad.addColorStop(0, `rgba(0, 245, 155, ${currentAlpha * 0.9})`);
          grad.addColorStop(0.35, `rgba(16, 185, 129, ${currentAlpha * 0.5})`);
          grad.addColorStop(0.7, `rgba(4, 45, 28, ${currentAlpha * 0.2})`);
          grad.addColorStop(1, 'rgba(4, 15, 10, 0)');
        } else {
          grad.addColorStop(0, `rgba(52, 211, 153, ${currentAlpha * 0.75})`);
          grad.addColorStop(0.4, `rgba(5, 150, 105, ${currentAlpha * 0.4})`);
          grad.addColorStop(0.75, `rgba(6, 35, 25, ${currentAlpha * 0.15})`);
          grad.addColorStop(1, 'rgba(4, 15, 10, 0)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [scrollVelocityRef]);

  return (
    <canvas 
      ref={canvasRef} 
      className="hero-smoke-canvas"
      aria-hidden="true"
    />
  );
}
