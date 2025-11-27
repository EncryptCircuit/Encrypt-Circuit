# Encrypt Circuit Platform Design Guidelines

## Design Approach
**Reference-Based Approach** drawing from modern developer platforms (Linear, Vercel, GitHub, Supabase) combined with Material Design principles for interactive components. This creates a technical yet accessible interface befitting a zero-knowledge development platform.

**Core Principle**: Technical precision with visual clarity. The interface should feel powerful and professional while remaining intuitive for developers building cryptographic circuits.

---

## Typography System

**Font Family**: 
- Primary: 'Inter' for UI elements and body text
- Monospace: 'JetBrains Mono' for code, circuit logic, and technical data

**Hierarchy**:
- Page Headers: text-3xl font-bold (36px)
- Section Headers: text-xl font-semibold (20px)
- Component Titles: text-lg font-medium (18px)
- Body Text: text-sm (14px)
- Labels/Metadata: text-xs font-medium uppercase tracking-wide (12px)
- Code/Technical: text-sm font-mono (14px monospace)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-4 to p-6
- Section spacing: space-y-8 or gap-6
- Card padding: p-6
- Large margins: mt-12 or mb-16

**Dashboard Structure**:
- **Sidebar Navigation** (w-64): Fixed left sidebar with main feature sections
- **Main Content Area**: flex-1 with max-width constraints per section
- **Top Bar**: Sticky header (h-16) with breadcrumbs, search, and account menu
- **Content Grid**: Container with max-w-7xl mx-auto px-6

---

## Component Library

### Navigation & Structure
**Sidebar Navigation**:
- Fixed left sidebar with logo at top
- Icon + label navigation items (hover states with subtle background)
- Active state: border-l-2 accent indicator + background fill
- Sections: Circuit Builder, Proof Dashboard, Data Portal, Playground, Demos

**Top Bar**:
- Breadcrumb navigation (Home / Circuit Builder / New Circuit)
- Global search with keyboard shortcut hint
- Network status indicator (live/simulated)
- User account dropdown

### Circuit Builder Interface
**Canvas Area**:
- Large central workspace with grid background (subtle)
- Drag-and-drop zone with clear drop indicators
- Zoom controls (bottom-right corner)
- Pan/zoom mini-map (top-right corner)

**Component Palette** (left panel, w-80):
- Categorized circuit modules with search
- Cards showing: icon, module name, brief description
- Drag handles with visual feedback
- Categories: Identity, Transfers, Storage, AI Inference, Validation

**Properties Panel** (right panel, w-80):
- Selected circuit node configuration
- Form inputs with clear labels
- Parameter validation feedback
- Export code button at bottom

### Proof Verification Dashboard
**Transaction Grid**:
- Table layout with sortable columns
- Columns: Proof ID, Type, Status, Chain, Timestamp, Actions
- Status badges: Verified (green), Pending (yellow), Failed (red)
- Expandable rows showing proof details

**Multi-Chain Status Cards**:
- Grid of chain cards (grid-cols-3)
- Each card: Chain icon, name, verification count, latency
- Real-time status indicators (pulsing dots)

**Verification Timeline**:
- Horizontal timeline visualization
- Shows proof journey across chains
- Interactive nodes with tooltips

### Data Portal
**Encryption Interface**:
- Two-panel layout (split view)
- Left: Plain data input (textarea with syntax highlighting)
- Right: Encrypted output with copy button
- Controls between panels: Encrypt/Decrypt toggle, algorithm selector

**Computation Verification**:
- Three-step process visualization (horizontal stepper)
- Steps: Submit → Compute → Verify
- Each step shows status, timestamp, proof hash
- Download proof button

### Developer Playground
**Example Cards Grid** (grid-cols-2 lg:grid-cols-3):
- 5 interactive demo cards: Private Voting, Encrypted Messaging, Confidential Transfers, Identity Verification, Private AI
- Each card: Icon, title, description, "Try Demo" button
- Hover: subtle elevation increase

**Demo Execution View**:
- Modal or slide-out panel
- Step-by-step interactive walkthrough
- Code snippets with copy buttons
- Real-time execution visualization
- Results panel showing proof generation

### Core UI Elements
**Cards**:
- Rounded corners (rounded-lg)
- Subtle border with shadow-sm
- Padding p-6
- Hover state: subtle shadow increase

**Buttons**:
- Primary: Full background, white text, rounded-md px-4 py-2
- Secondary: Border style, transparent background
- Icon buttons: Square (h-9 w-9), centered icon
- Hover: All buttons have subtle opacity/brightness shift

**Form Inputs**:
- Consistent height (h-10)
- Border with focus ring
- Clear labels above (text-sm font-medium mb-1)
- Helper text below in text-xs
- Error states with red accent and icon

**Status Badges**:
- Pill shape (rounded-full px-3 py-1 text-xs font-medium)
- Status-specific backgrounds (green/yellow/red/blue variants)
- Icon prefix where appropriate

**Code Blocks**:
- Monospace font
- Dark background with syntax highlighting
- Copy button in top-right corner
- Line numbers for multi-line blocks

### Data Visualization
**Circuit Flow Diagram**:
- SVG-based node graph
- Nodes: Rounded rectangles with icons and labels
- Connections: Curved paths with directional arrows
- Interactive: Click nodes for details, hover for tooltips

**Execution Visualizer**:
- Real-time animation showing data flowing through circuit
- Pulse effects on active nodes
- Progress indicators
- Sealed/encrypted state visual indicators (lock icons, encrypted text representation)

---

## Interaction Patterns

**Drag & Drop**:
- Clear drag handles (dotted border or grip icon)
- Ghost preview during drag
- Drop zones with dashed border and background change
- Smooth drop animation

**Modals/Overlays**:
- Dark overlay backdrop (bg-black/50)
- Modal content: max-w-2xl centered
- Close button (top-right X)
- Smooth fade-in animation

**Loading States**:
- Skeleton screens for data tables
- Spinner for quick operations
- Progress bars for multi-step processes
- Shimmer effect for card loading

**Tooltips**:
- Appear on hover with slight delay
- Small arrow pointing to target
- Concise text (max 2 lines)
- Position intelligently (above/below based on space)

---

## Responsive Behavior

**Desktop (lg+)**: Full dashboard layout with sidebar
**Tablet (md)**: Collapsible sidebar, maintain multi-column grids
**Mobile (base)**: 
- Hidden sidebar, hamburger menu
- Single column layouts
- Simplified circuit builder (list view vs canvas)
- Stacked panels instead of side-by-side

---

## Brand Integration

Use the geometric circuit design from logo as:
- Subtle background pattern in headers (very low opacity)
- Loading spinner animation (rotating circuit geometry)
- Empty state illustrations (circuit fragments)
- Section dividers (minimal circuit line motifs)

The vibrant blue from logo serves as the primary accent color throughout the interface for:
- Active states
- Primary buttons
- Links and interactive elements
- Success states in proof verification

---

## Images

No photographic images required. This is a technical dashboard relying on:
- Icons from Heroicons (outline style for consistency)
- SVG-based circuit diagrams and data visualizations
- Logo placement in sidebar header
- Illustrative geometric patterns derived from brand