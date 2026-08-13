# Fix Registration for Refuels and Transactions

The user reported that refuel and transaction registrations are not appearing, while trip registration works fine. My previous fix adjusted the props and handlers but didn't address a critical logical error in how objects are being passed through to the database mutations.

## Problem Analysis

In `Index.tsx`, the `addRefuel` and `addTransaction` functions were redefined to accept `Omit<T, 'id' | 'userId'>`. However, in `RefuelPage.tsx`, the `handleAddRefuel` function is still doing a direct call `onAddRefuel(refuelData as Refuel)` which might be preserving an `id` or `userId` if they were somehow present in `refuelData`, or causing type mismatches.

More importantly, `TripForm` and `RefuelForm` are still generating `Date.now().toString()` as `id` in their local `handleSubmit` functions, which then flows into the parent handlers. While `addTrip` in `Index.tsx` explicitly strips these, `addRefuel` and `addTransaction` were also updated to strip them, but the user says it's still not working.

The root cause seems to be a mismatch between the mutation types in `useUserData.ts` and how the components are passing data.

## Proposed Changes

### 1. `src/hooks/useUserData.ts`
*   Strengthen the `addRefuelMutation` and `addTransactionMutation` logic by ensuring the input is treated as an insertion that lets Supabase generate the ID and uses the current user's ID.

### 2. `src/components/refuel/RefuelForm.tsx` & `src/components/trips/TripForm.tsx`
*   Stop generating local IDs (`Date.now().toString()`) in these forms. The database should handle ID generation.

### 3. `src/pages/RefuelPage.tsx`
*   Fix the `handleAddRefuel` logic to correctly handle the missing ID when creating the related transaction.

### 4. `src/pages/Index.tsx`
*   Ensure the data passed to mutations is strictly the data payload without any pre-existing IDs.
