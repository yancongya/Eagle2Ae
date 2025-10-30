// Panel configuration constants
export const PANEL_CONFIG = {
  PANELS: ['panel1', 'panel2', 'panel3'],
  TOTAL_PANELS: 3,
  PROGRESS_WEIGHT: 50,
  LOAD_DELAYS: [0, 600, 1200],
  IFRAME_FADE_DURATION: 0.5,
  LOAD_TIMEOUT: 150
};

// UI configuration constants
export const UI_CONFIG = {
  LOADING_INDICATORS: {
    MAIN: { size: 'w-12 h-12', color: 'border-purple-500' },
    SECONDARY: { size: 'w-8 h-8', color: 'border-blue-500' },
    TERTIARY: { size: 'w-8 h-8', color: 'border-green-500' }
  },
  ANIMATION: {
    FADE_DURATION: 0.5,
    ENTRANCE_DURATION: 0.45,
    ENTRANCE_DELAY: 12
  },
  LAYOUT: {
    MIN_PANE_SIZE: 15,
    MAX_PANE_SIZE: 85,
    VERTICAL_MIN_SIZE: 20,
    VERTICAL_MAX_SIZE: 80
  }
};

// Panel labels (from manifest.xml configuration)
export const PANEL_LABELS = {
  panel1: 'Eagle2Ae 1@烟囱鸭',
  panel2: 'Eagle2Ae 2@烟囱鸭',
  panel3: 'Eagle2Ae 3@烟囱鸭'
};

// Panel variants for styling
export const PANEL_VARIANTS = {
  panel1: 'primary',
  panel2: 'secondary',
  panel3: 'tertiary'
};