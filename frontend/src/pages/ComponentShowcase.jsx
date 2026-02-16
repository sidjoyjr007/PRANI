import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"

// UI Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Chips } from "@/components/ui/chips"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectSeparator } from "@/components/ui/select"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxSearch, ComboboxItem, ComboboxValue } from "@/components/ui/combobox"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator, DropdownLabel } from "@/components/ui/dropdown"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter } from "@/components/ui/table"
import { Avatar } from "@/components/ui/avatar"
import { Empty } from "@/components/ui/empty"
import { Kbd } from "@/components/ui/kbd"
import { InputOTP } from "@/components/ui/input-otp"
import { NativeSelect } from "@/components/ui/native-select"
import { ButtonGroup, ButtonGroupButton } from "@/components/ui/button-group"
import { StackedList, StackedListItem, StackedListSection } from "@/components/ui/stacked-list"
import { GridList, GridListCard } from "@/components/ui/grid-list"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, InputGroupLabel, InputGroupHelperText } from "@/components/ui/input-group"
import { Dialog, DialogTrigger, DialogPortal, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription, DrawerClose as DrawerCloseButton } from "@/components/ui/drawer"
import { Toast, ToastContainer } from "@/components/ui/toast"

// Icons
import { ChevronRight, Search, Download, AlertCircle, Lock, Eye, EyeOff, Edit, Trash, CheckCircle, X, Copy, Share2, Download as DownloadIcon, MoreVertical, Star, Heart, MessageSquare, Mail, MapPin, DollarSign, Zap, Package, Slash, Dot, ArrowRight } from "lucide-react"

export default function ComponentsShowcasePage() {
  const theme = useTheme()
  const [selectedTab, setSelectedTab] = useState("buttons")
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [progressValue, setProgressValue] = useState(65)
  const [sliderValue, setSliderValue] = useState([50])

  // Component Section Wrapper
  const ComponentSection = ({ title, description, children }) => (
    <Card style={{ marginBottom: theme.spacing[8] }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
          {children}
        </div>
      </CardContent>
    </Card>
  )

  // Variant Group
  const VariantGroup = ({ label, children }) => (
    <div>
      <p style={{ fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>
        {label}
      </p>
      <div style={{ display: "flex", gap: theme.spacing[4], flexWrap: "wrap", alignItems: "center" }}>
        {children}
      </div>
    </div>
  )

  return (
    <Layout>
      <Container>
        {/* Header */}
        <div style={{ marginBottom: theme.spacing[12], paddingTop: theme.spacing[8] }}>
          <h1 style={{ fontSize: theme.typography.fontSize.xl3, fontWeight: theme.typography.fontWeight.bold, marginBottom: theme.spacing[2], color: theme.colors.foreground }}>
            Component Showcase
          </h1>
          <p style={{ fontSize: theme.typography.fontSize.lg, color: theme.colors.muted_foreground, margin: 0 }}>
            All reusable UI components with variants and theming
          </p>
        </div>

        {/* Buttons */}
        <ComponentSection 
          title="Buttons"
          description="Interactive button component with multiple variants and sizes, inspired by Tailwind UI"
        >
          <VariantGroup label="Primary Buttons">
            <Button variant="primary">Primary Button</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Secondary Buttons">
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Soft Buttons">
            <Button variant="soft">Soft Button</Button>
            <Button variant="soft" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Outline Buttons">
            <Button variant="outline">Outline Button</Button>
            <Button variant="outline" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Ghost Buttons">
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="ghost" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Link Buttons">
            <Button variant="link">Link Button</Button>
            <Button variant="link" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Destructive Buttons">
            <Button variant="destructive">Delete</Button>
            <Button variant="destructive" disabled>Disabled</Button>
          </VariantGroup>

          <VariantGroup label="Sizes">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
          </VariantGroup>

          <VariantGroup label="With Leading Icon">
            <Button variant="primary" leadingIcon={Download}>Download</Button>
            <Button variant="secondary" leadingIcon={Download}>Download</Button>
            <Button variant="outline" leadingIcon={Download}>Download</Button>
          </VariantGroup>

          <VariantGroup label="With Trailing Icon">
            <Button variant="primary" trailingIcon={CheckCircle}>Save Changes</Button>
            <Button variant="secondary" trailingIcon={X}>Cancel</Button>
            <Button variant="destructive" trailingIcon={Trash}>Delete</Button>
          </VariantGroup>
        </ComponentSection>

        {/* Badges */}
        <ComponentSection 
          title="Badges"
          description="Small labels for status or categorization, inspired by Tailwind UI"
        >
          <VariantGroup label="Flat (Filled) Badges">
            <Badge variant="flat" color="primary">Primary</Badge>
            <Badge variant="flat" color="secondary">Secondary</Badge>
            <Badge variant="flat" color="success">Success</Badge>
            <Badge variant="flat" color="warning">Warning</Badge>
            <Badge variant="flat" color="destructive">Destructive</Badge>
          </VariantGroup>

          <VariantGroup label="Outline Badges">
            <Badge variant="outline" color="primary">Primary</Badge>
            <Badge variant="outline" color="secondary">Secondary</Badge>
            <Badge variant="outline" color="success">Success</Badge>
            <Badge variant="outline" color="warning">Warning</Badge>
            <Badge variant="outline" color="destructive">Destructive</Badge>
          </VariantGroup>

          <VariantGroup label="With Status Dot">
            <Badge variant="flat" color="primary" dot>Active</Badge>
            <Badge variant="flat" color="success" dot>Completed</Badge>
            <Badge variant="outline" color="warning" dot>Pending</Badge>
            <Badge variant="outline" color="destructive" dot>Error</Badge>
          </VariantGroup>

          <VariantGroup label="Pill Badges">
            <Badge variant="flat" color="primary" pill>Primary</Badge>
            <Badge variant="outline" color="secondary" pill>Secondary</Badge>
            <Badge variant="flat" color="success" pill dot>Active</Badge>
          </VariantGroup>

          <VariantGroup label="Sizes">
            <Badge variant="flat" color="primary" size="sm">Small</Badge>
            <Badge variant="flat" color="primary" size="md">Medium</Badge>
            <Badge variant="flat" color="primary" size="lg">Large</Badge>
          </VariantGroup>

          <VariantGroup label="Removable Badges">
            <Badge variant="flat" color="primary" onRemove={() => {}}>Removable</Badge>
            <Badge variant="outline" color="secondary" onRemove={() => {}}>Removable</Badge>
            <Badge variant="flat" color="success" dot onRemove={() => {}}>Active</Badge>
          </VariantGroup>
        </ComponentSection>

        {/* Chips */}
        <ComponentSection 
          title="Chips"
          description="Small compact elements with remove capability"
        >
          <VariantGroup label="Variants">
            <Chips items={[
              { id: 1, label: "Primary" }
            ]} variant="default" size="md" />
            <Chips items={[
              { id: 1, label: "Secondary" }
            ]} variant="secondary" size="md" />
            <Chips items={[
              { id: 1, label: "Success" }
            ]} variant="success" size="md" />
            <Chips items={[
              { id: 1, label: "Warning" }
            ]} variant="warning" size="md" />
            <Chips items={[
              { id: 1, label: "Destructive" }
            ]} variant="destructive" size="md" />
          </VariantGroup>

          <VariantGroup label="Sizes">
            <Chips items={[{ id: 1, label: "Small" }]} variant="default" size="sm" />
            <Chips items={[{ id: 1, label: "Medium" }]} variant="default" size="md" />
            <Chips items={[{ id: 1, label: "Large" }]} variant="default" size="lg" />
          </VariantGroup>

          <VariantGroup label="With Remove">
            <Chips 
              items={[
                { id: 1, label: "Removable" },
                { id: 2, label: "Tag" }
              ]} 
              variant="default" 
              size="md" 
              onRemove={(id) => console.log("Removed:", id)}
            />
          </VariantGroup>
        </ComponentSection>

        {/* Input */}
        <ComponentSection 
          title="Inputs"
          description="Text input field with labels, icons, helper text, and error states"
        >
          <VariantGroup label="Basic Input">
            <Input placeholder="Enter text..." style={{ width: "300px" }} />
          </VariantGroup>

          <VariantGroup label="With Label">
            <Input 
              label="Email Address" 
              placeholder="you@example.com" 
              style={{ width: "300px" }} 
            />
          </VariantGroup>

          <VariantGroup label="With Helper Text">
            <Input 
              label="Password" 
              type="password"
              placeholder="••••••••" 
              helperText="Must be at least 8 characters"
              style={{ width: "300px" }} 
            />
          </VariantGroup>

          <VariantGroup label="With Error State">
            <Input 
              label="Username" 
              placeholder="username"
              error={true}
              helperText="Username already taken"
              style={{ width: "300px" }} 
            />
          </VariantGroup>

          <VariantGroup label="Disabled State">
            <Input 
              label="Disabled Field" 
              placeholder="Cannot edit"
              disabled={true}
              style={{ width: "300px" }} 
            />
          </VariantGroup>

          <VariantGroup label="With Icons">
            <Input 
              label="Search" 
              placeholder="Search..." 
              leadingIcon={Search}
              style={{ width: "300px" }} 
            />
            <Input 
              label="Password" 
              placeholder="Enter password"
              type="password"
              trailingIcon={Lock}
              style={{ width: "300px" }} 
            />
          </VariantGroup>
        </ComponentSection>

        {/* Input Groups */}
        <ComponentSection 
          title="Input Groups"
          description="Input fields with addons, buttons, and labels"
        >
          <VariantGroup title="With Leading Addon">
            <InputGroup layout="vertical" size="md">
              <InputGroupLabel htmlFor="domain">Domain</InputGroupLabel>
              <InputGroup layout="horizontal">
                <InputGroupAddon position="leading" size="md">
                  https://
                </InputGroupAddon>
                <InputGroupInput 
                  id="domain"
                  size="md" 
                  hasLeading={true}
                  placeholder="example.com"
                />
              </InputGroup>
            </InputGroup>
          </VariantGroup>

          <VariantGroup title="With Trailing Button">
            <InputGroup layout="vertical" size="md">
              <InputGroupLabel htmlFor="email">Email Subscription</InputGroupLabel>
              <InputGroup layout="horizontal">
                <InputGroupInput 
                  id="email"
                  size="md" 
                  hasTrailing={true}
                  placeholder="Enter your email"
                />
                <InputGroupButton size="md" position="trailing" variant="primary">
                  Subscribe
                </InputGroupButton>
              </InputGroup>
            </InputGroup>
          </VariantGroup>

          <VariantGroup title="With Leading and Trailing Addons">
            <InputGroup layout="vertical" size="md">
              <InputGroupLabel htmlFor="amount">Amount</InputGroupLabel>
              <InputGroup layout="horizontal">
                <InputGroupAddon position="leading" size="md">
                  <DollarSign size={16} />
                </InputGroupAddon>
                <InputGroupInput 
                  id="amount"
                  size="md" 
                  hasLeading={true}
                  hasTrailing={true}
                  placeholder="0.00"
                  type="number"
                />
                <InputGroupAddon position="trailing" size="md">
                  USD
                </InputGroupAddon>
              </InputGroup>
            </InputGroup>
          </VariantGroup>

          <VariantGroup title="With Helper Text">
            <InputGroup layout="vertical" size="md">
              <InputGroupLabel htmlFor="url">Website URL</InputGroupLabel>
              <InputGroup layout="horizontal">
                <InputGroupAddon position="leading" size="md">
                  https://
                </InputGroupAddon>
                <InputGroupInput 
                  id="url"
                  size="md" 
                  hasLeading={true}
                  placeholder="example.com"
                />
              </InputGroup>
              <InputGroupHelperText>
                Enter your website URL without protocol
              </InputGroupHelperText>
            </InputGroup>
          </VariantGroup>

          <VariantGroup title="With Error State">
            <InputGroup layout="vertical" size="md">
              <InputGroupLabel htmlFor="phone">Phone Number</InputGroupLabel>
              <InputGroup layout="horizontal">
                <InputGroupAddon position="leading" size="md">
                  +1
                </InputGroupAddon>
                <InputGroupInput 
                  id="phone"
                  size="md" 
                  hasLeading={true}
                  placeholder="(555) 000-0000"
                  error={true}
                />
              </InputGroup>
              <InputGroupHelperText error={true}>
                Please enter a valid phone number
              </InputGroupHelperText>
            </InputGroup>
          </VariantGroup>

          <VariantGroup title="Search Input">
            <InputGroup layout="vertical" size="md">
              <InputGroupLabel htmlFor="search">Search</InputGroupLabel>
              <InputGroup layout="horizontal">
                <InputGroupButton size="md" position="leading" variant="secondary">
                  <Search size={16} />
                </InputGroupButton>
                <InputGroupInput 
                  id="search"
                  size="md" 
                  hasLeading={true}
                  placeholder="Search..."
                />
              </InputGroup>
            </InputGroup>
          </VariantGroup>

          <VariantGroup title="Multiple Inputs">
            <div style={{ display: "flex", gap: theme.spacing[8], flexWrap: "wrap" }}>
              <InputGroup layout="vertical" size="md">
                <InputGroupLabel htmlFor="price">Price</InputGroupLabel>
                <InputGroup layout="horizontal">
                  <InputGroupAddon position="leading" size="md">$</InputGroupAddon>
                  <InputGroupInput id="price" size="md" hasLeading={true} placeholder="0.00" />
                </InputGroup>
              </InputGroup>
              <InputGroup layout="vertical" size="md">
                <InputGroupLabel htmlFor="discount">Discount</InputGroupLabel>
                <InputGroup layout="horizontal">
                  <InputGroupInput id="discount" size="md" hasTrailing={true} placeholder="0" />
                  <InputGroupAddon position="trailing" size="md">%</InputGroupAddon>
                </InputGroup>
              </InputGroup>
            </div>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <InputGroup layout="horizontal">
                  <InputGroupAddon position="leading" size="sm">@</InputGroupAddon>
                  <InputGroupInput size="sm" hasLeading={true} placeholder="username" />
                </InputGroup>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <InputGroup layout="horizontal">
                  <InputGroupAddon position="leading" size="md">@</InputGroupAddon>
                  <InputGroupInput size="md" hasLeading={true} placeholder="username" />
                </InputGroup>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <InputGroup layout="horizontal">
                  <InputGroupAddon position="leading" size="lg">@</InputGroupAddon>
                  <InputGroupInput size="lg" hasLeading={true} placeholder="username" />
                </InputGroup>
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Textarea */}
        <ComponentSection 
          title="Textarea"
          description="Multi-line text input, inspired by Tailwind UI"
        >
          <VariantGroup title="Default Variant">
            <Textarea 
              variant="default"
              placeholder="Enter your message..." 
              style={{ width: "100%", maxWidth: "500px" }} 
            />
          </VariantGroup>

          <VariantGroup title="Outline Variant">
            <Textarea 
              variant="outline"
              placeholder="Enter your message..." 
              style={{ width: "100%", maxWidth: "500px" }} 
            />
          </VariantGroup>

          <VariantGroup title="Minimal Variant">
            <Textarea 
              variant="minimal"
              placeholder="Enter your message..." 
              rows={3}
              style={{ width: "100%", maxWidth: "500px" }} 
            />
          </VariantGroup>

          <VariantGroup title="Filled Variant">
            <Textarea 
              variant="filled"
              placeholder="Enter your message..." 
              style={{ width: "100%", maxWidth: "500px" }} 
            />
          </VariantGroup>

          <VariantGroup title="With Label & Helper Text">
            <Textarea 
              label="Comments" 
              placeholder="Share your feedback..."
              helperText="Provide as much detail as possible"
              style={{ width: "100%", maxWidth: "500px" }}
            />
          </VariantGroup>

          <VariantGroup title="With Character Count">
            <Textarea 
              label="Bio" 
              placeholder="Tell us about yourself..."
              maxLength={200}
              showCharCount={true}
              helperText="Maximum 200 characters"
              style={{ width: "100%", maxWidth: "500px" }}
            />
          </VariantGroup>

          <VariantGroup title="With Avatar">
            <Textarea 
              label="Write a comment"
              placeholder="Share your thoughts..."
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop"
              style={{ width: "100%", maxWidth: "500px" }}
            />
          </VariantGroup>

          <VariantGroup title="Error State">
            <Textarea 
              label="Error Field"
              placeholder="This field has an error"
              error={true}
              helperText="This is an error message"
              style={{ width: "100%", maxWidth: "500px" }}
            />
          </VariantGroup>

          <VariantGroup title="Disabled State">
            <Textarea 
              label="Disabled"
              placeholder="Cannot edit"
              disabled={true}
              style={{ width: "100%", maxWidth: "500px" }}
            />
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Textarea 
                  size="sm" 
                  placeholder="Small textarea" 
                  rows={3}
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <Textarea 
                  size="md" 
                  placeholder="Medium textarea" 
                  rows={3}
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Textarea 
                  size="lg" 
                  placeholder="Large textarea" 
                  rows={3}
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Select */}
        <ComponentSection 
          title="Select"
          description="Dropdown selection component, inspired by Tailwind UI"
        >
          <VariantGroup title="Default Variant">
            <Select style={{ width: "250px" }} variant="default">
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="Outline Variant">
            <Select style={{ width: "250px" }} variant="outline">
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="Minimal Variant">
            <Select style={{ width: "250px" }} variant="minimal">
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="Filled Variant">
            <Select style={{ width: "250px" }} variant="filled">
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
                <SelectItem value="option3">Option 3</SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="With Avatars & Status">
            <Select style={{ width: "280px" }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  value="alice" 
                  avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop"
                  status="online"
                >
                  Alice Johnson
                </SelectItem>
                <SelectItem 
                  value="bob" 
                  avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop"
                  status="away"
                >
                  Bob Smith
                </SelectItem>
                <SelectItem 
                  value="carol" 
                  avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop"
                  status="offline"
                >
                  Carol Davis
                </SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="With Descriptions">
            <Select style={{ width: "300px" }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter" description="Best for small projects">
                  Starter
                </SelectItem>
                <SelectItem value="professional" description="For growing teams">
                  Professional
                </SelectItem>
                <SelectItem value="enterprise" description="Full featured solution">
                  Enterprise
                </SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="Check on Left">
            <Select style={{ width: "250px" }}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low" checkPosition="left">Low</SelectItem>
                <SelectItem value="medium" checkPosition="left">Medium</SelectItem>
                <SelectItem value="high" checkPosition="left">High</SelectItem>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="With Groups & Icons">
            <Select style={{ width: "280px" }}>
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup label="Frontend">
                  <SelectItem value="react" leadingIcon={CheckCircle}>React</SelectItem>
                  <SelectItem value="vue" leadingIcon={CheckCircle}>Vue</SelectItem>
                  <SelectItem value="angular" leadingIcon={CheckCircle}>Angular</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup label="Backend">
                  <SelectItem value="nodejs" leadingIcon={CheckCircle}>Node.js</SelectItem>
                  <SelectItem value="python" leadingIcon={CheckCircle}>Python</SelectItem>
                  <SelectItem value="go" leadingIcon={CheckCircle}>Go</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Select style={{ width: "200px" }}>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Small" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm1">Option 1</SelectItem>
                    <SelectItem value="sm2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <Select style={{ width: "200px" }}>
                  <SelectTrigger size="md">
                    <SelectValue placeholder="Medium" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="md1">Option 1</SelectItem>
                    <SelectItem value="md2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Select style={{ width: "200px" }}>
                  <SelectTrigger size="lg">
                    <SelectValue placeholder="Large" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lg1">Option 1</SelectItem>
                    <SelectItem value="lg2">Option 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Combobox */}
        <ComponentSection 
          title="Combobox"
          description="Searchable dropdown with filtering, inspired by Tailwind UI"
        >
          <VariantGroup title="Simple Combobox">
            <Combobox style={{ width: "300px" }}>
              <ComboboxTrigger>
                <ComboboxValue placeholder="Select an option" />
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxSearch placeholder="Search..." />
                <ComboboxItem value="option1">Option 1</ComboboxItem>
                <ComboboxItem value="option2">Option 2</ComboboxItem>
                <ComboboxItem value="option3">Option 3</ComboboxItem>
              </ComboboxContent>
            </Combobox>
          </VariantGroup>

          <VariantGroup title="With Descriptions">
            <Combobox style={{ width: "350px" }}>
              <ComboboxTrigger>
                <ComboboxValue placeholder="Select a plan" />
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxSearch placeholder="Search plans..." />
                <ComboboxItem 
                  value="starter" 
                  description="Perfect for getting started"
                >
                  Starter Plan
                </ComboboxItem>
                <ComboboxItem 
                  value="pro" 
                  description="For growing teams"
                >
                  Professional Plan
                </ComboboxItem>
                <ComboboxItem 
                  value="enterprise" 
                  description="Full-featured solution"
                >
                  Enterprise Plan
                </ComboboxItem>
              </ComboboxContent>
            </Combobox>
          </VariantGroup>

          <VariantGroup title="With Avatars & Status">
            <Combobox style={{ width: "350px" }}>
              <ComboboxTrigger>
                <ComboboxValue placeholder="Select a team member" />
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxSearch placeholder="Search members..." />
                <ComboboxItem 
                  value="alice" 
                  avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop"
                  status="online"
                >
                  Alice Johnson
                </ComboboxItem>
                <ComboboxItem 
                  value="bob" 
                  avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop"
                  status="away"
                >
                  Bob Smith
                </ComboboxItem>
                <ComboboxItem 
                  value="carol" 
                  avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop"
                  status="offline"
                >
                  Carol Davis
                </ComboboxItem>
              </ComboboxContent>
            </Combobox>
          </VariantGroup>

          <VariantGroup title="With Secondary Text">
            <Combobox style={{ width: "350px" }}>
              <ComboboxTrigger>
                <ComboboxValue placeholder="Select a country" />
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxSearch placeholder="Search countries..." />
                <ComboboxItem 
                  value="us" 
                  description="United States"
                >
                  🇺🇸 USA
                </ComboboxItem>
                <ComboboxItem 
                  value="uk" 
                  description="United Kingdom"
                >
                  🇬🇧 UK
                </ComboboxItem>
                <ComboboxItem 
                  value="ca" 
                  description="Canada"
                >
                  🇨🇦 Canada
                </ComboboxItem>
                <ComboboxItem 
                  value="au" 
                  description="Australia"
                >
                  🇦🇺 Australia
                </ComboboxItem>
              </ComboboxContent>
            </Combobox>
          </VariantGroup>

          <VariantGroup title="Variants">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Default</p>
                <Combobox style={{ width: "300px" }} variant="default">
                  <ComboboxTrigger variant="default">
                    <ComboboxValue placeholder="Default variant" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="opt1">Option 1</ComboboxItem>
                    <ComboboxItem value="opt2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Outline</p>
                <Combobox style={{ width: "300px" }} variant="outline">
                  <ComboboxTrigger variant="outline">
                    <ComboboxValue placeholder="Outline variant" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="opt1">Option 1</ComboboxItem>
                    <ComboboxItem value="opt2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Minimal</p>
                <Combobox style={{ width: "300px" }} variant="minimal">
                  <ComboboxTrigger variant="minimal">
                    <ComboboxValue placeholder="Minimal variant" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="opt1">Option 1</ComboboxItem>
                    <ComboboxItem value="opt2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Filled</p>
                <Combobox style={{ width: "300px" }} variant="filled">
                  <ComboboxTrigger variant="filled">
                    <ComboboxValue placeholder="Filled variant" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="opt1">Option 1</ComboboxItem>
                    <ComboboxItem value="opt2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Combobox style={{ width: "250px" }} size="sm">
                  <ComboboxTrigger size="sm">
                    <ComboboxValue placeholder="Small" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="sm1">Option 1</ComboboxItem>
                    <ComboboxItem value="sm2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <Combobox style={{ width: "280px" }} size="md">
                  <ComboboxTrigger size="md">
                    <ComboboxValue placeholder="Medium" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="md1">Option 1</ComboboxItem>
                    <ComboboxItem value="md2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Combobox style={{ width: "300px" }} size="lg">
                  <ComboboxTrigger size="lg">
                    <ComboboxValue placeholder="Large" />
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch />
                    <ComboboxItem value="lg1">Option 1</ComboboxItem>
                    <ComboboxItem value="lg2">Option 2</ComboboxItem>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Checkbox */}
        <ComponentSection 
          title="Checkbox"
          description="Multi-selection input, inspired by Tailwind UI"
        >
          <VariantGroup title="Default Variant">
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Checkbox size="md" defaultChecked variant="default" />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Default checkbox</span>
            </div>
          </VariantGroup>

          <VariantGroup title="Outline Variant">
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Checkbox size="md" defaultChecked variant="outline" />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Outline checkbox</span>
            </div>
          </VariantGroup>

          <VariantGroup title="Minimal Variant">
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Checkbox size="md" defaultChecked variant="minimal" />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Minimal checkbox</span>
            </div>
          </VariantGroup>

          <VariantGroup title="With Labels">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Checkbox label="Enable notifications" variant="default" defaultChecked />
              <Checkbox label="Subscribe to newsletter" variant="default" />
              <Checkbox label="Accept terms and conditions" variant="default" />
            </div>
          </VariantGroup>

          <VariantGroup title="With Descriptions">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Checkbox 
                label="Email notifications"
                description="Get notified about important updates"
                variant="default"
                defaultChecked
              />
              <Checkbox 
                label="SMS alerts"
                description="Receive critical alerts via text message"
                variant="default"
              />
              <Checkbox 
                label="Push notifications"
                description="Get real-time notifications on your device"
                variant="default"
              />
            </div>
          </VariantGroup>

          <VariantGroup title="Card Variant">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Checkbox 
                label="Free Plan"
                description="Perfect for getting started with basic features"
                variant="card"
                defaultChecked
              />
              <Checkbox 
                label="Pro Plan"
                description="Advanced features for growing teams"
                variant="card"
              />
              <Checkbox 
                label="Enterprise Plan"
                description="Full-featured solution for large organizations"
                variant="card"
              />
            </div>
          </VariantGroup>

          <VariantGroup title="Checkbox on Right">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Checkbox 
                label="I agree to the terms"
                checkboxPosition="right"
                variant="default"
              />
              <Checkbox 
                label="I want to receive updates"
                checkboxPosition="right"
                variant="default"
              />
              <Checkbox 
                label="Save my preferences"
                checkboxPosition="right"
                variant="default"
              />
            </div>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                  <Checkbox label="Small option 1" size="sm" />
                  <Checkbox label="Small option 2" size="sm" defaultChecked />
                </div>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                  <Checkbox label="Medium option 1" size="md" />
                  <Checkbox label="Medium option 2" size="md" defaultChecked />
                </div>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                  <Checkbox label="Large option 1" size="lg" />
                  <Checkbox label="Large option 2" size="lg" defaultChecked />
                </div>
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="States">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Checkbox label="Checked" defaultChecked variant="default" />
              <Checkbox label="Unchecked" variant="default" />
              <Checkbox label="Disabled" disabled variant="default" />
              <Checkbox label="Disabled & Checked" disabled defaultChecked variant="default" />
              <Checkbox label="Indeterminate" indeterminate variant="default" />
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Switch */}
        <ComponentSection 
          title="Switch"
          description="Toggle boolean value"
        >
          <VariantGroup label="Sizes">
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Switch size="sm" />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Small</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Switch size="md" />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Medium</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Switch size="lg" />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Large</span>
            </div>
          </VariantGroup>

          <VariantGroup label="States">
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Switch checked={switchChecked} onCheckedChange={setSwitchChecked} />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Interactive</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
              <Switch disabled />
              <span style={{ fontSize: theme.typography.fontSize.sm }}>Disabled</span>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Toggle */}
        <ComponentSection 
          title="Toggle"
          description="On/off switch component, inspired by Tailwind UI"
        >
          <VariantGroup title="Simple Toggle">
            <Toggle defaultPressed label="Enable notifications" />
          </VariantGroup>

          <VariantGroup title="Short Toggle">
            <Toggle size="sm" defaultPressed label="Active" />
          </VariantGroup>

          <VariantGroup title="With Labels">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <Toggle label="Enable dark mode" />
              <Toggle label="Subscribe to updates" defaultPressed />
              <Toggle label="Save preferences" disabled />
            </div>
          </VariantGroup>

          <VariantGroup title="With Descriptions">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <Toggle 
                label="Email notifications"
                description="Get notified about important updates"
                defaultPressed
              />
              <Toggle 
                label="SMS alerts"
                description="Receive critical alerts via text message"
              />
              <Toggle 
                label="Push notifications"
                description="Get real-time notifications on your device"
              />
            </div>
          </VariantGroup>

          <VariantGroup title="Label on Left">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Toggle 
                label="Dark mode"
                labelPosition="left"
                defaultPressed
              />
              <Toggle 
                label="Notifications"
                labelPosition="left"
              />
              <Toggle 
                label="Auto-save"
                labelPosition="left"
              />
            </div>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Toggle size="sm" label="Small toggle" defaultPressed />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <Toggle size="md" label="Medium toggle" defaultPressed />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Toggle size="lg" label="Large toggle" defaultPressed />
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="States">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <Toggle label="Enabled" defaultPressed />
              <Toggle label="Disabled (Off)" disabled />
              <Toggle label="Disabled (On)" defaultPressed disabled />
            </div>
          </VariantGroup>

          <VariantGroup title="Icon Toggles">
            <div style={{ display: "flex", gap: theme.spacing[4], alignItems: "center" }}>
              <Toggle isIcon size="md" defaultPressed><Eye size={18} /></Toggle>
              <Toggle isIcon size="md"><Edit size={18} /></Toggle>
              <Toggle isIcon size="md"><Trash size={18} /></Toggle>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Radio Group */}
        <ComponentSection 
          title="Radio Group"
          description="Single selection from multiple options, inspired by Tailwind UI"
        >
          <VariantGroup title="Default Variant - Vertical">
            <RadioGroup layout="vertical" variant="default">
              <RadioGroupItem value="option1" label="Option 1" />
              <RadioGroupItem value="option2" label="Option 2" />
              <RadioGroupItem value="option3" label="Option 3" />
            </RadioGroup>
          </VariantGroup>

          <VariantGroup title="Default Variant - Inline">
            <RadioGroup layout="inline" variant="default">
              <RadioGroupItem value="yes" label="Yes" />
              <RadioGroupItem value="no" label="No" />
              <RadioGroupItem value="maybe" label="Maybe" />
            </RadioGroup>
          </VariantGroup>

          <VariantGroup title="With Descriptions">
            <RadioGroup layout="vertical" variant="default">
              <RadioGroupItem 
                value="plan1" 
                label="Starter Plan"
                description="Perfect for individuals and small projects"
              />
              <RadioGroupItem 
                value="plan2" 
                label="Professional Plan"
                description="For teams and growing businesses"
              />
              <RadioGroupItem 
                value="plan3" 
                label="Enterprise Plan"
                description="Full-featured solution for large organizations"
              />
            </RadioGroup>
          </VariantGroup>

          <VariantGroup title="Card Variant">
            <RadioGroup layout="vertical" variant="card">
              <RadioGroupItem 
                value="card1" 
                label="Option 1"
                description="This is a card-styled option"
              />
              <RadioGroupItem 
                value="card2" 
                label="Option 2"
                description="Another card-styled option"
              />
              <RadioGroupItem 
                value="card3" 
                label="Option 3"
                description="Third card-styled option"
              />
            </RadioGroup>
          </VariantGroup>

          <VariantGroup title="Minimal Variant">
            <RadioGroup layout="vertical" variant="minimal">
              <RadioGroupItem value="min1" label="Option 1" />
              <RadioGroupItem value="min2" label="Option 2" />
              <RadioGroupItem value="min3" label="Option 3" />
            </RadioGroup>
          </VariantGroup>

          <VariantGroup title="Radio on Right">
            <RadioGroup layout="vertical" variant="default">
              <RadioGroupItem 
                value="right1" 
                label="Select this option"
                radioPosition="right"
              />
              <RadioGroupItem 
                value="right2" 
                label="Or select this one"
                radioPosition="right"
              />
              <RadioGroupItem 
                value="right3" 
                label="Or this option"
                radioPosition="right"
              />
            </RadioGroup>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <RadioGroup layout="vertical" variant="default" size="sm">
                  <RadioGroupItem value="sm1" label="Small option 1" />
                  <RadioGroupItem value="sm2" label="Small option 2" />
                </RadioGroup>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <RadioGroup layout="vertical" variant="default" size="md">
                  <RadioGroupItem value="md1" label="Medium option 1" />
                  <RadioGroupItem value="md2" label="Medium option 2" />
                </RadioGroup>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <RadioGroup layout="vertical" variant="default" size="lg">
                  <RadioGroupItem value="lg1" label="Large option 1" />
                  <RadioGroupItem value="lg2" label="Large option 2" />
                </RadioGroup>
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="Disabled State">
            <RadioGroup layout="vertical" variant="default" disabled>
              <RadioGroupItem value="dis1" label="Disabled option 1" />
              <RadioGroupItem value="dis2" label="Disabled option 2" />
              <RadioGroupItem value="dis3" label="Disabled option 3" />
            </RadioGroup>
          </VariantGroup>
        </ComponentSection>

        {/* Progress */}
        <ComponentSection 
          title="Progress"
          description="Progress bar indicator"
        >
          <VariantGroup label="Sizes">
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing[2], color: theme.colors.muted_foreground }}>Extra Small</p>
              <Progress size="xs" value={progressValue} max={100} />
            </div>
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing[2], color: theme.colors.muted_foreground }}>Small</p>
              <Progress size="sm" value={progressValue} max={100} />
            </div>
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing[2], color: theme.colors.muted_foreground }}>Medium</p>
              <Progress size="md" value={progressValue} max={100} />
            </div>
            <div style={{ width: "100%" }}>
              <p style={{ fontSize: theme.typography.fontSize.xs, marginBottom: theme.spacing[2], color: theme.colors.muted_foreground }}>Large</p>
              <Progress size="lg" value={progressValue} max={100} />
            </div>
          </VariantGroup>

          <VariantGroup label="Variants with Label">
            <div style={{ width: "100%" }}>
              <Progress size="md" variant="success" value={100} max={100} showLabel />
            </div>
            <div style={{ width: "100%" }}>
              <Progress size="md" variant="warning" value={50} max={100} showLabel />
            </div>
            <div style={{ width: "100%" }}>
              <Progress size="md" variant="destructive" value={25} max={100} showLabel />
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Spinner */}
        <ComponentSection 
          title="Spinner"
          description="Loading indicator"
        >
          <VariantGroup label="Variants">
            <Spinner variant="primary" size="md" />
            <Spinner variant="secondary" size="md" />
            <Spinner variant="success" size="md" />
            <Spinner variant="destructive" size="md" />
          </VariantGroup>

          <VariantGroup label="Sizes">
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </VariantGroup>
        </ComponentSection>

        {/* Skeleton */}
        <ComponentSection 
          title="Skeleton"
          description="Loading placeholder"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
            <Skeleton style={{ height: "20px" }} />
            <Skeleton style={{ height: "40px" }} />
            <div style={{ display: "flex", gap: theme.spacing[4] }}>
              <Skeleton style={{ width: "100px", height: "100px", borderRadius: theme.borderRadius.md }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                <Skeleton style={{ height: "20px" }} />
                <Skeleton style={{ height: "20px", width: "80%" }} />
              </div>
            </div>
          </div>
        </ComponentSection>

        {/* Alert */}
        <ComponentSection 
          title="Alert"
          description="Alert messages with multiple variants and styles"
        >
          <VariantGroup label="Default Variant">
            <Alert variant="default" status="default" title="Information" description="This is an informational message." />
            <Alert variant="default" status="success" title="Success!" description="Your operation completed successfully." />
            <Alert variant="default" status="warning" title="Warning" description="Please review this important notice." />
            <Alert variant="default" status="destructive" title="Error" description="Something went wrong. Please try again." />
          </VariantGroup>

          <VariantGroup label="Outline Variant">
            <Alert variant="outline" status="default" title="Info Notice" description="Border-only alert style." />
            <Alert variant="outline" status="success" title="Confirmed" description="Your changes have been saved." />
            <Alert variant="outline" status="warning" title="Attention" description="This action requires confirmation." />
            <Alert variant="outline" status="destructive" title="Error Occurred" description="Please fix the highlighted fields." />
          </VariantGroup>

          <VariantGroup label="Filled Variant">
            <Alert variant="filled" status="default" title="Notification" description="You have a new message waiting." />
            <Alert variant="filled" status="success" title="Complete" description="All tasks have been completed." />
            <Alert variant="filled" status="warning" title="Check Required" description="Please verify your email address." />
            <Alert variant="filled" status="destructive" title="Failed" description="The request could not be processed." />
          </VariantGroup>

          <VariantGroup label="Subtle Variant">
            <Alert variant="subtle" status="default" title="Hint" description="Click here for more information." />
            <Alert variant="subtle" status="success" title="Great!" description="Everything is working as expected." />
            <Alert variant="subtle" status="warning" title="FYI" description="This feature will be updated soon." />
            <Alert variant="subtle" status="destructive" title="Oops" description="That didn't work. Let's try again." />
          </VariantGroup>

          <VariantGroup label="Accent Border">
            <Alert variant="accent" status="default" title="New Feature" description="Check out our latest updates and improvements." />
            <Alert variant="accent" status="success" title="Payment Confirmed" description="Your payment has been processed successfully." />
            <Alert variant="accent" status="warning" title="Expiring Soon" description="Your subscription will expire in 7 days." />
            <Alert variant="accent" status="destructive" title="Account Issue" description="Your account requires immediate attention." />
          </VariantGroup>

          <VariantGroup label="With Actions">
            <Alert 
              variant="default" 
              status="warning" 
              title="Update Available" 
              description="A new version is ready to download."
              action={
                <button style={{
                  backgroundColor: theme.colors.warning[600],
                  color: "white",
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  borderRadius: theme.borderRadius.md,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: theme.typography.fontWeight.medium,
                  fontSize: theme.typography.fontSize.sm,
                  transition: `background-color ${theme.transitions.normal}`,
                }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.warning[700]} onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.warning[600]}>
                  Update Now
                </button>
              }
            />
            <Alert 
              variant="outline" 
              status="success" 
              title="Changes Saved" 
              description="Your document has been saved to the cloud."
              action={
                <button style={{
                  backgroundColor: theme.colors.success[600],
                  color: "white",
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  borderRadius: theme.borderRadius.md,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: theme.typography.fontWeight.medium,
                  fontSize: theme.typography.fontSize.sm,
                  transition: `background-color ${theme.transitions.normal}`,
                }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.success[700]} onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.success[600]}>
                  View
                </button>
              }
            />
          </VariantGroup>

          <VariantGroup label="With List">
            <Alert variant="default" status="destructive" title="Validation Errors" showIcon={true}>
              <ul style={{ margin: `${theme.spacing[2]} 0 0 ${theme.spacing[4]}`, paddingLeft: 0 }}>
                <li style={{ marginBottom: theme.spacing[1], color: theme.colors.neutral[700] }}>Email address is required</li>
                <li style={{ marginBottom: theme.spacing[1], color: theme.colors.neutral[700] }}>Password must be at least 8 characters</li>
                <li style={{ color: theme.colors.neutral[700] }}>Please accept the terms and conditions</li>
              </ul>
            </Alert>
            <Alert variant="accent" status="success" title="Setup Complete">
              <ul style={{ margin: `${theme.spacing[2]} 0 0 ${theme.spacing[4]}`, paddingLeft: 0 }}>
                <li style={{ marginBottom: theme.spacing[1], color: theme.colors.neutral[700] }}>✓ Account created</li>
                <li style={{ marginBottom: theme.spacing[1], color: theme.colors.neutral[700] }}>✓ Profile configured</li>
                <li style={{ color: theme.colors.neutral[700] }}>✓ Ready to use</li>
              </ul>
            </Alert>
          </VariantGroup>

          <VariantGroup label="Dismissible">
            <Alert 
              variant="default" 
              status="info" 
              title="Welcome Back!" 
              description="You have 3 new notifications waiting for you."
              onDismiss={() => {}}
            />
            <Alert 
              variant="outline" 
              status="warning" 
              title="Maintenance Notice" 
              description="System maintenance will occur on Sunday from 2-4 AM."
              onDismiss={() => {}}
            />
          </VariantGroup>

          <VariantGroup label="Sizes">
            <Alert variant="default" status="default" size="sm" title="Small Alert" description="Compact alert with smaller padding and icon." />
            <Alert variant="default" status="default" size="md" title="Medium Alert" description="Standard size alert with comfortable spacing." />
            <Alert variant="default" status="default" size="lg" title="Large Alert" description="Spacious alert with generous padding for important messages." />
          </VariantGroup>
        </ComponentSection>

        {/* Dividers */}
        <ComponentSection 
          title="Dividers"
          description="Visual separators with labels, icons, buttons, and toolbars"
        >
          <VariantGroup title="Simple Divider">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[2] }}>Horizontal</p>
                <Separator variant="simple" />
              </div>
              <div style={{ display: "flex", gap: theme.spacing[4], alignItems: "stretch", height: "60px" }}>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, margin: 0 }}>Vertical</p>
                <Separator variant="vertical" />
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, margin: 0 }}>With content</p>
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="With Label">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Centered Label</p>
                <Separator variant="with-label" label="OR" position="center" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Left Label</p>
                <Separator variant="with-label" label="Section" position="left" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Right Label</p>
                <Separator variant="with-label" label="More" position="right" />
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="With Icon">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <Separator 
                variant="with-icon" 
                icon={<Mail size={18} style={{ color: theme.colors.primary[600] }} />}
                position="center" 
              />
              <Separator 
                variant="with-icon" 
                icon={<Lock size={18} style={{ color: theme.colors.warning[600] }} />}
                position="left" 
              />
              <Separator 
                variant="with-icon" 
                icon={<CheckCircle size={18} style={{ color: theme.colors.success[600] }} />}
                position="right" 
              />
            </div>
          </VariantGroup>

          <VariantGroup title="With Title">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <Separator variant="with-title" title="Or continue with" position="center" />
              <Separator variant="with-title" title="New Section" position="left" />
              <Separator variant="with-title" title="Additional Info" position="right" />
            </div>
          </VariantGroup>

          <VariantGroup title="With Button">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <Separator 
                variant="with-button"
                button={<Button size="sm" variant="outline">Add Item</Button>}
                position="center"
              />
              <Separator 
                variant="with-button"
                button={<Button size="sm" variant="outline">Create</Button>}
                position="left"
              />
              <Separator 
                variant="with-button"
                button={<Button size="sm" variant="outline">View All</Button>}
                position="right"
              />
            </div>
          </VariantGroup>

          <VariantGroup title="With Toolbar">
            <Separator 
              variant="with-toolbar"
              toolbar={
                <div style={{ display: "flex", gap: theme.spacing[2] }}>
                  <Button size="sm" variant="outline">Filter</Button>
                  <Button size="sm" variant="outline">Sort</Button>
                  <Button size="sm" variant="outline">Search</Button>
                </div>
              }
              position="center"
            />
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[2] }}>Small</p>
                <Separator variant="with-label" label="Small" size="sm" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[2] }}>Medium</p>
                <Separator variant="with-label" label="Medium" size="md" />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[2] }}>Large</p>
                <Separator variant="with-label" label="Large" size="lg" />
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Card */}
        <ComponentSection 
          title="Card"
          description="Container components with multiple variants and layouts"
        >
          <VariantGroup label="Default Variant">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Clean elevated card with border and shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>This is the default card variant with a subtle shadow and border.</p>
              </CardContent>
            </Card>
          </VariantGroup>

          <VariantGroup label="Outline Variant">
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>Border-only variant without shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>Minimal styling with just a border for a clean look.</p>
              </CardContent>
            </Card>
          </VariantGroup>

          <VariantGroup label="Filled Variant">
            <Card variant="filled">
              <CardHeader>
                <CardTitle>Filled Card</CardTitle>
                <CardDescription>Subtle background color variant</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>This card has a subtle gray background for a softer appearance.</p>
              </CardContent>
            </Card>
          </VariantGroup>

          <VariantGroup label="Subtle Variant">
            <Card variant="subtle">
              <CardHeader>
                <CardTitle>Subtle Card</CardTitle>
                <CardDescription>No borders or shadows</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>Minimal card with no visible borders or shadows, perfect for nested content.</p>
              </CardContent>
            </Card>
          </VariantGroup>

          <VariantGroup label="Well Variant">
            <Card variant="well">
              <CardHeader>
                <CardTitle>Well Card</CardTitle>
                <CardDescription>Inset style card</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>This card has an inset appearance, great for form sections or highlighted areas.</p>
              </CardContent>
            </Card>
          </VariantGroup>

          <VariantGroup label="With Footer">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Card with Footer</CardTitle>
                <CardDescription>Cards can have footers for actions</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>This card demonstrates the footer section with action buttons.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Save</Button>
              </CardFooter>
            </Card>
          </VariantGroup>

          <VariantGroup label="Content Variations">
            <div style={{ display: "grid", gap: theme.spacing[4] }}>
              <Card variant="default" hoverable={false}>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: theme.spacing[4] }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "bold", color: theme.colors.primary[600] }}>12,543</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>Total Users</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "bold", color: theme.colors.success[600] }}>8,392</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>Active Today</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "bold", color: theme.colors.warning[600] }}>2,151</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>Pending</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="filled" hoverable={false}>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    <li style={{ paddingBottom: theme.spacing[2], marginBottom: theme.spacing[2], borderBottomColor: theme.colors.neutral[200], borderBottomWidth: "1px", borderBottomStyle: "solid" }}>
                      <div style={{ fontWeight: 500 }}>User joined</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>2 hours ago</div>
                    </li>
                    <li style={{ paddingBottom: theme.spacing[2], marginBottom: theme.spacing[2], borderBottomColor: theme.colors.neutral[200], borderBottomWidth: "1px", borderBottomStyle: "solid" }}>
                      <div style={{ fontWeight: 500 }}>File uploaded</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>4 hours ago</div>
                    </li>
                    <li>
                      <div style={{ fontWeight: 500 }}>Payment received</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>1 day ago</div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </VariantGroup>

          <VariantGroup label="Non-Hoverable">
            <Card variant="default" hoverable={false}>
              <CardHeader>
                <CardTitle>Static Content</CardTitle>
                <CardDescription>This card does not have hover effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ marginTop: 0 }}>Perfect for displaying static content that doesn't need interaction feedback.</p>
              </CardContent>
            </Card>
          </VariantGroup>
        </ComponentSection>

        {/* Tabs */}
        <ComponentSection 
          title="Tabs"
          description="Tabbed navigation with multiple variants and layouts"
        >
          <VariantGroup title="Underline Tabs">
            <Tabs defaultValue="tab1" variant="underline">
              <TabsList>
                <TabsTrigger value="tab1">Account</TabsTrigger>
                <TabsTrigger value="tab2">Settings</TabsTrigger>
                <TabsTrigger value="tab3">Notifications</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Account information and preferences</p>
              </TabsContent>
              <TabsContent value="tab2" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Manage your settings</p>
              </TabsContent>
              <TabsContent value="tab3" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Configure notifications</p>
              </TabsContent>
            </Tabs>
          </VariantGroup>

          <VariantGroup title="Pills Tabs">
            <Tabs defaultValue="tab1" variant="pills">
              <TabsList>
                <TabsTrigger value="tab1">All</TabsTrigger>
                <TabsTrigger value="tab2">Active</TabsTrigger>
                <TabsTrigger value="tab3">Archived</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Showing all items</p>
              </TabsContent>
              <TabsContent value="tab2" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Showing active items only</p>
              </TabsContent>
              <TabsContent value="tab3" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Showing archived items only</p>
              </TabsContent>
            </Tabs>
          </VariantGroup>

          <VariantGroup title="Filled Tabs">
            <Tabs defaultValue="tab1" variant="filled">
              <TabsList>
                <TabsTrigger value="tab1">Overview</TabsTrigger>
                <TabsTrigger value="tab2">Details</TabsTrigger>
                <TabsTrigger value="tab3">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Product overview and summary</p>
              </TabsContent>
              <TabsContent value="tab2" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Detailed product information</p>
              </TabsContent>
              <TabsContent value="tab3" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Customer reviews and ratings</p>
              </TabsContent>
            </Tabs>
          </VariantGroup>

          <VariantGroup title="Badge Tabs">
            <Tabs defaultValue="tab1" variant="badge">
              <TabsList>
                <TabsTrigger value="tab1" badge="12">Inbox</TabsTrigger>
                <TabsTrigger value="tab2" badge="3">Sent</TabsTrigger>
                <TabsTrigger value="tab3" badge="5">Drafts</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>You have 12 messages in your inbox</p>
              </TabsContent>
              <TabsContent value="tab2" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>You have sent 3 messages</p>
              </TabsContent>
              <TabsContent value="tab3" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>You have 5 draft messages</p>
              </TabsContent>
            </Tabs>
          </VariantGroup>

          <VariantGroup title="Underline with Icons">
            <Tabs defaultValue="tab1" variant="underline">
              <TabsList>
                <TabsTrigger value="tab1" icon={Lock}>Security</TabsTrigger>
                <TabsTrigger value="tab2" icon={Eye}>Privacy</TabsTrigger>
                <TabsTrigger value="tab3" icon={AlertCircle}>Alerts</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Manage your security settings</p>
              </TabsContent>
              <TabsContent value="tab2" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Control your privacy preferences</p>
              </TabsContent>
              <TabsContent value="tab3" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Configure alert notifications</p>
              </TabsContent>
            </Tabs>
          </VariantGroup>

          <VariantGroup title="Full-Width Pills">
            <Tabs defaultValue="tab1" variant="pills" fullWidth>
              <TabsList style={{ width: "100%" }}>
                <TabsTrigger value="tab1">Monthly</TabsTrigger>
                <TabsTrigger value="tab2">Quarterly</TabsTrigger>
                <TabsTrigger value="tab3">Yearly</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Monthly billing view</p>
              </TabsContent>
              <TabsContent value="tab2" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Quarterly billing view</p>
              </TabsContent>
              <TabsContent value="tab3" style={{ marginTop: theme.spacing[6] }}>
                <p style={{ color: theme.colors.muted_foreground }}>Yearly billing view</p>
              </TabsContent>
            </Tabs>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Tabs defaultValue="tab1" variant="pills" size="sm">
                  <TabsList>
                    <TabsTrigger value="tab1">Small</TabsTrigger>
                    <TabsTrigger value="tab2">Tabs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <Tabs defaultValue="tab1" variant="pills" size="md">
                  <TabsList>
                    <TabsTrigger value="tab1">Medium</TabsTrigger>
                    <TabsTrigger value="tab2">Tabs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Tabs defaultValue="tab1" variant="pills" size="lg">
                  <TabsList>
                    <TabsTrigger value="tab1">Large</TabsTrigger>
                    <TabsTrigger value="tab2">Tabs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Accordion */}
        <ComponentSection 
          title="Accordion"
          description="Collapsible content sections"
        >
          <Accordion>
            <AccordionItem value="item1">
              <AccordionTrigger>Section 1</AccordionTrigger>
              <AccordionContent>This is the content for section 1</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item2">
              <AccordionTrigger>Section 2</AccordionTrigger>
              <AccordionContent>This is the content for section 2</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item3">
              <AccordionTrigger>Section 3</AccordionTrigger>
              <AccordionContent>This is the content for section 3</AccordionContent>
            </AccordionItem>
          </Accordion>
        </ComponentSection>

        {/* Dropdowns */}
        <ComponentSection 
          title="Dropdowns"
          description="Context menu with actions, inspired by Tailwind UI"
        >
          <VariantGroup label="Simple Dropdown">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem>Profile</DropdownItem>
                <DropdownItem>Settings</DropdownItem>
                <DropdownItem>Help</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </VariantGroup>

          <VariantGroup label="With Dividers">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline">Actions</Button>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem leadingIcon={Edit}>Edit</DropdownItem>
                <DropdownItem leadingIcon={Download}>Download</DropdownItem>
                <DropdownSeparator />
                <DropdownItem variant="destructive" leadingIcon={Trash}>Delete</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </VariantGroup>

          <VariantGroup label="With Label">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="outline">Account</Button>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownLabel>My Account</DropdownLabel>
                <DropdownSeparator />
                <DropdownItem>Profile Settings</DropdownItem>
                <DropdownItem>Preferences</DropdownItem>
                <DropdownSeparator />
                <DropdownItem>Sign Out</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </VariantGroup>

          <VariantGroup label="With Trailing Icons">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="primary">Options</Button>
              </DropdownTrigger>
              <DropdownContent>
                <DropdownItem trailingIcon={CheckCircle}>Approve</DropdownItem>
                <DropdownItem trailingIcon={X}>Reject</DropdownItem>
                <DropdownSeparator />
                <DropdownItem variant="destructive" trailingIcon={Trash}>Remove</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </VariantGroup>
        </ComponentSection>

        {/* Dialog (Modal) */}
        <ComponentSection 
          title="Dialog (Modal)"
          description="Modal dialogs with multiple variants and sizes"
        >
          <VariantGroup label="Simple Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Open Dialog</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="default" size="md">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Make changes to your profile information below.</DialogDescription>
                  </DialogHeader>
                  <div style={{ padding: `${theme.spacing[4]} 0` }}>
                    <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                      Your profile content would go here with form fields, inputs, etc.
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    </DialogTrigger>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>

          <VariantGroup label="Alert Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Delete Item</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="alert" size="md">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle style={{ color: theme.colors.destructive[600] }}>Delete Confirmation</DialogTitle>
                    <DialogDescription>This action cannot be undone. Are you sure you want to continue?</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.destructive[600] }}>Delete</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>

          <VariantGroup label="Centered Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Show Info</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="centered" size="md">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle>Welcome!</DialogTitle>
                    <DialogDescription>This is a centered dialog with emphasis on the content.</DialogDescription>
                  </DialogHeader>
                  <div style={{ padding: `${theme.spacing[4]} 0` }}>
                    <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm, textAlign: "center" }}>
                      Centered dialogs work great for important messages and confirmations.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600], width: "100%" }}>Got it!</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>

          <VariantGroup label="Small Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Small</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="default" size="sm">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle>Quick Action</DialogTitle>
                    <DialogDescription>A compact dialog for simple interactions.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>

          <VariantGroup label="Large Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Large</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="default" size="lg">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle>Detailed Form</DialogTitle>
                    <DialogDescription>A larger dialog for complex content and forms.</DialogDescription>
                  </DialogHeader>
                  <div style={{ padding: `${theme.spacing[4]} 0`, minHeight: "200px" }}>
                    <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                      Large dialogs provide more space for complex forms, tables, or multi-step processes.
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>

          <VariantGroup label="Extra Large Dialog">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Extra Large</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="default" size="xl">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle>Advanced Settings</DialogTitle>
                    <DialogDescription>Configure advanced options for your account.</DialogDescription>
                  </DialogHeader>
                  <div style={{ padding: `${theme.spacing[4]} 0`, minHeight: "250px" }}>
                    <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                      Extra large dialogs offer maximum space for comprehensive forms and detailed information displays.
                    </p>
                  </div>
                  <DialogFooter>
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Apply Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>

          <VariantGroup label="Dialog with Multiple Actions">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="primary">Save As</Button>
              </DialogTrigger>
              <DialogPortal>
                <DialogContent variant="default" size="md">
                  <DialogClose />
                  <DialogHeader>
                    <DialogTitle>Save Document</DialogTitle>
                    <DialogDescription>Choose how you'd like to save your document.</DialogDescription>
                  </DialogHeader>
                  <div style={{ padding: `${theme.spacing[4]} 0` }}>
                    <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                      Select your preferred format and destination for the saved file.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Skip</Button>
                    <Button variant="outline" style={{ color: theme.colors.primary[600], borderColor: theme.colors.primary[200] }}>Save Draft</Button>
                    <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Save Now</Button>
                  </DialogFooter>
                </DialogContent>
              </DialogPortal>
            </Dialog>
          </VariantGroup>
        </ComponentSection>

        {/* Drawer */}
        <ComponentSection 
          title="Drawer"
          description="Side panels with multiple directions and sizes"
        >
          <VariantGroup label="Right Drawer">
            <Drawer direction="right" open={false}>
              <DrawerTrigger asChild>
                <Button variant="primary">Open Drawer</Button>
              </DrawerTrigger>
              <DrawerContent size="md" variant="default">
                <DrawerHeader>
                  <DrawerTitle>Edit Profile</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[6], overflowY: "auto" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                    Your drawer content would go here with forms, settings, or additional information.
                  </p>
                </div>
                <DrawerFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Save</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Left Drawer">
            <Drawer direction="left" open={false}>
              <DrawerTrigger asChild>
                <Button variant="outline">Left Sidebar</Button>
              </DrawerTrigger>
              <DrawerContent size="md" variant="filled">
                <DrawerHeader>
                  <DrawerTitle>Navigation</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[6], overflowY: "auto" }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    <li style={{ padding: theme.spacing[3], borderBottomColor: theme.colors.neutral[200], borderBottomWidth: "1px", borderBottomStyle: "solid", color: theme.colors.primary[600], cursor: "pointer" }}>Home</li>
                    <li style={{ padding: theme.spacing[3], borderBottomColor: theme.colors.neutral[200], borderBottomWidth: "1px", borderBottomStyle: "solid", cursor: "pointer" }}>Dashboard</li>
                    <li style={{ padding: theme.spacing[3], borderBottomColor: theme.colors.neutral[200], borderBottomWidth: "1px", borderBottomStyle: "solid", cursor: "pointer" }}>Settings</li>
                  </ul>
                </div>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Small Drawer">
            <Drawer direction="right" open={false}>
              <DrawerTrigger asChild>
                <Button variant="outline">Small</Button>
              </DrawerTrigger>
              <DrawerContent size="sm" variant="default">
                <DrawerHeader>
                  <DrawerTitle>Quick Actions</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[4], overflowY: "auto" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                    Compact drawer for quick operations.
                  </p>
                </div>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Large Drawer">
            <Drawer direction="right" open={false}>
              <DrawerTrigger asChild>
                <Button variant="outline">Large</Button>
              </DrawerTrigger>
              <DrawerContent size="lg" variant="default">
                <DrawerHeader>
                  <DrawerTitle>Detailed Settings</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[6], overflowY: "auto", minHeight: "300px" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                    Large drawer provides ample space for complex forms and detailed content.
                  </p>
                </div>
                <DrawerFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Apply</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Full-Width Drawer">
            <Drawer direction="right" open={false}>
              <DrawerTrigger asChild>
                <Button variant="outline">Full Width</Button>
              </DrawerTrigger>
              <DrawerContent size="full" variant="default">
                <DrawerHeader>
                  <DrawerTitle>Full Screen Editor</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[6], overflowY: "auto", minHeight: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm, textAlign: "center" }}>
                    Full-width drawer spans the entire width for immersive experiences.
                  </p>
                </div>
                <DrawerFooter>
                  <Button variant="outline">Close</Button>
                  <Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Done</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Top Drawer">
            <Drawer direction="top" open={false}>
              <DrawerTrigger asChild>
                <Button variant="outline">Top Drawer</Button>
              </DrawerTrigger>
              <DrawerContent size="md" variant="outline">
                <DrawerHeader>
                  <DrawerTitle>Top Notification Drawer</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[4], overflowY: "auto" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                    Drawer sliding from the top for notifications or alerts.
                  </p>
                </div>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Bottom Drawer">
            <Drawer direction="bottom" open={false}>
              <DrawerTrigger asChild>
                <Button variant="outline">Bottom Drawer</Button>
              </DrawerTrigger>
              <DrawerContent size="md" variant="filled">
                <DrawerHeader>
                  <DrawerTitle>Bottom Sheet</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[4], overflowY: "auto" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                    Bottom drawer perfect for mobile menus and action sheets.
                  </p>
                </div>
              </DrawerContent>
            </Drawer>
          </VariantGroup>

          <VariantGroup label="Drawer with Outline Variant">
            <Drawer direction="right" open={false}>
              <DrawerTrigger asChild>
                <Button variant="primary">Outline Style</Button>
              </DrawerTrigger>
              <DrawerContent size="md" variant="outline">
                <DrawerHeader>
                  <DrawerTitle>Minimal Style Drawer</DrawerTitle>
                  <DrawerCloseButton />
                </DrawerHeader>
                <div style={{ flex: 1, padding: theme.spacing[6], overflowY: "auto" }}>
                  <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm }}>
                    Outline variant with minimal border styling.
                  </p>
                </div>
              </DrawerContent>
            </Drawer>
          </VariantGroup>
        </ComponentSection>

        {/* Toast / Notifications */}
        <ComponentSection 
          title="Toast / Notifications"
          description="Non-intrusive notifications with actions and variants"
        >
          <VariantGroup label="Simple Notifications">
            <ToastContainer position="top-right">
              <Toast variant="default" title="Notification" description="This is a simple notification message." autoClose={false} />
              <Toast variant="success" title="Success!" description="Your action was completed successfully." autoClose={false} />
              <Toast variant="warning" title="Warning" description="Please review this important message." autoClose={false} />
              <Toast variant="error" title="Error" description="Something went wrong. Please try again." autoClose={false} />
              <Toast variant="info" title="Info" description="Here's some useful information for you." autoClose={false} />
            </ToastContainer>
          </VariantGroup>

          <VariantGroup label="Condensed">
            <ToastContainer position="top-right">
              <Toast variant="success" title="Saved" autoClose={false} size="sm" />
              <Toast variant="error" title="Failed" autoClose={false} size="sm" />
              <Toast variant="info" title="Updating..." autoClose={false} size="sm" />
            </ToastContainer>
          </VariantGroup>

          <VariantGroup label="With Actions">
            <ToastContainer position="top-right">
              <Toast 
                variant="info" 
                title="New Update Available" 
                description="A new version is ready to download."
                autoClose={false}
                action={
                  <button style={{
                    backgroundColor: theme.colors.primary[600],
                    color: "white",
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    borderRadius: theme.borderRadius.md,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                    transition: `background-color ${theme.transitions.normal}`,
                  }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.primary[700]} onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary[600]}>
                    Update
                  </button>
                }
              />
              <Toast 
                variant="success" 
                title="Changes Saved" 
                description="Your document has been saved to the cloud."
                autoClose={false}
                action={
                  <button style={{
                    backgroundColor: "transparent",
                    color: theme.colors.success[600],
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                  }}>
                    View
                  </button>
                }
              />
            </ToastContainer>
          </VariantGroup>

          <VariantGroup label="With Avatar / Icon Customization">
            <ToastContainer position="bottom-right">
              <Toast 
                variant="success" 
                title="Payment Confirmed" 
                description="Your payment of $99.00 has been processed."
                autoClose={false}
                showIcon={true}
              />
              <Toast 
                variant="warning" 
                title="Expiring Soon" 
                description="Your subscription expires in 7 days."
                autoClose={false}
                showIcon={true}
              />
            </ToastContainer>
          </VariantGroup>

          <VariantGroup label="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
              <div>
                <p style={{ marginBottom: theme.spacing[2], fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>Small Size:</p>
                <Toast variant="info" title="Small" description="Compact notification." size="sm" autoClose={false} />
              </div>
              <div>
                <p style={{ marginBottom: theme.spacing[2], fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>Medium Size:</p>
                <Toast variant="info" title="Medium" description="Standard notification with more space." size="md" autoClose={false} />
              </div>
              <div>
                <p style={{ marginBottom: theme.spacing[2], fontSize: theme.typography.fontSize.sm, color: theme.colors.neutral[600] }}>Large Size:</p>
                <Toast variant="info" title="Large" description="Spacious notification with prominent styling." size="lg" autoClose={false} />
              </div>
            </div>
          </VariantGroup>

          <VariantGroup label="Positions">
            <div style={{ position: "relative", height: "300px", border: `2px dashed ${theme.colors.neutral[300]}`, borderRadius: theme.borderRadius.lg, padding: theme.spacing[4], display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: theme.colors.neutral[600], fontSize: theme.typography.fontSize.sm, textAlign: "center" }}>
                Notifications can be positioned at any corner or center position (top-left, top-center, top-right, bottom-left, bottom-center, bottom-right)
              </p>
              <ToastContainer position="top-right">
                <Toast variant="success" title="Top Right" autoClose={false} size="sm" />
              </ToastContainer>
              <ToastContainer position="bottom-left">
                <Toast variant="info" title="Bottom Left" autoClose={false} size="sm" />
              </ToastContainer>
            </div>
          </VariantGroup>

          <VariantGroup label="All Variants">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
              <Toast variant="default" title="Default" description="Standard notification style." autoClose={false} />
              <Toast variant="success" title="Success" description="Operation completed successfully." autoClose={false} />
              <Toast variant="warning" title="Warning" description="Please review this message." autoClose={false} />
              <Toast variant="error" title="Error" description="Something went wrong." autoClose={false} />
              <Toast variant="info" title="Info" description="Additional information." autoClose={false} />
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Label */}
        <ComponentSection 
          title="Label"
          description="Form field labels"
        >
          <VariantGroup label="Variants">
            <div>
              <Label htmlFor="input1">Default Label</Label>
              <Input id="input1" placeholder="Input field" style={{ marginTop: theme.spacing[2], width: "200px" }} />
            </div>
            <div>
              <Label htmlFor="input2" variant="primary">Primary Label</Label>
              <Input id="input2" placeholder="Input field" style={{ marginTop: theme.spacing[2], width: "200px" }} />
            </div>
            <div>
              <Label htmlFor="input3" required>Required Label</Label>
              <Input id="input3" placeholder="Input field" style={{ marginTop: theme.spacing[2], width: "200px" }} />
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Breadcrumb */}
        <ComponentSection 
          title="Breadcrumb"
          description="Navigation path indicators with multiple variants and separators"
        >
          <VariantGroup label="Simple with Chevrons">
            <Breadcrumb variant="simple" separator="chevron">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </VariantGroup>

          <VariantGroup label="Simple with Slashes">
            <Breadcrumb variant="simple" separator="slash">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="slash" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="slash" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/products/electronics">Electronics</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="slash" />
                <BreadcrumbItem>
                  <BreadcrumbLink active>Laptop</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </VariantGroup>

          <VariantGroup label="Simple with Dots">
            <Breadcrumb variant="simple" separator="dot">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Settings</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="dot" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/account">Account</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="dot" />
                <BreadcrumbItem>
                  <BreadcrumbLink active>Security</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </VariantGroup>

          <VariantGroup label="Simple with Arrows">
            <Breadcrumb variant="simple" separator="arrow">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="arrow" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/design">Design System</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="arrow" />
                <BreadcrumbItem>
                  <BreadcrumbLink active>Components</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </VariantGroup>

          <VariantGroup label="Contained Variant">
            <Breadcrumb variant="contained" separator="chevron">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink active>Getting Started</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </VariantGroup>

          <VariantGroup label="Full-Width Variant">
            <div style={{ marginLeft: `-${theme.spacing[6]}`, marginRight: `-${theme.spacing[6]}`, marginTop: `-${theme.spacing[4]}`, marginBottom: `-${theme.spacing[4]}` }}>
              <Breadcrumb variant="fullWidth" separator="chevron">
                <BreadcrumbList style={{ width: "100%", paddingLeft: theme.spacing[6], paddingRight: theme.spacing[6] }}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">Admin</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator separator="chevron" />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/users">Users</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator separator="chevron" />
                  <BreadcrumbItem>
                    <BreadcrumbLink active>User Details</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </VariantGroup>

          <VariantGroup label="Long Path with Multiple Levels">
            <Breadcrumb variant="simple" separator="chevron">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Root</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/level1">Level 1</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/level2">Level 2</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/level3">Level 3</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator separator="chevron" />
                <BreadcrumbItem>
                  <BreadcrumbLink active>Current Page</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </VariantGroup>
        </ComponentSection>

        {/* Pagination */}
        <ComponentSection 
          title="Pagination"
          description="Page navigation with multiple variants and layouts"
        >
          <VariantGroup title="Default Pagination">
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious size="md" showLabel={true} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">4</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext size="md" showLabel={true} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </VariantGroup>

          <VariantGroup title="Outline Pagination">
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious size="md" showLabel={true} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="outline">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="outline" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="outline">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="outline">4</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext size="md" showLabel={true} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </VariantGroup>

          <VariantGroup title="Minimal Pagination">
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious size="md" showLabel={false} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="minimal">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="minimal" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="minimal">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="minimal">4</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext size="md" showLabel={false} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </VariantGroup>

          <VariantGroup title="Icon Only Buttons">
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious size="md" showLabel={false} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default" isActive>2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext size="md" showLabel={false} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Pagination centered>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious size="sm" showLabel={true} />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="sm" variant="default">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="sm" variant="default" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="sm" variant="default">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext size="sm" showLabel={true} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <Pagination centered>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious size="md" showLabel={true} />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="md" variant="default">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="md" variant="default" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="md" variant="default">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext size="md" showLabel={true} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Pagination centered>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious size="lg" showLabel={true} />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="lg" variant="default">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="lg" variant="default" isActive>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" size="lg" variant="default">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext size="lg" showLabel={true} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="Disabled State">
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious size="md" showLabel={true} disabled={true} />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" size="md" variant="default">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext size="md" showLabel={true} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </VariantGroup>

          <VariantGroup title="Compact Layout">
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious size="md" showLabel={true} />
                </PaginationItem>
                <PaginationItem>
                  <span style={{ color: theme.colors.muted_foreground, fontSize: "14px", padding: "8px 12px" }}>
                    Page 2 of 10
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext size="md" showLabel={true} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </VariantGroup>
        </ComponentSection>

        {/* List Containers */}
        <ComponentSection 
          title="List Containers"
          description="Display lists with multiple layout variants and styles"
        >
          <VariantGroup title="Simple with Dividers">
            <StackedList variant="simple">
              <StackedListItem 
                size="md"
                avatar={{ initials: "SA", bg: theme.colors.primary[100], color: theme.colors.primary[600] }}
                title="Sarah Anderson"
                description="sarah@company.com"
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "MC", bg: theme.colors.secondary[100], color: theme.colors.secondary[600] }}
                title="Michael Chen"
                description="michael@company.com"
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "ER", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                title="Emma Rodriguez"
                description="emma@company.com"
                divider={false}
              />
            </StackedList>
          </VariantGroup>

          <VariantGroup title="Card with Dividers">
            <StackedList variant="card">
              <StackedListItem 
                size="md"
                avatar={{ initials: "SA", bg: theme.colors.primary[100], color: theme.colors.primary[600] }}
                title="Sarah Anderson"
                description="Product Manager at Tech Corp"
                badge={{ label: "Online", bg: theme.colors.success[100], color: theme.colors.success[600] }}
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "MC", bg: theme.colors.secondary[100], color: theme.colors.secondary[600] }}
                title="Michael Chen"
                description="Lead Designer"
                badge={{ label: "Away", bg: theme.colors.warning[100], color: theme.colors.warning[600] }}
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "ER", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                title="Emma Rodriguez"
                description="Senior Developer"
                badge={{ label: "Online", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                divider={false}
              />
            </StackedList>
          </VariantGroup>

          <VariantGroup title="Separate Cards">
            <StackedList variant="separate">
              <StackedListItem 
                size="md"
                variant="separate"
                avatar={{ initials: "SA", bg: theme.colors.primary[100], color: theme.colors.primary[600] }}
                title="Sarah Anderson"
                description="Product Manager"
                trailing={<MoreVertical size={18} style={{ color: theme.colors.muted_foreground }} />}
              />
              <StackedListItem 
                size="md"
                variant="separate"
                avatar={{ initials: "MC", bg: theme.colors.secondary[100], color: theme.colors.secondary[600] }}
                title="Michael Chen"
                description="Lead Designer"
                trailing={<MoreVertical size={18} style={{ color: theme.colors.muted_foreground }} />}
              />
              <StackedListItem 
                size="md"
                variant="separate"
                avatar={{ initials: "ER", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                title="Emma Rodriguez"
                description="Senior Developer"
                trailing={<MoreVertical size={18} style={{ color: theme.colors.muted_foreground }} />}
              />
            </StackedList>
          </VariantGroup>

          <VariantGroup title="Flat Card with Dividers">
            <StackedList variant="flat">
              <StackedListItem 
                size="md"
                avatar={{ initials: "SA", bg: theme.colors.primary[100], color: theme.colors.primary[600] }}
                title="Sarah Anderson"
                description="Assigned to project review"
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "MC", bg: theme.colors.secondary[100], color: theme.colors.secondary[600] }}
                title="Michael Chen"
                description="Waiting for your approval"
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "ER", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                title="Emma Rodriguez"
                description="In progress on feature"
                divider={false}
              />
            </StackedList>
          </VariantGroup>

          <VariantGroup title="With Actions">
            <StackedList variant="card">
              <StackedListItem 
                size="md"
                avatar={{ initials: "SA", bg: theme.colors.primary[100], color: theme.colors.primary[600] }}
                title="Sarah Anderson"
                description="Product Manager"
                trailing={<MoreVertical size={18} style={{ color: theme.colors.muted_foreground }} />}
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "MC", bg: theme.colors.secondary[100], color: theme.colors.secondary[600] }}
                title="Michael Chen"
                description="Lead Designer"
                trailing={<MoreVertical size={18} style={{ color: theme.colors.muted_foreground }} />}
              />
              <StackedListItem 
                size="md"
                avatar={{ initials: "ER", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                title="Emma Rodriguez"
                description="Senior Developer"
                trailing={<MoreVertical size={18} style={{ color: theme.colors.muted_foreground }} />}
                divider={false}
              />
            </StackedList>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <StackedList>
                  <StackedListItem 
                    size="sm"
                    avatar={{ initials: "SA" }}
                    title="Sarah Anderson"
                    description="Product Manager"
                  />
                  <StackedListItem 
                    size="sm"
                    avatar={{ initials: "MC" }}
                    title="Michael Chen"
                    description="Designer"
                    divider={false}
                  />
                </StackedList>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <StackedList>
                  <StackedListItem 
                    size="md"
                    avatar={{ initials: "SA" }}
                    title="Sarah Anderson"
                    description="Product Manager"
                  />
                  <StackedListItem 
                    size="md"
                    avatar={{ initials: "MC" }}
                    title="Michael Chen"
                    description="Designer"
                    divider={false}
                  />
                </StackedList>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <StackedList>
                  <StackedListItem 
                    size="lg"
                    avatar={{ initials: "SA" }}
                    title="Sarah Anderson"
                    description="Product Manager"
                  />
                  <StackedListItem 
                    size="lg"
                    avatar={{ initials: "MC" }}
                    title="Michael Chen"
                    description="Designer"
                    divider={false}
                  />
                </StackedList>
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Table */}
        <ComponentSection 
          title="Table"
          description="Data display table with multiple layouts and variants"
        >
          <VariantGroup title="Simple Table">
            <Table variant="simple" size="md">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Sarah Anderson</TableCell>
                  <TableCell>sarah.anderson@company.com</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell><Badge variant="flat" color="success">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Michael Chen</TableCell>
                  <TableCell>michael.chen@company.com</TableCell>
                  <TableCell>Design</TableCell>
                  <TableCell><Badge variant="flat" color="success">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Emma Rodriguez</TableCell>
                  <TableCell>emma.rodriguez@company.com</TableCell>
                  <TableCell>Engineering</TableCell>
                  <TableCell><Badge variant="flat" color="warning">Pending</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </VariantGroup>

          <VariantGroup title="Bordered Table">
            <Table variant="card" bordered size="md">
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Professional Plan</TableCell>
                  <TableCell>$299</TableCell>
                  <TableCell>48</TableCell>
                  <TableCell>1,242</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Enterprise Plan</TableCell>
                  <TableCell>$999</TableCell>
                  <TableCell>128</TableCell>
                  <TableCell>3,841</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Startup Plan</TableCell>
                  <TableCell>$99</TableCell>
                  <TableCell>512</TableCell>
                  <TableCell>12,584</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </VariantGroup>

          <VariantGroup title="Striped Rows">
            <Table variant="simple" size="md">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow isStriped={false}>
                  <TableCell>Feb 15, 2026</TableCell>
                  <TableCell>Sarah Anderson</TableCell>
                  <TableCell>$1,250.00</TableCell>
                  <TableCell>Invoice</TableCell>
                </TableRow>
                <TableRow isStriped={true}>
                  <TableCell>Feb 14, 2026</TableCell>
                  <TableCell>Michael Chen</TableCell>
                  <TableCell>$850.00</TableCell>
                  <TableCell>Payment</TableCell>
                </TableRow>
                <TableRow isStriped={false}>
                  <TableCell>Feb 13, 2026</TableCell>
                  <TableCell>Emma Rodriguez</TableCell>
                  <TableCell>$2,100.00</TableCell>
                  <TableCell>Invoice</TableCell>
                </TableRow>
                <TableRow isStriped={true}>
                  <TableCell>Feb 12, 2026</TableCell>
                  <TableCell>James Kim</TableCell>
                  <TableCell>$500.00</TableCell>
                  <TableCell>Refund</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <Table variant="simple" size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell size="sm">Sarah Anderson</TableCell>
                      <TableCell size="sm">sarah@company.com</TableCell>
                      <TableCell size="sm"><Badge variant="flat" color="success">Active</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell size="sm">Michael Chen</TableCell>
                      <TableCell size="sm">michael@company.com</TableCell>
                      <TableCell size="sm"><Badge variant="flat" color="success">Active</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium (Default)</p>
                <Table variant="simple" size="md">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell size="md">Sarah Anderson</TableCell>
                      <TableCell size="md">sarah@company.com</TableCell>
                      <TableCell size="md"><Badge variant="flat" color="success">Active</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell size="md">Michael Chen</TableCell>
                      <TableCell size="md">michael@company.com</TableCell>
                      <TableCell size="md"><Badge variant="flat" color="success">Active</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <Table variant="simple" size="lg">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell size="lg">Sarah Anderson</TableCell>
                      <TableCell size="lg">sarah@company.com</TableCell>
                      <TableCell size="lg"><Badge variant="flat" color="success">Active</Badge></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell size="lg">Michael Chen</TableCell>
                      <TableCell size="lg">michael@company.com</TableCell>
                      <TableCell size="lg"><Badge variant="flat" color="success">Active</Badge></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </VariantGroup>

          <VariantGroup title="With Footer">
            <Table variant="simple" size="md">
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Professional License</TableCell>
                  <TableCell>2</TableCell>
                  <TableCell>$499</TableCell>
                  <TableCell>$998</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Support Package</TableCell>
                  <TableCell>1</TableCell>
                  <TableCell>$299</TableCell>
                  <TableCell>$299</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} style={{ textAlign: "right", paddingRight: "16px" }}>
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell>
                    <strong>$1,297</strong>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </VariantGroup>
        </ComponentSection>

        {/* Grid List */}
        <ComponentSection 
          title="Grid Lists"
          description="Grid-based card layouts with multiple variants"
        >
          <VariantGroup title="Simple Cards">
            <GridList columns={3} gap="md">
              <GridListCard
                size="md"
                title="Product Design"
                description="Create stunning visual designs for your products"
              />
              <GridListCard
                size="md"
                title="Web Development"
                description="Build fast and scalable web applications"
              />
              <GridListCard
                size="md"
                title="Mobile Apps"
                description="Develop native and cross-platform mobile apps"
              />
            </GridList>
          </VariantGroup>

          <VariantGroup title="Contact Cards">
            <GridList columns={3} gap="md">
              <GridListCard
                size="md"
                avatar={{ initials: "SA", bg: theme.colors.primary[100], color: theme.colors.primary[600] }}
                title="Sarah Anderson"
                description="Product Manager"
              />
              <GridListCard
                size="md"
                avatar={{ initials: "MC", bg: theme.colors.secondary[100], color: theme.colors.secondary[600] }}
                title="Michael Chen"
                description="Lead Designer"
              />
              <GridListCard
                size="md"
                avatar={{ initials: "ER", bg: theme.colors.success[100], color: theme.colors.success[600] }}
                title="Emma Rodriguez"
                description="Senior Developer"
              />
            </GridList>
          </VariantGroup>

          <VariantGroup title="Cards with Badges">
            <GridList columns={3} gap="md">
              <GridListCard
                size="md"
                avatar={{ initials: "SA" }}
                title="Sarah Anderson"
                description="Available for collaboration"
                badge={<Badge variant="flat" color="success">Available</Badge>}
                trailing={<Heart size={18} style={{ color: theme.colors.neutral[400] }} />}
              />
              <GridListCard
                size="md"
                avatar={{ initials: "MC" }}
                title="Michael Chen"
                description="Currently on project"
                badge={<Badge variant="flat" color="warning">Busy</Badge>}
                trailing={<Heart size={18} style={{ color: theme.colors.neutral[400] }} />}
              />
              <GridListCard
                size="md"
                avatar={{ initials: "ER" }}
                title="Emma Rodriguez"
                description="Open to opportunities"
                badge={<Badge variant="flat" color="success">Available</Badge>}
                trailing={<Heart size={18} style={{ color: theme.colors.neutral[400] }} />}
              />
            </GridList>
          </VariantGroup>

          <VariantGroup title="Image Cards">
            <GridList columns={3} gap="md">
              <GridListCard
                size="md"
                image={{ bg: theme.colors.primary[100], placeholder: "🎨 Design" }}
                title="UI Design System"
                description="Comprehensive design tokens and components"
              />
              <GridListCard
                size="md"
                image={{ bg: theme.colors.secondary[100], placeholder: "⚙️ Engineering" }}
                title="Development Guide"
                description="Best practices for code organization"
              />
              <GridListCard
                size="md"
                image={{ bg: theme.colors.success[100], placeholder: "✅ Quality" }}
                title="Testing Framework"
                description="Automated testing strategies"
              />
            </GridList>
          </VariantGroup>

          <VariantGroup title="Clickable Cards">
            <GridList columns={3} gap="md">
              <GridListCard
                size="md"
                href="#"
                avatar={{ initials: "JS" }}
                title="John Smith"
                description="Click to view profile"
              />
              <GridListCard
                size="md"
                href="#"
                avatar={{ initials: "AB" }}
                title="Alice Brown"
                description="Click to view profile"
              />
              <GridListCard
                size="md"
                href="#"
                avatar={{ initials: "CC" }}
                title="Chris Cooper"
                description="Click to view profile"
              />
            </GridList>
          </VariantGroup>

          <VariantGroup title="Two Column Layout">
            <GridList columns={2} gap="md">
              <GridListCard
                size="md"
                image={{ bg: theme.colors.primary[100], placeholder: "📱 Mobile" }}
                title="Mobile First Design"
                description="Design responsive applications that work on all devices"
              />
              <GridListCard
                size="md"
                image={{ bg: theme.colors.secondary[100], placeholder: "🎯 Strategy" }}
                title="Strategic Planning"
                description="Plan your project roadmap with clear objectives"
              />
              <GridListCard
                size="md"
                image={{ bg: theme.colors.success[100], placeholder: "🚀 Launch" }}
                title="Launch & Deploy"
                description="Deploy your application with confidence"
              />
              <GridListCard
                size="md"
                image={{ bg: theme.colors.warning[100], placeholder: "📊 Analytics" }}
                title="Analytics & Metrics"
                description="Monitor performance and user engagement"
              />
            </GridList>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Small</p>
                <GridList columns={4} gap="sm">
                  <GridListCard
                    size="sm"
                    avatar={{ initials: "SA" }}
                    title="Sarah"
                    description="Designer"
                  />
                  <GridListCard
                    size="sm"
                    avatar={{ initials: "MC" }}
                    title="Michael"
                    description="Developer"
                  />
                  <GridListCard
                    size="sm"
                    avatar={{ initials: "ER" }}
                    title="Emma"
                    description="Manager"
                  />
                  <GridListCard
                    size="sm"
                    avatar={{ initials: "JK" }}
                    title="James"
                    description="Engineer"
                  />
                </GridList>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Medium</p>
                <GridList columns={3} gap="md">
                  <GridListCard
                    size="md"
                    avatar={{ initials: "SA" }}
                    title="Sarah Anderson"
                    description="Product Manager"
                  />
                  <GridListCard
                    size="md"
                    avatar={{ initials: "MC" }}
                    title="Michael Chen"
                    description="Lead Designer"
                  />
                  <GridListCard
                    size="md"
                    avatar={{ initials: "ER" }}
                    title="Emma Rodriguez"
                    description="Senior Developer"
                  />
                </GridList>
              </div>
              <div>
                <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, marginBottom: theme.spacing[3] }}>Large</p>
                <GridList columns={2} gap="lg">
                  <GridListCard
                    size="lg"
                    image={{ bg: theme.colors.primary[100], placeholder: "🎨 Design" }}
                    avatar={{ initials: "SA" }}
                    title="Sarah Anderson"
                    description="Product Manager & Designer with extensive experience in building beautiful user interfaces"
                  />
                  <GridListCard
                    size="lg"
                    image={{ bg: theme.colors.secondary[100], placeholder: "⚙️ Code" }}
                    avatar={{ initials: "MC" }}
                    title="Michael Chen"
                    description="Full-stack engineer specializing in scalable architecture and clean code practices"
                  />
                </GridList>
              </div>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Avatar */}
        <ComponentSection 
          title="Avatar"
          description="User profile image"
        >
          <VariantGroup label="Sizes">
            <Avatar size="sm" initials="JS" />
            <Avatar size="md" initials="JD" />
            <Avatar size="lg" initials="AB" />
          </VariantGroup>
        </ComponentSection>

        {/* Empty State */}
        <ComponentSection 
          title="Empty State"
          description="Empty content placeholders with multiple variants"
        >
          <VariantGroup label="Default Variant">
            <Empty 
              icon={Search}
              title="No Results"
              description="Try adjusting your search criteria"
              variant="default"
              action={<Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Clear Filters</Button>}
            />
            <Empty 
              icon={Package}
              title="No Items"
              description="Your cart is empty. Start shopping!"
              variant="default"
              action={<Button variant="outline">Continue Shopping</Button>}
            />
          </VariantGroup>

          <VariantGroup label="Outline Variant">
            <Empty 
              icon={Search}
              title="No Matches Found"
              description="We couldn't find what you're looking for."
              variant="outline"
              action={<Button variant="primary" style={{ backgroundColor: theme.colors.primary[600] }}>Try Again</Button>}
            />
          </VariantGroup>

          <VariantGroup label="Filled Variant">
            <Empty 
              icon={Package}
              title="Nothing Here"
              description="Start creating something amazing."
              variant="filled"
            />
            <Empty 
              icon={Search}
              title="No Data Available"
              description="Check back soon for updates."
              variant="filled"
            />
          </VariantGroup>

          <VariantGroup label="Subtle Variant">
            <Empty 
              icon={Package}
              title="Empty List"
              description="No items to display right now."
              variant="subtle"
            />
          </VariantGroup>

          <VariantGroup label="Card Variant">
            <Empty 
              icon={Package}
              title="Get Started"
              description="Create your first item to begin."
              variant="card"
              action={
                <button style={{
                  backgroundColor: theme.colors.primary[600],
                  color: "white",
                  padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                  borderRadius: theme.borderRadius.md,
                  border: "none",
                  cursor: "pointer",
                  fontWeight: theme.typography.fontWeight.medium,
                  transition: `background-color ${theme.transitions.normal}`,
                }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.primary[700]} onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary[600]}>
                  Create New
                </button>
              }
            />
          </VariantGroup>

          <VariantGroup label="With Starting Points">
            <Empty 
              icon={Package}
              title="No Recommendations"
              description="Complete your profile to get personalized recommendations."
              variant="default"
              action={
                <div style={{ marginTop: theme.spacing[4], display: "flex", gap: theme.spacing[3], justifyContent: "center" }}>
                  <button style={{
                    backgroundColor: theme.colors.primary[600],
                    color: "white",
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    borderRadius: theme.borderRadius.md,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                    transition: `background-color ${theme.transitions.normal}`,
                  }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.primary[700]} onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.primary[600]}>
                    Complete Profile
                  </button>
                  <button style={{
                    backgroundColor: theme.colors.neutral[200],
                    color: theme.colors.neutral[900],
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    borderRadius: theme.borderRadius.md,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: theme.typography.fontWeight.medium,
                    fontSize: theme.typography.fontSize.sm,
                    transition: `background-color ${theme.transitions.normal}`,
                  }} onMouseEnter={(e) => e.target.style.backgroundColor = theme.colors.neutral[300]} onMouseLeave={(e) => e.target.style.backgroundColor = theme.colors.neutral[200]}>
                    Learn More
                  </button>
                </div>
              }
            />
          </VariantGroup>

          <VariantGroup label="Sizes">
            <Empty 
              icon={Package}
              title="Small Empty State"
              description="Compact size for small containers."
              variant="default"
              size="sm"
            />
            <Empty 
              icon={Package}
              title="Medium Empty State"
              description="Standard size with comfortable spacing."
              variant="default"
              size="md"
            />
            <Empty 
              icon={Package}
              title="Large Empty State"
              description="Spacious size for prominent placement."
              variant="default"
              size="lg"
            />
          </VariantGroup>

          <VariantGroup label="With Help Text">
            <Empty 
              icon={Package}
              title="No Data"
              description="Sync your account or import data to get started."
              variant="default"
              action={
                <div style={{ marginTop: theme.spacing[4] }}>
                  <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.neutral[500], marginBottom: theme.spacing[3] }}>
                    Need help? <a href="#" style={{ color: theme.colors.primary[600], textDecoration: "none" }}>View documentation</a>
                  </p>
                </div>
              }
            />
          </VariantGroup>
        </ComponentSection>

        {/* Kbd */}
        <ComponentSection 
          title="Keyboard Key"
          description="Display keyboard key"
        >
          <VariantGroup label="Keys">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>C</Kbd>
            <span style={{ color: theme.colors.muted_foreground }}>to copy</span>
          </VariantGroup>
        </ComponentSection>

        {/* Button Group */}
        <ComponentSection 
          title="Button Group"
          description="Grouped buttons with multiple layouts and variants"
        >
          <VariantGroup title="Basic Button Groups">
            <div style={{ display: "flex", gap: theme.spacing[8], alignItems: "center", flexWrap: "wrap" }}>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="md">Left</ButtonGroupButton>
                <ButtonGroupButton size="md">Center</ButtonGroupButton>
                <ButtonGroupButton size="md">Right</ButtonGroupButton>
              </ButtonGroup>
              <ButtonGroup variant="outline">
                <ButtonGroupButton size="md">Left</ButtonGroupButton>
                <ButtonGroupButton size="md">Center</ButtonGroupButton>
                <ButtonGroupButton size="md">Right</ButtonGroupButton>
              </ButtonGroup>
            </div>
          </VariantGroup>

          <VariantGroup title="Icon-Only Button Groups">
            <div style={{ display: "flex", gap: theme.spacing[8], alignItems: "center", flexWrap: "wrap" }}>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="md" icon={Edit} />
                <ButtonGroupButton size="md" icon={Copy} />
                <ButtonGroupButton size="md" icon={Share2} />
              </ButtonGroup>
              <ButtonGroup variant="outline">
                <ButtonGroupButton size="md" icon={Edit} />
                <ButtonGroupButton size="md" icon={Copy} />
                <ButtonGroupButton size="md" icon={Share2} />
              </ButtonGroup>
            </div>
          </VariantGroup>

          <VariantGroup title="With Statistics">
            <div style={{ display: "flex", gap: theme.spacing[8], alignItems: "center", flexWrap: "wrap" }}>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="md" label="Likes" stat="42" />
                <ButtonGroupButton size="md" label="Views" stat="128" />
                <ButtonGroupButton size="md" label="Shares" stat="8" />
              </ButtonGroup>
            </div>
          </VariantGroup>

          <VariantGroup title="Active State">
            <div style={{ display: "flex", gap: theme.spacing[8], alignItems: "center", flexWrap: "wrap" }}>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="md" isActive>Left</ButtonGroupButton>
                <ButtonGroupButton size="md">Center</ButtonGroupButton>
                <ButtonGroupButton size="md">Right</ButtonGroupButton>
              </ButtonGroup>
            </div>
          </VariantGroup>

          <VariantGroup title="Sizes">
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="sm">Small</ButtonGroupButton>
                <ButtonGroupButton size="sm">Group</ButtonGroupButton>
              </ButtonGroup>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="md">Medium</ButtonGroupButton>
                <ButtonGroupButton size="md">Group</ButtonGroupButton>
              </ButtonGroup>
              <ButtonGroup variant="default">
                <ButtonGroupButton size="lg">Large</ButtonGroupButton>
                <ButtonGroupButton size="lg">Group</ButtonGroupButton>
              </ButtonGroup>
            </div>
          </VariantGroup>

          <VariantGroup title="Vertical Layout">
            <div style={{ display: "flex", gap: theme.spacing[8], alignItems: "flex-start", flexWrap: "wrap" }}>
              <ButtonGroup variant="default" vertical>
                <ButtonGroupButton size="md">Top</ButtonGroupButton>
                <ButtonGroupButton size="md">Middle</ButtonGroupButton>
                <ButtonGroupButton size="md">Bottom</ButtonGroupButton>
              </ButtonGroup>
            </div>
          </VariantGroup>
        </ComponentSection>

        {/* Input OTP */}
        <ComponentSection 
          title="Input OTP"
          description="One-time password input"
        >
          <InputOTP maxLength={6} />
        </ComponentSection>

        {/* Footer */}
        <div style={{ 
          marginTop: theme.spacing[12], 
          paddingTop: theme.spacing[8], 
          borderTop: `1px solid ${theme.colors.border}`,
          textAlign: "center"
        }}>
          <p style={{ color: theme.colors.muted_foreground, fontSize: theme.typography.fontSize.sm }}>
            This is a comprehensive showcase of all available components and their variants.
          </p>
          <p style={{ color: theme.colors.muted_foreground, fontSize: theme.typography.fontSize.sm }}>
            Request any changes or new variants as needed.
          </p>
        </div>
      </Container>
    </Layout>
  )
}
