# Ebook Admin Panel - Project Journey

## Overview

This project is a Next.js 15 application with Supabase for authentication and database management. It provides an admin panel for managing ebooks with OAuth (Google) login.

---

## Database Schema

### Tables Created

```sql
-- ebook_user: Stores user information linked to Supabase Auth
CREATE TABLE ebook_user (
    id SERIAL PRIMARY KEY,
    created timestamptz DEFAULT now(),
    auth_user_id uuid REFERENCES auth.users(id),
    user_number varchar(100),
    name varchar(250),
    email_address varchar(250),
    is_premium boolean,
    lynk_id_webhook_url text
);

-- ebook_template: Stores ebook templates from GitHub
CREATE TABLE ebook_template (
    id SERIAL PRIMARY KEY,
    created timestamptz DEFAULT now(),
    raw_githubusercontent_url text,
    owner_name varchar(250),
    repository_name varchar(250),
    branch_name varchar(250),
    file_path varchar(250),
    template_name varchar(250)
);

-- ebook_user_content: Stores user's ebook content
CREATE TABLE ebook_user_content (
    id SERIAL PRIMARY KEY,
    created timestamptz DEFAULT now(),
    ebook_user_id integer,
    ebook_user_content_number varchar(250),
    ebook_user_content_title text,
    ebook_user_content_description text,
    ebook_template_id integer,
    ebook_template_preview_code text,
    storage_file_name varchar,
    storage_bucket_name varchar,
    cover_image_url varchar,
    upload_worker_status enum_types (IDLE, PROCESSING, SUCCESS, FAILED),
    preview_worker_status enum_types (IDLE, PROCESSING, SUCCESS, FAILED),
    publish_worker_status enum_types (IDLE, PROCESSING, SUCCESS, FAILED),
    publish_site_url text,
    is_published boolean,
    published_date timestamptz
);

-- ebook_user_content_access: Manages access to content
CREATE TABLE ebook_user_content_access (
    id SERIAL PRIMARY KEY,
    created timestamptz DEFAULT now(),
    ebook_user_content_id integer,
    ebook_user_content_number varchar(250),
    auth_user_id uuid REFERENCES auth.users(id),
    email_address varchar(250),
    lynk_id_reference_id varchar(250),
    storage_shard_name varchar(250)
);
```

### Foreign Keys

```sql
ALTER TABLE ebook_user_content
ADD CONSTRAINT fk_content_user
FOREIGN KEY (ebook_user_id)
REFERENCES ebook_user(id);

ALTER TABLE ebook_user_content
ADD CONSTRAINT fk_content_template
FOREIGN KEY (ebook_template_id)
REFERENCES ebook_template(id);

ALTER TABLE ebook_user_content_access
ADD CONSTRAINT fk_access_content
FOREIGN KEY (ebook_user_content_id)
REFERENCES ebook_user_content(id);
```

### Indexes

```sql
CREATE INDEX idx_content_user ON ebook_user_content(ebook_user_id);
CREATE INDEX idx_access_content ON ebook_user_content_access(ebook_user_content_id);
CREATE INDEX idx_access_auth ON ebook_user_content_access(auth_user_id);
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ebook-user/
│   │   │   └── route.js          # CRUD for ebook_user
│   │   ├── ebook-template/
│   │   │   └── route.js          # CRUD for ebook_template
│   │   ├── ebook-user-content/
│   │   │   └── route.js          # CRUD for ebook_user_content
│   │   ├── ebook-user-content-access/
│   │   │   └── route.js          # CRUD for ebook_user_content_access
│   │   └── hello/
│   │       └── route.js
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.js          # OAuth callback handler
│   │   └── signout/
│   │       └── route.js           # Sign out handler
│   ├── dashboard/
│   │   ├── page.js                # Server component
│   │   ├── DashboardContent.js    # Client component with UI
│   │   ├── dashboard.module.css
│   │   └── ebook/
│   │       ├── new/
│   │       │   ├── page.js
│   │       │   ├── NewEbookForm.js
│   │       │   └── new.module.css
│   │       └── [id]/
│   │           ├── edit/
│   │           │   ├── page.js
│   │           │   ├── EditEbookForm.js
│   │           │   └── new.module.css (shared)
│   │           └── view/
│   │               ├── page.js
│   │               ├── ViewEbookContent.js
│   │               └── view.module.css
│   ├── login/
│   │   ├── page.js
│   │   └── login.module.css
│   ├── api/
│   │   └── hello/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── lib/
│   └── supabase/
│       ├── client.js              # Browser client
│       ├── server.js              # Server client
│       └── supabase.js            # Original client
├── middleware.js                  # Auth protection
└── middleware.js
```

---

## Key Features Implemented

### 1. Authentication

- **Supabase Google OAuth** integration
- **Automatic user sync**: After OAuth login, checks if user exists in `ebook_user` table, creates if not
- **Protected routes**: Middleware protects `/dashboard` routes
- **Session management**: Uses Supabase SSR helpers

### 2. CRUD API Endpoints

| Endpoint                         | Methods                | Description         |
| -------------------------------- | ---------------------- | ------------------- |
| `/api/ebook-user`                | GET, POST, PUT, DELETE | User management     |
| `/api/ebook-template`            | GET, POST, PUT, DELETE | Template management |
| `/api/ebook-user-content`        | GET, POST, PUT, DELETE | Content management  |
| `/api/ebook-user-content-access` | GET, POST, PUT, DELETE | Access management   |

### 3. Frontend Pages

| Route                        | Description                                |
| ---------------------------- | ------------------------------------------ |
| `/login`                     | Modern login page with Google OAuth button |
| `/dashboard`                 | Main dashboard showing user's ebooks       |
| `/dashboard/ebook/new`       | Create new ebook form                      |
| `/dashboard/ebook/[id]/edit` | Edit existing ebook                        |
| `/dashboard/ebook/[id]/view` | View ebook details                         |

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Styling Approach

- **CSS Modules** for component-scoped styles (e.g., `login.module.css`, `dashboard.module.css`)
- **Styled-jsx** was initially used but replaced with CSS Modules to avoid flash of unstyled content
- **Modern gradient backgrounds** for login page
- **Responsive grid layouts** for dashboard

---

## How It Works

### User Login Flow

1. User visits `/login`
2. Clicks "Continue with Google"
3. Supabase redirects to Google for authentication
4. After success, redirects to `/auth/callback`
5. Callback handler:
    - Exchanges code for session
    - Checks if user exists in `ebook_user` table by `auth_user_id`
    - Creates new record if not exists
6. Redirects to `/dashboard`

### Content Management Flow

1. User clicks "Create New Ebook" on dashboard
2. Fills form with template selection, styling options
3. On submit, creates record in `ebook_user_content`
4. Can edit, view, or delete content
5. Publish toggle sets `is_published` and `published_date`

---

## Dependencies Installed

```json
{
	"@supabase/ssr": "^0.x.x",
	"@supabase/supabase-js": "^2.x.x",
	"next": "15.5.12",
	"react": "19.1.0",
	"react-dom": "19.1.0"
}
```

## Notes for Developers

- Use `createClient()` from `@/lib/supabase/client` for client components
- Use `createClient()` from `@/lib/supabase/server` for server components
- Always validate user session before allowing content operations
- Template selection shows `template_name` if available, falls back to `owner/repo - file`
- CSS Modules preferred over styled-jsx for better SSR support
