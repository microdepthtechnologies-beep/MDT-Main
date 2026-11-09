# Account access and sales workflows

## Sales workspace and quotation workflow

Sales staff use `/sales/`. Register an ordinary account for each colleague, then
grant access from the app directory:

```sh
node scripts/set-account-role.mjs "colleague@mdt.co.ke" sales
```

The colleague signs in again and opens `/sales/` (also linked from their account
navigation). To remove sales access, run the same command with `customer`.
Roles are checked against MongoDB on every sales API request. The public
registration endpoint never grants staff access.

The workflow is: submitted → review → quotation → customer acceptance/decline →
fulfilment → fulfilled. Staff can assign requests to themselves, save private
drafts, confirm available quantities, mark backorders/unavailable products, set
unit prices, tax, delivery, validity and terms, preview the customer quotation,
and publish/send it. Customers see only issued quotations in their own accounts.
They can accept or decline; acceptance does not collect payment. Payment and
physical delivery remain coordinated by sales.

All amounts are stored as integer KES minor units. Unit prices exclude tax; the
explicit quotation tax rate applies to the subtotal plus delivery. Unavailable
lines contribute zero. Published quotation snapshots and a bounded activity
history are stored with the request. Revisions prevent conflicting staff saves;
customer responses are bound to the current offer ID. Unsent drafts and internal
notes never appear in customer responses. Sales/customer pages are private and
noindex, and the public catalogue remains price-free.

Request notification emails link directly to the sales request and customer
dashboard. Quotation emails include product availability, item prices, totals,
terms and a secure account link. Saving a request succeeds independently of
email delivery. Issued quotations remain available in the customer's account
if email fails; staff see the failure and can retry. Concurrent sends are
blocked. If a process stops during delivery, after two minutes staff can release
the interrupted send and retry after checking receipt. SMTP cannot guarantee
exactly-once delivery across a process crash; a stable quotation Message-ID is
used for retries.

Set `APP_URL` to the address users can actually reach (for example,
`https://mdt.co.ke`). It falls back to `AUTH_URL` / `NEXTAUTH_URL`. A localhost URL
works only on the machine running the app; remote colleagues/customers need an
HTTPS deployment or a temporary tunnel. Keep authentication origins configured
for that same address. Mail uses the existing SMTP settings; `SMTP_SECURE=true`
is appropriate for port 465 and `false` for STARTTLS on port 587.

Live updates use authenticated server-sent events backed by MongoDB change streams,
with reconnection and a 15-second reconciliation fallback. Use Atlas or another
replica set, and configure the host/proxy to stream SSE without buffering. Streams
rotate after 50 seconds to accommodate host request-duration limits. Only
invalidation signals are streamed; quote content is fetched through authorized
server rendering. Drafts in an open editor are retained when another colleague
makes a change, and conflicts must be resolved before saving.

End-to-end checks run against a temporary local MongoDB replica set, temporary
accounts and a local SMTP receiver. They never send customer mail:

```sh
npm run build
npx playwright test tests/sales-workflow.spec.ts
```

The suite uses ports 3107 and 2527; the first run downloads a MongoDB test binary.
It checks ownership, staff permissions, draft privacy, duplicate submission,
concurrent sends, failed email retries, live customer/sales updates, acceptance,
fulfilment and layouts down to 320px.

## Deleting a login account

From the app directory, run:

```sh
node scripts/delete-account.mjs "user@example.com" --dry-run
node scripts/delete-account.mjs "user@example.com"
```

The first command previews matches; the second permanently deletes matching login
accounts. The script uses the configured MongoDB connection from `.env.local` (or
the process environment), matches the complete email address without regard to case,
and verifies the remaining count. Profiles, password hashes and reset tokens live on
the account and are removed with it. Existing JWT sessions are rejected on their next
authenticated request. Quote history and legacy WordPress user records are retained.
This deletes the account; it does not ban the address from registering again.

## Recovery flow

The sign-in page links to `/auth/forgot-password/`. Recovery emails use the existing
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS` settings. Set `AUTH_URL` (or
`NEXTAUTH_URL`) to the website's trusted origin: `http://localhost:3000` locally or
`https://mdt.co.ke` in production. Links are never constructed from request headers.

Only accounts with a password receive recovery emails; Google-only accounts continue
through Google. Public responses do not disclose whether an email is registered.
Links expire after 30 minutes, replace earlier links, and are consumed atomically when
the password changes. MongoDB stores only the token's SHA-256 hash on the account.
Resetting increments `passwordVersion`, which invalidates previous JWT sessions on
their next authenticated request. Password changes from the dashboard also remove
outstanding reset tokens.

The `passwordResetLimits` collection limits each normalized email to five attempts
per hour, with an additional one-minute email cooldown. Its keys hash the email
address; a TTL index removes expired limit records. SMTP failures clear the unsent
token and emit a generic server diagnostic without logging the token or credentials.
The response remains generic; it is not a delivery receipt.

Run `npx playwright test tests/password-recovery.spec.ts` against the local server
for recovery service checks and browser checks. Tests use isolated account and
email doubles; they do not send real messages or alter customer accounts.

# Micro Depth Technologies

Next.js App Router website using the migrated MongoDB catalogue.

## Marketing content

Home, About, Services, Software & Licenses, Blog and Contact use the typed defaults
in `data/site-content.ts`. Solution and service detail defaults live in
`data/service-pages.ts`. Their presentation components consume these fields through
`lib/site-content.ts`; they do not require a page builder.

The future admin dashboard can publish overrides to the MongoDB `sitePages`
collection using this document shape:

```json
{
  "key": "about",
  "schemaVersion": 1,
  "status": "published",
  "updatedAt": { "$date": "2026-11-09T00:00:00Z" },
  "content": {
    "seo": {
      "title": "About Micro Depth Technologies | MDT",
      "description": "Your approved page description."
    },
    "hero": {
      "title": "The whole picture.\nEvery little detail."
    }
  }
}
```

Supported page keys are `home`, `about`, `services`, `software`, `blog` and `contact`.
Service keys use `service:` followed by the path without leading/trailing slashes,
for example `service:our-services/it-support-services`. Canonical service paths stay
fixed to protect existing links.

Only published documents with schema version 1 are used; drafts are ignored.
The latest published version by `updatedAt` wins. Missing or invalid fields retain
the bundled defaults, and unrecognised fields are discarded. Arrays replace the
corresponding list, up to 100 entries. Headings support line breaks via `\n`.
Image fields use `/wp-content/uploads/YYYY/MM/filename.ext` paths and separate alt
text. Text is rendered as text, and migrated article HTML is sanitised.

The admin UI, write endpoints, media uploads, approval controls and revision
management are a later phase. Admin writes must validate the complete content
schema, require appropriate authorization and record an audit history.

### Software products

`software.products.categorySlugs` selects software categories, including their
descendants. `software.products.productIds` optionally selects published products
by WordPress product ID. The default `0` is an ignored placeholder, not a product.
The section shows up to four products using the existing quote-only cards; when no
products match, it shows a software enquiry panel. Add the future category's slug
to the selection to connect it without changing the template.

### Blog and SEO migration

Articles read published documents from `posts`, retaining their original
`/YYYY/MM/DD/slug/` URLs. `/blog/slug/` redirects to the dated canonical URL.
The journal supports topics, search and pagination; search pages are noindex.
Metadata, breadcrumbs, organization and article structured data are generated on
the server. `sitemap.xml` includes public corporate, service, blog, product and
category routes, with `/sitemap_index.xml` redirecting to it. Legacy page aliases
are listed in `next.config.ts`; Products remains canonical at `/shop/`.

Media continues to use the shared WordPress uploads library. Its default local
location is `../../uploads/uploads` relative to this app. A deployed environment
must supply that library or set `UPLOADS_PATH` to its location. The application
repository alone does not include the full media library.

Before cutover, check the final WordPress URL inventory against redirects, confirm
the production media library and environment settings, then submit the new
sitemap in Search Console and monitor crawl errors. Preserving URLs and metadata
reduces migration risk; it does not guarantee rankings.

The live sitemap was checked on 9 November 2026. This phase covers the corporate
pages, the ten solution/service URLs in `data/service-pages.ts`, all six migrated
articles and the Education and Financial Services archives. Both
`/request-quote/` and `/request-a-quote/` redirect to quote checkout.

The following live URLs remain outside this marketing phase and must be resolved
before production cutover:

- `/privacy-policy-2/` and `/return-warranty-policy/`: preserve the current approved
  policies in a dedicated policy template. Their migrated `pages.content` fields
  are empty because the source uses a page builder; the live pages contain text.
- `/terms-of-use/`: the live page still contains unrelated BeTheme shop demo terms
  referring to Australia and the Netherlands. Obtain MDT's approved terms rather
  than publishing those as company policy.
- `/product-authentication/`: the live page makes a blanket authenticity claim;
  replace it with an actual verification workflow or an agreed enquiry page.
- Legacy WordPress account, login, registration, password reset, wishlist and
  checkout URLs: agree the mapping to the new account and quote workflows.
No customer account import or password-reset workflow is introduced here.

## Shared media library

Added editorial photography is defined in `data/editorial-media.json`. The
frontend reads its local URLs and alt text through `data/editorial-media.ts`.
The manifest also records each photographer, source photo page and Pexels licence.
These are illustrative stock photographs, not portraits of MDT staff or claims
of endorsement. Product and article images from the WordPress export retain
their existing files and URLs.

New files use the same library as product images:

```text
uploads/uploads/
  2026/11/
    mdt-network-installation-442150.webp
    mdt-network-installation-442150-400.webp
    mdt-network-installation-442150-source.jpg
    ...
```

The served URL begins `/wp-content/uploads/`. The main WebP is at most 1920px
along its longest side; a 400px thumbnail supports the future media picker.
The downloaded JPEG is retained as the source copy. Next.js also generates its
normal responsive delivery variants. New filenames avoid stale immutable caches.

Use the repeatable importer from the app directory:

```sh
npm run media:sync
npm run media:sync -- --apply
```

The first command previews the database registrations. `--apply` downloads missing
source files, verifies existing files instead of overwriting them, creates WebPs
and thumbnails, and upserts records in the existing MongoDB `media` collection.
It uses `.env.local` when present and honours `UPLOADS_PATH`. If database access
fails, prepared files remain available and the command can be retried.

New records have a stable `mediaId`, `file`, `url`, `mime`, dimensions, byte size,
SHA-256 checksum, title, alt text, caption, description, tags, original and thumbnail
references, source/licence information and timestamps. WordPress entries retain
their numeric `wpId`; a partial unique index protects those IDs while allowing
new media without fabricated WordPress IDs.

Superseded design WebPs retain their old URLs and get `status: "archived"` records
linked to their replacements. Their original JPEGs are copied from `public/assets`
into the shared library, verified byte for byte, and removed from `public/assets`
only after the archive records are saved. No exported WordPress images are moved
or overwritten.

For a future admin picker, exclude `status: "archived"`; imported WordPress media
currently has no status, so include records where `status` is absent as well as
`status: "active"`. Use `mediaId` for new assets and `wpId` for migrated assets.
Page content continues to accept the selected local URL and editable alt text.
Uploading, replacing and deleting media through an admin UI remain future work.

The original `migration/transform-import.js` is a full replacement import that
clears collections. Do not use it for incremental media updates. If intentionally
restoring the WordPress snapshot, rerun `media:sync -- --apply` afterwards.

## Verification

Run `npm run lint` and `npm run build`. With the application running on port 3000,
run `npm run test:ui` for the catalogue and marketing browser suites. Set
`PLAYWRIGHT_BASE_URL` to test another local server. These checks use the migrated
database and media library and do not submit real enquiries or send email.
