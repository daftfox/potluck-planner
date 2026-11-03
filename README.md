# PotluckPlanner

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Potluck Planner is an Angular and NestJS application for organising shared
meals. The UI dev server proxies `/api` requests to the NestJS service on port
3000 (override with `PLANNER_SERVER_PORT`).

## Run tasks

The featured pot-luck's "See what's cooking" button opens its details page at
the full dish list using the `#full-spread` anchor.
Featured, upcoming, and details views show each event's start time in 24-hour
format alongside a clock icon. Sample events also include start times.

### Organising an event

Signed-in users can select "Organise a pot-luck" on the
home page. The `/organise` form requires a title, date, time, and location, with
an optional description and event photo. Photos use the shared dropper and are
uploaded on submission. Creation opens the new event's details page,
including its photo when supplied, and adds it to the home page's event list.
The signed-in user is recorded as organiser. Guests cannot open the form or
create events. Events, RSVP responses, dishes, profiles, and photos are persisted
in PostgreSQL. The service uses TypeORM entities and runs versioned migrations
on startup; schema synchronization is disabled.

### Accounts and registration

Use `/register` to create an account with a unique, case-insensitive username,
a display name, password (at least 8 characters), confirmation, and optional dietary
preferences. Usernames contain 1 to 80 ASCII letters, numbers, dots, underscores,
or hyphens and are set once at registration. Display names do not need to be unique
and can be changed in Profile without changing the login username.
Passwords are bcrypt-hashed. Login sessions use signed JWT bearer
tokens with a 24-hour expiry and server-side revocation on logout. The browser
keeps the token between reloads. Profiles and RSVPs are account-specific, and
dishes retain their owner IDs. Signed-out users can browse events, but cannot
RSVP or access Profile.

The username migration assigns `Sloddervos` only to the initial admin,
Timothy Claassens, without changing their password. Other pre-existing accounts
are left without usernames and cannot log in; they are not deleted or automatically
assigned usernames. Existing unexpired sessions remain valid.
Registration requests now include `username`, `name` (the display name), `password`,
and optional `dietaryPreferences`; login requests include `username` and `password`.
Profile updates accept only `name` and `dietaryPreferences`, never `username`.

Run `npm run test:service:integration` with PostgreSQL running to exercise the
username migration, registration, login, and profile updates. Tests use a temporary
schema in the configured database and remove it afterward.

### API and local development

Prepare local configuration, then start the workspace:

```sh
cp apps/potluck-planner-service/environment.example apps/potluck-planner-service/.env
npm run start
```

The service's Nx `serve` target uses the `nx:run-commands` executor to run
`docker compose up -d` before starting the backend. You can also start the
database independently with `npx nx run potluck-planner-service:database-up`.
The backend build explicitly uses the installed `@nx/webpack:webpack` executor
so `serve` receives Webpack watch events and restarts after source edits, even
without the Nx daemon. This executor is supported in the current Nx 23 workspace
but deprecated for Nx 24; review watch support when upgrading.
Replace the example `JWT_SECRET` and `DB_PASSWORD` with private random values
before exposing the service. The compose file binds PostgreSQL to localhost only.
Before the first service startup with this migration, set
`INITIAL_ADMIN_PASSWORD` in the service `.env` to the initial admin's password.
The migration stores only a bcrypt hash, does not overwrite an existing
account's profile data, and runs once. Remove `INITIAL_ADMIN_PASSWORD` from
the environment after that startup.
Keep `DB_NAME` consistent with the database initialized in the persistent
PostgreSQL volume; changing it later does not rename or create a database.
The API uses `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
`JWT_SECRET`, `JWT_ISSUER`, `JWT_AUDIENCE`, `PLANNER_SERVER_PORT`, and
`INITIAL_ADMIN_PASSWORD` for the one-time initial admin migration.
`npm run start:service` and `npm run start:ui` can be used in separate terminals.
New accounts start as members. The initial migration creates the first admin;
admins can then assign roles from `/admin` and delete other user accounts.
Deleting an account keeps the user's pot-lucks and dishes, removes their
uploaded photos, RSVPs, and sign-in sessions, and clears their
organizer/dish-owner links. An admin cannot change or delete their own account,
and the last admin account cannot be deleted.
Members can delete their own
pot-lucks; admins can also delete other members' pot-lucks. When someone changes
their RSVP to "Can't make it", their dishes are hidden, not deleted, and become
visible again if they RSVP "I'm in" or "Maybe".
The service exposes:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register`, `/api/auth/login` | Create an account or start a session |
| `GET` | `/api/auth/me` | Retrieve the current account |
| `POST` | `/api/auth/logout` | Revoke the current session |
| `GET` | `/api/potlucks`, `/api/potlucks/:id` | Retrieve event lists and details |
| `POST` | `/api/potlucks` | Create an event |
| `DELETE` | `/api/potlucks/:id` | Delete an event you organised, or any event as an admin |
| `POST` | `/api/potlucks/:id/rsvp` | Save an RSVP |
| `POST` | `/api/potlucks/:id/dishes` | Add a dish |
| `PATCH` | `/api/potlucks/:id/dishes/:dishId` | Update a dish you brought |
| `PATCH` | `/api/profile` | Save profile details and dietary preferences |
| `GET` | `/api/admin/users` | List users (admins only) |
| `PATCH` | `/api/admin/users/:id/role` | Assign a role to another user (admins only) |
| `DELETE` | `/api/admin/users/:id` | Delete another user account (admins only) |
| `POST` | `/api/photos` | Validate and persist an image data URL |
| `GET` | `/api/photos/:id` | Retrieve an uploaded image |

Protected endpoints require `Authorization: Bearer <token>`. Image uploads accept
PNG, JPEG, GIF, or WebP images up to 5 MB.

### Docker image

`npx nx docker-build potluck-planner-service` builds both apps (production) and
a single image, `potluck-planner:latest`, in which the NestJS service serves the
API under `/api` and the Angular UI (with deep-link fallback to `index.html`)
on port 3000. Options:

- `--image=registry/potluck-planner:1.2.3` sets the image name and tag.
- `--caFile=/path/to/ca.pem` supplies an extra CA bundle as a build secret for
  `npm ci` behind a corporate registry or TLS proxy (default
  `/etc/pki/tls/certs/ca-bundle.crt`). It is not stored in the image.

The image runs as the non-root `node` user and applies database migrations on
startup. Configure it with environment variables:

| Variable | Required | Image default |
| --- | --- | --- |
| `DB_PASSWORD` | yes | – |
| `JWT_SECRET` | yes (min 32 chars) | – |
| `DB_HOST` / `DB_PORT` | no | `postgres` / `5432` |
| `DB_USER` / `DB_NAME` | no | `potluck` / `potluck` |
| `JWT_ISSUER` / `JWT_AUDIENCE` | no | `potluck-planner-api` / `potluck-planner-ui` |
| `PLANNER_SERVER_PORT` | no | `3000` |
| `INITIAL_ADMIN_PASSWORD` | first start only (min 8 chars) | – |
| `UI_DIST_PATH` | no | `/app/ui` |

`apps/potluck-planner-service/docker-compose.example.yml` shows a complete
setup with PostgreSQL.

### Profile

Open Profile from the header to edit your display name and dietary preferences.
The profile and dish form share `DietarySelectorComponent`: identical toggle
buttons, selected check icons and fades, accessible pressed states, and disabled
behavior. Parents supply the selection and handle `selectedChange`.
Vegan and Vegetarian are mutually exclusive in all dietary selectors; deselect
one before selecting the other. Existing data containing both can be corrected
by deselecting either.
In all dietary selectors, Vegan disables Dairy-Free, Egg-Free, Pescatarian, and
Shellfish-Free; Vegetarian disables Pescatarian and Shellfish-Free. Previously
selected options remain selected while disabled and can be changed after removing
the controlling selection. No additional dietary claims are automatically saved.
Lucide SVG dietary icons live in `apps/potluck-planner-ui/public/images/dietary`
and are shared through `DietaryIconComponent`. Selector buttons pair each icon
with its text label. Dish-card footers show compact 16px
icon-only badges with card-styled tooltips on hover or keyboard focus and
accessible names.
Badges matching the signed-in user's saved dietary preferences are highlighted
in green with contrasting dark icons. Tooltips and accessible names identify
matches; profile changes update every dish card, and guests see no highlights.
Tooltips follow the mouse pointer with a small offset and stay within the
viewport; keyboard focus positions them beside the badge.
Footers show only the dish's declared
suitability; these are not allergen-safety guarantees or religious certification.
Icons come from [Lucide](https://lucide.dev/) under ISC/MIT licenses. The asset
directory includes `LICENSE.lucide` and `SOURCES.txt` with the pinned upstream
revision, icon mappings, and the theme-color modification.
DietaryIconComponent renders the SVGs as CSS masks: warm icons on dark surfaces,
and dark icons on selected or hovered green selector buttons. The inherited
`--dietary-icon-color` property can override the default for other backgrounds.
Saving updates the current account (including the header); cancelling restores
saved values. Profile changes persist across reloads.
The page lists all your RSVP responses, including "Can't make it", with links to
each event. Dish history shows only your contributions to events before today
(local date), newest events first; upcoming/today's dishes and other users'
dishes are excluded. Event records use an ISO `startsOn` date for comparisons,
separate from their display labels. Empty states appear until you RSVP or have
past contributions.

### Conditional transitions

The home page wraps its featured and upcoming pot-lucks in the same page-level
fade used by the other routed pages.

Conditional template content uses Angular's `animate.enter` and `animate.leave`
with shared `fade-in` / `fade-out` classes in
`apps/potluck-planner-ui/src/styles/_transitions.css`. Content fades over 200ms;
Angular waits for the exit animation before removing it. Reduced-motion users
get a near-instant transition. Apply both hooks to the root elements of new
conditional branches, not to the `@if` block itself.
The RSVP-dependent contribution section uses `reveal-in` / `reveal-out`
instead: a grid wrapper expands/collapses its natural height over 300ms while
fading, so following sections slide rather than jump. Its clipped inner
`reveal-content` wrapper includes the section's spacing in that animation.
Switching between the dish list and form uses `smoothHeight` to observe the
inner content's natural height and transition the surrounding space over 300ms.
Outgoing branches fade in place without contributing extra layout height.

### Dish photos

The "Add a dish" button is available only after an "I'm in" or "Maybe" RSVP.
Switching to "Can't make it" closes the dish form; existing dishes remain visible.
Dish ownership uses the current account in `PotluckDataService`, also displayed
in the header. New submissions are assigned to that user. "What I'm bringing"
shows only their dishes; "The full spread" shows everyone's dishes, including
theirs. Dishes without ownership are shown only in the full spread.
Your dish cards reveal a pencil button only while the card is hovered.
Editing pre-fills the dish form; saving updates the
same dish in both sections, and cancelling leaves it unchanged. Existing photos
are preserved unless replaced or removed. Stable dish IDs distinguish dishes
with the same name; updates are restricted to the current user's dishes.
Dish cards have equal heights across grid rows and show a cropped thumbnail
when a photo is present, or a subtle, warm-toned SVG plate placeholder otherwise.
The placeholder is decorative and uses the same thumbnail dimensions.
The pasta salad and brownies include original local
sample illustrations in `apps/potluck-planner-ui/public/images`; the quinoa
bowl demonstrates a dish without a photo.

The dish form accepts one optional image, either dropped onto the photo area or
selected with the file browser. A thumbnail appears below the drop area for the
selected photo; files that cannot be displayed as images show a preview error.
Selected photos can be replaced or removed. Dish images are sent to the photo
endpoint and stored with the dish record.

To run the dev server for your app, use:

```sh
npx nx serve potluck-planner-ui
```

To create a production bundle:

```sh
npx nx build potluck-planner-ui
```

To see all available targets to run for a project, run:

```sh
npx nx show project potluck-planner-ui
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/angular:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/angular:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Set up CI!

### Step 1

To connect to Nx Cloud, run the following command:

```sh
npx nx connect
```

Connecting to Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Step 2

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:

- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
