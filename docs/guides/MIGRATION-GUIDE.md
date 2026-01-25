# 🔧 Migration Guide: Fix Appointments Schema

## Problem

Your database was created with the old schema that uses:

- `service_code` (INTEGER)
- `professional_code` (INTEGER)

But your application code expects:

- `service_id` (BIGINT with foreign key to services table)
- `professional_id` (BIGINT with foreign key to professionals table)

## Solution

Follow these steps **in order**:

### Step 1: Run the Diagnostic Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the contents of `diagnose-and-fix-appointments.sql`
4. Click **Run**
5. Review the output to see current database state

### Step 2: Apply the Migration

The diagnostic script will automatically:

- ✅ Add `service_id` and `professional_id` columns if they don't exist
- ✅ Migrate existing data from `service_code`/`professional_code` to the new columns
- ✅ Create proper foreign key constraints
- ✅ Create indexes for performance
- ✅ Verify the migration succeeded

### Step 3: Test Appointment Creation

After running the migration:

1. Go to your application
2. Try creating a new appointment
3. It should now work without errors! 🎉

## What Changed

### Before (Old Schema)

```sql
CREATE TABLE appointments (
  ...
  service_code INTEGER NOT NULL,
  professional_code INTEGER NOT NULL,
  ...
);
```

### After (New Schema)

```sql
CREATE TABLE appointments (
  ...
  service_code INTEGER NOT NULL,  -- kept for backward compatibility
  professional_code INTEGER NOT NULL,  -- kept for backward compatibility
  service_id BIGINT REFERENCES services(id),  -- NEW
  professional_id BIGINT REFERENCES professionals(id),  -- NEW
  ...
);
```

## Notes

- The old `service_code` and `professional_code` columns are **kept** for backward compatibility
- The migration copies data from old columns to new columns
- New appointments will use `service_id` and `professional_id`
- You can optionally remove the old columns later if needed

## Troubleshooting

If you encounter any errors:

1. Check the Supabase SQL Editor output for specific error messages
2. Verify that `services` and `professionals` tables exist and have data
3. Ensure the IDs in `service_code`/`professional_code` match actual IDs in the respective tables
