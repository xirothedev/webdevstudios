-- Store storage keys instead of full public URLs (ticket #24).
-- Values are rewritten from URLs to keys by scripts/rewrite-media-urls-to-keys.ts.
ALTER TABLE "blog_posts" RENAME COLUMN "contentUrl" TO "contentKey";
