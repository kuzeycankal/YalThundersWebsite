import { put } from "@vercel/blob";

export const config = {
  runtime: "edge",
};

export default async function (req) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return new Response("Filename required", { status: 400 });
    }

    const blob = await put(filename, req.body, {
      access: "public",
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}
