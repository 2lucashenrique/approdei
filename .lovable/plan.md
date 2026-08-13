# Plan: Database Integration with Lovable Cloud

The user wants to use the app with the database (Lovable Cloud / Supabase). Currently, the app uses IndexedDB for storage. I will migrate the app to use the backend database while preserving the current functionality.

## Proposed Changes

### Database Schema (Supabase Migration)
1. **Tables**:
   - `profiles`: Store user profile information linked to `auth.users`.
   - `trips`: Store ride-hailing trip data.
   - `refuels`: Store vehicle refueling records.
   - `transactions`: Store income and expense transactions.
   - `user_settings`: Store user-specific application settings.
2. **Security**:
   - Enable Row Level Security (RLS) on all tables.
   - Add policies to ensure users can only access their own data.
   - Add `GRANT` statements for all tables.

### Frontend Integration
1. **Authentication**:
   - Update `useAuth.tsx` to use the backend authentication service instead of IndexedDB.
   - Maintain the current `User` interface compatibility.
2. **Data Hooks**:
   - Refactor `src/hooks/useUserData.ts` to fetch and save data using the backend client.
   - Implement real-time synchronization or cache management where appropriate (using React Query where possible).
3. **Data Migration**:
   - Create a one-time migration utility to move existing IndexedDB data to the backend database when a user first signs in.

## Technical Details
- Tables will use `uuid` for IDs and link to `auth.uid()` via a `user_id` column.
- Use the generated `supabase` client from `@/integrations/supabase/client`.
- RLS policies:
  ```sql
  CREATE POLICY "Users can only access their own data" ON public.<table>
  FOR ALL TO authenticated USING (auth.uid() = user_id);
  ```

## Security Considerations
- All tables will have RLS enabled.
- No public access to data.
- User roles (if needed) will be managed in a separate table as per security guidelines.
