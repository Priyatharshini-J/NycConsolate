import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/common/StarRating";
import { MapPin, Award, Users, Truck, Handshake } from "lucide-react";

interface Seller {
  id: string;
  Vendor_Name: string;
  Business_Description: string;
  // logo: string;
  Average_Rating: number;
  Rating_Count: number;
  State: string;
  Country: string;
  Years_in_Business: number;
  Employee_Count: number;
  certifications: string[];
  Engagement_Score: number;
  // specialties: string[];
  // responseTime: string;
  // deliveryTime: string;
}

interface SellerCardProps {
  seller: Seller;
  onContactSeller: (sellerId: string, sellerName: string) => void;
}

export function SellerCard({ seller, onContactSeller }: SellerCardProps) {
  return (
    <Card className="group h-full bg-gradient-to-b from-card to-card/50 border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
      <CardContent className="p-6">
        {/* Seller Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
            <img
              src={seller.logo}
              alt={seller.name}
              className="w-full h-full object-cover"
            />
          </div> */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {seller.Vendor_Name}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <StarRating rating={seller.Average_Rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({seller.Rating_Count} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {seller.State},{seller.Country}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {seller.Business_Description}
        </p>

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-professional-blue" />
            <span className="text-muted-foreground">
              Est. {new Date().getFullYear() - seller.Years_in_Business}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-professional-blue" />
            <span className="text-muted-foreground">
              {seller.Employee_Count} employees
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-professional-blue" />
            <span className="text-muted-foreground">
              {seller.Engagement_Score}
            </span>
          </div>
        </div>

        {/* Certifications */}
        {seller.certifications.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Certifications
            </p>
            <div className="flex flex-wrap gap-1">
              {seller.certifications.slice(0, 3).map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cert}
                </Badge>
              ))}
              {seller.certifications.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{seller.certifications.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Specialties */}
        {/* <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Specialties
          </p>
          <div className="flex flex-wrap gap-1">
            {seller.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
             {seller.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{seller.specialties.length - 3} more
              </Badge>
            )}
          </div>
        </div> */}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-primary to-professional-teal hover:opacity-90 transition-opacity"
          onClick={() => onContactSeller(seller.id, seller.Vendor_Name)}
        >
          Contact Seller
        </Button>
      </CardFooter>
    </Card>
  );
}
