# Auth Pages Design Specification

## Design References
- Login Page:
  - Login Tab: `product-requirements/design/login-page-login-tab.png`
  - Signup Tab: `product-requirements/design/login-page-signup-tab.png`
- Signup Page:
  - Login Tab: `product-requirements/design/signup-page-login-tab.png`
  - Signup Tab: `product-requirements/design/signup-page-signup-tab.png`
- Home Page Design:
  - Top Half (Buyer Tab): `product-requirements/design/trycrib-home-page-top-half-buyertab.png`
  - Top Half (Seller Tab): `product-requirements/design/trycrib-home-page-top-half-sellertab.png`
  - Bottom Half: `product-requirements/design/trycrib-home-page-bottom-half.png`

## Common Elements

### Page Layout
- Background color: #FAFAFA
- Content max width: 360px
- Content vertically and horizontally centered
- Spacing between sections: 24px (space-y-6)

### Header
- Title: "Welcome to TryCrib"
  - Font size: 28px
  - Font weight: Bold
  - Color: #111827
- Subtitle: "Experience your future home before making an offer"
  - Font size: 14px (text-sm)
  - Color: #6B7280
- Spacing between title and subtitle: 8px (space-y-2)

### Tab Navigation
- Full width tabs
- Bottom border: 1px solid #E5E7EB
- Active tab:
  - 2px bottom border
  - Border color: #0066FF
  - Text color: #111827
- Inactive tab:
  - Text color: #667085
- Tab padding: px-6 py-3
- Tab text size: 14px (text-sm)

### Input Fields
- Height: 40px (h-10)
- Border radius: 8px (rounded-lg)
- Border color: #D0D5DD
- Background: white
- Padding: 12px (px-3 py-2)
- Labels:
  - Color: #344054
  - Size: 14px (text-sm)
  - Margin bottom: 6px (mb-1.5)

### Buttons
- Height: 40px (h-10)
- Border radius: 8px (rounded-lg)
- Font weight: Medium
- Primary button:
  - Background: #0066FF
  - Text color: white
- Secondary button (Google):
  - Background: white
  - Border: 1px solid #D0D5DD
  - Text color: #111827

### Google Sign In
- Google logo: 16x16px SVG
- Logo margin right: 8px (mr-2)
- Text: "Google"
- Button centered content
- Full width

### Divider
- Text: "Or continue with"
- Text color: #667085
- Text size: 12px (text-xs)
- Line color: #D0D5DD
- Background matches page (#FAFAFA)
- Padding around text: 16px (px-4)

## Login Form Specific

### Form Fields Order
1. Email input
2. Password input
3. Log In button
4. Create Account button
5. Forgot Password link
6. Divider
7. Google button
8. Terms text

### Forgot Password Link
- Text: "Forgot your password?"
- Color: #0066FF
- Size: 14px (text-sm)
- Centered

### Terms Text
- Size: 11px
- Color: #667085
- Links color: #0066FF
- Centered

## Sign Up Form Specific

### Form Fields Order
1. Full Name input
2. Email input
3. Password input
   - Helper text: "Password must be at least 6 characters long"
   - Helper text color: #667085
   - Helper text size: 12px (text-xs)
4. Create Account button
5. Divider
6. Google button
7. Terms checkbox and text

### Terms Checkbox
- Size: 14x14px (h-3.5 w-3.5)
- Border color: #D0D5DD
- Checked color: #0066FF
- Text size: 11px
- Text color: #667085
- Links color: #0066FF

## Error States
- Text color: #DC2626 (red-600)
- Text size: 14px (text-sm)
- Centered
- Appears below form fields, above submit button

## Loading States
- Primary buttons:
  - Login: "Logging in..." when loading
  - Signup: "Creating account..." when loading
- Disabled state opacity: 50%

---

# Home Page Design Specification (Current Implementation)

## Hero Section
- Height: 400px (mobile), 500px (sm), 600px (md)
- Full-width carousel with auto-advance every 3 seconds
- Dark overlay on images: `bg-black/30`

### Hero Content
- Container with max-width and padding: `container mx-auto px-4`
- Content max-width: `max-w-3xl`
- Title:
  - Font size: 2xl (mobile), 3xl (sm), 5xl (md), 6xl (lg)
  - Font weight: Bold
  - Color: white
  - Text shadow enabled
  - Margin bottom: 8px (mobile), 16px (md)
- Subtitle:
  - Font size: sm (mobile), base (sm), lg (md), xl (lg)
  - Color: white with 90% opacity
  - Text shadow enabled

### Tab Navigation
- Centered tabs with 8px gap
- Tab button:
  - Padding: px-3 (mobile), px-4 (sm), px-6 (md), py-2
  - Border radius: full
  - Font size: sm
  - Font weight: medium
  - Min width: 90px (mobile), 100px (sm)
  - Active state:
    - Background: #0066FF
    - Text color: white
  - Inactive state:
    - Background: white
    - Text color: gray-600
    - Hover: 90% opacity

### Search Form
- Background: white
- Border radius: lg
- Shadow: lg
- Padding: 8px (mobile), 12px (md)
- Layout: Stack (mobile), Row (sm)
- Gap between elements: 8px
- Input fields:
  - Height: auto
  - Padding: pl-8/10, pr-3, py-2.5
  - Font size: sm (mobile), base (md)
  - Border: gray-200
  - Border radius: md
  - Focus: blue-500 border and ring
  - Icons:
    - Size: 16px (mobile), 20px (md)
    - Color: gray-400
    - Position: left, vertically centered

## Property Types Section
- Background: gray-50/30
- Padding: py-2 (mobile), py-4 (md)
- Overflow: auto horizontally
- Container: mx-auto px-2 (mobile), px-4 (md)
- Grid: flex (mobile), 3 columns (md), 6 columns (lg)
- Gap: 8px (mobile), 16px (md)

### Property Type Button
- Background: white
- Border radius: 2xl (mobile), 32px (md)
- Padding: py-2/3, px-3/4
- Shadow: [0_1px_2px_rgba(0,0,0,0.08)]
- Min width: 80px (mobile), auto (md)
- Hover: bg-gray-50/80
- Icon:
  - Container: 16px/20px square
  - Icon size: 12px/16px
  - Color: gray-600
  - Stroke width: 1.25
- Label:
  - Font size: 10px (mobile), xs (md)
  - Color: gray-500
  - Margin top: 4px (mobile), 8px (md)

## Featured Properties Section
- Padding: py-8 (mobile), py-16 (md)
- Container: mx-auto px-4

### Section Header
- Title:
  - Font size: 2xl
  - Font weight: semibold
- View all link:
  - Color: blue-600
  - Hover: blue-700
  - Font size: sm
  - Font weight: medium

### Property Cards Grid
- Grid: 1 column (mobile), 2 columns (md), 3 columns (lg)
- Gap: 24px

### Property Card
- Background: white
- Border radius: xl
- Shadow: lg
- Overflow: hidden
- Image:
  - Height: 200px (mobile), 240px (md)
  - Object fit: cover
- Content padding: 16px (mobile), 24px (md)
- Title:
  - Font size: lg
  - Font weight: semibold
  - Margin bottom: 4px
- Location:
  - Font size: sm
  - Color: gray-600
  - Margin bottom: 16px
- Price:
  - Font size: xl
  - Font weight: semibold
- View Details button:
  - Background: blue-600
  - Hover: blue-700
  - Text color: white
  - Padding: px-4 py-2
  - Border radius: lg
  - Font size: sm
  - Font weight: medium
- Property details:
  - Font size: sm
  - Color: gray-600
  - Separator: gray-300

## How It Works Section
- Background: gray-900
- Text color: white
- Padding: py-8 (mobile), py-16 (md)
- Container: mx-auto px-4

### Section Header
- Font size: 2xl (mobile), 3xl (md)
- Font weight: semibold
- Text align: center
- Margin bottom: 32px (mobile), 64px (md)

### Steps Grid
- Grid: 1 column (mobile), 3 columns (md)
- Gap: 32px (mobile), 48px (md)

### Step Card
- Text align: center
- Number circle:
  - Size: 48px
  - Background: blue-600
  - Border radius: full
  - Font size: xl
  - Font weight: semibold
  - Margin bottom: 24px
- Title:
  - Font size: lg (mobile), xl (md)
  - Font weight: medium
  - Margin bottom: 8px (mobile), 12px (md)
- Description:
  - Color: gray-400
  - Font size: sm (mobile), base (md)

## Footer
- Background: white
- Padding top: 64px
- Container: mx-auto px-4
- Grid: 3 columns
- Gap: 32px
- Text align: center 