# Component Showcase Page

## Overview
A comprehensive, interactive showcase page displaying all reusable UI components with their variants and configurations.

**URL**: `/components`

---

## Components Included

### 1. **Buttons**
- **Variants**: Primary, Secondary, Destructive, Outline, Ghost
- **Sizes**: XS, SM, MD, LG, XL
- **States**: Disabled, Loading, Full Width
- **With Icons**: Download, Close examples

### 2. **Badges**
- **Variants**: Default, Primary, Secondary, Success, Destructive, Warning
- **Sizes**: Small, Medium, Large

### 3. **Chips**
- **Sizes**: Small, Medium, Large
- **Variants**: Primary, Secondary, Outline
- Removable/closeable

### 4. **Inputs**
- **Sizes**: XS, SM, MD, LG, XL
- **Variants**: Default, Outline, Ghost
- **States**: Disabled, Error
- **With Icons**: Search, Password examples

### 5. **Textarea**
- **Sizes**: Small, Medium, Large
- Multi-line text input with theme sizing

### 6. **Select / Dropdown**
- **Native Select**: Browser native dropdown
- **Styled Select**: Custom themed dropdown
- **Searchable Select**: Filterable dropdown

### 7. **Checkbox**
- **Sizes**: Small, Medium, Large
- **States**: Checked, Unchecked, Disabled, Indeterminate

### 8. **Switch**
- **Sizes**: Small, Medium, Large
- **States**: On/Off, Disabled
- Toggle boolean values

### 9. **Toggle**
- Single state toggle button
- **States**: Pressed, Not Pressed, Disabled
- **With Icons**: Eye, Edit, Trash examples

### 10. **Progress Bar**
- **Sizes**: XS, SM, MD, LG
- **Variants**: Default, Success, Warning, Destructive
- Shows percentage with optional label

### 11. **Spinner**
- **Variants**: Primary, Secondary, Success, Destructive
- **Sizes**: XS, SM, MD, LG, XL
- Loading indicators

### 12. **Skeleton**
- Loading placeholder
- Different heights and widths
- Shimmer animation

### 13. **Alert**
- **Variants**: Default, Success, Warning, Destructive
- Title and description
- Dismissible option

### 14. **Separator**
- Horizontal divider
- Vertical divider
- Visual separation between sections

### 15. **Cards**
- Container component
- Header with title and description
- Content area
- Footer (optional)

### 16. **Tabs**
- Multiple content tabs
- Trigger navigation
- Content switching

### 17. **Accordion**
- Collapsible sections
- Multiple items
- One or all can be expanded

### 18. **Labels**
- **Variants**: Default, Primary
- **States**: Required indicator
- Form field labeling

### 19. **Breadcrumb**
- Navigation path indicator
- Active state highlighting
- Separators between items

### 20. **Pagination**
- Page navigation
- Previous/Next buttons
- Active page indicator
- Numbered page links

### 21. **Table**
- Data display
- Header with column names
- Body with data rows
- Status badges in cells

### 22. **Avatar**
- User profile image
- **Sizes**: Small, Medium, Large
- Initials fallback

### 23. **Empty State**
- No results placeholder
- Icon, title, description
- Action button

### 24. **Kbd (Keyboard Key)**
- Display keyboard key
- Combine keys (Ctrl+C)
- Instructional text

### 25. **Button Group**
- Multiple buttons grouped
- Connected appearance
- Toggle group behavior

### 26. **Input OTP**
- One-time password input
- 6-digit input slots
- Auto-focus next field

---

## Features

✅ **All components properly themed**
- Uses centralized `theme` object
- Typography from `theme.typography`
- Colors from `theme.colors`
- Spacing from `theme.spacing`
- Sizing from `theme.sizes`

✅ **Clear variant display**
- Each component shows all variants
- Visual hierarchy with labels
- Grouped by category

✅ **Interactive examples**
- Switch states can be toggled
- Checkboxes and radios work
- Tabs and accordions expandable
- Input fields editable

✅ **Responsive layout**
- Uses Layout and Container components
- Proper spacing and padding
- Flex and grid layouts

✅ **Easy to modify**
- Clearly organized sections
- Easy to add new variants
- Comments explaining each section

---

## How to Use

### View the Showcase
Navigate to: `http://localhost:5173/components`

### Request Changes
1. View the component variant you want to change
2. Note the component name and variant
3. Request the specific change (e.g., "Button primary should be darker")
4. Component will be updated in `src/components/ui/[component].jsx`

### Add New Variant
1. Identify the component section
2. Add new variant to component import
3. Add showcase example in ComponentShowcase.jsx
4. Update actual component if variant doesn't exist

---

## Showcase Page Structure

```
Header (Title + Description)
  ↓
Component Sections (grouped by component type)
  ├── Component Name & Description
  ├── Variant Group (Variants label)
  │   └── Component examples with variant props
  ├── Variant Group (Sizes label)
  │   └── Component examples with size props
  ├── Variant Group (States label)
  │   └── Component examples with state props
  ├── Variant Group (With Icons label)
  │   └── Component examples with icon integration
  └── ...
  ↓
Footer (Notes about showcase)
```

---

## Component Mapping

| Component | Import | File | Showcase |
|-----------|--------|------|----------|
| Button | `Button` | `button.jsx` | Variants, Sizes, States, Icons |
| Badge | `Badge` | `badge.jsx` | Variants, Sizes |
| Chips | `Chips` | `chips.jsx` | Sizes, Variants |
| Input | `Input` | `input.jsx` | Sizes, Variants, States, Icons |
| Textarea | `Textarea` | `textarea.jsx` | Sizes |
| Select | `Select` | `select.jsx` | Native, Styled, Searchable |
| Checkbox | `Checkbox` | `checkbox.jsx` | Sizes, States |
| Switch | `Switch` | `switch.jsx` | Sizes, States |
| Toggle | `Toggle` | `toggle.jsx` | States, Icons |
| Progress | `Progress` | `progress.jsx` | Sizes, Variants |
| Spinner | `Spinner` | `spinner.jsx` | Variants, Sizes |
| Skeleton | `Skeleton` | `skeleton.jsx` | Different heights |
| Alert | `Alert` | `alert.jsx` | Variants |
| Separator | `Separator` | `separator.jsx` | Horizontal, Vertical |
| Card | `Card`, `CardContent`, etc. | `card.jsx` | Basic structure |
| Tabs | `Tabs`, `TabsList`, etc. | `tabs.jsx` | Tab navigation |
| Accordion | `Accordion`, `AccordionItem`, etc. | `accordion.jsx` | Collapsible sections |
| Label | `Label` | `label.jsx` | Variants, Required |
| Breadcrumb | `Breadcrumb`, etc. | `breadcrumb.jsx` | Navigation path |
| Pagination | `Pagination`, etc. | `pagination.jsx` | Page navigation |
| Table | `Table`, `TableRow`, etc. | `table.jsx` | Data display |
| Avatar | `Avatar` | `avatar.jsx` | Sizes, Initials |
| Empty | `Empty` | `empty.jsx` | Placeholder |
| Kbd | `Kbd` | `kbd.jsx` | Keyboard keys |
| ButtonGroup | `ButtonGroup` | `button-group.jsx` | Grouped buttons |
| InputOTP | `InputOTP`, etc. | `input-otp.jsx` | 6-digit input |

---

## Accessing Components

### Direct File Access
All components are in: `/src/components/ui/`

### Import in Pages
```jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

### Theme Access
```jsx
import { useTheme } from "@/context/ThemeContext"

const MyComponent = () => {
  const theme = useTheme()
  return <div style={{ color: theme.colors.foreground }} />
}
```

---

## Feedback & Customization

The showcase is designed to be:
- **Easy to navigate** - Clear sections and labels
- **Complete** - Shows all important variants
- **Interactive** - Components actually work
- **Editable** - Easy to modify showcase examples

Request changes directly through the showcase page!
