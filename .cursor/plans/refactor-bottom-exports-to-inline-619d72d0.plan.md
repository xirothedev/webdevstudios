<!-- 619d72d0-a41d-47f6-a1c0-fe1ecc530c60 3d1051e6-dae7-4cb0-a2e3-a7b44a66027a -->

# Refactor Bottom Exports to Inline Exports

## Overview

Convert all files that use bottom exports (`export { ... }` at the end) to inline exports (export keyword at the point of declaration).

## Files to Refactor

### 1. [apps/web/src/components/ui/button.tsx](apps/web/src/components/ui/button.tsx)

- Change `function Button(...)` to `export function Button(...)`
- Remove `export { Button };` at line 62

### 2. [apps/web/src/contexts/auth.context.tsx](apps/web/src/contexts/auth.context.tsx)

- Change `const AuthContext = createContext(...)` to `export const AuthContext = createContext(...)`
- Remove `export { AuthContext };` at line 27

### 3. [apps/web/src/components/ui/input.tsx](apps/web/src/components/ui/input.tsx)

- Change `const Input = React.forwardRef(...)` to `export const Input = React.forwardRef(...)`
- Remove `export { Input };` at line 26

### 4. [apps/web/src/components/ui/navigation-menu.tsx](apps/web/src/components/ui/navigation-menu.tsx)

- Change all function declarations to `export function ...`:
- `NavigationMenu` (line 8)
- `NavigationMenuList` (line 32)
- `NavigationMenuItem` (line 48)
- `NavigationMenuTrigger` (line 65)
- `NavigationMenuContent` (line 85)
- `NavigationMenuViewport` (line 102)
- `NavigationMenuLink` (line 124)
- `NavigationMenuIndicator` (line 140)
- Change `const navigationMenuTriggerStyle = cva(...)` to `export const navigationMenuTriggerStyle = cva(...)`
- Remove the bottom export block (lines 158-168)

### 5. [apps/web/src/components/ui/avatar.tsx](apps/web/src/components/ui/avatar.tsx)

- Change all function declarations to `export function ...`:
- `Avatar` (line 8)
- `AvatarImage` (line 24)
- `AvatarFallback` (line 37)
- Remove `export { Avatar, AvatarFallback, AvatarImage };` at line 53

### 6. [apps/web/src/components/ui/bento-grid.tsx](apps/web/src/components/ui/bento-grid.tsx)

- Change `const BentoGrid = ...` to `export const BentoGrid = ...` (line 24)
- Change `const BentoCard = ...` to `export const BentoCard = ...` (line 38)
- Remove `export { BentoCard, BentoGrid };` at line 139

### 7. [apps/web/src/components/ui/dropdown-menu.tsx](apps/web/src/components/ui/dropdown-menu.tsx)

- Change all function declarations to `export function ...`:
- `DropdownMenu` (line 9)
- `DropdownMenuPortal` (line 15)
- `DropdownMenuTrigger` (line 23)
- `DropdownMenuContent` (line 34)
- `DropdownMenuGroup` (line 54)
- `DropdownMenuItem` (line 62)
- `DropdownMenuCheckboxItem` (line 85)
- `DropdownMenuRadioGroup` (line 111)
- `DropdownMenuRadioItem` (line 122)
- `DropdownMenuLabel` (line 146)
- `DropdownMenuSeparator` (line 166)
- `DropdownMenuShortcut` (line 179)
- `DropdownMenuSub` (line 195)
- `DropdownMenuSubTrigger` (line 201)
- `DropdownMenuSubContent` (line 225)
- Remove the bottom export block (lines 241-257)

## Implementation Steps

1. For each file, add `export` keyword to all declarations that are currently exported at the bottom
2. Remove the bottom `export { ... }` statement(s)
3. Ensure no functionality is broken - exports remain the same, just moved inline
4. Maintain code formatting and import order (simple-import-sort)

## Notes

- All changes are purely syntactic - no functional changes
- Default exports (like Next.js page components) are not affected
- Re-exports from other files (like in DTO files) are not affected
- The refactoring improves code readability by making exports explicit at declaration

### To-dos

- [ ] Refactor button.tsx - add export to Button function, remove bottom export
- [ ] Refactor auth.context.tsx - add export to AuthContext const, remove bottom export
- [ ] Refactor input.tsx - add export to Input const, remove bottom export
- [ ] Refactor navigation-menu.tsx - add export to all functions and const, remove bottom export block
- [ ] Refactor avatar.tsx - add export to all functions, remove bottom export
- [ ] Refactor bento-grid.tsx - add export to BentoGrid and BentoCard consts, remove bottom export
- [ ] Refactor dropdown-menu.tsx - add export to all functions, remove bottom export block
