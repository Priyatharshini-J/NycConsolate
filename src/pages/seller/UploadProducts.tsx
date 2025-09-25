/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
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
import { useOverlayToast } from "@/hooks/use-overlay-toast";
import { Upload, ImagePlus, Package, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BASE_URL,
  PRODUCTS_BUCKET_NAME,
  PRODUCTS_BUCKET_URL,
} from "@/constants";
import axios from "axios";
import { useAccount } from "../../context/AccountContext";

export default function UploadProducts() {
  const { accountId, contactId, loadingAuth } = useAccount();
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    minOrderQuantity: "",
    hsCode: "",
    itcHsCode: "",
    tax: [],
    image: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const dropdownRef = useRef(null);
  const { showToast, overlayVisible } = useOverlayToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    // Cleanup to avoid memory leaks
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const toggleTax = (tax) => {
    setFormData((prev) => ({
      ...prev,
      tax: prev.tax.includes(tax)
        ? prev.tax.filter((t) => t !== tax)
        : [...prev.tax, tax],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Product description is required";
    }

    if (!formData.category) {
      newErrors.category = "Product category is required";
    }

    if (!formData.tax) {
      newErrors.category = "Tax is required";
    }

    if (!formData.minPrice) {
      newErrors.priceRange = "Minimum price is required";
    }

    if (!formData.maxPrice) {
      newErrors.priceRange = "Maximum price is required";
    }

    if (!formData.itcHsCode) {
      newErrors.priceRange = "ITC-HS code is required";
    }

    if (!formData.hsCode) {
      newErrors.priceRange = "HS code is required";
    }

    if (formData.tax.length === 0) {
      newErrors.priceRange = "Select at least one tax slab.";
    }

    if (!formData.minOrderQuantity.trim()) {
      newErrors.minOrderQuantity = "Minimum order quantity is required";
    } else if (
      isNaN(
        Number(
          formData.minOrderQuantity || formData.minPrice || formData.maxPrice
        )
      ) ||
      Number(
        formData.minOrderQuantity || formData.minPrice || formData.maxPrice
      ) <= 0
    ) {
      newErrors.minOrderQuantity = "Must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
      });
      return;
    }

    const stratus = (window as any).catalyst.stratus;
    const bucket = stratus.bucket(PRODUCTS_BUCKET_NAME);
    const ms = Date.now();
    const putObject = await bucket.putObject(
      formData.productName + "_" + ms,
      formData.image
    );
    putObject.start();
    putObject.abort();
    const fileUrl = PRODUCTS_BUCKET_URL + "/" + formData.productName + "_" + ms;
    try {
      // Send product data to backend to store in ZOHO CRM Product's module
      const response = await axios.post(
        `${BASE_URL}/server/b2b_backend_function/postProduct`,
        {
          productName: formData.productName,
          description: formData.description,
          category: formData.category,
          minPrice: formData.minPrice,
          maxPrice: formData.maxPrice,
          minOrderQuantity: formData.minOrderQuantity,
          hsCode: formData.hsCode,
          itcHsCode: formData.itcHsCode,
          tax: formData.tax,
          fileUrl: fileUrl,
          vendorId: accountId,
        }
      );

      if (response.data.code === "SUCCESS") {
        showToast({
          title: "Product Added Successfully",
          description:
            "Your product has been added to the catalog and will be visible to buyers.",
        });
      } else {
        showToast({
          title: "Product Addition Failed",
          description:
            "Your product has been not been added to the catalog. Please try after sometime",
        });
      }
    } catch (error) {
      console.error("Error in Add New Product:", error);
      showToast({
        title: "Product Addition Failed",
        description:
          "Your product has been not been added to the catalog. Please try after sometime",
      });
    }

    // Reset form
    setFormData({
      productName: "",
      description: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      minOrderQuantity: "",
      hsCode: "",
      itcHsCode: "",
      tax: [],
      image: null,
    });
    setImagePreview("");
  };

  const handleReset = () => {
    setFormData({
      productName: "",
      description: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      minOrderQuantity: "",
      hsCode: "",
      itcHsCode: "",
      tax: [],
      image: null,
    });
    setImagePreview("");
    setErrors({});
  };

  return (
    <>
      {overlayVisible && (
        <div className="fixed inset-0 bg-black/50 z-[50]" aria-hidden />
      )}
      {loadingAuth ? (
        <p className="loading">Loading ....</p>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Upload My Products
            </h1>
            <p className="text-muted-foreground">
              Add new products to your catalog for buyers to discover
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Product Image Upload */}
                  <div>
                    <Label htmlFor="image">Product Image</Label>
                    <div className="mt-2">
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/50">
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <ImagePlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Upload Image
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="cursor-pointer"
                          />
                          <p className="text-sm text-muted-foreground mt-1">
                            Upload a high-quality product image (JPG, PNG, max
                            5MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="productName">Product Name *</Label>
                        <Input
                          id="productName"
                          value={formData.productName}
                          onChange={(e) =>
                            handleInputChange("productName", e.target.value)
                          }
                          className={errors.productName ? "border-red-500" : ""}
                          placeholder="Enter product name"
                        />
                        {errors.productName && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.productName}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="category">Product Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            handleInputChange("category", value)
                          }
                        >
                          <SelectTrigger
                            className={cn(
                              "bg-background z-50",
                              errors.category && "border-red-500"
                            )}
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border shadow-lg z-50">
                            <SelectItem value="Agricultural Products">
                              Agricultural Products
                            </SelectItem>
                            <SelectItem value="Electronice and Technology">
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
                        <Label htmlFor="hsCode">HS Code *</Label>
                        <Input
                          id="hsCode"
                          value={formData.hsCode}
                          onChange={(e) =>
                            handleInputChange("hsCode", e.target.value)
                          }
                          className={errors.hsCode ? "border-red-500" : ""}
                          placeholder="Enter HS code"
                        />
                        {errors.hsCode && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.hsCode}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="itcHsCode">ITC-HS Code *</Label>
                        <Input
                          id="itcHsCode"
                          value={formData.itcHsCode}
                          onChange={(e) =>
                            handleInputChange("itcHsCode", e.target.value)
                          }
                          className={errors.itcHsCode ? "border-red-500" : ""}
                          placeholder="Enter ITC-HS code"
                        />
                        {errors.itcHsCode && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.itcHsCode}
                          </p>
                        )}
                      </div>

                      {/* <div>
                    <Label htmlFor="category">Tax Category *</Label>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen((o) => !o)}
                        className="w-full bg-background z-50 border rounded px-4 py-1 text-left"
                      >
                        {formData.tax.length ? (
                          taxRates
                            .filter((opt) => formData.tax.includes(opt))
                            .map((opt) => opt)
                            .join(", ")
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Select Tax Slabs
                          </span>
                        )}
                      </button>
                      {isDropdownOpen && (
                        <div className="absolute mt-1 left-0 right-0 bg-background border border-border shadow-lg z-50 rounded">
                          {taxRates.map((option) => (
                            <label
                              key={option}
                              className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                            >
                              <input
                                type="checkbox"
                                checked={formData.tax.includes(option)}
                                onChange={() => toggleTax(option)}
                                className="mr-2"
                              />
                              {option}
                            </label>
                          ))}
                          <button
                            type="button"
                            className="block w-full py-2 bg-gray-200 text-center rounded-b"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                    {errors.tax && (
                      <p className="text-sm text-red-500 mt-1">{errors.tax}</p>
                    )}
                  </div> */}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="description">
                          Product Description *
                        </Label>
                        <Textarea
                          id="description"
                          rows={4}
                          value={formData.description}
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          className={errors.description ? "border-red-500" : ""}
                          placeholder="Provide a detailed description of your product, including key features, specifications, and benefits..."
                        />
                        {errors.description && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="minOrderQuantity">
                          Minimum Order Quantity *
                        </Label>
                        <div className="relative">
                          <Input
                            id="minOrderQuantity"
                            type="number"
                            min="1"
                            value={formData.minOrderQuantity}
                            onChange={(e) =>
                              handleInputChange(
                                "minOrderQuantity",
                                e.target.value
                              )
                            }
                            className={
                              errors.minOrderQuantity ? "border-red-500" : ""
                            }
                            placeholder="Enter minimum order quantity"
                          />
                        </div>
                        {errors.minOrderQuantity && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.minOrderQuantity}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="minPrice">Minimum Price *</Label>
                        <div className="relative">
                          <Input
                            id="minPrice"
                            type="number"
                            min="1"
                            value={formData.minPrice}
                            onChange={(e) =>
                              handleInputChange("minPrice", e.target.value)
                            }
                            className={errors.minPrice ? "border-red-500" : ""}
                            placeholder="Enter the minimum price"
                          />
                        </div>
                        {errors.minPrice && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.minPrice}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="maxPrice">Maximum Price *</Label>
                        <div className="relative">
                          <Input
                            id="maxPrice"
                            type="number"
                            min="2"
                            value={formData.maxPrice}
                            onChange={(e) =>
                              handleInputChange("maxPrice", e.target.value)
                            }
                            className={errors.maxPrice ? "border-red-500" : ""}
                            placeholder="Enter the maximum price"
                          />
                        </div>
                        {errors.maxPrice && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.maxPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-4 pt-4 border-t border-border">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-professional-teal to-professional-success hover:opacity-90 transition-opacity"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                    >
                      Reset Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-professional-blue mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-2">
                      Product Upload Tips
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>
                        • Use high-quality, clear product images for better
                        buyer engagement
                      </li>
                      <li>
                        • Write detailed descriptions highlighting key features
                        and benefits
                      </li>
                      <li>
                        • Choose accurate price ranges to match buyer
                        expectations
                      </li>
                      <li>
                        • Set realistic minimum order quantities based on your
                        production capacity
                      </li>
                      <li>
                        • All fields marked with (*) are required for product
                        submission
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
