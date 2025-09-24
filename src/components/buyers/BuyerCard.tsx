import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/common/StarRating";
import {
  MapPin,
  Award,
  Users,
  Truck,
  Handshake,
  CreditCard,
  ScanEye,
  Globe,
  User,
  PhoneCall,
  Mail,
} from "lucide-react";

interface Buyer {
  id: string;
  Account_Name: string;
  Business_Description: string;
  Billing_State: string;
  Billing_Country: string;
  No_of_Employees: number;
  Business_License_Number: string;
  Tax_Identification_Number: string;
  Primary_Contact: { id: string; name: string };
  Account_Status: string;
  Website: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Mobile: string;
}

interface BuyerCardProps {
  buyer: Buyer;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Inactive":
      return "bg-yellow-100 text-yellow-800";
    case "Suspended":
      return "bg-red-100 text-red-800";
    case "NA":
      return "bg-yellow-100 text-yellow-800";
  }
};

export function BuyerCard({ buyer }: BuyerCardProps) {
  return (
    <Card className="group h-full bg-gradient-to-b from-card to-card/50 border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300">
      <CardContent className="p-6">
        {/* Seller Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {buyer.Account_Name}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <Badge
                className={getStatusColor(
                  buyer.Account_Status ? buyer.Account_Status : "NA"
                )}
              >
                {buyer.Account_Status ? buyer.Account_Status : "NA"}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {buyer.Billing_State},{buyer.Billing_Country}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info Section */}

        <div className="mb-4 p-4 bg-muted rounded-md text-sm text-muted-foreground space-y-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <span>
                {buyer.First_Name} {buyer.Last_Name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <a
                href={`mailto:${buyer.Email}`}
                className="underline hover:text-primary"
              >
                {buyer.Email}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-primary" />
              <a
                href={`tel:${buyer.Mobile}`}
                className="underline hover:text-primary"
              >
                {buyer.Mobile}
              </a>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {buyer.Business_Description}
        </p>

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-professional-blue" />
            <span className="text-muted-foreground">
              {buyer.Business_License_Number}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ScanEye className="h-4 w-4 text-professional-blue" />
            <span className="text-muted-foreground">
              {buyer.Tax_Identification_Number}
            </span>
          </div>
        </div>

        <div className="mb-2 flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-professional-blue" />
          <span className="text-muted-foreground">{buyer.Website}</span>
        </div>

        <div className="mb-2 flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-professional-blue" />
          <span className="text-muted-foreground">
            {buyer.No_of_Employees} employees
          </span>
        </div>

        {/* Certifications */}
        {/* {seller.certifications.length > 0 && (
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
        )} */}

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

      {/* <CardFooter className="p-6 pt-0">
        <Button
          className="w-full bg-gradient-to-r from-primary to-professional-teal hover:opacity-90 transition-opacity"
            onClick={() => onContactSeller(seller.id, seller.Vendor_Name)}
        >
          Contact Seller
        </Button>
      </CardFooter> */}
    </Card>
  );
}
