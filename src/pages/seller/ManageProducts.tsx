import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useOverlayToast } from "@/hooks/use-overlay-toast";
import { Edit, Trash2, Eye, Package, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { BASE_URL } from "../../constants";
import { useAccount } from "../../context/AccountContext";

interface Product {
  id: string;
  Product_Name: string;
  Product_Description: string;
  Product_Category: string;
  Price_Range: string;
  Minimum_Order_Quantity: number;
  Image: string;
  // status: "Active" | "Inactive" | "Pending";
  // dateAdded: string;
}

export default function ManageProducts() {
  const { accountId, contactId, loadingAuth } = useAccount();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showToast, overlayVisible } = useOverlayToast();

  const navigate = useNavigate();

  const handleAddProductClick = () => {
    navigate("/seller/upload-products");
  };

  useEffect(() => {
    if (!loadingAuth && accountId) {
      const fetchProducts = async () => {
        try {
          const res = await axios.get(
            `${BASE_URL}/server/b2b_backend_function/getSellerProducts/${accountId}`
          );
          setProducts(res.data);
        } catch (err) {
          console.error("Failed to fetch Products", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [loadingAuth, accountId]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    Product_Name: "",
    Product_Description: "",
    Product_Category: "",
    Price_Range: "",
    Minimum_Order_Quantity: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleEditClick = async (product: Product) => {
    setEditingProduct(product);

    setEditForm({
      Product_Name: product.Product_Name,
      Product_Description: product.Product_Description,
      Product_Category: product.Product_Category,
      Price_Range: product.Price_Range,
      Minimum_Order_Quantity: product.Minimum_Order_Quantity.toString(),
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!editForm.Product_Name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!editForm.Product_Description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!editForm.Product_Category) {
      newErrors.category = "Category is required";
    }

    if (!editForm.Price_Range) {
      newErrors.priceRange = "Price range is required";
    }

    if (!editForm.Minimum_Order_Quantity.trim()) {
      newErrors.minOrderQuantity = "Minimum order quantity is required";
    } else if (
      isNaN(Number(editForm.Minimum_Order_Quantity)) ||
      Number(editForm.Minimum_Order_Quantity) <= 0
    ) {
      newErrors.minOrderQuantity = "Must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProduct = async () => {
    if (!validateForm()) {
      return;
    }

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct?.id
          ? {
              ...p,
              Product_Name: editForm.Product_Name,
              Product_Description: editForm.Product_Description,
              Product_Category: editForm.Product_Category,
              Price_Range: editForm.Price_Range,
              Minimum_Order_Quantity: Number(editForm.Minimum_Order_Quantity),
            }
          : p
      )
    );

    try {
      // Send updated product data to backend for editing in ZOHO CRM Product's module
      const response = await axios.put(
        `${BASE_URL}/server/b2b_backend_function/putProduct/${editingProduct.id}`,
        {
          name: editForm.Product_Name,
          description: editForm.Product_Description,
          category: editForm.Product_Category,
          priceRange: editForm.Price_Range,
          mod: editForm.Minimum_Order_Quantity,
        }
      );

      if (response.data.code === "SUCCESS") {
        showToast({
          title: "Product Updated",
          description: "Your product has been successfully updated.",
        });
        window.location.reload();
      } else {
        showToast({
          title: "Product Update Failed",
          description: "Your product has not been successfully updated.",
        });
      }
    } catch (error) {
      console.error("Error in Edit Product:", error);
      showToast({
        title: "Product Update Failed",
        description: "Your product has not been successfully updated.",
      });
    }

    setEditingProduct(null);
  };

  const handleDeleteProduct = async (
    productId: string,
    productName: string,
    productImage: string
  ) => {
    try {
      // Make DELETE request to remove the product from CRM
      const response = await axios.delete(
        `${BASE_URL}/server/b2b_backend_function/product/${productId}`,
        {
          data: { fileUrl: productImage },
          withCredentials: true,
        }
      );

      if (response.data.code === "SUCCESS") {
        setProducts((prev) => prev.filter((p) => p.id !== productId));

        showToast({
          title: "Product Deleted",
          description: `${productName} has been removed from your catalog.`,
        });
      } else {
        showToast({
          title: "Product Deletion Failed",
          description: `${productName} deletion has failed. Please try again later`,
        });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
      showToast({
        title: "Product Deletion Failed",
        description: `${productName} deletion has failed. Please try again later`,
      });
    }
  };

  // const getStatusColor = (status: Product["status"]) => {
  //   switch (status) {
  //     case "Active":
  //       return "bg-green-100 text-green-800";
  //     case "Inactive":
  //       return "bg-red-100 text-red-800";
  //     case "Pending":
  //       return "bg-yellow-100 text-yellow-800";
  //   }
  // };

  return (
    <>
      {overlayVisible && (
        <div className="fixed inset-0 bg-black/50 z-[50]" aria-hidden />
      )}
      {loading || loadingAuth ? (
        <p className="loading">Loading ....</p>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Products
              </h1>
              <p className="text-muted-foreground">
                Update and manage your existing product catalog
              </p>
            </div>
            <button
              className="flex items-center gap-1 bg-[#099ed9] text-white text-sm font-medium rounded-lg px-6 py-3 shadow hover:bg-[#088cc0] transition"
              onClick={handleAddProductClick}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mr-2"
              >
                <path d="M10 4v12m6-6H4" />
              </svg>
              Add products
            </button>
          </div>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">My Products</h2>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(products) ? products.length : 0} products in
                catalog
              </p>
            </div>

            {(!Array.isArray(products) || products.length === 0) && (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Products Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't added any products to your catalog yet.
                  </p>
                  <Button asChild>
                    <a href="/seller/upload-products">Add Your First Product</a>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(Array.isArray(products) ? products : []).map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {product.Product_Name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          ID: {product.id}
                        </p>
                      </div>
                      {/* <Badge className={getStatusColor(product.status)}>
                    {product.status}
                  </Badge> */}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Product Image */}
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={product.Image}
                        alt={product.Product_Name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.Product_Description}
                      </p>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">
                          {product.Product_Category}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Price Range:
                        </span>
                        <span className="font-medium text-primary">
                          {product.Price_Range}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">MOQ:</span>
                        <span className="font-medium">
                          {product.Minimum_Order_Quantity}
                        </span>
                      </div>

                      {/* <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Added:</span>
                    <span>{new Date(product.dateAdded).toLocaleDateString()}</span>
                  </div> */}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditClick(product)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-background border border-border shadow-lg z-50">
                          <DialogHeader>
                            <DialogTitle>
                              Edit Product: {editingProduct?.Product_Name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                              <Label htmlFor="edit-name">Product Name *</Label>
                              <Input
                                id="edit-name"
                                value={editForm.Product_Name}
                                onChange={(e) =>
                                  handleInputChange(
                                    "Product_Name",
                                    e.target.value
                                  )
                                }
                                className={errors.name ? "border-red-500" : ""}
                              />
                              {errors.name && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.name}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="edit-description">
                                Description *
                              </Label>
                              <Textarea
                                id="edit-description"
                                rows={3}
                                value={editForm.Product_Description}
                                onChange={(e) =>
                                  handleInputChange(
                                    "Product_Description",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors.description ? "border-red-500" : ""
                                }
                              />
                              {errors.description && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.description}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-category">
                                  Category *
                                </Label>
                                <Select
                                  value={editForm.Product_Category}
                                  onValueChange={(value) =>
                                    handleInputChange("Product_Category", value)
                                  }
                                >
                                  <SelectTrigger
                                    className={cn(
                                      "bg-background z-50",
                                      errors.category && "border-red-500"
                                    )}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                                    <SelectItem value="Agricultural Products">
                                      Agricultural Products
                                    </SelectItem>
                                    <SelectItem value="Electronics & Technology">
                                      Electronics & Technology
                                    </SelectItem>
                                    <SelectItem value="Jewelry & Luxury Goods">
                                      Jewelry & Luxury Goods
                                    </SelectItem>
                                    <SelectItem value="Seafood Products">
                                      Seafood Products
                                    </SelectItem>
                                    <SelectItem value="Textiles & Apparel">
                                      Textiles & Apparel
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                {errors.category && (
                                  <p className="text-sm text-red-500 mt-1">
                                    {errors.category}
                                  </p>
                                )}
                              </div>
                              <div>
                                <Label htmlFor="edit-price">
                                  Price Range *
                                </Label>
                                <Input
                                  id="edit-price"
                                  value={editForm.Price_Range}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "Price_Range",
                                      e.target.value
                                    )
                                  }
                                  className={
                                    errors.priceRange ? "border-red-500" : ""
                                  }
                                />
                                {errors.priceRange && (
                                  <p className="text-sm text-red-500 mt-1">
                                    {errors.priceRange}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="edit-moq">
                                Minimum Order Quantity *
                              </Label>
                              <Input
                                id="edit-moq"
                                type="number"
                                min="1"
                                value={editForm.Minimum_Order_Quantity}
                                onChange={(e) =>
                                  handleInputChange(
                                    "Minimum_Order_Quantity",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors.minOrderQuantity
                                    ? "border-red-500"
                                    : ""
                                }
                              />
                              {errors.minOrderQuantity && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.minOrderQuantity}
                                </p>
                              )}
                            </div>

                            <div className="flex gap-2 pt-4">
                              <Button onClick={handleUpdateProduct}>
                                Update Product
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteProduct(
                            product.id,
                            product.Product_Name,
                            product.Image
                          )
                        }
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
