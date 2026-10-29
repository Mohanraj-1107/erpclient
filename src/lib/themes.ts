export type ThemeId =
  | 'original'
  | 'teal'
  | 'navy'
  | 'slate'
  | 'forest'
  | 'charcoal';

/**
 * Full palette for a theme. The CSS custom properties in `src/index.css` are
 * the runtime source of truth; this object mirrors their values, powers the
 * selector preview swatches, and keeps the theme names/ordering in one place.
 *
 * The default theme's palette is the original ERP palette and must never be
 * modified. The five enterprise palettes are muted, low-saturation palettes
 * from the design spec.
 */
export interface ThemePalette {
  navBg: string;
  navFg: string;
  page: string;
  surface: string;
  primary: string;
  primaryHover: string;
  primaryFg: string;
  secondary: string;
  secondaryFg: string;
  secondaryBorder: string;
  border: string;
  inputBorder: string;
  text: string;
  textMuted: string;
  successToastBg: string;
  successToastFg: string;
  successToastBorder: string;
  errorToastBg: string;
  errorToastFg: string;
  errorToastBorder: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  shortName: string;
  palette: ThemePalette;
  isDefault?: boolean;
}

export const THEME_STORAGE_KEY = 'erp.theme';

export const DEFAULT_THEME: ThemeId = 'original';

/** Shared semantic status colors used by the five enterprise themes' toast surfaces. */
const STATUS_SUCCESS_TOAST = {
  successToastBg: '#ECFAF0',
  successToastFg: '#11693D',
  successToastBorder: '#BBE6CB',
  errorToastBg: '#FDF1F0',
  errorToastFg: '#A3302A',
  errorToastBorder: '#F2C9C5',
} as const;

export const THEMES: ThemeDefinition[] = [
  {
    id: 'original',
    name: 'Existing Default Theme',
    shortName: 'Default',
    isDefault: true,
    palette: {
      navBg: '#FFFFFF',
      navFg: '#0F172A',
      page: '#F8FAFC',
      surface: '#FFFFFF',
      primary: '#4F46E5',
      primaryHover: '#4338CA',
      primaryFg: '#FFFFFF',
      secondary: '#F1F5F9',
      secondaryFg: '#334155',
      secondaryBorder: 'transparent',
      border: '#E2E8F0',
      inputBorder: '#E2E8F0',
      text: '#0F172A',
      textMuted: '#64748B',
      successToastBg: '#FFFFFF',
      successToastFg: '#0F172A',
      successToastBorder: '#E2E8F0',
      errorToastBg: '#FFFFFF',
      errorToastFg: '#0F172A',
      errorToastBorder: '#E2E8F0',
    },
  },
  {
    id: 'teal',
    name: 'Harbor Teal',
    shortName: 'Harbor Teal',
    palette: {
      navBg: '#EAF4F3',
      navFg: '#0F3D3A',
      page: '#F7F9F9',
      surface: '#FFFFFF',
      primary: '#0E7C72',
      primaryHover: '#0B655D',
      primaryFg: '#FFFFFF',
      secondary: '#FFFFFF',
      secondaryFg: '#0F3D3A',
      secondaryBorder: '#BFD9D5',
      border: '#E2E9E8',
      inputBorder: '#CBD5D4',
      text: '#1C2B2A',
      textMuted: '#5B6E6D',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'navy',
    name: 'Meridian Blue',
    shortName: 'Meridian Blue',
    palette: {
      navBg: '#EEF3FA',
      navFg: '#1F3657',
      page: '#F6F8FB',
      surface: '#FFFFFF',
      primary: '#2F5EA8',
      primaryHover: '#27508F',
      primaryFg: '#FFFFFF',
      secondary: '#FFFFFF',
      secondaryFg: '#1F3657',
      secondaryBorder: '#C6D4E6',
      border: '#E3E9F1',
      inputBorder: '#CCD6E4',
      text: '#1C2838',
      textMuted: '#5D6B80',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'forest',
    name: 'Sage Field',
    shortName: 'Sage Field',
    palette: {
      navBg: '#EDF2EC',
      navFg: '#27362A',
      page: '#F8FAF7',
      surface: '#FFFFFF',
      primary: '#4A7C59',
      primaryHover: '#3C6749',
      primaryFg: '#FFFFFF',
      secondary: '#FFFFFF',
      secondaryFg: '#2F4634',
      secondaryBorder: '#CBDAC9',
      border: '#E4EAE2',
      inputBorder: '#CDD8CB',
      text: '#26332A',
      textMuted: '#5F6E62',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'slate',
    name: 'Graphite Indigo',
    shortName: 'Graphite Indigo',
    palette: {
      navBg: '#F2F3F8',
      navFg: '#2A2E3C',
      page: '#FAFAFC',
      surface: '#FFFFFF',
      primary: '#4A56B8',
      primaryHover: '#3E49A0',
      primaryFg: '#FFFFFF',
      secondary: '#FFFFFF',
      secondaryFg: '#343A4D',
      secondaryBorder: '#D2D5E0',
      border: '#E6E7EE',
      inputBorder: '#D3D6E0',
      text: '#23262F',
      textMuted: '#62677A',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'charcoal',
    name: 'Warehouse Stone',
    shortName: 'Warehouse Stone',
    palette: {
      navBg: '#F1EFEB',
      navFg: '#322C25',
      page: '#FAF9F7',
      surface: '#FFFFFF',
      primary: '#A15A33',
      primaryHover: '#874A29',
      primaryFg: '#FFFFFF',
      secondary: '#FFFFFF',
      secondaryFg: '#3A332B',
      secondaryBorder: '#DBD4CA',
      border: '#E8E4DD',
      inputBorder: '#D6CFC5',
      text: '#2B251E',
      textMuted: '#6B6358',
      ...STATUS_SUCCESS_TOAST,
    },
  },
];

const THEME_IDS = new Set<string>(THEMES.map((theme) => theme.id));

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && THEME_IDS.has(value);
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
