"use strict";

const { S3Client, PutObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// ─── Config & validation ───────────────────────────────────────────────────────

const REQUIRED_ENV = [
  "AWS_S3_BUCKET",
  "AWS_S3_REGION",
  "AWS_CLOUDFRONT_URL",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
];

const MISSING = REQUIRED_ENV.filter((k) => !process.env[k]);
if (MISSING.length) {
  console.error("[S3 SERVICE] Missing env vars:", MISSING.join(", "));
}

const BUCKET      = process.env.AWS_S3_BUCKET;
const REGION      = process.env.AWS_S3_REGION || "ap-south-1";
const CDN_URL     = (process.env.AWS_CLOUDFRONT_URL || "").replace(/\/+$/, "");
const MAX_WIDTH   = parseInt(process.env.IMAGE_MAX_WIDTH   || "1400", 10);
const WEBP_QUALITY = parseInt(process.env.IMAGE_WEBP_QUALITY || "85",   10);
const AVIF_QUALITY = parseInt(process.env.IMAGE_AVIF_QUALITY || "70",   10);

// ─── S3 client ────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a CloudFront CDN URL from an S3 object key.
 * @param {string} key  e.g. "products/abc123.webp"
 * @returns {string}    e.g. "https://d1234.cloudfront.net/products/abc123.webp"
 */
const buildCdnUrl = (key) => `${CDN_URL}/${key}`;

/**
 * Upload a single buffer to S3.
 * @param {Buffer} buffer
 * @param {string} key          S3 object key
 * @param {string} contentType  MIME type
 */
const putObject = async (buffer, key, contentType) => {
  await s3.send(
    new PutObjectCommand({
      Bucket:       BUCKET,
      Key:          key,
      Body:         buffer,
      ContentType:  contentType,
      CacheControl: "public, max-age=31536000, immutable",
      Metadata: {
        "uploaded-by": "kalasatra-backend",
      },
    })
  );
};

/**
 * Generate a tiny Base64 blur placeholder (8×8 → WebP).
 * Used by frontend for lazy-load <img> placeholders.
 * @param {Buffer} inputBuffer  Original image buffer
 * @returns {Promise<string>}   data:image/webp;base64,...
 */
const generateBlurDataURL = async (inputBuffer) => {
  const tinyBuffer = await sharp(inputBuffer)
    .resize(8, 8, { fit: "cover" })
    .webp({ quality: 20 })
    .toBuffer();

  return `data:image/webp;base64,${tinyBuffer.toString("base64")}`;
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Process and upload one image to S3 in both WebP and AVIF formats.
 *
 * @param {Buffer} buffer           Raw file buffer from multer
 * @param {string} originalFilename Original uploaded filename (for ext reference only)
 * @param {string} [folder="products"]  S3 "directory" prefix
 *
 * @returns {Promise<{
 *   url:         string,   // = webp_url  (backward-compat primary)
 *   webp_url:    string,
 *   avif_url:    string,
 *   webp_key:    string,   // S3 object key — store this for later deletion
 *   avif_key:    string,
 *   blurDataURL: string,   // tiny base64 placeholder for lazy loading
 *   width:       number,
 *   height:      number,
 *   size_bytes:  number,   // WebP file size
 * }>}
 */
const uploadImageToS3 = async (buffer, originalFilename, folder = "products") => {
  if (!BUCKET || !CDN_URL) {
    throw new Error(
      "S3 not configured. Set AWS_S3_BUCKET and AWS_CLOUDFRONT_URL in .env"
    );
  }

  const id = uuidv4();

  // ── 1. Resize (preserve aspect ratio, never upscale) ──────────────────────
  const base = sharp(buffer).resize(MAX_WIDTH, undefined, {
    withoutEnlargement: true,
    fit: "inside",
  });

  // ── 2. Convert to WebP ────────────────────────────────────────────────────
  const { data: webpBuffer, info: webpInfo } = await base
    .clone()
    .webp({ quality: WEBP_QUALITY })
    .toBuffer({ resolveWithObject: true });

  // ── 3. Convert to AVIF ────────────────────────────────────────────────────
  const avifBuffer = await base
    .clone()
    .avif({ quality: AVIF_QUALITY, effort: 4 })
    .toBuffer();

  // ── 4. Generate blur placeholder ──────────────────────────────────────────
  const blurDataURL = await generateBlurDataURL(buffer);

  // ── 5. Upload both formats to S3 ──────────────────────────────────────────
  const webpKey = `${folder}/${id}.webp`;
  const avifKey = `${folder}/${id}.avif`;

  await Promise.all([
    putObject(webpBuffer, webpKey, "image/webp"),
    putObject(avifBuffer, avifKey, "image/avif"),
  ]);

  // ── 6. Build CloudFront URLs ───────────────────────────────────────────────
  const webp_url = buildCdnUrl(webpKey);
  const avif_url = buildCdnUrl(avifKey);

  console.info(
    `[S3 SERVICE] Uploaded: ${webpKey} (${webpInfo.size}B) + ${avifKey}`
  );

  return {
    url:         webp_url,   // backward-compat: keep existing "url" field
    webp_url,
    avif_url,
    webp_key:    webpKey,
    avif_key:    avifKey,
    blurDataURL,
    width:       webpInfo.width,
    height:      webpInfo.height,
    size_bytes:  webpInfo.size,
  };
};

/**
 * Delete one or more S3 objects by their keys.
 * Silently skips empty arrays.
 *
 * @param {string[]} keys  Array of S3 object keys to delete
 */
const deleteImagesFromS3 = async (keys) => {
  if (!keys || keys.length === 0) return;
  if (!BUCKET) {
    console.warn("[S3 SERVICE] deleteImagesFromS3: AWS_S3_BUCKET not set, skipping.");
    return;
  }

  const objects = keys
    .filter(Boolean)
    .map((Key) => ({ Key }));

  if (objects.length === 0) return;

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: objects, Quiet: true },
    })
  );

  console.info(`[S3 SERVICE] Deleted ${objects.length} object(s):`, objects.map((o) => o.Key));
};

module.exports = { uploadImageToS3, deleteImagesFromS3, buildCdnUrl };
