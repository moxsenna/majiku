import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { getMyRoles } from "@/server/actions/roles";
import { putPhoto, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/server/r2";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roles = await getMyRoles();
  const isAllowed = roles.some((r) => r === "admin" || r === "moderator" || r === "tutor");
  if (!isAllowed) {
    return Response.json({ error: "Forbidden: role tidak diizinkan" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: "Data form tidak valid" }, { status: 400 });
  }

  const prefix = formData.get("prefix");
  if (prefix !== "reports" && prefix !== "gallery") {
    return Response.json(
      { error: "Prefix harus reports atau gallery" },
      { status: 400 }
    );
  }

  let fileEntries = formData.getAll("files");
  if (fileEntries.length === 0) {
    fileEntries = formData.getAll("file");
  }

  const files = fileEntries.filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return Response.json(
      { error: "Tidak ada file yang diunggah" },
      { status: 400 }
    );
  }

  if (files.length > 6) {
    return Response.json(
      { error: "Maksimal 6 file sekaligus" },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES[file.type]) {
      return Response.json(
        { error: `Format file ${file.name || "yang dipilih"} harus JPG/PNG/WebP` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `Ukuran file ${file.name || "yang dipilih"} melebihi batas 5MB` },
        { status: 400 }
      );
    }
  }

  try {
    const keys: string[] = [];
    for (const file of files) {
      const key = await putPhoto(prefix, file);
      keys.push(key);
    }
    return Response.json({ keys });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengunggah foto";
    return Response.json({ error: message }, { status: 400 });
  }
}
