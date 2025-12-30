"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  placeholder?: string;
  className?: string;
  aspect?: "square" | "video" | "wide";
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  placeholder = "Upload Image",
  className = "",
  aspect = "square"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[3/1]"
  };

  const handleFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput) return;
    try {
      new URL(urlInput);
      onChange(urlInput);
      setUrlInput("");
      toast.success("Image URL added");
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  if (value) {
    return (
      <div className={`relative ${className}`}>
        <div className={`relative ${aspectClasses[aspect]} w-full overflow-hidden rounded-lg border bg-muted group`}>
          <img
            src={value}
            alt="Uploaded"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onChange("")}
              disabled={uploading}
            >
              Change
            </Button>
            {onRemove && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="upload" className="text-xs">
            <Upload className="h-3 w-3 mr-1" /> Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs">
            <LinkIcon className="h-3 w-3 mr-1" /> URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-0">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`${aspectClasses[aspect]} w-full cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 p-4
              ${dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/25 bg-muted/50 hover:border-primary/50 hover:bg-muted"}
              ${uploading ? "cursor-not-allowed opacity-70" : ""}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10 text-primary mb-1">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-center">{placeholder}</span>
                <p className="text-xs text-muted-foreground text-center">
                  Drag & drop or click to upload<br/>
                  (JPEG, PNG, GIF, WebP up to 5MB)
                </p>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="url" className="mt-0">
          <div className={`${aspectClasses[aspect]} w-full rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 flex flex-col items-center justify-center gap-4`}>
            <div className="p-3 rounded-full bg-secondary/10 text-secondary mb-1">
              <LinkIcon className="h-6 w-6" />
            </div>
            <div className="w-full space-y-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                className="bg-background"
              />
              <Button 
                onClick={handleUrlSubmit} 
                className="w-full"
                variant="secondary"
                disabled={!urlInput}
              >
                Add Image URL
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Make sure the URL is public and ends with an image extension.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
