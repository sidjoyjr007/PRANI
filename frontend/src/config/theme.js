/**
 * Centralized Theme Configuration
 * Used across all UI components for consistent styling
 */

export const theme = {
  // colors: {
  //   // Primary (kept base, refined ramp)
  //   primary: {
  //     50: "#f5f3ff",
  //     100: "#ede9fe",
  //     200: "#ddd6fe",
  //     300: "#c4b5fd",
  //     400: "#a78bfa",
  //     500: "#8b5cf6",
  //     600: "#7c3aed",
  //     700: "#6d28d9",
  //     800: "#5b21b6",
  //     900: "#4c1d95",
  //     DEFAULT: "#a78bfa",
  //   },

  //   // Secondary (clean indigo tone)
  //   secondary: {
  //     50: "#eef2ff",
  //     100: "#e0e7ff",
  //     200: "#c7d2fe",
  //     300: "#a5b4fc",
  //     400: "#818cf8",
  //     500: "#6366f1",
  //     600: "#4f46e5",
  //     700: "#4338ca",
  //     800: "#3730a3",
  //     900: "#312e81",
  //     DEFAULT: "#6366f1",
  //   },

  //   // Modern Neutral System (replaces muddy gray)
  //   neutral: {
  //     50: "#f9fafb",
  //     100: "#f3f4f6",
  //     200: "#e5e7eb",
  //     300: "#d1d5db",
  //     400: "#9ca3af",
  //     500: "#6b7280",
  //     600: "#4b5563",
  //     700: "#374151",
  //     800: "#1f2937",
  //     900: "#111827",
  //   },

  //   success: {
  //     50: "#ecfdf5",
  //     100: "#d1fae5",
  //     200: "#a7f3d0",
  //     300: "#6ee7b7",
  //     400: "#34d399",
  //     500: "#10b981",
  //     600: "#059669",
  //     700: "#047857",
  //     800: "#065f46",
  //     900: "#064e3b",
  //     DEFAULT: "#10b981",
  //     foreground: "#ffffff",
  //   },

  //   warning: {
  //     50: "#fffbeb",
  //     100: "#fef3c7",
  //     200: "#fde68a",
  //     300: "#fcd34d",
  //     400: "#fbbf24",
  //     500: "#f59e0b",
  //     600: "#d97706",
  //     700: "#b45309",
  //     800: "#92400e",
  //     900: "#78350f",
  //     DEFAULT: "#f59e0b",
  //     foreground: "#111827",
  //   },

  //   destructive: {
  //     50: "#fef2f2",
  //     100: "#fee2e2",
  //     200: "#fecaca",
  //     300: "#fca5a5",
  //     400: "#f87171",
  //     500: "#ef4444",
  //     600: "#dc2626",
  //     700: "#b91c1c",
  //     800: "#991b1b",
  //     900: "#7f1d1d",
  //     DEFAULT: "#ef4444",
  //     foreground: "#ffffff",
  //   },

  //   // Surface system
  //   background: "#f9fafb",
  //   foreground: "#111827",

  //   card: "#ffffff",
  //   card_foreground: "#111827",

  //   input: "#ffffff",
  //   inputBorder: "#e5e7eb",

  //   border: "#e5e7eb",

  //   muted: "#f3f4f6",
  //   muted_foreground: "#6b7280",

  //   white: "#ffffff",
  //   black: "#111827",
  //   shadow: "#000000",

  //   primaryForeground: "#ffffff",
  //   secondaryForeground: "#ffffff",
  // }
  // colors: {
  //   // Deep Ocean Blue (Primary)
  //   primary: {
  //     50: "#eef6f9",
  //     100: "#d9eaf2",
  //     200: "#b9d7e6",
  //     300: "#94c0d6",
  //     400: "#6fa8c4",
  //     500: "#4f90b3",
  //     600: "#3e768f",
  //     700: "#325f72",
  //     800: "#2a4e5e",
  //     900: "#243f4d",
  //     DEFAULT: "#3e768f",
  //   },

  //   // Steel Teal (Secondary)
  //   secondary: {
  //     50: "#f0f7f6",
  //     100: "#dcebea",
  //     200: "#bdd9d6",
  //     300: "#97c3bf",
  //     400: "#6fabaa",
  //     500: "#4f9292",
  //     600: "#3e7778",
  //     700: "#325f60",
  //     800: "#294e4f",
  //     900: "#233f40",
  //     DEFAULT: "#4f9292",
  //   },

  //   // Warm Graphite Neutrals
  //   neutral: {
  //     50: "#f7f8f9",
  //     100: "#eef0f2",
  //     200: "#e0e4e8",
  //     300: "#cdd3da",
  //     400: "#a6b0bb",
  //     500: "#7e8a98",
  //     600: "#5f6b78",
  //     700: "#46515c",
  //     800: "#2f3943",
  //     900: "#1f262d",
  //   },

  //   // Success – Muted Emerald
  //   success: {
  //     50: "#edf7f2",
  //     100: "#d6efe3",
  //     200: "#b3e2cc",
  //     300: "#8dd2b2",
  //     400: "#65bf97",
  //     500: "#4aa883",
  //     600: "#3a8a6b",
  //     700: "#2f6f57",
  //     800: "#255747",
  //     900: "#1e473b",
  //     DEFAULT: "#4aa883",
  //     foreground: "#ffffff",
  //   },

  //   // Warning – Soft Amber
  //   warning: {
  //     50: "#fdf6ed",
  //     100: "#fae7d3",
  //     200: "#f4d2a9",
  //     300: "#ecba7a",
  //     400: "#e29f4e",
  //     500: "#d8892e",
  //     600: "#b66f23",
  //     700: "#91571c",
  //     800: "#744617",
  //     900: "#5f3914",
  //     DEFAULT: "#d8892e",
  //     foreground: "#1f262d",
  //   },

  //   // Destructive – Deep Brick
  //   destructive: {
  //     50: "#f8eded",
  //     100: "#f0d6d6",
  //     200: "#e3b3b3",
  //     300: "#d68d8d",
  //     400: "#c46565",
  //     500: "#b54a4a",
  //     600: "#963b3b",
  //     700: "#7a2f2f",
  //     800: "#632626",
  //     900: "#522020",
  //     DEFAULT: "#b54a4a",
  //     foreground: "#ffffff",
  //   },

  //   // Surfaces
  //   background: "#f7f8f9",
  //   foreground: "#1f262d",

  //   card: "#ffffff",
  //   card_foreground: "#1f262d",

  //   input: "#ffffff",
  //   inputBorder: "#e0e4e8",

  //   border: "#e0e4e8",

  //   muted: "#eef0f2",
  //   muted_foreground: "#5f6b78",

  //   white: "#ffffff",
  //   black: "#1f262d",
  //   shadow: "#000000",

  //   primaryForeground: "#ffffff",
  //   secondaryForeground: "#ffffff",
  // },
  // colors: {
  //   primary: {
  //     50: "#eef2f7",
  //     100: "#dbe3ee",
  //     200: "#b9c8db",
  //     300: "#93a9c4",
  //     400: "#6e89ad",
  //     500: "#4f6f96",
  //     600: "#3f5b7a",
  //     700: "#334a64",
  //     800: "#2a3d53",
  //     900: "#243347",
  //     DEFAULT: "#3f5b7a",
  //   },

  //   secondary: {
  //     50: "#f3f5f7",
  //     100: "#e6eaee",
  //     200: "#d2d9df",
  //     300: "#bcc6cf",
  //     400: "#a4b0bb",
  //     500: "#8b99a6",
  //     600: "#6f7c88",
  //     700: "#56626d",
  //     800: "#3f4a53",
  //     900: "#2b333a",
  //     DEFAULT: "#56626d",
  //   },

  //   neutral: {
  //     50: "#fafbfc",
  //     100: "#f2f4f7",
  //     200: "#e4e8ec",
  //     300: "#d3d9df",
  //     400: "#aeb6bf",
  //     500: "#8a94a0",
  //     600: "#67727e",
  //     700: "#4d5661",
  //     800: "#2e3640",
  //     900: "#1f252c",
  //   },

  //   success: {
  //     50: "#edf6f1",
  //     100: "#d5eade",
  //     200: "#b3dac4",
  //     300: "#8dc9a8",
  //     400: "#64b78c",
  //     500: "#489f73",
  //     600: "#3b8260",
  //     700: "#2f684e",
  //     800: "#265441",
  //     900: "#1f4536",
  //     DEFAULT: "#489f73",
  //     foreground: "#ffffff",
  //   },

  //   warning: {
  //     50: "#faf4ec",
  //     100: "#f2e3cc",
  //     200: "#e8cfa3",
  //     300: "#dcb876",
  //     400: "#cf9f49",
  //     500: "#c1862b",
  //     600: "#9e6c22",
  //     700: "#7c551b",
  //     800: "#624517",
  //     900: "#513a14",
  //     DEFAULT: "#c1862b",
  //     foreground: "#1f252c",
  //   },

  //   destructive: {
  //     50: "#f6eeee",
  //     100: "#edd6d6",
  //     200: "#deb3b3",
  //     300: "#cf8c8c",
  //     400: "#bb6464",
  //     500: "#a84a4a",
  //     600: "#8a3c3c",
  //     700: "#703030",
  //     800: "#5c2727",
  //     900: "#4c2020",
  //     DEFAULT: "#a84a4a",
  //     foreground: "#ffffff",
  //   },

  //   background: "#fafbfc",
  //   foreground: "#1f252c",

  //   card: "#ffffff",
  //   card_foreground: "#1f252c",

  //   input: "#ffffff",
  //   inputBorder: "#e4e8ec",

  //   border: "#e4e8ec",

  //   muted: "#f2f4f7",
  //   muted_foreground: "#67727e",

  //   white: "#ffffff",
  //   black: "#1f252c",
  //   shadow: "#000000",

  //   primaryForeground: "#ffffff",
  //   secondaryForeground: "#ffffff",
  // }
  colors: {
    // Deep Sapphire (Primary)
    primary: {
      50: "#eef1f6",
      100: "#d9e0eb",
      200: "#bcc8db",
      300: "#9cadc9",
      400: "#7c91b6",
      500: "#5f77a3",
      600: "#4e6287",
      700: "#3f506e",
      800: "#334159",
      900: "#2a3649",
      DEFAULT: "#4e6287",
    },

    // Muted Steel Accent
    secondary: {
      50: "#f4f6f8",
      100: "#e8edf2",
      200: "#d7dee6",
      300: "#c3ccd7",
      400: "#aab6c4",
      500: "#8f9ead",
      600: "#748492",
      700: "#5c6a76",
      800: "#46515c",
      900: "#353e46",
      DEFAULT: "#5c6a76",
    },

    // True Graphite Neutral System
    neutral: {
      50: "#fafafa",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },

    // Elegant Green
    success: {
      50: "#edf5f1",
      100: "#d7e8dd",
      200: "#b5d4c2",
      300: "#90bea5",
      400: "#6aa888",
      500: "#4d9171",
      600: "#3f765d",
      700: "#325e4b",
      800: "#294c3d",
      900: "#223f33",
      DEFAULT: "#4d9171",
      foreground: "#ffffff",
    },

    // Refined Amber
    warning: {
      50: "#f8f2e9",
      100: "#efe2c9",
      200: "#e3cc9d",
      300: "#d6b46e",
      400: "#c79b42",
      500: "#b58327",
      600: "#956c1f",
      700: "#755419",
      800: "#5e4515",
      900: "#4f3a13",
      DEFAULT: "#b58327",
      foreground: "#111827",
    },

    // Deep Wine (Destructive)
    destructive: {
      50: "#f6eeee",
      100: "#edd6d9",
      200: "#deb4b9",
      300: "#cf8d95",
      400: "#b96671",
      500: "#a34b57",
      600: "#863c46",
      700: "#6b3038",
      800: "#57272d",
      900: "#4a2126",
      DEFAULT: "#a34b57",
      foreground: "#ffffff",
    },

    // Surface System
    background: "#f9fafb",
    foreground: "#111827",

    card: "#ffffff",
    card_foreground: "#111827",

    input: "#ffffff",
    inputBorder: "#e5e7eb",

    border: "#e5e7eb",

    muted: "#f3f4f6",
    muted_foreground: "#6b7280",

    white: "#ffffff",
    black: "#111827",
    shadow: "#000000",

    primaryForeground: "#ffffff",
    secondaryForeground: "#ffffff",
  }
  // colors: {
  //   // Deep Sapphire (Primary)
  //   primary: {
  //     50: "#eef1f6",
  //     100: "#d9e0eb",
  //     200: "#bcc8db",
  //     300: "#9cadc9",
  //     400: "#7c91b6",
  //     500: "#5f77a3",
  //     600: "#4e6287",
  //     700: "#3f506e",
  //     800: "#334159",
  //     900: "#2a3649",
  //     DEFAULT: "#4e6287",
  //   },

  //   // Muted Steel Accent
  //   secondary: {
  //     50: "#f4f6f8",
  //     100: "#e8edf2",
  //     200: "#d7dee6",
  //     300: "#c3ccd7",
  //     400: "#aab6c4",
  //     500: "#8f9ead",
  //     600: "#748492",
  //     700: "#5c6a76",
  //     800: "#46515c",
  //     900: "#353e46",
  //     DEFAULT: "#5c6a76",
  //   },

  //   // True Graphite Neutral System
  //   neutral: {
  //     50: "#fafafa",
  //     100: "#f3f4f6",
  //     200: "#e5e7eb",
  //     300: "#d1d5db",
  //     400: "#9ca3af",
  //     500: "#6b7280",
  //     600: "#4b5563",
  //     700: "#374151",
  //     800: "#1f2937",
  //     900: "#111827",
  //   },

  //   // Elegant Green
  //   success: {
  //     50: "#edf5f1",
  //     100: "#d7e8dd",
  //     200: "#b5d4c2",
  //     300: "#90bea5",
  //     400: "#6aa888",
  //     500: "#4d9171",
  //     600: "#3f765d",
  //     700: "#325e4b",
  //     800: "#294c3d",
  //     900: "#223f33",
  //     DEFAULT: "#4d9171",
  //     foreground: "#ffffff",
  //   },

  //   // Refined Amber
  //   warning: {
  //     50: "#f8f2e9",
  //     100: "#efe2c9",
  //     200: "#e3cc9d",
  //     300: "#d6b46e",
  //     400: "#c79b42",
  //     500: "#b58327",
  //     600: "#956c1f",
  //     700: "#755419",
  //     800: "#5e4515",
  //     900: "#4f3a13",
  //     DEFAULT: "#b58327",
  //     foreground: "#111827",
  //   },

  //   // Deep Wine (Destructive)
  //   destructive: {
  //     50: "#f6eeee",
  //     100: "#edd6d9",
  //     200: "#deb4b9",
  //     300: "#cf8d95",
  //     400: "#b96671",
  //     500: "#a34b57",
  //     600: "#863c46",
  //     700: "#6b3038",
  //     800: "#57272d",
  //     900: "#4a2126",
  //     DEFAULT: "#a34b57",
  //     foreground: "#ffffff",
  //   },

  //   // Surface System
  //   background: "#f9fafb",
  //   foreground: "#111827",

  //   card: "#ffffff",
  //   card_foreground: "#111827",

  //   input: "#ffffff",
  //   inputBorder: "#e5e7eb",

  //   border: "#e5e7eb",

  //   muted: "#f3f4f6",
  //   muted_foreground: "#6b7280",

  //   white: "#ffffff",
  //   black: "#111827",
  //   shadow: "#000000",

  //   primaryForeground: "#ffffff",
  //   secondaryForeground: "#ffffff",
  // }
  // colors: {
  //   // Royal Emerald (Primary)
  //   primary: {
  //     50: "#eefaf6",
  //     100: "#d5f3e8",
  //     200: "#aee7d2",
  //     300: "#80d7b8",
  //     400: "#52c79e",
  //     500: "#2fb88a",
  //     600: "#249873",
  //     700: "#1d7a5d",
  //     800: "#17624c",
  //     900: "#124f3d",
  //     DEFAULT: "#249873",
  //   },

  //   // Midnight Teal (Secondary)
  //   secondary: {
  //     50: "#eef6f7",
  //     100: "#d8eaed",
  //     200: "#b7d7dd",
  //     300: "#92c1c9",
  //     400: "#6baab4",
  //     500: "#4f909b",
  //     600: "#3f7680",
  //     700: "#335f66",
  //     800: "#294d52",
  //     900: "#223f43",
  //     DEFAULT: "#335f66",
  //   },

  //   // Carbon Neutral System (Deep + Clean)
  //   neutral: {
  //     50: "#f9fafb",
  //     100: "#f3f4f6",
  //     200: "#e5e7eb",
  //     300: "#d1d5db",
  //     400: "#9ca3af",
  //     500: "#6b7280",
  //     600: "#4b5563",
  //     700: "#374151",
  //     800: "#1f2937",
  //     900: "#0f172a",
  //   },

  //   // Elegant Green Success (Close to Primary but lighter)
  //   success: {
  //     50: "#edf8f4",
  //     100: "#d6efe3",
  //     200: "#b4e1cc",
  //     300: "#8fd1b2",
  //     400: "#69c096",
  //     500: "#4aa883",
  //     600: "#3b8b6c",
  //     700: "#2f7058",
  //     800: "#265a47",
  //     900: "#1f4a3a",
  //     DEFAULT: "#4aa883",
  //     foreground: "#ffffff",
  //   },

  //   // Soft Gold Warning (Luxury feel)
  //   warning: {
  //     50: "#faf6ea",
  //     100: "#f2e8c8",
  //     200: "#e8d59a",
  //     300: "#dcc06a",
  //     400: "#cfa73d",
  //     500: "#b89022",
  //     600: "#97761b",
  //     700: "#765c15",
  //     800: "#5e4a12",
  //     900: "#4f3f10",
  //     DEFAULT: "#b89022",
  //     foreground: "#0f172a",
  //   },

  //   // Deep Garnet Destructive
  //   destructive: {
  //     50: "#f6eeee",
  //     100: "#edd6d8",
  //     200: "#deb3b6",
  //     300: "#cf8b92",
  //     400: "#b8646f",
  //     500: "#a14a57",
  //     600: "#843c46",
  //     700: "#6a3038",
  //     800: "#57272d",
  //     900: "#4a2126",
  //     DEFAULT: "#a14a57",
  //     foreground: "#ffffff",
  //   },

  //   // Surface System
  //   background: "#f9fafb",
  //   foreground: "#0f172a",

  //   card: "#ffffff",
  //   card_foreground: "#0f172a",

  //   input: "#ffffff",
  //   inputBorder: "#e5e7eb",

  //   border: "#e5e7eb",

  //   muted: "#f3f4f6",
  //   muted_foreground: "#6b7280",

  //   white: "#ffffff",
  //   black: "#0f172a",
  //   shadow: "#000000",

  //   primaryForeground: "#ffffff",
  //   secondaryForeground: "#ffffff",
  // }

  ,

  typography: {
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      xl2: "1.5rem",
      xl3: "1.875rem",
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
  },

  // Badge sizes
  badgeSizes: {
    sm: { height: "20px", paddingX: "8px", fontSize: "0.75rem", dotSize: 6 },
    md: { height: "28px", paddingX: "12px", fontSize: "0.875rem", dotSize: 8 },
    lg: { height: "32px", paddingX: "16px", fontSize: "1rem", dotSize: 10 },
  },

  // Tab sizes
  tabSizes: {
    sm: { paddingV: "0.5rem", paddingH: "0.75rem", fontSize: "0.875rem", iconSize: 16 },
    md: { paddingV: "0.75rem", paddingH: "1rem", fontSize: "0.875rem", iconSize: 18 },
    lg: { paddingV: "0.875rem", paddingH: "1.25rem", fontSize: "1rem", iconSize: 20 },
  },

  // Additional sizes for components
  sizes: {
    maxHeight: {
      dropdown: "250px",
      modal: "90vh",
      sidebar: "100vh",
      select: "256px",
    },
    minWidth: {
      dropdown: "200px",
      input: "200px",
    },
    minHeight: {
      textareaSm: "80px",
      textareaMd: "120px",
      textareaLg: "160px",
    },
    height: {
      inputXs: "28px",
      inputSm: "32px",
      inputMd: "36px",
      inputLg: "40px",
      inputXl: "44px",
      chipsSmall: "24px",
      chipsMedium: "32px",
      chipsLarge: "40px",
      selectSm: "32px",
      selectMd: "36px",
      selectLg: "40px",
      iconSm: "16px",
      iconMd: "20px",
      iconLg: "24px",
      avatarXs: "24px",
      avatarSm: "32px",
      avatarMd: "40px",
      avatarLg: "48px",
      avatarXl: "64px",
      sidebarIconButton: "44px",
    },
    width: {
      iconSm: "16px",
      iconMd: "20px",
      iconLg: "24px",
      avatarXs: "24px",
      avatarSm: "32px",
      avatarMd: "40px",
      avatarLg: "48px",
      avatarXl: "64px",
      sidebarIconButton: "44px",
      sidebarCollapsed: "60px",
      sidebarFull: "240px",
    },
  },

  // Border widths
  borderWidth: {
    none: "0",
    sm: "1px",
    base: "1px",
    md: "2px",
    lg: "3px",
  },

  borderRadius: {
    none: "0",
    sm: "0.25rem",
    base: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    xxl: '2rem',
    full: "9999px",
  },

  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  transitions: {
    fast: "150ms ease-in-out",
    normal: "300ms ease-in-out",
    slow: "500ms ease-in-out",
  },

  opacity: {
    disabled: 0.6,
    hover: 0.8,
    active: 0.9,
    full: 1,
  },
}

export const getColor = (colorPath) => {
  const keys = colorPath.split(".")
  let value = theme.colors
  for (const key of keys) {
    value = value[key]
  }
  return value
}
