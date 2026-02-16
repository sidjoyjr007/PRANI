# Prani Design System & Component Library

## Overview

This is a comprehensive, production-ready component library built with React, Tailwind CSS, and following the design system principles for the Prani project.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Categories](#component-categories)
3. [Usage Examples](#usage-examples)
4. [Component Reference](#component-reference)
5. [Best Practices](#best-practices)

---

## Design Tokens

All design tokens are centralized in `src/lib/design-system.js`. This includes:

### Colors
- **Primary**: Main brand color (Blue-based)
- **Secondary**: Secondary brand color (Purple-based)
- **Semantic Colors**:
  - `success`: Green for successful actions
  - `warning`: Amber for warnings
  - `destructive`: Red for destructive actions
- **Neutral**: Gray scale for neutral elements

Each color has a 10-step scale (50, 100, 200...900) for flexibility.

### Typography
- **Font Families**:
  - `sans`: System default sans-serif (UI text)
  - `serif`: Georgia (body text)
  - `mono`: SFMono or Courier New (code)

- **Font Sizes**: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- **Font Weights**: light (300), normal (400), medium (500), semibold (600), bold (700), extrabold (800)

### Spacing Scale (8px base)
- Follows 8px grid system
- Sizes: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96

### Border Radius
- `none`: 0px
- `xs`: 0.25rem
- `sm`: 0.375rem
- `base`: 0.5rem
- `md`: 0.625rem
- `lg`: 0.75rem
- `xl`: 1rem
- `2xl`: 1.25rem
- `3xl`: 1.5rem
- `full`: 9999px

### Shadows
- **Levels**: xs, sm, base, md, lg, xl, 2xl
- **Elevation**: low, medium, high

### Z-Index Scale
- `hide`: -1
- `base`: 0
- `dropdown`: 1000
- `sticky`: 1020
- `fixed`: 1030
- `backdrop`: 1040
- `offcanvas`: 1050
- `modal`: 1060
- `popover`: 1070
- `tooltip`: 1080

---

## Component Categories

### 1. Form Components

#### Button
```jsx
import { Button } from "@/components/ui/button"

// Variants: primary, secondary, destructive, outline, ghost, link, subtle
// Sizes: xs, sm, md, lg, xl
// States: loading, disabled
<Button variant="primary" size="md">Click Me</Button>
<Button isLoading={true}>Processing...</Button>
```

#### Input
```jsx
import { Input } from "@/components/ui/input"

// Variants: default, outline, ghost
// Sizes: xs, sm, md, lg, xl
<Input placeholder="Enter text" variant="default" size="md" />
<Input error={true} placeholder="Error state" />
```

#### Textarea
```jsx
import { Textarea } from "@/components/ui/textarea"

// Variants: default, outline, ghost
// Sizes: sm, md, lg
<Textarea placeholder="Enter message" maxLength={500} />
```

#### Checkbox
```jsx
import { Checkbox } from "@/components/ui/checkbox"

// Sizes: sm, md, lg
// States: checked, unchecked, indeterminate, disabled
<Checkbox size="md" />
<Checkbox indeterminate={true} />
```

#### Radio Group
```jsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup value="option1" onValueChange={(val) => setOption(val)}>
  <RadioGroupItem value="option1">Option 1</RadioGroupItem>
  <RadioGroupItem value="option2">Option 2</RadioGroupItem>
</RadioGroup>
```

#### Switch
```jsx
import { Switch } from "@/components/ui/switch"

// Variants: default, primary
// Sizes: sm, md, lg
<Switch checked={true} onCheckedChange={(val) => setToggle(val)} />
```

#### Slider
```jsx
import { Slider } from "@/components/ui/slider"

<Slider min={0} max={100} value={50} onValueChange={(val) => setRange(val)} />
```

#### Select
```jsx
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"

<Select value="option1" onValueChange={(val) => setSelected(val)}>
  <SelectTrigger>Select an option</SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Input Group
```jsx
import { InputGroup, InputGroupPrefix, InputGroupInput, InputGroupSuffix } from "@/components/ui/input-group"

<InputGroup>
  <InputGroupPrefix>$</InputGroupPrefix>
  <InputGroupInput placeholder="Amount" />
  <InputGroupSuffix>.00</InputGroupSuffix>
</InputGroup>
```

#### Input OTP
```jsx
import { InputOTP } from "@/components/ui/input-otp"

<InputOTP maxLength={6} onChange={(val) => setOtp(val)} />
```

#### Badge
```jsx
import { Badge } from "@/components/ui/badge"

// Variants: default, primary, secondary, destructive, success, warning, outline, ghost
// Sizes: sm, md, lg
<Badge variant="primary" size="md">New</Badge>
<Badge onRemove={() => remove()}>Removable</Badge>
```

#### Label
```jsx
import { Label } from "@/components/ui/label"

<Label htmlFor="input" required>Email</Label>
```

#### Toggle
```jsx
import { Toggle } from "@/components/ui/toggle"

<Toggle pressed={true} onPressedChange={(val) => setPressed(val)}>
  Bold
</Toggle>
```

#### Toggle Group
```jsx
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup type="multiple" onValueChange={(val) => setSelected(val)}>
  <ToggleGroupItem value="bold">B</ToggleGroupItem>
  <ToggleGroupItem value="italic">I</ToggleGroupItem>
  <ToggleGroupItem value="underline">U</ToggleGroupItem>
</ToggleGroup>
```

### 2. Display Components

#### Card
```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### Alert
```jsx
import { Alert } from "@/components/ui/alert"

// Variants: default, destructive, success, warning, info
<Alert 
  variant="success" 
  title="Success" 
  description="Operation completed"
  onDismiss={() => closeAlert()}
/>
```

#### Badge
See Form Components above.

#### Progress
```jsx
import { Progress } from "@/components/ui/progress"

// Variants: default, success, warning, destructive
<Progress value={75} max={100} label="Loading" />
```

#### Skeleton
```jsx
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"

<Skeleton variant="circular" className="h-12 w-12" />
<SkeletonText lines={3} />
```

#### Spinner
```jsx
import { Spinner } from "@/components/ui/spinner"

// Variants: default, primary, secondary, success, destructive
// Sizes: xs, sm, md, lg, xl
<Spinner variant="primary" size="md" />
```

#### Empty
```jsx
import { Empty } from "@/components/ui/empty"

<Empty 
  title="No data" 
  description="No items found"
  action={<Button>Create New</Button>}
/>
```

#### Avatar
```jsx
import { Avatar, AvatarGroup } from "@/components/ui/avatar"

// Variants: circle, square
// Sizes: xs, sm, md, lg, xl
<Avatar src="url" alt="User" size="md" variant="circle" />
<AvatarGroup max={3}>
  <Avatar src="url1" />
  <Avatar src="url2" />
</AvatarGroup>
```

#### Breadcrumb
```jsx
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

#### Table
```jsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 3. Navigation Components

#### Tabs
```jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Variants: default, bordered, filled, pills, underline
// Sizes: sm, md, lg
<Tabs defaultValue="tab1" variant="default">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

#### Pagination
```jsx
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

#### Button Group
```jsx
import { ButtonGroup, ButtonGroupItem } from "@/components/ui/button-group"

<ButtonGroup>
  <ButtonGroupItem isActive>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>
```

#### Sidebar
```jsx
import { Sidebar, SidebarContent, SidebarItem, SidebarLabel } from "@/components/ui/sidebar"

<Sidebar>
  <SidebarContent>
    <SidebarLabel>Menu</SidebarLabel>
    <SidebarItem active>Dashboard</SidebarItem>
    <SidebarItem>Settings</SidebarItem>
  </SidebarContent>
</Sidebar>
```

### 4. Overlay Components

#### Dialog
```jsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open Dialog</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog content</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

#### Alert Dialog
```jsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger>Delete</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    <AlertDialogCancel>Cancel</AlertDialogCancel>
  </AlertDialogContent>
</AlertDialog>
```

#### Drawer
```jsx
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

// Directions: left, right, top, bottom
<Drawer direction="right">
  <DrawerTrigger>Open Drawer</DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
    </DrawerHeader>
  </DrawerContent>
</Drawer>
```

#### Sheet
```jsx
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"

<Sheet side="right">
  <SheetTrigger>Open Sheet</SheetTrigger>
  <SheetContent>Sheet content</SheetContent>
</Sheet>
```

### 5. Popover Components

#### Popover
```jsx
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger>Open Popover</PopoverTrigger>
  <PopoverContent side="bottom">Popover content</PopoverContent>
</Popover>
```

#### Dropdown
```jsx
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"

<Dropdown>
  <DropdownTrigger>Menu</DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Option 1</DropdownItem>
    <DropdownItem>Option 2</DropdownItem>
    <DropdownSeparator />
    <DropdownItem variant="destructive">Delete</DropdownItem>
  </DropdownContent>
</Dropdown>
```

#### Tooltip
```jsx
import { Tooltip } from "@/components/ui/tooltip"

<Tooltip content="Help text" side="top">
  <button>Hover me</button>
</Tooltip>
```

#### Hover Card
```jsx
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger>Hover here</HoverCardTrigger>
  <HoverCardContent side="bottom">Card content</HoverCardContent>
</HoverCard>
```

### 6. Utility Components

#### Accordion
```jsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

// Variants: default, bordered, flush, gradient
<Accordion type="single" variant="default">
  <AccordionItem value="item1">
    <AccordionTrigger>Item 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item2">
    <AccordionTrigger>Item 2</AccordionTrigger>
    <AccordionContent>Content 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

#### Collapsible
```jsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

<Collapsible open={false}>
  <CollapsibleTrigger>Click to expand</CollapsibleTrigger>
  <CollapsibleContent>Hidden content</CollapsibleContent>
</Collapsible>
```

#### Separator
```jsx
import { Separator } from "@/components/ui/separator"

<Separator orientation="horizontal" />
<Separator orientation="vertical" />
```

#### Aspect Ratio
```jsx
import { AspectRatio } from "@/components/ui/aspect-ratio"

<AspectRatio ratio={16/9}>
  <img src="image.jpg" />
</AspectRatio>
```

#### Scroll Area
```jsx
import { ScrollArea, ScrollAreaViewport } from "@/components/ui/scroll-area"

<ScrollArea className="h-96">
  <div>Long content here</div>
</ScrollArea>
```

#### Field
```jsx
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<Field 
  label="Email" 
  required 
  error={error} 
  hint="Enter your email"
>
  <Input placeholder="you@example.com" />
</Field>
```

#### Kbd
```jsx
import { Kbd } from "@/components/ui/kbd"

<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
```

### 7. Notification Components

#### Toast
```jsx
import { Toast, ToastContainer } from "@/components/ui/toast"

// Variants: default, success, error, warning, info
<ToastContainer position="bottom-right">
  <Toast 
    variant="success" 
    title="Success" 
    description="Operation completed"
    autoClose={true}
    duration={5000}
  />
</ToastContainer>
```

---

## Best Practices

### 1. Consistent Spacing
Always use design system spacing values. Never use arbitrary values.

```jsx
// ✅ Good
<div className="p-4 mb-6">Content</div>

// ❌ Bad
<div className="p-5.5 mb-7">Content</div>
```

### 2. Color Usage
Use semantic color names for meaning. Avoid magic colors.

```jsx
// ✅ Good
<Button variant="destructive">Delete</Button>
<Alert variant="success" />

// ❌ Bad
<Button className="bg-red-500">Delete</Button>
```

### 3. Size Consistency
Use consistent sizes within a context.

```jsx
// ✅ Good - All medium
<Button size="md">Action</Button>
<Input size="md" />
<Badge size="md">New</Badge>

// ❌ Bad - Inconsistent
<Button size="lg">Action</Button>
<Input size="sm" />
<Badge size="md">New</Badge>
```

### 4. Variants for States
Use variants to communicate state and intent.

```jsx
// ✅ Good
<Alert variant="destructive" title="Error" />
<Badge variant="success">Complete</Badge>
<Button variant="outline">Secondary Action</Button>

// ❌ Bad
<div className="bg-red-500">Error</div>
<span className="text-green-500">Complete</span>
```

### 5. Accessibility
Always include proper labels, ARIA attributes, and keyboard navigation.

```jsx
// ✅ Good
<Field label="Name" required>
  <Input id="name" required />
</Field>
<button aria-label="Close">✕</button>

// ❌ Bad
<div>Name</div>
<input />
<button>X</button>
```

### 6. Responsive Design
Use Tailwind's responsive prefixes for mobile-first design.

```jsx
// ✅ Good
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Bad
<div className="grid grid-cols-3">
```

---

## File Organization

```
src/components/ui/
├── accordion.jsx
├── alert-dialog.jsx
├── alert.jsx
├── aspect-ratio.jsx
├── avatar.jsx
├── badge.jsx
├── breadcrumb.jsx
├── button-group.jsx
├── button.jsx
├── card.jsx
├── checkbox.jsx
├── collapsible.jsx
├── dialog.jsx
├── drawer.jsx
├── dropdown.jsx
├── empty.jsx
├── field.jsx
├── hover-card.jsx
├── input-group.jsx
├── input-otp.jsx
├── input.jsx
├── kbd.jsx
├── label.jsx
├── native-select.jsx
├── pagination.jsx
├── popover.jsx
├── progress.jsx
├── radio-group.jsx
├── scroll-area.jsx
├── select.jsx
├── separator.jsx
├── sheet.jsx
├── sidebar.jsx
├── skeleton.jsx
├── slider.jsx
├── spinner.jsx
├── switch.jsx
├── table.jsx
├── tabs.jsx
├── textarea.jsx
├── toast.jsx
├── toggle-group.jsx
├── toggle.jsx
├── tooltip.jsx
└── index.js (main export)

src/lib/
├── design-system.js (design tokens)
└── utils.js
```

---

## Customization

All components support the `className` prop for custom Tailwind classes. You can extend components by:

1. **Overriding styles**: `<Button className="custom-class">Custom Button</Button>`
2. **Using design tokens**: Always reference colors, spacing from design-system.js
3. **Creating component variants**: Extend existing variants in the component file

---

## Version History

- **v1.0.0** (Current) - Initial comprehensive component library with 40+ components
  - All form components
  - All display components
  - All navigation components
  - All overlay components
  - All utility components
  - Comprehensive design system

---

For more details, refer to individual component files. Each component includes:
- TypeScript-ready JSDoc comments
- Props documentation
- Usage examples
- State management examples
- Accessibility notes
