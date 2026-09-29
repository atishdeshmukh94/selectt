# MANDATORY 3-PHASE WORKFLOW

Do NOT start changing CSS immediately.

You MUST complete the following three phases in order:

## PHASE 1 — COMPLETE AUDIT

First inspect the entire React frontend without making changes.

Audit:

- All pages/routes
- All reusable components
- Global CSS
- Tailwind configuration/classes
- Typography styles
- Headings H1–H6
- Paragraphs
- Buttons
- Navigation
- Forms
- Cards
- Hero sections
- CTA sections
- Footer
- Images
- Grids
- Containers
- Margins
- Padding
- Gaps
- Line heights
- Letter spacing
- Responsive breakpoints

Identify:

- Inconsistent font sizes
- Inconsistent spacing
- Excessive spacing
- Insufficient spacing
- Poor mobile readability
- Poor tablet scaling
- Awkward heading wrapping
- Excessive letter spacing
- Incorrect line height
- Inconsistent section spacing
- Image/text spacing problems
- Card spacing problems
- Button spacing problems
- Horizontal overflow
- Text clipping

IMPORTANT:

Do NOT change anything during Phase 1.

After the audit, create an internal list of the issues found and determine which issues can be solved globally or at the reusable component level.

---

# PHASE 2 — COMPONENT-LEVEL FIX

Now fix the identified issues.

Priority order:

1. Global typography system
2. Reusable typography components
3. Reusable layout/container components
4. Reusable cards
5. Reusable buttons
6. Reusable forms
7. Reusable sections
8. Page-specific fixes only when absolutely necessary

If the same issue exists in multiple pages, FIX THE REUSABLE COMPONENT instead of adding duplicate CSS to individual pages.

Create a consistent responsive system for:

### Desktop
1280px–1920px

### Tablet
768px–1024px

### Mobile
360px–430px

Use responsive CSS/Tailwind rules appropriately.

Where useful, use fluid sizing such as CSS clamp(), but do not blindly apply clamp() everywhere.

Maintain consistent:

- Heading hierarchy
- Font sizes
- Line heights
- Letter spacing
- Paragraph spacing
- Section spacing
- Container spacing
- Card spacing
- Button spacing
- Image spacing

IMPORTANT:

Do NOT change:

- Font family
- Font color
- Brand colors
- Font design/style
- Images
- Icons
- Existing visual concept
- Component functionality
- React logic
- API
- Backend
- Routing

This phase is ONLY typography and spacing optimization.

---

# PHASE 3 — RESPONSIVE QA

After implementing the changes, perform a complete visual QA.

Test at:

### DESKTOP
1920 × 1080
1440 × 900
1366 × 768
1280 × 720

### TABLET
1024px
820px
768px

### MOBILE
430px
414px
390px
375px
360px

For every page check:

- H1 readability
- H2/H3 hierarchy
- Paragraph readability
- Line height
- Letter spacing
- Heading wrapping
- Heading-to-paragraph spacing
- Paragraph-to-button spacing
- Section spacing
- Card spacing
- Image spacing
- Container padding
- Button spacing
- Navigation spacing
- Form spacing
- Footer spacing
- Horizontal overflow
- Text clipping
- Element overlap
- Excessive whitespace
- Crowded content

If a problem is found during QA:

1. Determine whether it is caused by a reusable component.
2. Fix the reusable component if possible.
3. Re-check every page using that component.
4. Only use a page-specific fix if the issue is genuinely page-specific.

Repeat the QA cycle until the website is visually consistent across Desktop, Tablet and Mobile.

---

# FINAL RULE

DO NOT REDESIGN THE WEBSITE.

The existing design is approved.

Your job is to REFINE the existing design through:

AUDIT → COMPONENT-LEVEL FIX → RESPONSIVE QA

The final result should look like the same website and same design, but with significantly better:

- Typography
- Readability
- Spacing
- Alignment
- Responsive scaling
- Visual rhythm
- Mobile usability
- Tablet usability
- Desktop consistency

Do not make unnecessary changes.