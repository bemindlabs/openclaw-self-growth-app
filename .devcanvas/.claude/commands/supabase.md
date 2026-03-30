---
description: Supabase — auth, database, storage, edge functions, migrations, and debug
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [auth|db|storage|functions|migrate|realtime|rls|debug] [action]
---

# Supabase

Unified command for Supabase authentication, database, storage, Edge Functions, migrations, realtime, RLS policies, and troubleshooting.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `auth [action]` — Authentication and user management
- `db [action]` — Database operations and queries
- `storage [action]` — File storage management
- `functions [action]` — Edge Functions
- `migrate [action]` — Database migrations
- `realtime [action]` — Realtime subscriptions
- `rls [action]` — Row Level Security policies
- `debug [action]` — Troubleshooting and diagnostics
- No arguments — Show Supabase project overview

---

## Overview (default, no arguments)

Show Supabase project status:

```bash
# Check CLI version
supabase --version

# Check project status
supabase status

# List linked projects
supabase projects list
```

Display format:
```
Supabase Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project:     my-app
Region:      us-east-1
Status:      running

Local Dev:
  API URL:       http://127.0.0.1:54321
  Studio URL:    http://127.0.0.1:54323
  DB URL:        postgresql://postgres:postgres@127.0.0.1:54322/postgres
  Anon Key:      eyJ...
  Service Key:   eyJ...

Migrations:  5 applied, 0 pending
Functions:   3 deployed

Quick Actions:
  /supabase db         Database operations
  /supabase auth       Auth management
  /supabase migrate    Run migrations
  /supabase functions  Edge Functions
```

---

## Auth — Authentication

### `auth` — Auth overview

```bash
# Check auth config
cat supabase/config.toml | grep -A 20 "\[auth\]"
```

### `auth setup` — Setup authentication

1. **Configure providers** in `supabase/config.toml`:
   ```toml
   [auth]
   site_url = "http://localhost:3000"
   additional_redirect_urls = ["https://myapp.com/callback"]
   jwt_expiry = 3600
   enable_signup = true

   [auth.email]
   enable_signup = true
   double_confirm_changes = true
   enable_confirmations = true

   [auth.external.google]
   enabled = true
   client_id = "env(GOOGLE_CLIENT_ID)"
   secret = "env(GOOGLE_CLIENT_SECRET)"
   redirect_uri = ""

   [auth.external.github]
   enabled = true
   client_id = "env(GITHUB_CLIENT_ID)"
   secret = "env(GITHUB_CLIENT_SECRET)"
   redirect_uri = ""
   ```

2. **Client setup:**
   ```typescript
   import { createClient } from '@supabase/supabase-js'

   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

### `auth providers` — List/configure auth providers

Supported providers:
| Provider | Config Key |
|----------|-----------|
| Email/Password | `[auth.email]` |
| Phone/OTP | `[auth.sms]` |
| Google | `[auth.external.google]` |
| GitHub | `[auth.external.github]` |
| Apple | `[auth.external.apple]` |
| Discord | `[auth.external.discord]` |
| Twitter | `[auth.external.twitter]` |
| Azure | `[auth.external.azure]` |
| SAML | `[auth.external.saml]` |

### `auth hooks` — Auth hook functions

```sql
-- Custom auth hook for user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Auth Client Patterns

**Sign up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: { data: { full_name: 'John Doe' } }
})
```

**Sign in:**
```typescript
// Email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: 'https://myapp.com/callback' }
})

// Magic link
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com'
})
```

**Session management:**
```typescript
// Get session
const { data: { session } } = await supabase.auth.getSession()

// Get user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

**Server-side (Next.js):**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## DB — Database Operations

### `db` — Database overview

```bash
supabase db lint
supabase inspect db table-sizes
```

### `db reset` — Reset local database

```bash
supabase db reset
```

### `db dump` — Dump database schema/data

```bash
# Schema only
supabase db dump -f supabase/schema.sql

# Data only
supabase db dump -f supabase/data.sql --data-only

# Specific schema
supabase db dump -f supabase/auth_schema.sql --schema auth
```

### `db push` — Push local migrations to remote

```bash
supabase db push
```

### `db pull` — Pull remote schema changes

```bash
supabase db pull
```

### `db lint` — Lint database schema

```bash
supabase db lint
```

### `db diff` — Diff local vs remote schema

```bash
supabase db diff
# Named diff (creates migration):
supabase db diff --use-migra -f <migration-name>
```

### `db inspect` — Inspect database

```bash
supabase inspect db table-sizes
supabase inspect db index-sizes
supabase inspect db blocking
supabase inspect db locks
supabase inspect db cache-hit
supabase inspect db unused-indexes
supabase inspect db seq-scans
supabase inspect db long-running-queries
```

### `db remote` — Execute remote SQL

```bash
supabase db execute --project-ref <ref> "SELECT * FROM auth.users LIMIT 5"
```

### Query Patterns

```typescript
// Select
const { data, error } = await supabase
  .from('posts')
  .select('*, author:profiles(*)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .range(0, 9)

// Insert
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: 'Hello' })
  .select()

// Update
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'Updated' })
  .eq('id', postId)
  .select()

// Delete
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', postId)

// Upsert
const { data, error } = await supabase
  .from('posts')
  .upsert({ id: postId, title: 'Upserted' })
  .select()

// RPC (stored procedure)
const { data, error } = await supabase
  .rpc('search_posts', { query: 'hello' })
```

---

## Storage — File Storage

### `storage` — Storage overview

```bash
supabase storage ls
```

### `storage create` — Create bucket

```sql
-- Via SQL
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);
```

```typescript
// Via client
const { data, error } = await supabase.storage.createBucket('avatars', {
  public: true,
  fileSizeLimit: 1024 * 1024 * 2, // 2MB
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
})
```

### `storage policies` — Setup storage RLS

```sql
-- Allow authenticated uploads
create policy "Users can upload avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public reads
create policy "Public avatar access"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- Allow users to delete own files
create policy "Users can delete own avatars"
on storage.objects for delete
to authenticated
using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Storage Client Patterns

```typescript
// Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true
  })

// Download
const { data, error } = await supabase.storage
  .from('avatars')
  .download('path/to/file.png')

// Get public URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('path/to/file.png')

// Get signed URL
const { data, error } = await supabase.storage
  .from('private-docs')
  .createSignedUrl('path/to/file.pdf', 3600)

// List files
const { data, error } = await supabase.storage
  .from('avatars')
  .list('folder', { limit: 100, offset: 0 })

// Delete
const { error } = await supabase.storage
  .from('avatars')
  .remove(['path/to/file.png'])

// Image transforms
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('image.png', {
    transform: { width: 200, height: 200, resize: 'cover' }
  })
```

---

## Functions — Edge Functions

### `functions` — List functions

```bash
supabase functions list
```

### `functions new` — Create new Edge Function

```bash
supabase functions new <function-name>
```

Creates `supabase/functions/<function-name>/index.ts`

### `functions serve` — Serve locally

```bash
supabase functions serve
# Specific function:
supabase functions serve <function-name>
# With env file:
supabase functions serve --env-file supabase/.env.local
```

### `functions deploy` — Deploy function

```bash
supabase functions deploy <function-name>
# Deploy all:
supabase functions deploy
# With JWT verification disabled:
supabase functions deploy <function-name> --no-verify-jwt
```

### `functions delete` — Delete function

```bash
supabase functions delete <function-name>
```

### Edge Function Template

```typescript
// supabase/functions/my-function/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user!.id)

    if (error) throw error

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

### Invoke Function

```typescript
const { data, error } = await supabase.functions.invoke('my-function', {
  body: { key: 'value' }
})
```

---

## Migrate — Database Migrations

### `migrate new` — Create new migration

```bash
supabase migration new <name>
# e.g.: supabase migration new create_posts_table
```

Creates `supabase/migrations/<timestamp>_<name>.sql`

### `migrate list` — List migrations

```bash
supabase migration list
```

### `migrate up` — Apply pending migrations

```bash
supabase migration up
# Specific migration:
supabase migration up --to <version>
```

### `migrate repair` — Repair migration history

```bash
supabase migration repair --status applied <version>
supabase migration repair --status reverted <version>
```

### `migrate squash` — Squash migrations

```bash
supabase migration squash
# From specific version:
supabase migration squash --version <timestamp>
```

### Migration Template

```sql
-- supabase/migrations/20240101000000_create_posts.sql

-- Create posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text,
  status text default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.posts enable row level security;

-- Indexes
create index posts_user_id_idx on public.posts(user_id);
create index posts_status_idx on public.posts(status);
create index posts_created_at_idx on public.posts(created_at desc);

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at
  before update on public.posts
  for each row execute procedure public.update_updated_at();

-- RLS Policies
create policy "Users can read published posts"
  on public.posts for select
  using (status = 'published' or auth.uid() = user_id);

create policy "Users can create own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);
```

---

## Realtime — Realtime Subscriptions

### `realtime` — Realtime overview

```bash
cat supabase/config.toml | grep -A 10 "\[realtime\]"
```

### `realtime enable` — Enable realtime on table

```sql
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.messages;
```

### `realtime disable` — Disable realtime on table

```sql
alter publication supabase_realtime drop table public.posts;
```

### Realtime Client Patterns

```typescript
// Subscribe to changes
const channel = supabase
  .channel('posts-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'posts' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe()

// Filter by event
const channel = supabase
  .channel('new-posts')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'posts', filter: 'status=eq.published' },
    (payload) => console.log('New post:', payload.new)
  )
  .subscribe()

// Presence (who's online)
const channel = supabase.channel('room-1')
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('Joined:', newPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ user_id: userId, online_at: new Date() })
    }
  })

// Broadcast (send messages)
const channel = supabase.channel('chat')
channel
  .on('broadcast', { event: 'message' }, ({ payload }) => {
    console.log('Message:', payload)
  })
  .subscribe()

// Send
channel.send({
  type: 'broadcast',
  event: 'message',
  payload: { text: 'Hello!' }
})

// Unsubscribe
supabase.removeChannel(channel)
```

---

## RLS — Row Level Security

### `rls` — Review RLS policies

```bash
# Check which tables have RLS enabled
supabase db lint
```

```sql
-- List all policies
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

### `rls enable` — Enable RLS on table

```sql
alter table public.<table> enable row level security;
```

### `rls disable` — Disable RLS on table

```sql
alter table public.<table> disable row level security;
```

### `rls create` — Create RLS policy

Common patterns:

**Public read, authenticated write:**
```sql
-- Anyone can read
create policy "Public read access"
  on public.posts for select
  using (true);

-- Authenticated users can insert
create policy "Authenticated insert"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = user_id);
```

**Owner-only access:**
```sql
create policy "Owner full access"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

**Role-based access:**
```sql
create policy "Admin full access"
  on public.posts for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
```

**Team/org access:**
```sql
create policy "Team members can view"
  on public.projects for select
  using (
    exists (
      select 1 from public.team_members
      where team_members.project_id = projects.id
      and team_members.user_id = auth.uid()
    )
  );
```

### `rls test` — Test RLS policies

```sql
-- Test as specific user
set request.jwt.claims = '{"sub": "user-uuid-here", "role": "authenticated"}';
set role authenticated;

select * from public.posts;  -- Should only show allowed rows

-- Reset
reset role;
reset request.jwt.claims;
```

### RLS Checklist

- [ ] RLS enabled on ALL public tables
- [ ] SELECT policies defined
- [ ] INSERT policies with `with check`
- [ ] UPDATE policies with `using` and `with check`
- [ ] DELETE policies with `using`
- [ ] Service role bypasses RLS (for server-side operations)
- [ ] No overly permissive policies
- [ ] Policies tested with different user roles

---

## Debug — Troubleshooting

### `debug` — Run diagnostics

1. **Check CLI & Local Services**
   ```bash
   supabase --version
   supabase status
   ```

2. **Check Docker Containers**
   ```bash
   docker ps --filter "name=supabase" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
   ```

3. **Check Migrations**
   ```bash
   supabase migration list
   ```

4. **Check Database**
   ```bash
   supabase db lint
   supabase inspect db table-sizes
   ```

### `debug start` — Start local development

```bash
supabase start
# If issues:
supabase stop --no-backup
supabase start
```

### `debug logs` — View service logs

```bash
# All logs
supabase logs

# Specific service
docker logs supabase_db_<project>
docker logs supabase_auth_<project>
docker logs supabase_rest_<project>
docker logs supabase_realtime_<project>
docker logs supabase_storage_<project>
```

### `debug connection` — Test database connection

```bash
# Local
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT 1"

# Remote
supabase db execute --project-ref <ref> "SELECT 1"
```

### `debug auth` — Debug authentication

```bash
# Check auth config
cat supabase/config.toml | grep -A 30 "\[auth\]"

# Check auth logs
docker logs supabase_auth_<project> --tail 50
```

### `debug rls` — Debug RLS policies

```sql
-- Check RLS status
select tablename, rowsecurity
from pg_tables
where schemaname = 'public';

-- List policies
select * from pg_policies where schemaname = 'public';
```

### Common Issues

| Issue | Solution |
|-------|----------|
| `supabase start` fails | `supabase stop --no-backup && supabase start` |
| Migration conflict | `supabase migration repair` |
| RLS blocking queries | Check policies, test with `set role` |
| Auth not working | Check redirect URLs, provider config |
| Storage upload fails | Check bucket policies, file size limits |
| Realtime not firing | Enable publication on table |
| Edge Function timeout | Check Deno logs, increase timeout |
| Type generation stale | `supabase gen types typescript --local` |
| Connection refused | Check `supabase status`, restart services |
| CORS errors | Check Edge Function CORS headers |

### Type Generation

```bash
# From local
supabase gen types typescript --local > types/supabase.ts

# From remote
supabase gen types typescript --project-id <ref> > types/supabase.ts
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Project Structure

```
supabase/
├── config.toml              # Project configuration
├── migrations/              # SQL migrations
│   ├── 20240101000000_init.sql
│   └── 20240102000000_add_posts.sql
├── functions/               # Edge Functions
│   ├── my-function/
│   │   └── index.ts
│   └── another-function/
│       └── index.ts
├── seed.sql                 # Seed data
└── .env.local               # Local env vars
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show Supabase overview
  - `auth` / `auth setup` / `auth providers` / `auth hooks`
  - `db` / `db reset` / `db dump` / `db push` / `db pull` / `db lint` / `db diff` / `db inspect`
  - `storage` / `storage create` / `storage policies`
  - `functions` / `functions new <name>` / `functions serve` / `functions deploy` / `functions delete`
  - `migrate new <name>` / `migrate list` / `migrate up` / `migrate repair` / `migrate squash`
  - `realtime` / `realtime enable` / `realtime disable`
  - `rls` / `rls enable` / `rls create` / `rls test`
  - `debug` / `debug start` / `debug logs` / `debug connection` / `debug auth` / `debug rls`

## Output

Supabase management across auth, database, storage, Edge Functions, migrations, realtime, RLS, and troubleshooting.
