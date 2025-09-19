import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/common/StarRating";
import { Handshake, MapPin, Package } from "lucide-react";

interface Product {
  id: string;
  Product_Name: string;
  Product_Description: string;
  Image: string;
  Price_Range: string;
  Minimum_Order_Quantity: number;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  sellerEngScore: number;
  sellerLocation: string;
  Product_Category: string;
  certificates?: string[];
}

interface ProductCardProps {
  product: Product;
  onContactSeller: (
    productName: string,
    productId: string,
    sellerId: string,
    sellerName: string
  ) => void;
}

export function ProductCard({ product, onContactSeller }: ProductCardProps) {
  return (
    <Card className="group h-full bg-gradient-to-b from-card to-card/50 border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
          <img
            src={product.Image}
            alt={product.Product_Name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              {product.Product_Category}
            </Badge>
          </div>
          {product.certificates && product.certificates.length > 0 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-professional-success text-white">
                Certified
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {product.Product_Name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.Product_Description}
            </p>
          </div>

          {/* Price and MOQ */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-primary">
                {product.Price_Range}
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Package className="h-3 w-3" />
                <span>MOQ: {product.Minimum_Order_Quantity}</span>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm">{product.sellerName}</p>
              <StarRating rating={product.sellerRating} size="sm" />
            </div>
            <div className="flex items-center text-xs text-muted-foreground justify-between">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{product.sellerLocation}</span>
              </div>
              <div className="flex items-center gap-1">
                <Handshake className="h-3 w-3" />
                <span>{product.sellerEngScore}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-primary to-professional-teal hover:opacity-90 transition-opacity"
          onClick={() =>
            onContactSeller(
              product.Product_Name,
              product.id,
              product.sellerId,
              product.sellerName
            )
          }
        >
          Contact Seller
        </Button>
      </CardFooter>
    </Card>
  );
}
