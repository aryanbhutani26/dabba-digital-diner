# Cleanup Supabase

Run these commands to completely remove Supabase from your project:

## 1. Remove Supabase Package

```bash
npm uninstall @supabase/supabase-js
```

## 2. Delete Supabase Integration Folder

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force src/integrations/supabase

# Linux/Mac
rm -rf src/integrations/supabase
```

## 3. Delete Supabase Migrations (if exists)

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force supabase

# Linux/Mac
rm -rf supabase
```

## 4. Verify No Supabase References

Search for any remaining Supabase references:

```bash
# Windows (PowerShell)
Select-String -Path "src/**/*.tsx" -Pattern "supabase" -CaseSensitive

# Linux/Mac
grep -r "supabase" src/
```

If you find any, they should only be in comments or documentation.

## ✅ All Done!

Your project is now 100% Supabase-free and running on MongoDB!
