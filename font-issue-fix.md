You are working on a completed React website project. The website functionality, UI design, components, pages, images, colors, font families, font styles, and overall visual design are already finalized and must NOT be redesigned.

Your task is ONLY to perform a complete RESPONSIVE TYPOGRAPHY, SPACING, AND VISUAL RHYTHM OPTIMIZATION across the entire frontend.

## IMPORTANT — DO NOT CHANGE THE EXISTING DESIGN

Do NOT change:

- Font family
- Font typeface
- Font style
- Font weight unless technically required to fix an existing responsive issue
- Font color
- Background colors
- Brand colors
- Button colors
- Existing visual theme
- Images
- Image content
- Icons
- Logos
- Existing component design
- Page structure
- Website functionality
- Routing
- API logic
- Backend
- Database
- Business logic
- Existing animations
- Existing design concept
- Desktop design direction

The current design is already approved.

ONLY optimize:

- Font size
- Line height
- Letter spacing
- Word spacing where necessary
- Heading spacing
- Paragraph spacing
- Text block spacing
- Margin
- Padding
- Gap
- Section spacing
- Image-to-text spacing
- Image spacing
- Button-to-text spacing
- Card internal spacing
- Container spacing
- Responsive breakpoints
- Responsive typography
- Responsive layout spacing

The goal is to make the existing design look polished, balanced, readable and uncluttered on:

1. Desktop
2. Tablet
3. Mobile

---

# 1. FIRST AUDIT THE ENTIRE PROJECT

Before modifying anything, inspect the complete React frontend.

Check:

- All routes/pages
- Home page
- About page
- Services pages
- Product pages
- Contact page
- Forms
- Cards
- Hero sections
- Navigation
- Footer
- CTA sections
- Testimonials
- FAQ sections
- Blog/content sections
- Tables if present
- Modals if present
- All reusable components
- All typography components
- All CSS
- Tailwind classes if used
- CSS modules if used
- Global CSS
- Responsive breakpoints

Do NOT immediately start changing random values.

First identify the existing typography system and spacing system.

Create a mental/global map of:

- H1
- H2
- H3
- H4
- H5
- H6
- Body text
- Small text
- Labels
- Navigation text
- Buttons
- Form labels
- Form inputs
- Captions
- Cards
- CTA text
- Footer text

---

# 2. TYPOGRAPHY MUST BE RESPONSIVE

The same font size must NOT blindly be used across Desktop, Tablet and Mobile.

Create a responsive typography system.

Use appropriate responsive values for:

### Desktop
Optimized for large screens such as:

- 1440px
- 1366px
- 1280px
- 1200px

### Tablet
Optimized for:

- 1024px
- 991px
- 768px

### Mobile
Optimized for:

- 430px
- 414px
- 390px
- 375px
- 360px

Do not make mobile typography unnecessarily tiny.

Mobile text must remain comfortably readable without zooming.

---

# 3. HEADINGS

Review every heading throughout the website.

For each heading check:

- Font size
- Line height
- Letter spacing
- Maximum width
- Margin bottom
- Margin top
- Distance from previous element
- Distance from following paragraph/content
- Wrapping behavior

Important:

Do not allow headings to create awkward line breaks.

For example, if a heading becomes:

"Digital
Marketing
Services"

when it should visually remain:

"Digital Marketing
Services"

adjust the typography or max-width responsively.

Do not force unnatural line breaks unless they already exist intentionally in the approved design.

Headings should have a clear hierarchy:

H1 > H2 > H3 > H4

Do not make different heading levels visually almost identical.

---

# 4. BODY TEXT / PARAGRAPHS

Optimize all paragraphs.

Check:

- Font size
- Line height
- Letter spacing
- Maximum text width
- Paragraph margin
- Spacing between paragraphs
- Spacing between heading and paragraph
- Spacing between paragraph and button
- Spacing between paragraph and image

Body text should NEVER look cramped.

It should also NEVER look excessively loose.

For desktop, avoid extremely long text lines.

Use a reasonable max-width for readability.

On mobile:

- Keep font readable
- Keep line height comfortable
- Prevent text from touching screen edges
- Prevent unnecessary huge gaps
- Avoid overly narrow text columns
- Maintain consistent horizontal padding

---

# 5. LETTER SPACING

Audit letter spacing across the entire website.

Fix:

- Headings with excessive tracking
- Uppercase labels with excessive spacing
- Buttons with excessive spacing
- Body text with unnecessary letter spacing
- Mobile text where letter spacing makes words look disconnected

Use letter-spacing only where visually appropriate.

Do NOT globally apply one letter-spacing value to every element.

Typography should look natural and premium.

---

# 6. WORD SPACING

Check word spacing wherever it is explicitly defined or appears visually incorrect.

Do NOT unnecessarily modify normal browser word spacing.

Only adjust word-spacing where there is a real visual issue.

---

# 7. LINE HEIGHT

This is extremely important.

Review line-height independently for:

- H1
- H2
- H3
- H4
- Body
- Small text
- Buttons
- Navigation
- Labels
- Cards
- Forms

Headings should have tighter line-height than body text.

Body text should have comfortable line-height.

Do NOT use excessive line-height that creates huge vertical gaps.

Do NOT use extremely tight line-height that makes text difficult to read.

---

# 8. SPACING BETWEEN ELEMENTS

Audit the complete vertical rhythm of every section.

Check:

Heading
↓
Paragraph
↓
Button
↓
Image
↓
Next section

Also check:

Section
↓
Section

Avoid:

- Too much empty space
- Almost no spacing
- Random spacing
- Different spacing for identical components
- Huge gaps on mobile
- Crowded text on mobile

Create a consistent spacing rhythm.

For example, use a logical spacing scale rather than random values everywhere.

---

# 9. MARGIN AND PADDING

Review all:

- Section padding
- Container padding
- Card padding
- Hero padding
- Header padding
- Footer padding
- Button padding
- Form padding
- Text block margin
- Heading margin
- Paragraph margin

Make these responsive.

Desktop can have larger spacing.

Tablet should reduce spacing appropriately.

Mobile should reduce spacing further without making the design cramped.

Do NOT simply multiply or divide every value.

Visually inspect each component and use context-appropriate spacing.

---

# 10. IMAGES

Do not modify image content or image styling unnecessarily.

Only optimize the SPACING around images.

Check:

- Image-to-heading spacing
- Image-to-paragraph spacing
- Image-to-button spacing
- Image-to-card spacing
- Image-to-section spacing
- Image gaps in grids
- Image gaps on mobile

Ensure images never cause:

- Text overlap
- Unnecessary gaps
- Content collision
- Horizontal overflow
- Excessive whitespace

For responsive layouts, ensure images scale correctly without breaking the existing design.

---

# 11. CARDS

Audit every card component.

Check:

- Card padding
- Heading spacing
- Paragraph spacing
- Icon-to-heading spacing
- Image-to-content spacing
- Button spacing
- Grid gap
- Mobile card spacing

Cards should not feel:

- Too compressed
- Too empty
- Too text-heavy
- Too crowded

If the same card component is reused throughout the website, fix the reusable component rather than manually creating different fixes on every page.

---

# 12. BUTTONS

Do NOT change button colors, design or visual style.

Only check:

- Font size
- Letter spacing
- Line height
- Horizontal padding
- Vertical padding
- Text-to-icon gap
- Button-to-content spacing
- Button-to-button gap

Buttons must remain easily readable and comfortably tappable on mobile.

Do not make buttons unnecessarily small on mobile.

---

# 13. NAVIGATION

Check responsive navigation typography.

Desktop:

- Navigation text should be clearly readable
- Appropriate spacing between navigation items

Tablet:

- Reduce gaps where necessary

Mobile:

- Navigation/menu text must remain readable
- Menu items should have comfortable vertical spacing
- No text collision
- No overflow
- No cramped menu layout

Do NOT redesign the navigation.

Only optimize typography and spacing.

---

# 14. FORMS

Audit:

- Labels
- Inputs
- Textareas
- Select fields
- Placeholder text
- Error messages
- Helper text
- Submit buttons

Ensure:

- Labels are readable
- Inputs have comfortable internal padding
- Text does not touch borders
- Vertical spacing is consistent
- Mobile inputs are easy to use
- No text clipping
- No horizontal overflow

Do not change form colors or design.

---

# 15. CONTAINER WIDTH

Check every major content container.

Prevent:

- Extremely wide paragraphs
- Text stretching across the entire desktop screen
- Very narrow content on mobile
- Inconsistent left/right alignment

Maintain a consistent responsive content width.

The website should feel visually aligned from section to section.

---

# 16. RESPONSIVE BREAKPOINT STRATEGY

Use the existing project's breakpoint system if one already exists.

Do NOT unnecessarily introduce many new breakpoints.

Prefer a clean system such as:

Desktop
Tablet
Mobile

If Tailwind is being used, use the existing Tailwind breakpoint conventions unless the project requires otherwise.

If CSS media queries are being used, keep them organized and avoid duplicated conflicting rules.

---

# 17. USE FLUID TYPOGRAPHY WHERE APPROPRIATE

Where appropriate, use CSS techniques such as:

clamp()

for responsive typography.

Example concept:

font-size: clamp(minimum, fluid-value, maximum);

However, do NOT blindly convert every font size to clamp().

Use it only where it improves responsive scaling.

The final typography must look intentionally designed at:

360px
375px
390px
414px
430px
768px
820px
1024px
1280px
1366px
1440px
1920px

---

# 18. MOBILE-FIRST READABILITY

Mobile is extremely important.

At 360px–430px width:

- No text should become unreadably small
- No heading should touch the edges
- No paragraph should touch the edges
- No unnecessary horizontal scrolling
- No overlapping text
- No awkward heading breaks
- No excessive vertical whitespace
- No cramped sections
- Buttons should remain usable
- Images should have appropriate spacing
- Cards should breathe properly
- Section transitions should feel natural

The mobile version must feel like a professionally designed mobile website, NOT a compressed desktop website.

---

# 19. DESKTOP QUALITY

On desktop:

Do not make everything excessively large.

Avoid:

- Oversized headings
- Huge paragraph spacing
- Excessive section heights
- Excessive whitespace
- Extremely wide text blocks

The design should feel premium, balanced and intentional.

---

# 20. TABLET QUALITY

Tablet must be treated as its own responsive state.

Do not simply use desktop styles on tablet.

Check:

- Heading sizes
- Paragraph sizes
- Container width
- Section padding
- Card gaps
- Grid spacing
- Image spacing
- Button spacing

Make sure the layout transitions naturally between desktop and mobile.

---

# 21. CONSISTENCY ACROSS ALL PAGES

This is very important.

Do not optimize only the Home page.

Apply the typography and spacing system consistently across EVERY frontend page.

The final website should have a consistent visual rhythm.

For example:

If H2 headings use a certain spacing pattern on the Home page, equivalent H2 headings elsewhere should follow the same system unless the specific component requires a different context.

Do not create random page-specific values when a reusable component can solve the problem.

---

# 22. COMPONENT-LEVEL FIXES FIRST

Before adding page-specific CSS:

1. Identify reusable components.
2. Fix the reusable component.
3. Check all pages using that component.
4. Only add page-specific CSS if genuinely required.

This prevents inconsistent typography across the website.

---

# 23. DO NOT BREAK FUNCTIONALITY

During this optimization:

DO NOT modify:

- React logic
- State management
- API calls
- Backend
- Database
- Routing
- Authentication
- Form submission logic
- Business logic
- Existing functionality

This is a FRONTEND VISUAL OPTIMIZATION ONLY.

---

# 24. DO NOT CHANGE THE FONT ITSELF

This instruction is critical.

DO NOT:

- Replace the font
- Import another font
- Change font family
- Change font color
- Redesign typography
- Change the brand's typographic identity

The existing font is approved.

Only optimize its:

- Size
- Line height
- Letter spacing
- Word spacing when required
- Margin
- Padding
- Position
- Responsive behavior

---

# 25. VISUAL QA

After making changes, inspect the website at minimum:

### Desktop
1920px
1440px
1366px
1280px

### Tablet
1024px
820px
768px

### Mobile
430px
414px
390px
375px
360px

Look specifically for:

- Typography consistency
- Heading wrapping
- Paragraph readability
- Vertical rhythm
- Horizontal spacing
- Section spacing
- Card spacing
- Image spacing
- Button spacing
- Alignment
- Overflow
- Clipping
- Unexpected blank spaces
- Crowded sections

---

# 26. DO NOT OVER-CORRECT

Do not change something just because it can be changed.

If an existing typography value already looks correct, KEEP IT.

Only modify values where there is an actual responsive or visual spacing problem.

The objective is:

"Refine the existing design, do not redesign it."

---

# 27. FINAL ACCEPTANCE CRITERIA

The work is complete only when:

✓ Existing font family remains unchanged  
✓ Existing font colors remain unchanged  
✓ Existing visual design remains unchanged  
✓ Desktop typography is balanced  
✓ Tablet typography is balanced  
✓ Mobile typography is readable  
✓ Heading hierarchy is clear  
✓ Paragraphs have comfortable line height  
✓ Letter spacing looks natural  
✓ Word spacing is not excessive  
✓ Heading-to-paragraph spacing is consistent  
✓ Paragraph-to-button spacing is consistent  
✓ Image spacing is consistent  
✓ Card spacing is consistent  
✓ Section spacing is consistent  
✓ Mobile does not look cramped  
✓ Desktop does not look excessively empty  
✓ Tablet does not look like a broken desktop layout  
✓ No horizontal overflow  
✓ No text clipping  
✓ No overlapping elements  
✓ No broken components  
✓ No functionality is affected  
✓ All pages follow the same spacing/typography system  

---

# FINAL INSTRUCTION

Do a COMPLETE frontend-wide typography and spacing audit first.

Then implement the improvements systematically at the reusable component/global CSS level wherever possible.

After implementation, perform responsive visual QA across Desktop, Tablet and Mobile.

Do not redesign anything.

Do not change the font family, font color, visual identity or existing design.

The ONLY goal is to make the existing website typography and spacing look professionally balanced, readable, consistent and responsive across all screen sizes.