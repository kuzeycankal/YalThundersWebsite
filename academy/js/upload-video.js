import { put } from "@vercel/blob";

export default async function handler(req, res) {
  if (req.method !== "POST") 
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { videoBase64 } = req.body;

    if (!videoBase64)
      return res.status(400).json({ error: "Missing video" });

    const buffer = Buffer.from(videoBase64, "base64");

    const blob = await put(`videos/${Date.now()}.mp4`, buffer, {
      access: "public"
    });

    return res.status(200).json({ videoUrl: blob.url });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
