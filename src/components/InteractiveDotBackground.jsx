import React, { useEffect, useRef } from 'react';

const InteractiveDotBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let dots = [];
    
    // Configuration
    const dotSpacing = 25; // Space between dots
    const dotRadius = 1.5; // Size of dots
    const mouseRadius = 60; // Radius of interaction
    const repelStrength = 40; // How far they get pushed
    const springFactor = 0.1; // Speed of return
    
    let mouse = { x: -1000, y: -1000 };
    let isDarkMode = document.documentElement.classList.contains('dark');

    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      isDarkMode = document.documentElement.classList.contains('dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(canvas.width / dotSpacing) + 1;
      const rows = Math.ceil(canvas.height / dotSpacing) + 1;
      
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * dotSpacing;
          const y = j * dotSpacing;
          dots.push({
            baseX: x,
            baseY: y,
            x: x,
            y: y,
          });
        }
      }
    };

    const resize = () => {
      // Ensure canvas matches screen exactly
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    window.addEventListener('resize', resize);
    resize();

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dynamic dot color based on theme
      ctx.fillStyle = isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.15)';
      
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        
        const dx = mouse.x - dot.baseX;
        const dy = mouse.y - dot.baseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let targetX = dot.baseX;
        let targetY = dot.baseY;

        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          const angle = Math.atan2(dy, dx);
          targetX = dot.baseX - Math.cos(angle) * force * repelStrength;
          targetY = dot.baseY - Math.sin(angle) * force * repelStrength;
        }
        
        dot.x += (targetX - dot.x) * springFactor;
        dot.y += (targetY - dot.y) * springFactor;
        
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1]"
      style={{ background: 'transparent' }}
    />
  );
};

export default InteractiveDotBackground;
