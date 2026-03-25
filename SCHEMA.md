# Database Schema Reference

> Auto-generated from Supabase. Do not run directly — this is a read-only reference.

---

## users

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| email | varchar | | NOT NULL, UNIQUE |
| password_hash | varchar | | |
| display_name | varchar | | |
| avatar_url | varchar | | |
| bio | text | | |
| created_at | timestamptz | `now()` | |

---

## families

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| name | varchar | | NOT NULL |
| created_by | uuid | | FK → users.id |
| created_at | timestamptz | `now()` | |

---

## family_members

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| family_id | uuid | | NOT NULL, FK → families.id |
| user_id | uuid | | NOT NULL, FK → users.id |
| role | varchar | `'member'` | NOT NULL, CHECK: `admin`, `member`, `child` |
| household | varchar | `'main'` | NOT NULL, CHECK: `main`, `extended` |
| joined_at | timestamptz | `now()` | |

---

## invites

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| family_id | uuid | | NOT NULL, FK → families.id |
| created_by | uuid | | FK → users.id |
| token | varchar | `encode(gen_random_bytes(24), 'base64')` | NOT NULL, UNIQUE |
| email | varchar | | |
| expires_at | timestamptz | | |
| used_at | timestamptz | | |

---

## sprint_themes

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| name | varchar | | NOT NULL |
| description | text | | |
| icon | varchar | | |
| is_active | boolean | `true` | |
| sort_order | integer | `0` | |

---

## family_sprints

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| family_id | uuid | | NOT NULL, FK → families.id |
| theme_id | uuid | | NOT NULL, FK → sprint_themes.id |
| started_at | date | | NOT NULL |
| ends_at | date | `started_at + 42 days` | |
| current_week | integer | `1` | NOT NULL, CHECK: 1–6 |
| status | varchar | `'active'` | NOT NULL, CHECK: `active`, `completed`, `abandoned` |
| completed_at | timestamptz | | |

---

## activities

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| theme_id | uuid | | NOT NULL, FK → sprint_themes.id |
| week_number | integer | | NOT NULL, CHECK: 1–6 |
| sort_order | integer | | NOT NULL, CHECK: 1–3 |
| type | varchar | | NOT NULL, CHECK: `question`, `photo`, `poll`, `dare`, `draw`, `story`, `confession`, `voice` |
| prompt | text | | NOT NULL |
| is_anonymous | boolean | `false` | |
| allow_comments | boolean | `true` | |

---

## responses

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| sprint_id | uuid | | NOT NULL, FK → family_sprints.id |
| activity_id | uuid | | NOT NULL, FK → activities.id |
| user_id | uuid | | NOT NULL, FK → users.id |
| type | varchar | | NOT NULL, CHECK: `text`, `image`, `audio`, `drawing` |
| content | text | | |
| is_anonymous | boolean | `false` | |
| created_at | timestamptz | `now()` | |

---

## comments

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| response_id | uuid | | NOT NULL, FK → responses.id |
| user_id | uuid | | NOT NULL, FK → users.id |
| content | text | | NOT NULL |
| created_at | timestamptz | `now()` | |

---

## reactions

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| response_id | uuid | | NOT NULL, FK → responses.id |
| user_id | uuid | | NOT NULL, FK → users.id |
| emoji | varchar | | NOT NULL |
| created_at | timestamptz | `now()` | |

---

## badges

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| key | varchar | | NOT NULL, UNIQUE |
| label | varchar | | NOT NULL |
| description | text | | |
| icon | varchar | | |

---

## user_badges

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| user_id | uuid | | NOT NULL, FK → users.id |
| family_id | uuid | | NOT NULL, FK → families.id |
| badge_id | uuid | | NOT NULL, FK → badges.id |
| earned_at | timestamptz | `now()` | |

---

## streaks

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| family_id | uuid | | NOT NULL, FK → families.id |
| user_id | uuid | | NOT NULL, FK → users.id |
| current_streak | integer | `0` | |
| longest_streak | integer | `0` | |
| last_active_week | date | | |

---

## family_xp

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| family_id | uuid | | NOT NULL, UNIQUE, FK → families.id |
| total_xp | integer | `0` | |
| updated_at | timestamptz | `now()` | |

---

## memory_books

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| sprint_id | uuid | | NOT NULL, UNIQUE, FK → family_sprints.id |
| generated_at | timestamptz | | |
| pdf_url | varchar | | |

---

## week_votes

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | uuid | `gen_random_uuid()` | PK |
| sprint_id | uuid | | NOT NULL, FK → family_sprints.id |
| user_id | uuid | | NOT NULL, FK → users.id |
| week_number | integer | | NOT NULL, CHECK: 1–6 |
| created_at | timestamptz | `now()` | |
| | | | UNIQUE(sprint_id, user_id, week_number) |

---

## test_items

| Column | Type | Default | Constraints |
|---|---|---|---|
| id | integer | `nextval(...)` | PK |
| name | text | | NOT NULL |
| description | text | | |
| created_at | timestamptz | `now()` | |

---

## Relationships

```
users ──┬── family_members ──── families
        ├── responses ──────── activities ──── sprint_themes
        ├── comments ──────── responses       │
        ├── reactions ─────── responses        ├── family_sprints ──── families
        ├── user_badges ───── badges           │
        ├── streaks ────────── families         └── memory_books
        └── invites ────────── families
```

- A **family** has many **family_members** (users with roles).
- A **sprint_theme** has many **activities** (3 per week, 6 weeks).
- A **family_sprint** links a family to a theme for a 42-day cycle.
- **Responses** are submitted per user per activity within a sprint.
- Responses can have **comments** and **reactions**.
- **Invites** use a unique token to onboard new members.
- **Streaks**, **family_xp**, **badges**, and **user_badges** track engagement.
- **Memory_books** are generated per completed sprint.
