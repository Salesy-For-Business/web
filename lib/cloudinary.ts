import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureConfigured() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
  filename?: string,
) {
  const client = ensureConfigured();
  const prefix = process.env.CLOUDINARY_FOLDER || "salesy";

  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: `${prefix}/${folder}`,
        resource_type: "image",
        public_id: filename,
        overwrite: true,
      },
      (err, result) => {
        if (err || !result) {
          reject(err ?? new Error("Upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

const DATA_URL_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/;

/**
 * Business logo / social image can arrive as an inline base64 `data:` URL
 * (from `FileDropzone`, before a Business document — and Cloudinary's
 * owned-business-gated upload route — exist). A `data:` URL can't be used
 * as `og:image` / `twitter:image` (social crawlers fetch an absolute HTTP
 * URL, they don't decode inline data), so hoist it to Cloudinary here and
 * store the real `https://` URL instead.
 *
 * Already-hosted URLs (or anything else) pass through unchanged. Falls
 * back to the original value if Cloudinary isn't configured or the upload
 * fails, so signup never breaks over an optional image.
 */
export async function resolveHostedImage(
  value: string | null | undefined,
  folder: string,
): Promise<string | undefined> {
  if (!value) return undefined;
  const match = DATA_URL_RE.exec(value);
  if (!match) return value;

  try {
    const buffer = Buffer.from(match[2], "base64");
    const uploaded = await uploadImageBuffer(buffer, folder);
    return uploaded.url;
  } catch (err) {
    console.error(
      "[resolveHostedImage] Cloudinary upload failed, keeping inline data URL",
      err,
    );
    return value;
  }
}
