import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Building, Globe, Phone, Mail, MapPin } from "lucide-react";
import axios from "axios";
import { BASE_URL, buyerAccountId, buyerId } from "../constants";
import { useOverlayToast } from "@/hooks/use-overlay-toast";

interface Profile {
  id: string;
  First_Name: string;
  Last_Name: string;
  Email: string;
  Mobile: string;
  Title: string;
  Account_Name: string;
  Website: string;
  Mailing_Street: string;
  Mailing_City: string;
  Mailing_State: string;
  Mailing_Zip: string;
  Mailing_Country: string;
  Business_Description: string;
}

export default function AccountProfile() {
  const { showToast, overlayVisible } = useOverlayToast();
  const [profile, setProfile] = useState<Profile>();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    companyName: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    bio: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchBuyer = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/server/b2b_backend_function/getBuyer/${buyerId}`
      );
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch buyer", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBuyer();
  }, []);

  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData({
        firstName: profile.First_Name || "",
        lastName: profile.Last_Name || "",
        email: profile.Email || "",
        phone: profile.Mobile || "",
        jobTitle: profile.Title || "",
        companyName: profile.Account_Name || "",
        website: profile.Website || "",
        address: profile.Mailing_Street || "",
        city: profile.Mailing_City || "",
        state: profile.Mailing_State || "",
        zipCode: profile.Mailing_Zip || "",
        country: profile.Mailing_Country || "",
        bio: profile.Business_Description || "",
      });
    }
  }, [profile]);

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Send updated product data to backend for editing in ZOHO CRM Product's module
      const response = await axios.put(
        `${BASE_URL}/server/b2b_backend_function/buyer/${buyerId}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          jobTitle: formData.jobTitle,
          companyName: formData.companyName,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          bio: formData.bio,
          buyerAccountId: buyerAccountId,
        }
      );

      if (response.data.code === "SUCCESS") {
        showToast({
          title: "Profile Updated",
          description:
            "Your profile information has been successfully updated.",
        });
      } else {
        showToast({
          title: "Profile Update Failed",
          description:
            "Your profile information update has been failed. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Error in Buyer profile:", error);
      showToast({
        title: "Profile Update Failed",
        description:
          "Your profile information update has been failed. Please try again later.",
      });
    }
  };

  return (
    <>
      {overlayVisible && (
        <div className="fixed inset-0 bg-black/50 z-[50]" aria-hidden />
      )}
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
              Manage your profile information and business details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-professional-teal flex items-center justify-center text-white text-2xl font-semibold">
                    {formData.firstName}
                    {formData.lastName}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {formData.firstName} {formData.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formData.jobTitle}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formData.companyName}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-professional-blue" />
                    <span>{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-professional-blue" />
                    <span>{formData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-professional-blue" />
                    <span className="text-professional-blue hover:underline cursor-pointer">
                      {formData.website}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-professional-blue" />
                    <span>
                      {formData.city}, {formData.state}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
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
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        handleInputChange("jobTitle", e.target.value)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label htmlFor="bio">Company Description</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                    />
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
                  className="bg-gradient-to-r from-primary to-professional-teal"
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
