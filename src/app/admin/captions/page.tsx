import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CaptionsPage() {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const { data: captions } = await supabase
    .from("captions")
    .select("id,text,image_id,images(url)")
    .order("id", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Captions</h2>
        <p className="text-sm text-muted-foreground">
          Read-only captions linked to images.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Caption List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caption</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Image ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {captions?.map((caption) => (
                <TableRow key={caption.id}>
                  <TableCell className="max-w-[420px]">{caption.text}</TableCell>
                  <TableCell>
                    {caption.images?.[0]?.url ? (
                      <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={caption.images[0].url}
                          alt="Image"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{caption.image_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
