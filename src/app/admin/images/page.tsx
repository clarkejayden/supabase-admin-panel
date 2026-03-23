import { createAdminClient, requireSuperadmin } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageCreateForm, ImageDeleteForm, ImageUpdateForm } from "./image-forms";

export default async function ImagesPage() {
  await requireSuperadmin();
  const supabase = createAdminClient();

  const { data: images } = await supabase
    .from("images")
    .select("id,url,user_id,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Images</h2>
        <p className="text-sm text-muted-foreground">
          Create, update, and delete images with strict validation.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create Image</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageCreateForm />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images?.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt="Uploaded"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px] truncate">
                    {image.url}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{image.user_id}</TableCell>
                  <TableCell className="text-xs">
                    {image.created_at ? new Date(image.created_at).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell className="space-y-2">
                    <ImageUpdateForm
                      id={image.id}
                      defaultUrl={image.url}
                      defaultUserId={image.user_id}
                    />
                    <ImageDeleteForm id={image.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
