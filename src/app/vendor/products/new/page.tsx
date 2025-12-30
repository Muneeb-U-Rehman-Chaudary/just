"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Upload, FileText, Info, CheckCircle2, AlertTriangle, Lightbulb, X, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ImageUpload from "@/components/ImageUpload";

const categories = [
  { value: "wordpress-theme", label: "WordPress Theme" },
  { value: "plugin", label: "Plugin" },
  { value: "template", label: "Template" },
  { value: "ui-kit", label: "UI Kit" },
  { value: "design", label: "Design Asset" },
  { value: "script", label: "Script / Code" },
  { value: "graphics", label: "Graphics" },
  { value: "other", label: "Other" },
];

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("guide");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    downloadUrl: "",
    demoUrl: "",
    fileSize: "",
    version: "",
    compatibility: "",
    licenseType: "regular",
    tags: "",
    changelog: "",
  });

  const handleAddImage = (url: string) => {
    if (productImages.length < 5) {
      setProductImages([...productImages, url]);
    } else {
      toast.error("Maximum 5 images allowed");
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.price || !form.downloadUrl) {
      toast.error("Please fill all required fields");
      return;
    }

    if (productImages.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          images: productImages,
          tags: form.tags.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        toast.success("Product submitted for review!");
        router.push("/vendor/products");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create product");
      }
    } catch (e) {
      toast.error("Error creating product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create and submit a new digital product for review</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guide">
            <FileText className="mr-2 h-4 w-4" /> Product Guide
          </TabsTrigger>
          <TabsTrigger value="form">
            <Package className="mr-2 h-4 w-4" /> Product Form
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-6">
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" /> Product Submission Guidelines
              </CardTitle>
              <CardDescription>
                Follow these guidelines to ensure your product gets approved quickly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="requirements">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Product Requirements
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Title:</strong> Clear, descriptive title (5-100 characters)</li>
                      <li><strong>Description:</strong> Detailed description with features list (min 100 characters)</li>
                      <li><strong>Category:</strong> Select the most appropriate category</li>
                      <li><strong>Price:</strong> Set a fair price between $1 - $999</li>
                      <li><strong>Download URL:</strong> Direct link to downloadable file (ZIP, RAR, etc.)</li>
                      <li><strong>Images:</strong> Upload at least 1 preview image (recommended: 1200x800px)</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="quality">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Quality Standards
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Code must be clean, well-commented, and follow best practices</li>
                      <li>No malware, backdoors, or malicious code</li>
                      <li>Must be your original work or properly licensed</li>
                      <li>Include documentation or readme file</li>
                      <li>Responsive design for themes/templates</li>
                      <li>Cross-browser compatibility</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prohibited">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Prohibited Content
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Nulled, pirated, or stolen content</li>
                      <li>Adult or explicit material</li>
                      <li>Products that violate copyright laws</li>
                      <li>Products with hidden affiliate links</li>
                      <li>Malware, viruses, or harmful code</li>
                      <li>Products that collect user data without consent</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="process">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-500" />
                      Review Process
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <ol className="list-decimal pl-6 space-y-2">
                      <li><strong>Submission:</strong> Fill out the product form and submit</li>
                      <li><strong>Initial Review:</strong> Admin checks basic requirements (1-2 days)</li>
                      <li><strong>Technical Review:</strong> Code quality and security check</li>
                      <li><strong>Approval/Rejection:</strong> You'll be notified via email</li>
                      <li><strong>Live:</strong> Once approved, your product goes live immediately</li>
                    </ol>
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="text-sm"><strong>Average Review Time:</strong> 1-3 business days</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tips">
                  <AccordionTrigger>
                    <span className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-green-500" />
                      Tips for Success
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Use high-quality preview images that showcase your product</li>
                      <li>Write a compelling description with bullet points</li>
                      <li>Include a demo URL so buyers can try before purchasing</li>
                      <li>Keep your product updated with new features</li>
                      <li>Respond quickly to customer support requests</li>
                      <li>Use relevant tags to improve discoverability</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setActiveTab("form")} className="gradient-bg">
                  Continue to Product Form →
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Fill in the details about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" placeholder="e.g., Modern Dashboard Template" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" placeholder="Describe your product, its features, and what makes it unique..." rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <p className="text-xs text-muted-foreground">{form.description.length}/100 characters minimum</p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input id="price" type="number" min="1" max="999" placeholder="29.99" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" placeholder="1.0.0" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileSize">File Size</Label>
                  <Input id="fileSize" placeholder="e.g., 2.5 MB" value={form.fileSize} onChange={(e) => setForm({ ...form, fileSize: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="downloadUrl">Download URL *</Label>
                <Input id="downloadUrl" type="url" placeholder="https://your-storage.com/product.zip" value={form.downloadUrl} onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })} />
                <p className="text-xs text-muted-foreground">Direct link to your product file (Dropbox, Google Drive, S3, etc.)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL (Optional)</Label>
                <Input id="demoUrl" type="url" placeholder="https://demo.yoursite.com" value={form.demoUrl} onChange={(e) => setForm({ ...form, demoUrl: e.target.value })} />
              </div>

              <div className="space-y-4">
                <Label>Product Images * (Max 5)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {productImages.map((img, index) => (
                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                      <img src={img} alt={`Product ${index + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {productImages.length < 5 && (
                    <ImageUpload
                      onChange={handleAddImage}
                      placeholder="Add Image"
                      aspect="video"
                    />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Upload high-quality images (recommended: 1200x800px)</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="compatibility">Compatibility</Label>
                  <Input id="compatibility" placeholder="e.g., WordPress 6.0+, PHP 8.0+" value={form.compatibility} onChange={(e) => setForm({ ...form, compatibility: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type</Label>
                  <Select value={form.licenseType} onValueChange={(v) => setForm({ ...form, licenseType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular License</SelectItem>
                      <SelectItem value="extended">Extended License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="dashboard, admin, template, bootstrap" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                <p className="text-xs text-muted-foreground">Comma-separated tags for better discoverability</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="changelog">Changelog (Optional)</Label>
                <Textarea id="changelog" placeholder="Version 1.0.0 - Initial release..." rows={3} value={form.changelog} onChange={(e) => setForm({ ...form, changelog: e.target.value })} />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="gradient-bg">
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}