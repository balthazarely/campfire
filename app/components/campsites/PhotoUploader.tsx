"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../utils/supabaseClient";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, CheckCircle2 } from "lucide-react";

type Props = {
  campsiteId: number;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function PhotoUploader({ campsiteId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setUploadSuccess(false);

    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or WebP)");
        event.target.value = "";
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 10MB");
        event.target.value = "";
        return;
      }

      setUploading(true);

      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("User not authenticated for photo upload");

      const storagePath = `user_uploads/${user.id}/${campsiteId}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("photos")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase
        .from("campsite_photos")
        .insert({
          user_id: user.id,
          campsite_id: campsiteId,
          storage_bucket: "photos",
          storage_path: storagePath,
          original_name: file.name,
          content_type: file.type,
          size_bytes: file.size,
        });

      if (insertErr) throw insertErr;

      setUploadSuccess(true);
      event.target.value = "";
      router.refresh();

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label
            htmlFor="photo-upload"
            className="text-sm text-muted-foreground flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Photo
          </Label>
          <Input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mt-2"
          />
        </div>
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </div>
        )}
      </div>

      {uploadSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          Photo uploaded successfully!
        </div>
      )}

      {error && <div className="text-sm text-red-600">{error}</div>}

      <p className="text-xs text-muted-foreground">
        Maximum file size: 10MB. Accepted formats: JPEG, PNG, WebP
      </p>
    </div>
  );
}
