"use strict";

const https = require("https");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const {
  BUNNY_STORAGE_ZONE_NAME,
  STORAGE_HOST,
  BUNNY_STORAGE_API_KEY,
  BUNNY_CDN_URL,
} = process.env;

// ── Startup validation ──────────────────────────────────────────────
const MISSING = ["BUNNY_STORAGE_ZONE_NAME", "STORAGE_HOST", "BUNNY_STORAGE_API_KEY", "BUNNY_CDN_URL"]
  .filter((k) => !process.env[k]);

if (MISSING.length) {
  console.error("[UPLOAD] Missing env vars:", MISSING.join(", "));
}

// ── Core upload ─────────────────────────────────────────────────────
const uploadToBunny = (buffer, filename, subdirectory = "products") => {
  return new Promise((resolve, reject) => {
    // Guard: catch missing env early with clear message
    if (!BUNNY_STORAGE_API_KEY || !STORAGE_HOST || !BUNNY_STORAGE_ZONE_NAME) {
      return reject(new Error("Bunny.net env vars not set. Check STORAGE_HOST, BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_API_KEY"));
    }

    const remotePath = `${subdirectory}/${filename}`;
    const options = {
      hostname: STORAGE_HOST.replace(/^https?:\/\//, ""), // strip protocol if accidentally included
      path: `/${BUNNY_STORAGE_ZONE_NAME}/${remotePath}`,
      method: "PUT",
      headers: {
        AccessKey: BUNNY_STORAGE_API_KEY.trim(), // trim whitespace
        "Content-Type": "application/octet-stream",
        "Content-Length": buffer.length,
      },
    };

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          const cdnUrl = `${BUNNY_CDN_URL.replace(/\/+$/, "")}/${remotePath}`;
          resolve(cdnUrl);
        } else {
          // Log full detail for easier debug
          console.error("[BUNNY] Upload failed:", {
            status: res.statusCode,
            body,
            host: options.hostname,
            path: options.path,
          });
          reject(new Error(`Bunny.net upload failed: ${res.statusCode} ${body}`));
        }
      });
    });

    req.on("error", (err) => {
      console.error("[BUNNY] Request error:", err.message);
      reject(err);
    });

    req.write(buffer);
    req.end();
  });
};

// ── Single upload ───────────────────────────────────────────────────
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided." });
    }

    const ext = path.extname(req.file.originalname) || ".png";
    const filename = `${uuidv4()}${ext}`;
    const url = await uploadToBunny(req.file.buffer, filename);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      data: { url, filename, size: req.file.size, mimetype: req.file.mimetype },
    });
  } catch (err) {
    console.error("[UPLOAD CONTROLLER] uploadImage:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Image upload failed." });
  }
};

// ── Multiple upload ─────────────────────────────────────────────────
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files provided." });
    }

    const results = await Promise.all(
      req.files.map(async (file, index) => {
        const ext = path.extname(file.originalname) || ".png";
        const filename = `${uuidv4()}${ext}`;
        const url = await uploadToBunny(file.buffer, filename);
        return { url, filename, order: index, size: file.size, mimetype: file.mimetype };
      })
    );

    return res.status(200).json({
      success: true,
      message: `${results.length} image(s) uploaded successfully.`,
      data: results,
    });
  } catch (err) {
    console.error("[UPLOAD CONTROLLER] uploadImages:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Image upload failed." });
  }
};

module.exports = { uploadImage, uploadImages };