# Tools Page Implementation Plan

## Requirements Analysis

### Features Needed
1. **Search Box** - Filter tools by name/description
2. **Tool Cards** - Display tool information in card format
3. **Create Button** - Add new tools (+Create)
4. **Pagination** - Navigate through tool list
5. **Tool Card Content**:
   - Tool name
   - Tool description
   - Tool capabilities (as chips/badges)

---

## Design Architecture

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│  PageHeader (Tools)                          [+Create] [Search] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Tool Card       │  │  Tool Card       │  │  Tool Card       │
│  │  ─────────────── │  │  ─────────────── │  │  ─────────────── │
│  │ Name: Web Search │  │ Name: Executor   │  │ Name: File Mgr   │
│  │ Desc: Search...  │  │ Desc: Execute... │  │ Desc: File ops.. │
│  │ [search] [web]   │  │ [exec] [code]    │  │ [file] [ops]     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  │  Tool Card       │  │  Tool Card       │  │  Tool Card       │
│  │  ...             │  │  ...             │  │  ...             │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│  [<] 1 2 3 4 [>]  (Pagination)                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Usage & Reusable Elements

### Existing Components to Use
1. **Layout** - Main layout wrapper
2. **PageHeader** - Title section with optional subtitle
3. **Input** - Search box
4. **Button** - +Create button
5. **Card** - Tool card container (variant: "default")
6. **Badge/Chips** - Tool capabilities display
7. **Text** - Tool name, description
8. **Pagination** - Bottom pagination
9. **Separator** - Visual dividers if needed

### Theme Integration
- All spacing from `theme.spacing`
- All colors from `theme.colors`
- All borders from `theme.borderWidth` and `theme.borderRadius`
- All transitions from `theme.transitions`
- All shadows from `theme.shadows`

---

## Implementation Steps

### Step 1: Data Structure
```javascript
const tools = [
  {
    id: 1,
    name: "Web Search",
    description: "Search the internet for real-time information",
    capabilities: ["search", "web", "realtime"]
  },
  // ... more tools
]
```

### Step 2: Component Structure
1. Create ToolsPage.jsx with:
   - Search state & filtering logic
   - Pagination state & logic
   - Tools data array
   - Render layout

2. Create ToolCard.jsx component:
   - Accepts tool object
   - Displays name, description, capabilities
   - Uses Card, Badge, and Text components

### Step 3: Features to Implement

#### Search Feature
- Filter tools by name and description
- Real-time search as user types
- Fuzzy search (like combobox)

#### Pagination
- Items per page: 6 (2 rows × 3 columns)
- Show page numbers
- Previous/Next navigation
- Update card grid based on page

#### Create Button
- Positioned in header
- Opens dialog/modal (for later implementation)

### Step 4: Styling & Layout
- Use `CardGrid` component or simple grid
- 3 columns per row
- Responsive grid layout
- Proper spacing using theme values
- Hover effects on cards

---

## File Structure
```
pages/
  ToolsPage.jsx (main page - 200-250 lines)

components/
  ToolCard.jsx (reusable card component - 80-100 lines)
  
utils/
  toolFilters.js (optional - search/filter logic)
```

---

## Key Styling Details

### ToolCard Dimensions
- Width: responsive grid
- Height: auto (content-based)
- Padding: `theme.spacing[6]`
- Border: `theme.borderWidth.sm` solid `theme.colors.border`
- Border-radius: `theme.borderRadius.md`
- Background: `theme.colors.card`
- Shadow: `theme.shadows.md` on hover

### Capabilities Chips
- Variant: "outline" or "flat"
- Color: "secondary"
- Size: "sm"
- Display in flex with gap: `theme.spacing[2]`

### Search Box
- Width: responsive or fixed (e.g., 300px)
- Placeholder: "Search tools..."
- Position: Header right side

### Pagination
- Centered or left-aligned
- Size: "md"
- Variant: "default"
- Spacing: top margin `theme.spacing[6]`

---

## State Management
```javascript
// Tools page state
const [tools, setTools] = useState([...])
const [searchQuery, setSearchQuery] = useState("")
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 6

// Computed values
const filteredTools = tools.filter(tool => 
  fuzzySearch(searchQuery, tool.name + " " + tool.description)
)
const totalPages = Math.ceil(filteredTools.length / itemsPerPage)
const paginatedTools = filteredTools.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
)
```

---

## Next Steps
1. Create ToolCard.jsx component
2. Update ToolsPage.jsx with new layout
3. Implement search filtering
4. Implement pagination logic
5. Style everything with theme
6. Test responsiveness
