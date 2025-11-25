import { db } from "./_firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { title, description, category, videoUrl, thumbnailUrl } = req.body;

    await addDoc(collection(db, "videos"), {
      title,
      description,
      category,
      videoUrl,
      thumbnailUrl,
      createdAt: Timestamp.now()
    });

    return res.status(200).json({ success: true });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
