# Bible Engine

The Bible engine deliberately separates the application from any Bible-content vendor.

## Provider boundary

`BibleProvider` exposes versions, books, chapters and passages. The API currently includes a YouVersion adapter. A future public-domain or separately licensed provider can be added without changing reader or study modules.

## YouVersion integration

The server uses `YVP_APP_KEY`; the key must never be shipped to browser or mobile bundles. The API base is `https://api.youversion.com/v1` by default. The current platform API requires the `X-YVP-App-Key` header and distinguishes metadata availability from licensed text access. Select versions from the app-scoped `/bibles?language_ranges[]=...` response rather than assuming a hard-coded translation is licensed.

## References

Internally, references are normalized to `{ bookId, chapter, verseStart?, verseEnd? }` and converted to USFM such as `JHN.3.16`. This keeps user input (`John 3:16`) separate from provider-specific URL formatting.

## Caching

The web reader uses Next.js revalidation as a first cache layer. Production should add Redis/API caching keyed by provider, version, book, chapter/reference and locale, with explicit TTLs and invalidation rules.

## Search

Search should not scrape provider pages. The production search layer should index only content the application is legally permitted to store/index, with license metadata attached to every indexed version.
