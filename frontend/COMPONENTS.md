# Prani Frontend - Component & Theme System

## Overview

This frontend uses a **centralized theme system** that provides consistent colors, spacing, typography, and shadows across all UI components. All components are built with **Tailwind CSS** and use the theme configuration as the single source of truth.

## Theme Configuration

The theme is defined in `/src/config/theme.js` and exported globally:

```javascript
import { theme } from '@/config/theme'
```

### Color Palette

#### Primary Colors
- **Default**: `#0ea5e9` (Sky Blue)
- Shades: 50-900 for varying intensities

#### Secondary Colors
- **Default**: `#8b5cf6` (Purple)
- Full scale from 50-900

#### Accent Colors
- **Default**: `#64748b` (Slate)
- Used for muted/secondary elements

#### Status Colors
- **Success**: `#22c55e` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Destructive**: `#ef4444` (Red)
- Each with foreground override for readability

#### Grayscale
- **White**: `#ffffff`
- **Black**: `#000000`
- **Gray Scale**: 50-900 shades
- All semantic colors (background, border, muted, etc.)

### Spacing Scale
- `0`: 0
- `1`: 0.25rem (4px)
- `2`: 0.5rem (8px)
- `3`: 0.75rem (12px)
- `4`: 1rem (16px)
- `6`: 1.5rem (24px)
- `8`: 2rem (32px)
- `12`: 3rem (48px)
- `16`: 4rem (64px)

### Typography
- **Font Sizes**: xs, sm, base, lg, xl, xl2, xl3
- **Font Weights**: light (300), normal (400), medium (500), semibold (600), bold (700)
- **Line Heights**: tight (1.2), normal (1.5), relaxed (1.75)

### Shadows
- **sm**: Subtle shadow for depth
- **md**: Standard shadow
- **lg**: Prominent shadow
- **xl**: Strong emphasis shadow

### Border Radius
- **sm**: 0.375rem (6px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **full**: 9999px (fully rounded)

## UI Components

### Button Component

**Location**: `/src/components/ui/button.jsx`

**Variants**: 
- `primary` - Main action buttons
- `secondary` - Secondary actions
- `destructive` - Delete/dangerous actions
- `outline` - Border-only style
- `ghost` - Text-only, no background

**Sizes**:
- `sm` - Small (8px height)
- `md` - Medium (9px height, default)
- `lg` - Large (10px height)

**Example**:
```jsx
import { Button } from '@/components/ui/button'

<Button variant="primary" size="md">
  Click me
</Button>

<Button variant="destructive" size="lg" disabled>
  Delete
</Button>
```

### Input Component

**Location**: `/src/components/ui/input.jsx`

**Features**:
- Theme-integrated colors and borders
- Error state support
- Icon support (left & right)
- Multiple sizes

**Example**:
```jsx
import { Input } from '@/components/ui/input'

<Input 
  placeholder="Enter text" 
  type="text"
  error={false}
/>
```

### Label Component

**Location**: `/src/components/ui/label.jsx`

**Variants**:
- `default` - Standard label
- `primary` - Primary colored label
- `required` - Shows asterisk for required fields

**Example**:
```jsx
import { Label } from '@/components/ui/label'

<Label htmlFor="name" required>
  Full Name
</Label>
```

### Card Component

**Location**: `/src/components/ui/card.jsx`

**Exports**:
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title element
- `CardDescription` - Subtitle/description
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Example**:
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Badge Component

**Location**: `/src/components/ui/badge.jsx`

**Variants**:
- `default` - Gray neutral badge
- `primary` - Primary color badge
- `secondary` - Secondary color badge
- `success` - Green success badge
- `warning` - Amber warning badge
- `destructive` - Red error badge
- `outline` - Border-only badge

**Sizes**:
- `sm` - Small (2px height)
- `md` - Medium (4px height, default)
- `lg` - Large (6px height)

**Example**:
```jsx
import { Badge } from '@/components/ui/badge'

<Badge variant="success">Active</Badge>
<Badge variant="warning" size="lg">Pending</Badge>
<Badge variant="destructive">Error</Badge>
```

### Alert Component

**Location**: `/src/components/ui/alert.jsx`

**Variants**:
- `default` - Neutral alert
- `success` - Success alert (green)
- `warning` - Warning alert (amber)
- `destructive` - Error alert (red)

**Features**:
- Auto icon based on variant
- Dismissible
- Title and description support
- Custom actions

**Example**:
```jsx
import { Alert } from '@/components/ui/alert'

<Alert 
  variant="success"
  title="Success!"
  description="Your changes were saved."
  onDismiss={() => console.log('dismissed')}
/>
```

### Tabs Component

**Location**: `/src/components/ui/tabs.jsx`

**Exports**:
- `Tabs` - Root container
- `TabsList` - Tab list container
- `TabsTrigger` - Individual tab button
- `TabsContent` - Tab content panel

**Example**:
```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

## Using Theme in Components

All components use the centralized theme. If you need to use theme values directly:

```jsx
import { theme } from '@/config/theme'

// Access colors
theme.colors.primary.DEFAULT        // #0ea5e9
theme.colors.success.DEFAULT        // #22c55e
theme.colors.gray[500]              // #6b7280

// Access typography
theme.typography.fontSize.base.size      // 1rem
theme.typography.fontWeight.semibold     // 600

// Access spacing
theme.spacing[4]                    // 1rem

// Apply inline
<div style={{ 
  backgroundColor: theme.colors.primary.DEFAULT,
  padding: theme.spacing[4],
  fontSize: theme.typography.fontSize.lg.size
}}>
  Custom styled element
</div>
```

## Component Showcase

Visit `/components` route to see all components in action with the theme applied:

```
http://localhost:5173/components
```

This interactive showcase displays:
- Button variants and sizes
- Form components (Input, Label)
- Alert variants
- Badge styles
- Card layouts
- Complete color palette

## Extending the Theme

To add new theme values:

1. Edit `/src/config/theme.js`
2. Add your values to the appropriate section (colors, spacing, etc.)
3. Import and use in components:

```javascript
// In theme.js
export const theme = {
  colors: {
    // ... existing
    myColor: {
      DEFAULT: '#123456',
      light: '#abcdef',
    }
  }
}

// In component
import { theme } from '@/config/theme'
const myElement = <div style={{ color: theme.colors.myColor.DEFAULT }} />
```

## Tailwind CSS Integration

The project uses **Tailwind CSS** with the theme system. Most styling is done via:

1. **Tailwind classes** (e.g., `px-4 py-2 rounded-md`)
2. **Inline styles** with theme values (e.g., `backgroundColor: theme.colors.primary.DEFAULT`)
3. **CSS variables** (fallback, defined in `src/index.css`)

All components blend these approaches for maximum flexibility and consistency.

## File Structure

```
src/
├── config/
│   └── theme.js              # Centralized theme configuration
├── components/
│   └── ui/
│       ├── button.jsx        # Button component
│       ├── input.jsx         # Input component
│       ├── label.jsx         # Label component
│       ├── card.jsx          # Card components
│       ├── badge.jsx         # Badge component
│       ├── alert.jsx         # Alert component
│       ├── tabs.jsx          # Tabs component
│       └── ...
├── pages/
│   └── ComponentShowcase.jsx  # Component showcase page
├── App.jsx                   # Main app with routing
├── index.css                 # Global styles & CSS variables
└── tailwind.config.js        # Tailwind configuration
```

## Best Practices

1. **Always use theme values** - Don't hardcode colors or spacing
2. **Import theme in components** - Ensures consistency
3. **Use semantic color names** - `success`, `warning`, `destructive`
4. **Combine Tailwind + inline styles** - Use Tailwind for layout, theme for colors
5. **Test in ComponentShowcase** - Verify changes in the showcase page
6. **Document variant additions** - Update this README when adding variants

## Support

For questions or issues with components or theme, check:
- Component Showcase page: `/components`
- Component source files: `/src/components/ui/`
- Theme configuration: `/src/config/theme.js`
