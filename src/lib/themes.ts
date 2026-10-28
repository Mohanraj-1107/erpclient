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

/** Shared semantic status colors used by every theme's toast surfaces. */
const STATUS_SUCCESS_TOAST = {
  successToastBg: '#DCFCE7',
  successToastFg: '#166534',
  successToastBorder: '#86EFAC',
  errorToastBg: '#FEE2E2',
  errorToastFg: '#991B1B',
  errorToastBorder: '#FCA5A5',
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
    name: 'Teal Professional',
    shortName: 'Teal Professional',
    palette: {
      navBg: '#173F3A',
      navFg: '#F7FAF9',
      page: '#F3F6F5',
      surface: '#FFFFFF',
      primary: '#376F68',
      primaryHover: '#2F5D57',
      primaryFg: '#FFFFFF',
      secondary: '#E8F0ED',
      secondaryFg: '#173F3A',
      secondaryBorder: '#CDDBD6',
      border: '#DDE5E1',
      inputBorder: '#C6D1CC',
      text: '#24332F',
      textMuted: '#687873',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'navy',
    name: 'Navy Corporate',
    shortName: 'Navy Corporate',
    palette: {
      navBg: '#1C2D42',
      navFg: '#F4F6F9',
      page: '#F3F5F8',
      surface: '#FFFFFF',
      primary: '#3F5F85',
      primaryHover: '#36526F',
      primaryFg: '#FFFFFF',
      secondary: '#E8EDF4',
      secondaryFg: '#1C2D42',
      secondaryBorder: '#CCD7E3',
      border: '#DCE2E9',
      inputBorder: '#C4CEDB',
      text: '#202B38',
      textMuted: '#697789',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'slate',
    name: 'Slate & Indigo',
    shortName: 'Slate & Indigo',
    palette: {
      navBg: '#252F42',
      navFg: '#E8ECF4',
      page: '#F4F5F9',
      surface: '#FFFFFF',
      primary: '#5865A8',
      primaryHover: '#4C5891',
      primaryFg: '#FFFFFF',
      secondary: '#EAECF7',
      secondaryFg: '#252F42',
      secondaryBorder: '#CCCEDD',
      border: '#E0E3EC',
      inputBorder: '#C7CCE6',
      text: '#252B38',
      textMuted: '#6D7384',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    shortName: 'Forest Green',
    palette: {
      navBg: '#263F32',
      navFg: '#F4F8F4',
      page: '#F4F6F2',
      surface: '#FFFFFF',
      primary: '#4D755B',
      primaryHover: '#43664F',
      primaryFg: '#FFFFFF',
      secondary: '#E9EFE8',
      secondaryFg: '#263F32',
      secondaryBorder: '#CCDBCA',
      border: '#DFE5DC',
      inputBorder: '#C8D4C6',
      text: '#28342B',
      textMuted: '#707A70',
      ...STATUS_SUCCESS_TOAST,
    },
  },
  {
    id: 'charcoal',
    name: 'Charcoal & Copper',
    shortName: 'Charcoal & Copper',
    palette: {
      navBg: '#292B2F',
      navFg: '#F5F3F1',
      page: '#F5F4F2',
      surface: '#FFFFFF',
      primary: '#A96343',
      primaryHover: '#93543A',
      primaryFg: '#FFFFFF',
      secondary: '#F1E8E2',
      secondaryFg: '#292B2F',
      secondaryBorder: '#DCC7BC',
      border: '#E4E0DC',
      inputBorder: '#C7BDB7',
      text: '#292A2C',
      textMuted: '#74716F',
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
