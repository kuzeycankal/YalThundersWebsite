import { db } from "./_firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default async function handler(req, res) {
  try {
    const q = query(collection(db, "meetings"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    const meetings = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ meetings });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
