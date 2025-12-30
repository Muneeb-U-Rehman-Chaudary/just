"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import ImageUpload from "@/components/ImageUpload";
import { 
  useAdminProducts, 
  useAdminUsers, 
  useApproveProduct, 
  useRejectProduct, 
  useCreateProduct 
} from "@/hooks/useApi";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: productsData, isLoading: productsLoading } = useAdminProducts();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers();
  
  const approveProduct = useApproveProduct();
  const rejectProduct = useRejectProduct();
  const createProduct = useCreateProduct();

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    vendorId: "",
    images: [] as string[],
    downloadUrl: "",
    fileSize: "",
    version: "",
    compatibility: "",
    tags: "",
    demoUrl: "",
    licenseType: "standard",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login");
      } else if (session?.user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  const products = productsData?.products || [];
  const vendors = usersData?.users?.filter((u: any) => u.role === "vendor") || [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!productForm.title.trim()) newErrors.title = "Title is required";
    if (!productForm.description.trim()) newErrors.description = "Description is required";
    if (!productForm.category) newErrors.category = "Category is required";
    if (!productForm.price) newErrors.price = "Price is required";
    if (!productForm.vendorId) newErrors.vendorId = "Vendor is required";
    if (productForm.images.length === 0) newErrors.images = "At least one image is required";
    if (!productForm.downloadUrl.trim()) newErrors.downloadUrl = "Download URL is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProduct = async () => {
    if (!validateForm()) return;

    createProduct.mutate({
      ...productForm,
      price: parseFloat(productForm.price),
      tags: productForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }, {
      onSuccess: () => {
        setShowAddDialog(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      category: "",
      price: "",
      vendorId: "",
      images: [],
      downloadUrl: "",
      fileSize: "",
      version: "",
      compatibility: "",
      tags: "",
      demoUrl: "",
      licenseType: "standard",
    });
    setErrors({});
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isPending || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">Review and manage platform products</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gradient-bg">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by title or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="max-w-[200px] truncate">{product.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{product.vendor?.name || "Unknown"}</TableCell>
                  <TableCell><Badge variant="secondary">{product.category}</Badge></TableCell>
                    <TableCell>${(product.price ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "approved" ? "default" : product.status === "pending" ? "secondary" : "destructive"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.totalSales || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.id}`}>View</Link>
                      </Button>
                      {product.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => approveProduct.mutate(product.id)}
                            disabled={approveProduct.isPending}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => rejectProduct.mutate({ id: product.id, reason: "Does not meet quality standards" })}
                            disabled={rejectProduct.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Create a new product listing</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input
                value={productForm.title}
                onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                placeholder="Product title"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Product description"
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wordpress-theme">WordPress Theme</SelectItem>
                    <SelectItem value="plugin">Plugin</SelectItem>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="ui-kit">UI Kit</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="29.99"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Vendor</Label>
              <Select value={productForm.vendorId} onValueChange={(v) => setProductForm({ ...productForm, vendorId: v })}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v: any) => (
                    <SelectItem key={v.id} value={v.id.toString()}>{v.storeName || v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Images</Label>
              <div className="grid grid-cols-3 gap-4">
                {productForm.images.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={img} alt="" className="w-full h-full object-cover rounded border" />
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setProductForm({ ...productForm, images: productForm.images.filter((_, idx) => idx !== i) })}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {productForm.images.length < 5 && (
                  <ImageUpload 
                    onChange={(url) => setProductForm({ ...productForm, images: [...productForm.images, url] })} 
                  />
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Download URL</Label>
              <Input
                value={productForm.downloadUrl}
                onChange={(e) => setProductForm({ ...productForm, downloadUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitProduct} 
              className="gradient-bg"
              disabled={createProduct.isPending}
            >
              {createProduct.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
