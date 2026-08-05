# Day R Survival - Tabela de Preços Interativa

## Design Philosophy: Post-Apocalyptic Functional Elegance

**Chosen Approach:** A sleek, data-driven interface inspired by survivor camp terminals and trading posts in a post-apocalyptic world. The design balances utility with atmospheric immersion.

---

## Core Design Elements

### Design Movement
**Retro-Futuristic Minimalism** meets **Apocalyptic Realism**
- Inspired by military/industrial UI design, Soviet-era aesthetics, and survival game interfaces
- Clean, scannable layouts with purposeful hierarchy
- Muted, earthy color palette reflecting the wasteland setting

### Core Principles
1. **Data Clarity**: Every number, ratio, and comparison must be immediately scannable
2. **Atmospheric Immersion**: Visual language should reinforce the post-apocalyptic survival theme
3. **Functional Elegance**: No decoration without purpose; every visual element serves information
4. **Accessibility**: High contrast, readable typography, keyboard-navigable

### Color Philosophy
- **Primary Background**: Deep charcoal (`#1a1a1a`) with subtle texture overlay to suggest worn metal/concrete
- **Accent Color**: Rust-orange (`#d97706`) for highlights, representing weathered metal and warning signals
- **Secondary Accent**: Muted teal (`#0f766e`) for data visualization and secondary information
- **Text**: Off-white (`#f5f5f5`) for primary text, muted gray (`#9ca3af`) for secondary
- **Emotional Intent**: Survival, caution, reliability—colors that feel grounded and trustworthy

### Layout Paradigm
**Asymmetric Grid with Sidebar Navigation**
- Left sidebar: Category filter and quick stats
- Main content: Tabular data with expandable rows
- Right rail: Trending prices and market insights
- Avoids centered, symmetrical layouts for visual interest

### Signature Elements
1. **Weathered Metal Borders**: Subtle beveled edges and texture overlays on cards
2. **Monospace Typography for Numbers**: Courier/Roboto Mono for all prices to emphasize data precision
3. **Animated Price Indicators**: Small directional arrows and color shifts showing price trends
4. **Survival Camp Terminal Aesthetic**: Glowing text on dark backgrounds, reminiscent of old CRT monitors

### Interaction Philosophy
- **Hover States**: Subtle glow effect on interactive elements
- **Filtering**: Smooth transitions when toggling categories
- **Sorting**: Click headers to sort; visual feedback with animated arrows
- **Comparisons**: Side-by-side price comparison with percentage difference calculations
- **Responsive Design**: Mobile-first, collapsible sidebar on small screens

### Animation Guidelines
- **Entrance**: Staggered fade-in of table rows (50ms delay per row) for a cascading reveal
- **Hover**: 150ms ease-out scale(1.02) on rows with subtle shadow increase
- **Transitions**: All UI transitions 200-250ms cubic-bezier(0.23, 1, 0.32, 1) for snappy feel
- **Data Updates**: Price changes trigger a 300ms highlight flash (accent color) then fade back
- **Modals/Filters**: 250ms ease-out entrance from edges

### Typography System
- **Display Font**: "Courier Prime" or "IBM Plex Mono" (monospace, bold) for headers—reinforces technical/survival theme
- **Body Font**: "Inter" or "Roboto" (sans-serif, 400-500 weight) for descriptions and secondary text
- **Data Font**: "Roboto Mono" (monospace, 500 weight) for all prices, ratios, and numbers
- **Hierarchy**:
  - H1: 32px, bold, monospace (category titles)
  - H2: 24px, semi-bold, monospace (subcategory)
  - Body: 14px, regular, sans-serif (descriptions)
  - Data: 16px, medium, monospace (prices)

### Brand Essence
**One-liner**: *"A survivor's trading terminal for navigating the post-apocalyptic economy of Day R."*

**Personality Adjectives**:
1. **Pragmatic** — Every feature exists to solve a real problem
2. **Immersive** — Visual language reinforces the wasteland setting
3. **Reliable** — Data-driven, trustworthy, no fluff

### Brand Voice
**Headlines & CTAs**: Direct, action-oriented, survival-focused
- ❌ "Welcome to our pricing guide"
- ✅ "Survival Trading Terminal"
- ✅ "Check Current Market Rates"
- ✅ "Optimize Your Trades"

**Microcopy**: Practical, informative, slightly sardonic
- "Last updated: [timestamp]"
- "Steel ($) = Primary currency | Cement (€) = Secondary (1:2 ratio)"
- "Tip: Salted meats offer consistent profit margins"

### Wordmark & Logo
**Logo Concept**: A stylized **survival camp trading post icon**
- Central element: Crossed pickaxe and wrench (tools of survival)
- Surrounding ring: Gear teeth (mechanical, industrial)
- Color: Rust-orange (#d97706) on transparent background
- Style: Bold, geometric, 64x64px minimum
- Usage: Top-left corner of header, favicon

### Signature Brand Color
**Rust-Orange (#d97706)**: Unmistakably apocalyptic, represents weathered metal, warning signals, and the harsh sun of the wasteland. Used for all interactive elements, highlights, and data emphasis.

---

## Style Decisions (Applied)
- **Card Design**: Subtle border (1px solid, 20% opacity) with 4px border-radius, no shadow (flat design with minimal depth)
- **Table Styling**: Alternating row backgrounds (2% opacity difference) for scanability
- **Price Display**: Always show both Steel and Cement values; highlight the "better deal" with accent color
- **Rarity Badges**: Small colored dots (common=gray, uncommon=orange, rare=red) next to item names
- **Demand Indicator**: Vertical bar chart sparkline showing demand level (visual at a glance)
