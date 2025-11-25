import { db } from "./_firebase";
import { doc, deleteDoc } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const { id } = req.body;

    await deleteDoc(doc(db, "meetings", id));

    return res.status(200).json({ success: true });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
