# Naij UX Reference for AI Agents

Naij helps people quickly find Nigerian and Nigerian-adjacent restaurants in England. The first supported regions are Kent and London, but the product direction is wider England coverage.

## Product Priority

The default experience must be list-first and location-first. When a user lands on the page, they should immediately understand which restaurants are available and how to sort nearby places to the top.

Analytics, research notes, and advanced filters are secondary. They can exist, but they should not dominate the first viewport or compete with the restaurant list.

## Interaction Rules

- Show the restaurant list as the primary browsing surface.
- Keep general restaurant search near the list because users may arrive looking for a specific place.
- Keep `Use Location` close to the list because distance sorting is a core user task.
- Keep user-entered address sorting inside `Refine Results`; it is an advanced distance-origin control.
- Keep `Refine Results` collapsed by default.
- Keep analytics collapsed by default and place them after the browsing surface.
- Keep map view available, but do not make it the default over the list.
- Preserve URL state for filters and view state so shared links remain meaningful.
- Use clear empty states when filters return no restaurants.

## Visual Direction

The UI should feel simple, friendly, and restrained. Use light mode by default, Mona Sans for text, thin low-contrast borders, fully rounded buttons, and no shadows.

Use emojis sparingly for warmth and recognition. Do not add icon libraries unless the product direction changes. Avoid decorative gradients, heavy color systems, large dashboard stats, and marketing-style hero sections.

## Chakra UI Guidance

Use Chakra UI v3 components by default. Prefer Chakra primitives and documented component APIs over native controls when Chakra has an equivalent.

For area selection, use Chakra UI `Combobox` from `@chakra-ui/react` so users can search. Configure it to show all areas when clicked and filter areas as the user types.

## Data Model Notes

The main directory implementation currently lives in `src/app/kent-restaurants.tsx`. Restaurant entries use the `Restaurant` shape with region, town, address, coordinates, contact details, rating metadata, confidence status, evidence, and notes.

Statuses mean:

- `Confirmed`: Clear Nigerian restaurant or Nigerian food positioning.
- `Likely`: Strong Nigerian or West African relevance, but broader positioning.
- `Candidate`: Worth checking, but evidence is weaker or more indirect.

Distance sorting uses postcode-level restaurant coordinates plus either browser geolocation or a user-entered address resolved through geocoding. Treat map pins and distance order as useful discovery aids, not exact front-door guarantees.

## Future Agent Checklist

- Does the list still appear before secondary analytics?
- Is `Refine Results` still collapsed by default?
- Can users request location or enter an address without hunting through filters?
- Can users search for a known restaurant without opening filters?
- Are Chakra UI components used for controls?
- Are borders thin and shadows absent?
- Does the page remain comfortable on mobile?
- Did any copy or styling make the page feel like a dashboard instead of a directory?
