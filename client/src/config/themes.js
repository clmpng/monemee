/**
 * Theme Configuration
 * Vordefinierte Themes für Store-Customization
 */

export const THEMES = {
  classic: {
    id: 'classic',
    name: 'Classic Blue',
    description: 'Professionelles Blau-Weiß Design',
    primary: '#1E3A8A',
    primaryLight: '#3B82F6',
    primaryDark: '#1E40AF',
    background: '#F8FAFC',
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textTertiary: '#64748B',
    border: '#E2E8F0'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warmes Orange-Rosa Design',
    primary: '#f97316',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',
    background: '#fff7ed',
    backgroundSecondary: '#fffbf5',
    backgroundTertiary: '#ffedd5',
    textPrimary: '#431407',
    textSecondary: '#7c2d12',
    textTertiary: '#9a3412',
    border: '#fed7aa'
  },
  nature: {
    id: 'nature',
    name: 'Nature Green',
    description: 'Frisches Grün-Beige Design',
    primary: '#059669',
    primaryLight: '#10b981',
    primaryDark: '#047857',
    background: '#f0fdf4',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#dcfce7',
    textPrimary: '#064e3b',
    textSecondary: '#065f46',
    textTertiary: '#047857',
    border: '#bbf7d0'
  },
  dark: {
    id: 'dark',
    name: 'Dark Gold',
    description: 'Elegantes Dunkel-Gold Design',
    primary: '#eab308',
    primaryLight: '#fbbf24',
    primaryDark: '#ca8a04',
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#e2e8f0',
    textTertiary: '#cbd5e1',
    border: '#475569'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal B&W',
    description: 'Minimalistisches Schwarz-Weiß Design',
    primary: '#18181b',
    primaryLight: '#3f3f46',
    primaryDark: '#09090b',
    background: '#ffffff',
    backgroundSecondary: '#fafafa',
    backgroundTertiary: '#f4f4f5',
    textPrimary: '#09090b',
    textSecondary: '#18181b',
    textTertiary: '#52525b',
    border: '#e4e4e7'
  },
  pastel: {
    id: 'pastel',
    name: 'Pastel Purple',
    description: 'Sanftes Pastell-Lila Design',
    primary: '#a855f7',
    primaryLight: '#c084fc',
    primaryDark: '#9333ea',
    background: '#faf5ff',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#f3e8ff',
    textPrimary: '#581c87',
    textSecondary: '#6b21a8',
    textTertiary: '#7e22ce',
    border: '#e9d5ff'
  }
};

export const GRID_LAYOUTS = {
  single: {
    id: 'single',
    name: '1 Spalte',
    description: 'Große Karten, eine pro Reihe',
    columns: 1,
    icon: 'layoutList'
  },
  'two-column': {
    id: 'two-column',
    name: '2 Spalten',
    description: 'Standard Grid-Layout',
    columns: 2,
    icon: 'layoutGrid'
  },
  'three-column': {
    id: 'three-column',
    name: '3 Spalten',
    description: 'Kompaktes Layout (Desktop)',
    columns: 3,
    icon: 'grid3x3'
  }
};

/**
 * Avatar Styles
 */
export const AVATAR_STYLES = {
  round: {
    id: 'round',
    name: 'Rund',
    description: 'Klassischer Kreis',
    borderRadius: '50%'
  },
  square: {
    id: 'square',
    name: 'Quadratisch',
    description: 'Abgerundete Ecken',
    borderRadius: '16px'
  },
  hexagon: {
    id: 'hexagon',
    name: 'Hexagon',
    description: '6-eckige Form',
    borderRadius: '50%', // Will use clip-path in CSS
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
  }
};

/**
 * Button Styles
 */
export const BUTTON_STYLES = {
  rounded: {
    id: 'rounded',
    name: 'Rounded',
    description: 'Leicht abgerundet',
    borderRadius: '8px'
  },
  pill: {
    id: 'pill',
    name: 'Pill',
    description: 'Vollständig rund',
    borderRadius: '9999px'
  },
  sharp: {
    id: 'sharp',
    name: 'Sharp',
    description: 'Eckige Kanten',
    borderRadius: '2px'
  }
};

/**
 * Card Styles
 */
export const CARD_STYLES = {
  elevated: {
    id: 'elevated',
    name: 'Elevated',
    description: 'Mit Schatten',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: 'none'
  },
  flat: {
    id: 'flat',
    name: 'Flat',
    description: 'Kein Schatten',
    shadow: 'none',
    border: '1px solid var(--preview-border)'
  },
  bordered: {
    id: 'bordered',
    name: 'Bordered',
    description: 'Dicker Border',
    shadow: 'none',
    border: '2px solid var(--preview-border)'
  }
};

/**
 * Header Background Types
 */
export const HEADER_BACKGROUNDS = {
  solid: {
    id: 'solid',
    name: 'Solid',
    description: 'Einfarbig',
    type: 'solid'
  },
  gradient: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Farbverlauf',
    type: 'gradient'
  },
  pattern: {
    id: 'pattern',
    name: 'Pattern',
    description: 'Mit Muster',
    type: 'pattern'
  }
};

/**
 * Font Families
 */
export const FONT_FAMILIES = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Inter (Standard)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Playfair Display',
    fontFamily: "'Playfair Display', Georgia, serif",
    bodyFont: "'Source Sans Pro', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  playful: {
    id: 'playful',
    name: 'Playful',
    description: 'Poppins',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  }
};

/**
 * Spacing/Density Options
 */
export const SPACING_OPTIONS = {
  compact: {
    id: 'compact',
    name: 'Kompakt',
    description: 'Enge Abstände',
    multiplier: 0.75
  },
  normal: {
    id: 'normal',
    name: 'Normal',
    description: 'Standard',
    multiplier: 1
  },
  spacious: {
    id: 'spacious',
    name: 'Luftig',
    description: 'Große Abstände',
    multiplier: 1.5
  }
};

// Helper function to get theme by ID
export const getTheme = (themeId) => {
  return THEMES[themeId] || THEMES.classic;
};

// Helper function to get layout by ID
export const getLayout = (layoutId) => {
  return GRID_LAYOUTS[layoutId] || GRID_LAYOUTS['two-column'];
};

// Get all themes as array
export const getAllThemes = () => {
  return Object.values(THEMES);
};

// Get all layouts as array
export const getAllLayouts = () => {
  return Object.values(GRID_LAYOUTS);
};

// Get all avatar styles as array
export const getAllAvatarStyles = () => {
  return Object.values(AVATAR_STYLES);
};

// Get all button styles as array
export const getAllButtonStyles = () => {
  return Object.values(BUTTON_STYLES);
};

// Get all card styles as array
export const getAllCardStyles = () => {
  return Object.values(CARD_STYLES);
};

// Get all header backgrounds as array
export const getAllHeaderBackgrounds = () => {
  return Object.values(HEADER_BACKGROUNDS);
};

// Get all font families as array
export const getAllFontFamilies = () => {
  return Object.values(FONT_FAMILIES);
};

// Get all spacing options as array
export const getAllSpacingOptions = () => {
  return Object.values(SPACING_OPTIONS);
};

// Helper: Get option by ID
export const getAvatarStyle = (id) => AVATAR_STYLES[id] || AVATAR_STYLES.round;
export const getButtonStyle = (id) => BUTTON_STYLES[id] || BUTTON_STYLES.rounded;
export const getCardStyle = (id) => CARD_STYLES[id] || CARD_STYLES.elevated;
export const getHeaderBackground = (id) => HEADER_BACKGROUNDS[id] || HEADER_BACKGROUNDS.solid;
export const getFontFamily = (id) => FONT_FAMILIES[id] || FONT_FAMILIES.modern;
export const getSpacingOption = (id) => SPACING_OPTIONS[id] || SPACING_OPTIONS.normal;
