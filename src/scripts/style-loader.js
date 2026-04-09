// ============================================================================
// STYLE-LOADER.JS - Load Saved Styles from localStorage
// ============================================================================
// This file loads any custom styles saved from the Style Editor and applies
// them to the current page. It runs automatically on every page.

function loadSavedStyles() {
  // Get saved styles from localStorage
  const saved = localStorage.getItem('harvardToolStyles');
  if (!saved) return; // No saved styles yet

  const vals = JSON.parse(saved);

  // Build CSS with the saved values
  const cssVars = `
:root {
  --primary-color: ${vals.primaryColor || '#6366f1'};
  --text-color: ${vals.textColor || '#1f2937'};
  --secondary-color: ${vals.secondaryColor || '#6b7280'};
  --heading-size: ${vals.headingSize || '28'}px;
  --body-size: ${vals.bodySize || '16'}px;
  --border-radius: ${vals.borderRadius || '6'}px;
  --padding-base: ${vals.padding || '16'}px;
}

/* Apply variables to existing styles */
button, .btn-primary {
  background: var(--primary-color);
  border-radius: var(--border-radius);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--text-color);
  font-size: var(--heading-size);
}

body {
  color: var(--text-color);
  font-size: var(--body-size);
}

.section-button, .main-nav-button {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  border-radius: var(--border-radius);
  padding: var(--padding-base);
}

.card, .accordion-item {
  border-radius: var(--border-radius);
  padding: var(--padding-base);
}
`;

  // Create a style element and inject it
  const style = document.createElement('style');
  style.id = 'harvard-custom-styles';
  style.textContent = cssVars;
  document.head.appendChild(style);
}

// Load styles as soon as possible (even before DOMContentLoaded)
loadSavedStyles();
