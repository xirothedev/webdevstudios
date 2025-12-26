<!-- dcca19a1-7420-4566-bb43-e9ea4e9fc1b7 5ecc77e1-a8b1-4159-82b9-2bc8f3eb6304 -->

# Calendar Page Responsive Design

## Overview

Implement responsive design for the calendar page to ensure optimal viewing experience across mobile, tablet, and desktop devices.

## Implementation Steps

### 1. Calendar Page Layout

- Adjust padding and spacing for mobile (px-4), tablet (px-6), desktop (px-8)
- Make title and description responsive (smaller font sizes on mobile)
- Ensure proper spacing between sections

### 2. Event Filter Component

- Stack filter buttons vertically on mobile
- Reduce button sizes and padding on mobile
- Adjust font sizes for better mobile readability

### 3. Calendar Container

- Reduce calendar height on mobile (400px) vs desktop (600px)
- Adjust padding for calendar wrapper on mobile
- Make calendar scrollable horizontally on mobile if needed

### 4. Calendar Toolbar

- Stack toolbar elements vertically on mobile
- Reduce button sizes on mobile
- Hide or simplify date range display on very small screens
- Make view switcher buttons smaller on mobile

### 5. Agenda View Table

- Make table horizontally scrollable on mobile
- Reduce column widths on mobile (date: 20%, time: 20%, event: 60%)
- Reduce font sizes and padding in table cells on mobile
- Ensure sticky header works on mobile

### 6. Event Details Modal

- Full width on mobile with reduced padding
- Max width constraints for tablet and desktop
- Adjust font sizes for mobile readability

### 7. Month/Week/Day Views

- Ensure calendar events are readable on mobile
- Adjust event font sizes
- Ensure proper touch targets for mobile interaction

## Breakpoints

- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md)
- Desktop: > 1024px (lg)

## Files to Modify

- `apps/web/src/app/calendar/page.tsx` - Page layout responsive
- `apps/web/src/components/calendar/CalendarContainer.tsx` - Calendar container responsive
- `apps/web/src/components/calendar/EventFilter.tsx` - Filter buttons responsive
- `apps/web/src/components/calendar/EventDetailsModal.tsx` - Modal responsive
- `apps/web/src/components/calendar/calendar.css` - Calendar styles responsive

### To-dos

- [ ] Make calendar page layout responsive with proper padding and spacing for mobile/tablet/desktop
- [ ] Make event filter buttons responsive - stack on mobile, adjust sizes
- [ ] Adjust calendar container height and padding for different screen sizes
- [ ] Make calendar toolbar responsive - stack elements on mobile, adjust button sizes
- [ ] Make agenda table responsive - horizontal scroll on mobile, adjust column widths and font sizes
- [ ] Make event details modal responsive - full width on mobile, proper max-width on larger screens
- [ ] Ensure month/week/day views are responsive with proper event sizing and touch targets
