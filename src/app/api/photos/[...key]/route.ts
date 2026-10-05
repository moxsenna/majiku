import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { getPhoto } from "@/server/r2";

export async function GET(
  _req: Request,
  props: { params: Promise<{ key: string[] }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: keySegments } = await props.params;
  if (!keySegments || keySegments.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  const key = keySegments.join("/");
  const obj = await getPhoto(key);

  if (!obj || !obj.body) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
