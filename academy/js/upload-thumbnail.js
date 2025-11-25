import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { thumbnailBase64 } = req.body;

    if (!thumbnailBase64)
      return res.status(400).json({ error: "Missing thumbnail" });

    const buffer = Buffer.from(thumbnailBase64, "base64");

    const blob = await put(`thumbnails/${Date.now()}.jpg`, buffer, {
      access: "public"
    });

    return res.status(200).json({ thumbnailUrl: blob.url });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
