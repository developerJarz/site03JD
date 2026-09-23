"use client";

import Image from "next/image";
import { Check, Loader2, Search, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useMediaList } from "@/hooks/use-media-list";
import { cn } from "@/lib/utils";

export interface PickedImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface MediaItem {
  _id: string;
  url: string;
  alt: string;
  originalName: string;
  width?: number;
  height?: number;
  size: number;
  mimeType: string;
  createdAt: string;
}

export async function uploadFile(file: File, folder = "general"): Promise<MediaItem> {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  const res = await fetch("/api/admin/media", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Upload failed");
  return data.item as MediaItem;
}

/** Choose an existing asset, upload a new one, or reference a site image by path. */
export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (img: PickedImage) => void }) {
  const toast = useToast();
  const [tab, setTab] = useState<"library" | "upload" | "url">("library");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(q, 250);
  const { items, loading, reload } = useMediaList(debounced, open && tab === "library", 48);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const item = await uploadFile(files[0]);
      toast.success("Uploaded", item.originalName);
      setTab("library");
      setSelected(item);
      reload();
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : undefined);
    } finally {
      setUploading(false);
    }
  };

  const confirm = () => {
    if (tab === "url") {
      if (!url.trim()) return;
      onPick({ src: url.trim(), alt: "" });
    } else if (selected) {
      onPick({ src: selected.url, alt: selected.alt, width: selected.width, height: selected.height });
    } else return;
    onClose();
    setSelected(null);
    setUrl("");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Media library"
      description="Pick an image, upload a new one, or use an existing site path."
      size="xl"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="dark" size="sm" onClick={confirm} disabled={tab === "url" ? !url : !selected}>
            Use image
          </Button>
        </>
      }
    >
      <div role="tablist" className="mb-5 flex gap-1 rounded-xl bg-mist-100 p-1 text-sm">
        {(["library", "upload", "url"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("flex-1 rounded-lg py-2 font-medium capitalize", tab === t ? "bg-white text-ink-900 shadow-sm" : "text-mist-600")}>
            {t === "url" ? "Site path / URL" : t}
          </button>
        ))}
      </div>

      {tab === "library" && (
        <div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by file name or alt text" aria-label="Search media" className="h-10 w-full rounded-xl border border-mist-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
          </div>
          {loading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square skeleton" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-mist-500">No media yet. Upload your first image.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {items.map((item) => (
                <li key={item._id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    aria-pressed={selected?._id === item._id}
                    className={cn("group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-mist-50", selected?._id === item._id ? "border-brand-500" : "border-transparent hover:border-mist-300")}
                    title={item.originalName}
                  >
                    <Image src={item.url} alt={item.alt || item.originalName} fill sizes="160px" className="object-cover" />
                    {selected?._id === item._id && (
                      <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-brand-500 text-ink-950">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {tab === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn("flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center", drag ? "border-brand-500 bg-brand-50" : "border-mist-300")}
        >
          {uploading ? <Loader2 className="size-8 animate-spin text-brand-600" /> : <UploadCloud className="size-8 text-mist-400" aria-hidden />}
          <p className="mt-4 font-medium text-ink-900">Drag & drop an image here</p>
          <p className="mt-1 text-sm text-mist-500">PNG, JPG, WebP, GIF or AVIF — up to 8 MB.</p>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="sr-only" onChange={(e) => handleFiles(e.target.files)} aria-label="Choose file to upload" />
          <Button variant="outline" size="sm" className="mt-5" onClick={() => fileRef.current?.click()} loading={uploading}>
            Browse files
          </Button>
        </div>
      )}

      {tab === "url" && (
        <div>
          <label htmlFor="media-url" className="mb-1.5 block text-sm font-medium text-ink-800">
            Image path or URL
          </label>
          <input id="media-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/images/work/cravin-crabs-web.webp" className="h-11 w-full rounded-xl border border-mist-200 px-3 text-sm outline-none focus:border-brand-500" />
          <p className="mt-2 text-xs text-mist-500">Use a path under /images (migrated site assets) or /media, or a full https:// URL from an allowed host.</p>
        </div>
      )}
    </Dialog>
  );
}
