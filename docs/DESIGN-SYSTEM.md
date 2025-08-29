# Receep: Cross-Platform Mobile App Design System

## Overview

Receep is a friendly expense-tracking app (its name suggesting "receipt") with a mascot-like logo – imagine a smiling receipt character with a green check-mark – to emphasize ease and completion. The visual identity uses a clean, trust-inspiring palette (e.g. a teal or blue primary color with contrasting accents for buttons and highlights). 

We recommend using system fonts for readability and consistency:
- **iOS**: San Francisco (SF Pro) 
- **Android**: Roboto for body text

Set body copy at least 16–17pt/sp (per HIG/Material guidelines) to ensure legibility. Headings can use a slightly larger weight or a complementary font to create hierarchy. Icons and graphics should be simple line or flat styles (e.g. Material icons or SF Symbols) that match the friendly brand (for example, a stylized camera icon for the scanner, chart icons for analytics, etc.).

## Core Palette and Typography

### Color Palette
- **Primary**: Teal for active elements and highlights
- **Secondary**: Orange for calls-to-action
- **Neutral**: White/gray backgrounds with dark text for contrast
- **Charts**: 3–4 well-contrasted hues maximum

### Typography Guidelines
- Use system default fonts (SF/Roboto) for body text and controls
- Bolder weight or distinctive but legible font for headings
- Minimum 16pt for body text (aligns with Apple's HIG 17pt minimum and Material's 16sp recommendations)
- Avoid tiny caption fonts
- Follow accessibility contrast standards (dark text on light backgrounds)

## Navigation & Layout

Receep's structure uses a bottom tab bar (Tab Bar on iOS, Bottom Navigation on Android) to switch between the app's 3–5 main sections. We suggest four tabs:

1. **Home (Receipts)**: Shows all scanned receipts in a chronological list
2. **Scan**: Opens the camera to capture a new receipt
3. **Stats/Dashboard**: Shows spending analytics (charts and reports)
4. **Profile/Settings**: Shows user info, account options, etc.

This matches Material Design guidance that bottom navigation is ideal for 3–5 top-level destinations. Each tab has an icon and label; when active, it's tinted the primary color. On Android, consider using a Floating Action Button (FAB) for quick scanning access.

### Screen Layout Principles
- Simple, clean layouts with cards or sections
- Headers use the brand font/weight and clear section titles
- Lists use consistent spacing and simple dividers
- Standard back button or left-swipe gesture to return from details
- Visual cues and animations guide transitions

## Onboarding & Authentication

### Welcome Flow
The welcome/onboarding flow should build trust and get users up to speed quickly:
- Simple intro screen with mascot logo and tagline ("Organize your receipts effortlessly")
- Emphasize security ("Bank-level encryption") and ease of use
- Brief feature highlights (e.g. "Snap receipts, get expense insights, stay on budget")
- Show progress indicators (e.g. step dots) to orient the user

### Sign-up/Login
- **Minimal and familiar** approach
- **Social Login Options**:
  - Sign in with Google (Android & iOS)
  - Sign in with Apple (iOS) - required if other social logins are offered
- **Traditional**: Email/password form
- Ask only for essential info (name, email) to reduce drop-off
- Include "Log In" link for returning users

## Receipt Scanner

### Camera Interface
- **Clean and easy** design with live camera preview
- Outline or guide frame for receipt positioning
- Auto-detect receipt edges on capture
- Immediate processing with visual feedback

### User Interaction
- Tap "Scan" or press FAB to capture
- **Success Animation**: Brief glowing border and gentle haptic pulse
- **Error Animation**: Shake or red outline with soft vibration for retry
- **OCR Processing**: Auto-transcribe receipt data to reduce manual entry
- Quick preview of scanned data (store name, date, total) with edit option

### Scanner Screen Details
- Overlay controls for flash on/off and gallery access
- Camera shutter button (minimum 64dp)
- "Processing…" overlay with spinner/progress bar
- Green check and confirmation haptic on success
- Retry prompt on failure
- Large, readable text (16pt+)

## Receipts List

### List Structure
- **Vertical scrollable list** of "cards" or rows
- Each item displays:
  - Thumbnail (receipt icon or cropped image)
  - Store name
  - Date/time
  - Total amount
  - Receipt category tag (e.g. "Groceries")

### Organization
- Group by date ("Today", "Yesterday", "Last Week") with sticky headers
- Consistent spacing and type hierarchy (store name bold, details smaller)
- Tapping a receipt opens detail view
- Quick "Add Receipt" button for easy access
- Empty state: "No receipts yet. Tap + to add one!"

## Receipt Detail

### Content Structure
**Header Section**:
- Store name (with logo if available)
- Date/time

**Item List**:
- Product line items: quantity, name, price
- Clean list format
- Skip details for simple receipts (e.g. gas)

**Summary Section**:
- Subtotal, taxes, grand total
- Clearly labeled tax lines ("Sales Tax: $2.50")
- Store address or notes (collapsible)

**Actions**:
- Share/export options (email receipt, copy data)
- Edit Receipt option
- "Back" navigation arrow

### Design Principles
- Consistent fonts and spacing
- Dividers between sections
- Scrollview for large receipts
- Legible fonts and minimal colors (black/dark text on white)
- Paper receipt aesthetic

## Statistics Dashboard

### Overview
The Stats tab visualizes spending data with charts and reports – no boring tables. Use segmented control or tabs to switch time range (Week/Month/Quarter/Year).

### Chart Types

#### 1. Spend by Category
- **Pie/donut chart** (if <7 categories) or **horizontal bar chart**
- Each category (Groceries, Entertainment, etc.) distinctly colored
- Show percentages and legend
- Limit to 3–5 colors

#### 2. Spend Over Time
- **Line or bar chart** showing total spend trend
- Points/dots highlight peaks
- Cover selected period (e.g. last 4 weeks or months)

#### 3. Top 5 Products
- **Quantity chart**: Stacked bar chart of top items count
- **Amount chart**: Horizontal bar of dollar totals
- Short labels and helpful icons

#### 4. Additional Insights
- "Average Daily Spend"
- "Budget vs Actual" (if budgets are a feature)
- Contextual insights ("You spent 10% more on groceries this month")

### Design Guidelines
- **Contrast**: Light backgrounds with dark text/lines (or vice versa)
- **Color palette**: Brand accent for highlights, neutrals for baseline
- **Typography**: Legible 16pt+ text for labels and data
- **Touch targets**: Minimum 44px (e.g. legend toggles)
- **Charts**: Bar charts for comparing categories, line charts for trends
- **Focus**: Uncluttered design focusing on key insights

### Bonus Reports
- "Spend by Merchant"
- "Weekly Trends"
- Keep core focus on categories, trends, and top items

## Profile & Settings

### User Information
- User's name, email, optional profile photo

### Account Management

#### Subscription Status
- Current plan display ("Premium Member – Auto-Renews $4.99/mo")
- "Upgrade to Premium / Manage Subscription" button
- Link to App Store/Play Store billing

#### Account Actions
- **Delete My Account**: GDPR compliance option
  - Confirmation dialog ("Are you sure? All data will be permanently removed.")
  - Accessible but requires confirmation
  - Strong haptic/animation cue with second tap requirement
- **Logout**: Clear sign-out button

### Design Approach
- Simple list rows or cards
- Platform-appropriate styling:
  - **iOS**: Grouped table view
  - **Android**: Preferences screen or simple list
- Icons for actions (trash icon for delete)
- Red text for destructive actions

## Micro-Interactions & Haptics

### Animation Principles
- **Purposeful and subtle** animations
- Button gentle depression (scale down/bounce) when tapped
- Smooth list transitions
- Instant feedback on actions
- Quick green checkmark animation for successful saves
- Loading spinners or skeleton screens during data fetch

### Haptic Feedback Guidelines
- **Light, brief tap** for routine actions (toggles, list items)
- **Stronger pulse** for important events (receipt saved, sync errors)
- **Consistent patterns** for similar actions
- **Avoid overuse** – only when something real changed
- **Co-design** with animations and sounds for harmony

### Specific Interactions
- Highlight selected bottom-tab icon
- Scanner capture overlay animation
- Error animations (shake, red outline with vibration)
- Success confirmations (green check with haptic)

## Summary of Styles

### Colors
- **Primary**: Brand teal
- **Accent**: Orange
- **Background**: Light gray
- **Cards**: White
- **Text**: Mostly dark on light
- **Charts**: High-contrast colors, 3–4 hues maximum

### Typography
- **System fonts**: San Francisco (iOS) / Roboto (Android)
- **Headings**: Medium/semibold weight
- **Body**: Regular weight, minimum 16pt/sp
- **Line height and spacing**: Optimized for small screen readability

### Icons & Imagery
- **Style**: Friendly but flat line icons
- **Examples**: Camera, chart, person icons
- **Logo/mascot**: Used sparingly (e.g. welcome screen)
- **Receipt images**: Thumbnail previews when shown

### UI Components
- **Buttons**: 
  - Rounded rectangles
  - Filled for primary actions
  - Outline or ghost for secondary
- **Controls**: Platform-standard switches for toggles
- **Forms**: Standard text fields and dialogs
- **Navigation**: Platform conventions (iOS/Android)

## Conclusion

By combining these elements – a cohesive brand identity (Receep + check-mark mascot), consistent fonts and colors, intuitive navigation, and engaging micro-interactions – Receep will feel polished and user-friendly on both iPhone and Android. The result is a low-development-effort design (using native components and shared style guides) that still delivers a "nice and sweet" UI with thoughtful animations and haptic feedback.

---

## Sources

This design system was informed by expense-tracking and fintech design guides, including:
- Nimble AppGenie on key features
- Eleken on receipt OCR
- UX best practices for mobile typography, navigation, microinteractions, haptics, and data visualization
- Apple Human Interface Guidelines
- Material Design Guidelines
