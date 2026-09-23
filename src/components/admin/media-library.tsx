"use client";

import Image from "next/image";
import { Check, Copy, Loader2, Search, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/use-debounce";
import { useMediaList } from "@/hooks/use-media-list";
import { cn, formatDateTime } from "@/lib/utils";
import { EmptyState } from "./ui";
import { uploadFile, type MediaItem } from "./editor/media-picker";

const sizeLabel = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export function MediaLibrary() {
  const toast = useToast();
  const [uploading, setUploading] = useState(0);
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState(false);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounced = useDebounce(q, 250);
  const { items, loading, reload: load, setItems } = useMediaList(debounced, true, 100);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 10);
    setUploading(list.length);
    let ok = 0;
    for (const f of list) {
      try {
        await uploadFile(f);
        ok++;
      } catch (err) {
        toast.error(`${f.name}: upload failed`, err instanceof Error ? err.message : undefined);
      }
      setUploading((n) => n - 1);
    }
    if (ok) toast.success(`${ok} file${ok > 1 ? "s" : ""} uploaded`);
    load();
  };

  const open = (item: MediaItem) => {
    setSelected(item);
    setAlt(item.alt);
    setCopied(false);
  };

  const saveAlt = async () => {
    if (!selected) return;
    setBusy(true);
    const res = await fetch(`/api/admin/media/${selected._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ alt }) });
    setBusy(false);
    if (res.ok) {
      toast.success("Alt text saved");
      setItems((all) => all.map((i) => (i._id === selected._id ? { ...i, alt } : i)));
    } else toast.error("Could not save alt text");
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    const res = await fetch(`/api/admin/media/${selected._id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      toast.success("Deleted");
      setItems((all) => all.filter((i) => i._id !== selected._id));
      setSelected(null);
      setConfirmDelete(false);
    } else toast.error("Could not delete");
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => e.currentTarget === e.target && setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        upload(e.dataTransfer.files);
      }}
      className={cn("relative rounded-2xl transition-colors", drag && "bg-brand-50 ring-2 ring-brand-500")}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search file name or alt text" aria-label="Search media" className="h-10 w-full rounded-xl border border-mist-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <div className="flex items-center gap-3">
          {uploading > 0 && (
            <span className="flex items-center gap-2 text-sm text-mist-600" role="status">
              <Loader2 className="size-4 animate-spin" /> Uploading {uploading}…
            </span>
          )}
          <input ref={fileRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="sr-only" onChange={(e) => upload(e.target.files)} aria-label="Upload images" />
          <Button variant="dark" size="sm" onClick={() => fileRef.current?.click()}>
            <UploadCloud className="size-4" aria-hidden /> Upload
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square skeleton" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title={q ? "No matching media" : "Your media library is empty"}
          description="Drag images anywhere on this page, or use Upload. Migrated site images live under /images and can be referenced by path."
          icon={<UploadCloud className="size-5" aria-hidden />}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {items.map((item) => (
            <li key={item._id}>
              <button type="button" onClick={() => open(item)} className="group block w-full overflow-hidden rounded-xl border border-mist-200 bg-white text-left hover:border-mist-400">
                <span className="relative block aspect-square bg-mist-50">
                  <Image src={item.url} alt={item.alt || item.originalName} fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
                </span>
                <span className="block truncate px-3 py-2 text-xs text-mist-600">{item.originalName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setConfirmDelete(false);
        }}
        title={selected?.originalName ?? ""}
        size="lg"
        footer={
          confirmDelete ? (
            <>
              <span className="mr-auto self-center text-sm text-danger-500">Delete permanently? Pages using it will show a broken image.</span>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={busy} onClick={remove}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="mr-auto text-danger-500" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="size-4" aria-hidden /> Delete
              </Button>
              <Button variant="dark" size="sm" loading={busy} onClick={saveAlt} disabled={alt === selected?.alt}>
                Save alt text
              </Button>
            </>
          )
        }
      >
        {selected && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-mist-50">
              <Image src={selected.url} alt={selected.alt} fill sizes="400px" className="object-contain" />
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <label htmlFor="media-alt" className="mb-1.5 block font-medium text-ink-800">
                  Alt text
                </label>
                <textarea id="media-alt" rows={3} value={alt} onChange={(e) => setAlt(e.target.value)} className="w-full rounded-xl border border-mist-200 px-3 py-2 outline-none focus:border-brand-500" />
                <p className="mt-1 text-xs text-mist-500">Describe the image for screen readers and search engines.</p>
              </div>
              <div>
                <p className="mb-1.5 font-medium text-ink-800">URL</p>
                <div className="flex gap-2">
                  <input readOnly value={selected.url} aria-label="File URL" className="h-9 min-w-0 flex-1 rounded-lg border border-mist-200 bg-mist-25 px-2 text-xs" />
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(selected.url.startsWith("http") ? selected.url : `${window.location.origin}${selected.url}`);
                      setCopied(true);
                    }}
                    className="flex items-center gap-1 rounded-lg border border-mist-200 px-3 text-xs font-medium hover:border-mist-400"
                  >
                    {copied ? <Check className="size-3.5 text-success-500" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 rounded-xl bg-mist-25 p-3 text-xs">
                <div>
                  <dt className="text-mist-500">Dimensions</dt>
                  <dd className="text-ink-900">{selected.width && selected.height ? `${selected.width} × ${selected.height}` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-mist-500">Size</dt>
                  <dd className="text-ink-900">{sizeLabel(selected.size)}</dd>
                </div>
                <div>
                  <dt className="text-mist-500">Type</dt>
                  <dd className="text-ink-900">{selected.mimeType}</dd>
                </div>
                <div>
                  <dt className="text-mist-500">Uploaded</dt>
                  <dd className="text-ink-900">{formatDateTime(selected.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
