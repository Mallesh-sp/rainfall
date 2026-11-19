import React, { useEffect, useRef } from 'react';

const RainCanvas = ({
  intensity = 20,
  windSpeed = 15,
  cloudCover = 80,
  humidity = 80,
  temp = 28,
  rainProb = 50,
  onThunderTrigger
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Weather condition determination
    const isStormy = intensity > 40 || rainProb >= 80;
    const isRaining = intensity > 0.5 || rainProb >= 35;
    const isClearSunny = !isRaining && cloudCover < 35 && rainProb < 25;
    const isCloudy = !isRaining && cloudCover >= 35;

    // 1. Rain Drops configuration
    const dropCount = isRaining ? Math.min(800, Math.floor(intensity * 12 + (rainProb / 100) * 80 + 30)) : 0;
    const drops = [];
    const splashes = [];

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * (width + 400) - 200,
        y: Math.random() * height,
        length: Math.random() * 25 + 12,
        speed: Math.random() * 14 + 12 + (intensity / 100) * 16,
        opacity: Math.random() * 0.45 + 0.25,
        thickness: Math.random() * 1.8 + (intensity > 40 ? 1.4 : 0.8)
      });
    }

    // 2. Sunny Sunbeam / Dust Mote Particles configuration
    const sunParticles = [];
    if (isClearSunny) {
      for (let i = 0; i < 40; i++) {
        sunParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.5 + 1,
          speedY: Math.random() * 0.4 + 0.1,
          speedX: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI
        });
      }
    }

    // 3. Clouds / Fog drifting layers
    const cloudPuffs = [];
    const puffCount = isCloudy || isRaining ? 12 : 4;
    for (let i = 0; i < puffCount; i++) {
      cloudPuffs.push({
        x: Math.random() * (width + 600) - 300,
        y: Math.random() * (height * 0.55),
        radius: Math.random() * 160 + 120,
        speed: (Math.random() * 0.2 + 0.08) * (1 + windSpeed / 60),
        opacity: (isStormy ? 0.25 : isCloudy ? 0.18 : 0.08) * (cloudCover / 100)
      });
    }

    let flashAlpha = 0;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // --- LAYER 1: SKY BACKGROUND GRADIENT ---
      let skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isStormy) {
        // Dark storm sky with deep navy & electric violet tones
        skyGrad.addColorStop(0, '#040711');
        skyGrad.addColorStop(0.6, '#091024');
        skyGrad.addColorStop(1, '#0e1730');
      } else if (isRaining) {
        // Rain moody slate-blue atmosphere
        skyGrad.addColorStop(0, '#070f1e');
        skyGrad.addColorStop(0.5, '#0c1a33');
        skyGrad.addColorStop(1, '#112242');
      } else if (isClearSunny) {
        // Warm radiant golden blue sunny sky
        skyGrad.addColorStop(0, '#061329');
        skyGrad.addColorStop(0.5, '#0b2347');
        skyGrad.addColorStop(1, '#1b335a');
      } else {
        // Overcast / Cloudy atmosphere
        skyGrad.addColorStop(0, '#080d18');
        skyGrad.addColorStop(0.5, '#0f172a');
        skyGrad.addColorStop(1, '#18243b');
      }

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // --- LAYER 2: SUN GLOW & RAYS (For Clear Sunny Condition) ---
      if (isClearSunny) {
        // Radiant Sun Disc Glow
        const sunX = width * 0.82;
        const sunY = height * 0.18;
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 380);
        sunGlow.addColorStop(0, 'rgba(255, 214, 0, 0.45)');
        sunGlow.addColorStop(0.3, 'rgba(255, 171, 0, 0.2)');
        sunGlow.addColorStop(0.7, 'rgba(255, 145, 0, 0.05)');
        sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 380, 0, Math.PI * 2);
        ctx.fill();

        // Sun beam streaks
        ctx.save();
        ctx.translate(sunX, sunY);
        for (let i = 0; i < 8; i++) {
          const rayAngle = (i * Math.PI) / 4 + Math.sin(time * 0.5 + i) * 0.05;
          ctx.rotate(rayAngle);
          ctx.fillStyle = 'rgba(255, 235, 150, 0.035)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-40, 600);
          ctx.lineTo(40, 600);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Golden floating dust motes
        for (let p of sunParticles) {
          p.pulse += 0.03;
          const curOpacity = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
          ctx.fillStyle = `rgba(255, 220, 100, ${curOpacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          p.y -= p.speedY;
          p.x += p.speedX;
          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }
      }

      // --- LAYER 3: DRIFTING ATMOSPHERIC CLOUDS & FOG ---
      for (let c of cloudPuffs) {
        const cloudGrad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.radius);
        if (isStormy) {
          cloudGrad.addColorStop(0, `rgba(18, 28, 55, ${c.opacity * 1.5})`);
          cloudGrad.addColorStop(0.6, `rgba(12, 19, 38, ${c.opacity * 0.8})`);
          cloudGrad.addColorStop(1, 'rgba(5, 10, 20, 0)');
        } else {
          cloudGrad.addColorStop(0, `rgba(140, 175, 220, ${c.opacity})`);
          cloudGrad.addColorStop(0.6, `rgba(90, 130, 180, ${c.opacity * 0.5})`);
          cloudGrad.addColorStop(1, 'rgba(30, 50, 80, 0)');
        }

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();

        c.x += c.speed;
        if (c.x - c.radius > width) {
          c.x = -c.radius - 50;
          c.y = Math.random() * (height * 0.5);
        }
      }

      // --- LAYER 4: THUNDERSTORM LIGHTNING FLASHES ---
      if (isStormy && Math.random() < 0.004 && flashAlpha <= 0) {
        flashAlpha = Math.random() * 0.45 + 0.3;
        if (onThunderTrigger) onThunderTrigger();
      }

      if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(220, 240, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, width, height);
        flashAlpha -= 0.035;
      }

      // --- LAYER 5: RAINDROPS & SPLASHES (If Raining) ---
      if (isRaining && drops.length > 0) {
        const windAngle = (windSpeed / 100) * 0.85;

        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          ctx.lineWidth = d.thickness;
          ctx.strokeStyle = isStormy
            ? `rgba(160, 235, 255, ${d.opacity})`
            : `rgba(185, 245, 255, ${d.opacity * 0.85})`;

          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + windAngle * d.length, d.y + d.length);
          ctx.stroke();

          d.x += windAngle * d.speed * 0.5;
          d.y += d.speed;

          // Ground splash effect
          if (d.y >= height - 8) {
            if (Math.random() < 0.45 && splashes.length < 90) {
              splashes.push({
                x: d.x,
                y: height - Math.random() * 10,
                radius: 1,
                maxRadius: Math.random() * 7 + 3,
                opacity: 0.85
              });
            }
            d.y = -25;
            d.x = Math.random() * (width + 400) - 200;
          }
        }

        // Render ground splash ripples
        ctx.lineWidth = 1.2;
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.strokeStyle = `rgba(0, 242, 254, ${s.opacity})`;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.radius * 2.2, s.radius * 0.7, 0, 0, Math.PI * 2);
          ctx.stroke();

          s.radius += 0.45;
          s.opacity -= 0.045;

          if (s.opacity <= 0 || s.radius >= s.maxRadius) {
            splashes.splice(i, 1);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [intensity, windSpeed, cloudCover, humidity, temp, rainProb, onThunderTrigger]);

  return <canvas ref={canvasRef} className="background-canvas" />;
};

export default RainCanvas;
