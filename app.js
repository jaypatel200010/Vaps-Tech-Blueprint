/* app.js - Vaps Tech Integration Blueprint Custom Logic Core */

document.addEventListener('DOMContentLoaded', () => {
  
  // Scroll-Reveal IntersectionObserver setup
  const reveals = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        // Recalculate SVG connector paths when map is revealed
        if (entry.target.id === 'map') {
          setTimeout(drawLines, 100);
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });
  
  reveals.forEach(el => revealObserver.observe(el));

  // Dynamic Bezier connector path drawer
  const container = document.querySelector('.systemmap');
  const hub = document.querySelector('.hub-node');
  const modules = document.querySelectorAll('.mod-node');
  const svg = document.querySelector('.map-connectors');
  const paths = svg ? svg.querySelectorAll('path') : [];

  function drawLines() {
    if (!container || !hub || !svg || paths.length === 0) return;
    
    // Clear/hide paths on mobile/small viewports where grid stacks
    if (window.innerWidth <= 900) {
      paths.forEach(p => p.setAttribute('d', ''));
      return;
    }
    
    const containerRect = container.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();
    
    // Hub connection point (center of the right edge)
    const hubX = hubRect.right - containerRect.left;
    const hubY = (hubRect.top + hubRect.height / 2) - containerRect.top;
    
    modules.forEach((mod, index) => {
      if (index >= paths.length) return;
      const modRect = mod.getBoundingClientRect();
      
      // Module connection point (center of the left edge)
      const modX = modRect.left - containerRect.left;
      const modY = (modRect.top + modRect.height / 2) - containerRect.top;
      
      // Horizontal offset weight for control points
      const offset = (modX - hubX) * 0.55;
      
      // Curve path formula
      const d = `M ${hubX} ${hubY} C ${hubX + offset} ${hubY}, ${modX - offset} ${modY}, ${modX} ${modY}`;
      paths[index].setAttribute('d', d);
    });
  }

  // Draw on load and screen resize
  drawLines();
  window.addEventListener('load', drawLines);
  window.addEventListener('resize', drawLines);

});
