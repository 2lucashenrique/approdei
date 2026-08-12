# Plan - Fix Date Filtering in General Summary

The user reported that when changing the week date in "Corridas" (Trips), the general summary still shows the "General Summary" (all data) instead of the data for the selected period.

## User Request
"em corridas, quando altero a data de semana o resumo geral mostra o resumo geral ,e nao os dados daquela semana selecionada. corrija isso."

## Analysis
- In `src/pages/TripsPage.tsx`, there is a `WeeklyEarningsChart` and a `TripMetricsDashboard`.
- The `WeeklyEarningsChart` has its own internal state for the current week and also responds to `dateFilter` props.
- The `TripMetricsDashboard` receives `filteredTrips` but is preceded by a heading "Resumo Geral" (General Summary).
- The user is likely referring to the "Resumo Geral" section in `TripsPage.tsx` not being filtered by the *chart's* selected week, OR they are simply observing that the header "Resumo Geral" is misleading when filters are applied.
- Actually, looking at `TripsPage.tsx`:
  ```tsx
  {/* Dashboard de Métricas */}
  <div>
    <h3 className="text-lg font-semibold mb-4">Resumo Geral</h3>
    <TripMetricsDashboard trips={filteredTrips} />
  </div>
  ```
  The `TripMetricsDashboard` *is* receiving `filteredTrips`. However, the `WeeklyEarningsChart` allows the user to navigate weeks using Chevron buttons, which updates its *internal* state but doesn't propagate that back to the parent `TripsPage`.
- When the user changes the week *in the chart*, they expect the summary below it to update as well.

## Proposed Changes

### 1. Update `WeeklyEarningsChart` to notify parent of week changes
- Add an optional `onWeekChange` callback prop to `WeeklyEarningsChart`.
- Call this whenever `currentWeekStart` changes.

### 2. Update `TripsPage.tsx` to handle week selection from chart
- Add state to track the "active interval" (start/end dates) coming from the chart.
- If the chart is in "week mode" (user navigated via chevrons), apply this interval to the trips passed to the dashboard.
- Update the heading "Resumo Geral" to reflect the current period (e.g., "Resumo do Período" or "Resumo da Semana").

### 3. Improve `filterByDate` utility
- Ensure it handles `Date` objects correctly as inputs from `DateFilterOptions`.

## Technical Details
- **File**: `src/components/trips/WeeklyEarningsChart.tsx`
  - Add `onWeekChange?: (start: Date, end: Date) => void` to props.
  - Trigger it in `useEffect` or navigation handlers.
- **File**: `src/pages/TripsPage.tsx`
  - Track `chartInterval` in state.
  - Filter trips using both `dateFilter` and `chartInterval`.
  - Update UI labels.
