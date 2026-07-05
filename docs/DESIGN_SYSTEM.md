# Spendscape — Design System

Version: 1.0
Status: Living Document
Owner: Design + Frontend

---

# Philosophy

The design system exists to make every screen feel like it belongs to the same product.

Users should never notice inconsistency.

Every component should feel handcrafted.

---

# Design Language

Premium.

Minimal.

Elegant.

Modern.

Data-first.

Calm.

Sophisticated.

---

# Inspiration

Do NOT copy.

Study principles from:

- Apple
- Linear
- Arc Browser
- Stripe
- TradingView
- Notion
- Spotify Wrapped

---

# Design Principles

Hierarchy before decoration.

Whitespace before borders.

Motion before explanation.

Typography before color.

Color before icons.

Consistency over creativity.

---

# Color Philosophy

Colors communicate meaning.

Never use color purely for decoration.

---

## Financial Colors

Income

Green

Expense

Red

Transfer

Blue

Savings

Emerald

Investment

Purple

Warning

Amber

Error

Red

Success

Green

Neutral

Gray

---

# Theme

Dark Mode First

Light Mode Fully Supported

No hardcoded colors.

Everything must use semantic tokens.

Example:

Background

Surface

Card

Border

Text Primary

Text Secondary

Muted

Accent

Positive

Negative

Warning

---

# Typography

Primary Font

Geist

Fallback

Inter

Hierarchy

Display

H1

H2

H3

Body Large

Body

Caption

Label

Mono

Avoid excessive font weights.

Prefer spacing over bold text.

---

# Grid

Desktop

12 Columns

Tablet

8 Columns

Mobile

4 Columns

Maximum Content Width

1440px

---

# Spacing

Use an 8px spacing system.

Allowed values:

4

8

12

16

24

32

40

48

64

80

96

Avoid arbitrary spacing.

---

# Border Radius

Small

8px

Medium

12px

Large

20px

Cards

24px

Floating Elements

9999px

---

# Shadows

Use subtle elevation.

Prefer blur over heavy shadows.

Dark mode shadows should remain soft.

---

# Borders

Hairline borders.

Low contrast.

Avoid thick outlines.

---

# Glass Effects

Use sparingly.

Allowed:

Navigation

Floating Panels

Dialogs

Never use glass everywhere.

---

# Motion Philosophy

Motion communicates.

Never decorate.

---

## Duration

Fast

150ms

Normal

250ms

Large

400ms

Page Transition

500ms

---

## Easing

Use smooth curves.

Avoid bounce unless meaningful.

---

# Animations

Allowed

Fade

Slide

Scale

Layout

Shared Element

Number Counting

Chart Drawing

Not Allowed

Flash

Shake

Infinite Animations

Distracting Motion

---

# Icons

Use Lucide Icons.

Consistent stroke width.

No mixed icon packs.

---

# Buttons

Variants

Primary

Secondary

Ghost

Outline

Danger

Success

Loading

Sizes

Small

Medium

Large

Icon

---

# Inputs

Rounded

Clear Labels

Visible Focus States

Inline Validation

Helpful Errors

---

# Cards

Every card includes

Title

Content

Optional Footer

Consistent Padding

Rounded Corners

Hover Feedback

---

# Tables

Minimal.

Avoid heavy borders.

Hover states.

Sticky headers.

Responsive.

---

# Charts

Charts are part of the product identity.

Never use default chart styles.

Every chart must:

Animate

Be Interactive

Be Responsive

Support Tooltips

Support Keyboard Navigation

Provide Accessible Summary

---

# Visualization Language

Treemap

Hierarchy

Sankey

Flow

Calendar Heatmap

Time

Bubble Chart

Magnitude

Timeline

Progression

Galaxy

Relationships

Sunburst

Structure

Every visualization answers a question.

Never display charts without purpose.

---

# Empty States

Every empty state teaches.

Include:

Illustration

Explanation

Primary Action

---

# Loading States

Skeletons.

Progressive loading.

Avoid spinners whenever possible.

---

# Error States

Explain:

What happened.

Why.

How to recover.

---

# Responsive Rules

Mobile First.

Navigation becomes drawer.

Charts adapt.

Tables become cards.

No horizontal scrolling.

---

# Accessibility

Keyboard First.

Visible Focus.

Reduced Motion.

Screen Readers.

High Contrast.

Semantic HTML.

---

# Component Rules

Reusable.

Composable.

Typed.

Accessible.

Independent.

No duplicated logic.

---

# Naming

Components

PascalCase

Hooks

camelCase

Files

kebab-case

Constants

UPPER_CASE

Types

PascalCase

---

# Design Review Checklist

Before shipping ask:

Does it feel premium?

Is spacing consistent?

Is motion meaningful?

Is typography clear?

Does it match the product vision?

Is it accessible?

Is it responsive?

Would Apple, Linear or Stripe ship something like this?

If not, improve it.