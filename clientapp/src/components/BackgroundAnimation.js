import React, { useEffect } from 'react';
import '../styles/BackgroundAnimation.css';

const BackgroundAnimation = () => {
  useEffect(() => {
    const svg = document.getElementById('background');
    const starsGroup = document.getElementById('stars');
    const linesGroup = document.getElementById('lines');
    const numStars = 700;
    const maxLines = 100;
    const stars = [];
    let lines = [];
    const connectionRadius = 100;

    const createStar = (x, y) => {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', x);
      star.setAttribute('cy', y);
      star.setAttribute('r', 1);
      star.classList.add('star');
      starsGroup.appendChild(star);
      return { x, y, element: star };
    };

    const createLine = (x1, y1, x2, y2) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.classList.add('line-glow');
      linesGroup.appendChild(line);
      return line;
    };

    const updateLines = (mouseX, mouseY) => {
      clearPulsate();
      let nearbyStars = stars.filter(star => {
        const starX = parseFloat(star.element.getAttribute('cx'));
        const starY = parseFloat(star.element.getAttribute('cy'));
        const distance = Math.sqrt((mouseX - starX) ** 2 + (mouseY - starY) ** 2);
        return distance < connectionRadius;
      });

      nearbyStars.forEach(star => star.element.classList.add('pulsate'));
      nearbyStars = nearbyStars.sort(() => 0.5 - Math.random()).slice(0, maxLines / 10);

      nearbyStars.forEach((star, index) => {
        setTimeout(() => {
          const starX = parseFloat(star.element.getAttribute('cx'));
          const starY = parseFloat(star.element.getAttribute('cy'));
          const line = createLine(mouseX, mouseY, starX, starY);
          line.classList.add('visible');
          lines.push(line);
          if (lines.length > maxLines) {
            const oldLine = lines.shift();
            oldLine.classList.remove('visible');
            setTimeout(() => {
              if (linesGroup.contains(oldLine)) {
                linesGroup.removeChild(oldLine);
              }
            }, 2000);
          }
        }, index * 100);
      });
    };

    const clearPulsate = () => {
      stars.forEach(star => {
        star.element.classList.remove('pulsate');
      });
    };

    const onMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      updateLines(mouseX, mouseY);
    };

    const resizeHandler = () => {
      starsGroup.innerHTML = '';
      linesGroup.innerHTML = '';
      stars.length = 0;
      lines.length = 0;
      for (let i = 0; i < numStars; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        stars.push(createStar(x, y));
      }
    };

    for (let i = 0; i < numStars; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      stars.push(createStar(x, y));
    }

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mousemove', onMouseMove);
      stars.forEach(star => {
        if (starsGroup.contains(star.element)) {
          starsGroup.removeChild(star.element);
        }
      });
      lines.forEach(line => {
        if (linesGroup.contains(line)) {
          linesGroup.removeChild(line);
        }
      });
    };
  }, []);

  return (
    <svg id="background" className="background-svg">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g id="stars"></g>
      <g id="lines"></g>
    </svg>
  );
};

export default BackgroundAnimation;
