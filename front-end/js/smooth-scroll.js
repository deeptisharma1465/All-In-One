/* =========================================================
   smooth-scroll.js — Ultra-lightweight dedicated smooth scroller
   Applies buttery inertia scrolling to specific scroll containers
   without requiring heavy libraries or DOM restructuring.
   ========================================================= */

function initSmoothScroll(element) {
  if (!element) return;

  let isScrolling = false;
  let targetY = element.scrollTop;
  let currentY = element.scrollTop;

  // Listen to mouse wheel to hijack native scroll
  element.addEventListener('wheel', (e) => {
    // Only intercept if we actually have room to scroll
    const maxScroll = element.scrollHeight - element.clientHeight;
    if (maxScroll <= 0) return;

    e.preventDefault();
    
    // Add wheel delta to target (multiplier controls scroll speed)
    targetY += e.deltaY;
    
    // Clamp target within bounds
    targetY = Math.max(0, Math.min(targetY, maxScroll));
    
    // Kick off animation loop if not already running
    if (!isScrolling) {
      isScrolling = true;
      requestAnimationFrame(update);
    }
  }, { passive: false });

  // Native scroll sync (if user drags scrollbar directly)
  element.addEventListener('scroll', () => {
    if (!isScrolling) {
      targetY = element.scrollTop;
      currentY = element.scrollTop;
    }
  }, { passive: true });

  // Animation loop
  function update() {
    // LERP (Linear Interpolation) for buttery smooth decay
    currentY += (targetY - currentY) * 0.12; 

    // Apply the smoothed value
    element.scrollTop = currentY;

    // Stop loop when we get very close to target
    if (Math.abs(targetY - currentY) > 0.5) {
      requestAnimationFrame(update);
    } else {
      element.scrollTop = targetY; // snap to exact pixel
      isScrolling = false;
    }
  }
}

// Initialize on all our scrollable containers globally
document.addEventListener('DOMContentLoaded', () => {
  const containers = [
    '.sidebar-scroll',
    '.inbox-list',
    '.email-thread',
    '.messages-container',
    '.profile-inner'
  ];

  containers.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) initSmoothScroll(el);
  });
});
