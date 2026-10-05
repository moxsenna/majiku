import { tenants } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Tag } from "lucide-react";

export interface ProgramListProps {
  tenant: typeof tenants.$inferSelect;
}

export function ProgramList({ tenant }: ProgramListProps) {
  const programs = tenant.programs && tenant.programs.length > 0 ? tenant.programs : [];

  const courseJsonLd = programs.length > 0
    ? programs.map((p) => ({
        "@context": "https://schema.org",
        "@type": "Course",
        name: p.name,
        description: `Program ${p.name} untuk usia ${p.ageRange} di ${tenant.name}`,
        provider: { "@type": "Organization", name: tenant.name },
      }))
    : null;

  return (
    <section className="space-y-4">
      {courseJsonLd && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd).replace(/</g, "\\u003c") }}
          />
          {"\n"}
        </>
      )}

      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Program Tersedia
      </h2>

      {programs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((program, idx) => {
            const numericPrice = Number(program.priceFrom);
            const formattedPrice = Number.isFinite(numericPrice)
              ? Intl.NumberFormat("id-ID").format(numericPrice)
              : program.priceFrom;

            return (
              <Card key={idx} className="border-border/80 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {program.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 shrink-0 text-primary" />
                    <span>Usia {program.ageRange}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Tag className="h-4 w-4 shrink-0 text-primary" />
                    <span>Rp {formattedPrice}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Belum ada program terdaftar untuk saat ini.
        </p>
      )}
    </section>
  );
}
