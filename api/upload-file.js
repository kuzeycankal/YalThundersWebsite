// ===============================
//   YAL THUNDERS BLOB UPLOADER
// ===============================

// Node.js Runtime (EN ÖNEMLİ SATIR)
export const config = {
  runtime: "nodejs", 
};

import { put } from "@vercel/blob";
import formidable from "formidable";
import fs from "fs";

// Vercel’in ES Module ortamında temporary directory kullanımına izin
export const GET = () => new Response("Use POST instead.");

// ===============================
//   POST → dosya yükleme
// ===============================
export async function POST(req) {
  try {
    // formidable form parser
    const form = formidable({ multiples: false });

    // form verisini çöz
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = files.file;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    // dosya bufferını oku
    const fileBuffer = fs.readFileSync(file.filepath);

    // vercel blob’a yükle
    const blob = await put(file.originalFilename, fileBuffer, {
      access: "public",
    });

    return new Response(
      JSON.stringify({
        success: true,
        url: blob.url,
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message || "Upload failed",
      }),
      { status: 500 }
    );
  }
}
