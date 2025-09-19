import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  Award,
  Calendar,
} from "lucide-react";
import axios from "axios";
import { BASE_URL, sellerAccountId, sellerId } from "../../constants";

interface Profile {
  id: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Mobile: string;
  Vendor_Name: string;
  Website: string;
  Mailing_Street: string;
  Mailing_City: string;
  Mailing_State: string;
  Mailing_Zip: string;
  Mailing_Country: string;
  Business_Description: string;
  Tax_Identification_Number: string;
  Years_in_Business: number;
  Employee_Count: number;
  Business_License_Number: string;
}

export default function SellerProfile() {
  const [profile, setProfile] = useState<Profile>();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    description: "",
    yearEstablished: 0,
    employeeCount: 0,
    businessLicense: "",
    taxId: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyer = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/getSeller/${sellerId}`
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyer();
  }, []);

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData({
        companyName: profile.Vendor_Name,
        contactPerson: profile.First_Name + " " + profile.Last_Name,
        email: profile.Email,
        phone: profile.Mobile,
        website: profile.Website,
        address: profile.Mailing_Street,
        city: profile.Mailing_City,
        state: profile.Mailing_State,
        zipCode: profile.Mailing_Zip,
        country: profile.Mailing_Country,
        description: profile.Business_Description,
        yearEstablished: Number(
          new Date().getFullYear() - profile.Years_in_Business
        ),
        employeeCount: profile.Employee_Count,
        businessLicense: profile.Business_License_Number,
        taxId: profile.Tax_Identification_Number,
      });
    }
  }, [profile]);

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/server/b2b_backend_function/seller/${sellerId}`,
        {
          companyName: formData.companyName,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          description: formData.description,
          yearEstablished: formData.yearEstablished,
          employeeCount: formData.employeeCount,
          businessLicense: formData.businessLicense,
          taxId: formData.taxId,
          vendorAccountId: sellerAccountId,
        }
      );
      if (response.data.code === "SUCCESS") {
        toast({
          title: "Profile Updated",
          description: "Your seller profile has been successfully updated.",
        });
      } else {
        toast({
          title: "Profile Update Failed",
          description:
            "Your seller profile has not been updated. Please try again later",
        });
      }
    } catch (error) {
      console.error("Error in Edit Seller Profile:", error);
    }
  };

  return (
    <>
      {loading ? (
        <p className="loading">Loading ....</p>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Account Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your seller profile and business information
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Company Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-professional-teal to-professional-success flex items-center justify-center text-white text-lg font-semibold">
                    {formData.companyName
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 3)}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {formData.companyName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.contactPerson}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Est. {formData.yearEstablished}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-professional-teal" />
                    <span className="break-all">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-professional-teal" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-professional-teal" />
                    <span className="text-professional-blue hover:underline cursor-pointer break-all">
                      {formData.website}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-professional-teal" />
                    <span>
                      {formData.city}, {formData.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-professional-teal" />
                    <span>{formData.employeeCount} employees</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={(e) =>
                          handleInputChange("companyName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) =>
                          handleInputChange("contactPerson", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">Company Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Business Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearEstablished">Year Established</Label>
                      <Input
                        id="yearEstablished"
                        value={formData.yearEstablished}
                        onChange={(e) =>
                          handleInputChange("yearEstablished", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Input
                        id="employeeCount"
                        value={formData.employeeCount}
                        onChange={(e) =>
                          handleInputChange("employeeCount", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="businessLicense">
                        Business License Number
                      </Label>
                      <Input
                        id="businessLicense"
                        value={formData.businessLicense}
                        onChange={(e) =>
                          handleInputChange("businessLicense", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={formData.taxId}
                        onChange={(e) =>
                          handleInputChange("taxId", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-professional-teal to-professional-success"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
