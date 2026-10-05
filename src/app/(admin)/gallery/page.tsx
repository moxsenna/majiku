import Gallery from "@/views/Gallery";
import { listGalleryPhotos, listGalleryOptions } from "@/server/actions/gallery";
import { getMyRoles } from "@/server/actions/roles";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [photos, options, roles] = await Promise.all([
    listGalleryPhotos(),
    listGalleryOptions(),
    getMyRoles(),
  ]);

  const canDelete = roles.includes("admin") || roles.includes("moderator");
  const canUpload = roles.includes("admin") || roles.includes("moderator") || roles.includes("tutor");


  return (
    <Gallery
      initialPhotos={photos}
      studentOptions={options.students}
      classOptions={options.classes}
      canDelete={canDelete}
      canUpload={canUpload}
    />
  );
}
