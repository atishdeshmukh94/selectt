Please update the Selectt website typography using **Plus Jakarta Sans for headings and Inter for body text and interface elements**. The goal is a clean, premium appearance with better readability and less crowding.

**1. Font families and weights**
- Headings: Plus Jakarta Sans, weight 600.
- Paragraphs and descriptions: Inter, weight 400.
- Navigation, filters and form labels: Inter, weight 500.
- Buttons and action links: Inter, weight 600.
- Use a sans-serif fallback and load only the required weights. Avoid synthetic bold.

**2. Typography sizes**

| Element | Desktop | Mobile | Line height |
|---|---:|---:|---:|
| Main section headings | 40px | 28px | 1.2 |
| Section introductions | 18px | 17px | 1.6 |
| Card headings | 21px | 20px | 1.35 |
| Body text and descriptions | 17px | 16px | 1.6 |
| Navigation, filters and buttons | 15px | 15px | 1.4–1.5 |
| Small badges | 12px | 12px | 1.4 |

Implement these sizes in `rem`, keeping the root font size at the browser default.

**3. Letter spacing and text colour**
- Use normal letter spacing and word spacing for headings, paragraphs and controls.
- Remove negative letter spacing from card headings and body text.
- Avoid light body weights such as 300 and excessively bold headings such as 800.
- Heading colour on light backgrounds: `#0F172A`.
- Body text on light backgrounds: `#475569`.
- Body text on navy backgrounds: `#CBD5E1`.
- Verify text contrast on all backgrounds, including tinted cards and coloured buttons.

**4. Card layout and spacing**
- Use approximately 28–32px internal card padding on desktop and 20–24px on mobile.
- Keep 24px gaps between cards.
- Leave 12–16px between card headings and descriptions.
- Leave at least 24px between descriptions and action links.
- Switch from four cards to two columns when the available content area becomes too narrow, accounting for the filter sidebar. Use one column on small mobile screens.
- Avoid fixed text-container heights, forced line breaks and clipped text. Align bottom actions using flex or grid layout.
- Limit section introductions to approximately 65–75 characters per line.

**5. Visual cleanup**
- Use sentence case for action links: “View inspection details”, “Warranty terms” and “Calculate your EMI”.
- In seller cards, retain the large step number and remove the duplicate “STEP 01” style badge.
- Ensure the floating chat widget does not cover filters, text or buttons.
- Preserve the existing navy-and-teal brand colours and card design.

**6. Final checks**
- Confirm the actual fonts load correctly in the browser; do not use the AI-generated comparison image as an exact font reference.
- Test desktop, tablet and mobile layouts.
- Check that text remains readable at 200% zoom and that increased user text spacing does not cause clipping or overlap.
- Share updated previews of both the buyer advantages and seller protection sections before applying the typography sitewide.