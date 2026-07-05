# Spendscape — Visualization Guidelines

Version: 1.0
Status: Living Document
Owner: Product + Design + Frontend

---

# Philosophy

Visualization is the product.

Charts are not decorations.

Every visualization must answer a question.

Users should discover insights rather than read numbers.

If a chart doesn't teach something, don't build it.

---

# Goals

Visualizations should:

- Explain
- Compare
- Reveal
- Predict
- Encourage exploration

Never simply display data.

---

# Design Principles

Insight over aesthetics.

Interaction over static graphics.

Animation explains change.

Minimal visual noise.

Accessibility first.

---

# Visualization Hierarchy

Level 1

Immediate understanding

Examples

- Stat Cards
- Net Worth
- Income
- Expense

---

Level 2

Comparison

Examples

- Treemap
- Monthly Trend
- Calendar Heatmap

---

Level 3

Exploration

Examples

- Sankey
- Financial Galaxy
- Bubble Universe

---

Level 4

Storytelling

Examples

- Monthly Replay
- Spending Journey
- Financial DNA

---

# Signature Visualizations

These define Spendscape.

---

## Financial Galaxy ⭐

Every category is a planet.

Planet size

↓

Money spent

Orbit

↓

Category

Animation

↓

Money flowing

Click

↓

Zoom

Goal

Make finance feel alive.

---

## Spending River

Timeline where spending flows like water.

Width

↓

Amount

Color

↓

Category

Scroll

↓

Time travel

---

## Financial DNA

Personal spending fingerprint.

Compares

Current Month

Previous Month

Average

Highlights behavioral change.

---

## Spending Replay

Spotify Wrapped for finance.

Animated monthly recap.

Examples

"You spent the most on coffee."

"You saved ₹4,000 more."

"Weekend spending increased."

---

## Bubble Universe

Categories become bubbles.

Bubble size

↓

Amount

Distance

↓

Relationship

Hover

↓

Details

Drag

↓

Explore

---

# Standard Visualizations

Treemap

Best for

Category distribution

Avoid

Small datasets

---

Calendar Heatmap

Best for

Daily habits

---

Sankey

Best for

Money flow

Income

↓

Accounts

↓

Categories

↓

Savings

---

Timeline

Best for

Historical changes

---

Bar Chart

Best for

Simple comparisons

Avoid

When hierarchy matters

---

Line Chart

Best for

Trends

---

Sunburst

Best for

Hierarchical categories

---

Scatter Plot

Best for

Correlation

---

# Color Rules

Income

Green

Expense

Red

Savings

Emerald

Transfer

Blue

Investment

Purple

Warning

Amber

Neutral

Gray

Never assign random colors.

A category keeps the same color everywhere.

---

# Motion

Every visualization should animate.

Animation duration

250–500ms

Animate

Entry

Filtering

Sorting

Zooming

Expansion

Selection

Never animate endlessly.

---

# Interaction

Support

Hover

Click

Keyboard

Touch

Zoom

Drill Down

Breadcrumbs

Tooltips

Context Menus

---

# Tooltips

Every tooltip includes

Title

Value

Percentage

Trend

Comparison

Avoid plain numbers.

---

# Drill Down

Overview

↓

Category

↓

Merchant

↓

Transaction

Always allow users to go deeper.

---

# Empty States

Explain why.

Suggest an action.

Never show an empty chart.

---

# Accessibility

Every visualization requires

Keyboard support

Screen reader summary

ARIA labels

High contrast

Reduced motion support

Alternative table view

---

# Performance

Lazy load large charts.

Memoize calculations.

Virtualize large datasets.

Prefer SVG.

Use Canvas only when required.

Maintain 60 FPS.

---

# Responsive Rules

Desktop

Full interaction

Tablet

Simplified controls

Mobile

Single visualization focus

Avoid tiny unreadable charts.

---

# D3 Standards

Reusable.

Typed.

Composable.

Independent.

No duplicated chart logic.

---

# Chart Lifecycle

Loading

↓

Animation

↓

Interaction

↓

Filtering

↓

Drill Down

↓

Exit Animation

---

# Decision Framework

Before creating a chart ask

What question does this answer?

Can users interact?

Can users discover something new?

Would text explain this better?

Does it support accessibility?

If the answer is no,

don't build the chart.

---

# Ultimate Goal

Spendscape should become known for its visualizations.

People should share screenshots because they are beautiful.

People should understand their finances without reading documentation.

Visualization is not a feature.

Visualization is the product.
