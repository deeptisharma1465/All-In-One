/* =========================================================
   main.js  —  Nexus Multi-Chat — Application Entry Point
   Initializes app and loads first conversation
   Requires all other modules to be loaded first
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();

  // Auto-load first DM on startup
  const firstDm = document.querySelector('.dm-row[data-convo]');
  if (firstDm) {
    firstDm.click();
  }
});
