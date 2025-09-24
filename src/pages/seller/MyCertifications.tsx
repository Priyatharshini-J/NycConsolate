/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useOverlayToast } from "@/hooks/use-overlay-toast";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Calendar,
  FileText,
  AlertCircle,
  ImagePlus,
} from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import {
  BASE_URL,
  CERTIFICATES_BUCKET_NAME,
  CERTIFICATES_BUCKET_URL,
  sellerAccountId,
} from "../../constants";

interface Certification {
  id: string;
  Certification_number: string;
  Name: string;
  Issued_Date: string;
  Expiry_Date: string;
  Issuer: string;
  Certifical_URl: string;
}

export default function MyCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [reloadCertsFlag, setReloadCertsFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { showToast, overlayVisible } = useOverlayToast();

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
  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/server/b2b_backend_function/getSellerCertifications/${sellerAccountId}`
      );
      setCertifications(res.data);
    } catch (err) {
      console.error("Failed to fetch Products", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCertificates();
  }, [reloadCertsFlag]);

  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    certificateNumber: "",
    certificateName: "",
    issueDate: "",
    expiryDate: "",
    issuer: "",
    image: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.certificateNumber.trim()) {
      newErrors.certificateNumber = "Certificate number is required";
    }

    if (!formData.certificateName.trim()) {
      newErrors.certificateName = "Certificate name is required";
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "Issue date is required";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    if (!formData.issuer.trim()) {
      newErrors.issuer = "Issuer is required";
    }

    if (
      formData.issueDate &&
      formData.expiryDate &&
      new Date(formData.issueDate) >= new Date(formData.expiryDate)
    ) {
      newErrors.expiryDate = "Expiry date must be after issue date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24)
    );

    if (daysUntilExpiry < 0) return "Expired";
    if (daysUntilExpiry <= 90) return "Expiring Soon";
    return "Valid";
  };

  const handleAddCertification = async () => {
    if (!validateForm()) {
      return;
    }

    const newCert: Certification = {
      id: `C${String(certifications.length + 1).padStart(3, "0")}`,
      ...formData,
      Certification_number: "",
      Name: "",
      Issued_Date: "",
      Expiry_Date: "",
      Issuer: "",
      Certifical_URl: "",
    };

    setCertifications((prev) => [newCert, ...prev]);

    const stratus = (window as any).catalyst.stratus;
    const bucket = stratus.bucket(CERTIFICATES_BUCKET_NAME);
    const ms = Date.now();
    const putObject = await bucket.putObject(
      formData.certificateName + "_" + ms,
      formData.image
    );
    putObject.start();
    putObject.abort();
    const fileUrl =
      CERTIFICATES_BUCKET_URL + "/" + formData.certificateName + "_" + ms;

    try {
      // Send product data to backend to store in ZOHO CRM Product's module
      const response = await axios.post(
        `${BASE_URL}/server/b2b_backend_function/postSellerCertifications/${sellerAccountId}`,
        {
          certificationNo: formData.certificateNumber,
          name: formData.certificateName,
          issuer: formData.issuer,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          imageUrl: fileUrl,
        }
      );
      setLoading(true);
      if (response.data.code === "SUCCESS") {
        showToast({
          title: "Certification Added",
          description: "Your certification has been successfully added.",
        });
      } else {
        showToast({
          title: "Certification Addition Failed",
          description:
            "Your certification addition has been failed. Please try again later.",
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in Add New Product:", error);
      showToast({
        title: "Certification Addition Failed",
        description:
          "Your certification addition has been failed. Please try again later.",
      });
    }

    resetForm();
    setIsAddingNew(false);
    setReloadCertsFlag((f) => !f);
    fetchCertificates();
  };

  const handleUpdateCertification = async () => {
    if (!validateForm() || !editingCert) {
      return;
    }
    try {
      const response = await axios.put(
        `${BASE_URL}/server/b2b_backend_function/putSellerCertifications/${editingCert.id}`,
        {
          certificationNo: formData.certificateNumber,
          name: formData.certificateName,
          issuer: formData.issuer,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
        }
      );
      setLoading(true);
      if (response.data.code === "SUCCESS") {
        showToast({
          title: "Certification Updated",
          description: "Your certification has been successfully updated.",
        });
        setCertifications((prev) =>
          prev.map((cert) =>
            cert.id === editingCert.id
              ? { ...cert, ...formData, status: getStatus(formData.expiryDate) }
              : cert
          )
        );
      } else {
        showToast({
          title: "Certification Updation Failed",
          description:
            "Your certification updation has failed. Please try again later",
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in Edit Certificate:", error);
      showToast({
        title: "Certification Updation Failed",
        description:
          "Your certification updation has failed. Please try again later",
      });
    }

    resetForm();
    setEditingCert(null);
    setReloadCertsFlag((f) => !f);
  };

  const handleDeleteCertification = async (
    certId: string,
    certName: string
  ) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/server/b2b_backend_function/deleteSellerCertifications/${certId}`
      );
      setLoading(true);
      if (response.data.code === "SUCCESS") {
        setCertifications((prev) => prev.filter((cert) => cert.id !== certId));
        showToast({
          title: "Certification Deleted",
          description: `${certName} has been removed from your certifications.`,
        });
      } else {
        showToast({
          title: "Certification Deletion Failed",
          description:
            "Your certification deletion has failed. Please try again later",
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error in Edit Certificate:", error);
      showToast({
        title: "Certification Deletion Failed",
        description:
          "Your certification deletion has failed. Please try again later",
      });
    }
  };

  const handleEditClick = (cert: Certification) => {
    setEditingCert(cert);
    setFormData({
      certificateNumber: cert.Certification_number,
      certificateName: cert.Name,
      issueDate: cert.Issued_Date,
      expiryDate: cert.Expiry_Date,
      issuer: cert.Issuer,
      image: null,
    });
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      certificateNumber: "",
      certificateName: "",
      issueDate: "",
      expiryDate: "",
      issuer: "",
      image: null,
    });
    setImagePreview("");
    setErrors({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Valid":
        return "bg-green-100 text-green-800";
      case "Expiring Soon":
        return "bg-yellow-100 text-yellow-800";
      case "Expired":
        return "bg-red-100 text-red-800";
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                My Certifications
              </h1>
              <p className="text-muted-foreground">
                Manage your professional certifications and credentials
              </p>
            </div>
            <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-professional-teal to-professional-success">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-background border border-border shadow-lg z-50">
                <DialogHeader>
                  <DialogTitle>Add New Certification</DialogTitle>
                </DialogHeader>
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
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cert-number">Certificate Number *</Label>
                    <Input
                      id="cert-number"
                      value={formData.certificateNumber}
                      onChange={(e) =>
                        handleInputChange("certificateNumber", e.target.value)
                      }
                      className={
                        errors.certificateNumber ? "border-red-500" : ""
                      }
                      placeholder="Enter certificate number"
                    />
                    {errors.certificateNumber && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.certificateNumber}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cert-name">Certificate Name *</Label>
                    <Input
                      id="cert-name"
                      value={formData.certificateName}
                      onChange={(e) =>
                        handleInputChange("certificateName", e.target.value)
                      }
                      className={errors.certificateName ? "border-red-500" : ""}
                      placeholder="Enter certificate name"
                    />
                    {errors.certificateName && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.certificateName}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cert-issuer">Issuer *</Label>
                    <Input
                      id="cert-issuer"
                      value={formData.issuer}
                      onChange={(e) =>
                        handleInputChange("issuer", e.target.value)
                      }
                      className={errors.issuer ? "border-red-500" : ""}
                      placeholder="Enter issuing organization"
                    />
                    {errors.issuer && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.issuer}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue-date">Issue Date *</Label>
                      <Input
                        id="issue-date"
                        type="date"
                        value={formData.issueDate}
                        onChange={(e) =>
                          handleInputChange("issueDate", e.target.value)
                        }
                        className={errors.issueDate ? "border-red-500" : ""}
                      />
                      {errors.issueDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.issueDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="expiry-date">Expiry Date *</Label>
                      <Input
                        id="expiry-date"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        className={errors.expiryDate ? "border-red-500" : ""}
                      />
                      {errors.expiryDate && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.expiryDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddCertification}>
                      Add Certification
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingNew(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Certifications List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <Card
                key={cert.id}
                className="hover:shadow-lg transition-all duration-300"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                        {cert.Certifical_URl ? (
                          <a
                            href={cert.Certifical_URl}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                          >
                            <img
                              src={cert.Certifical_URl}
                              alt="Certificate"
                              className="object-cover w-full h-full rounded-lg cursor-pointer"
                            />
                          </a>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-professional-teal to-professional-success flex items-center justify-center overflow-hidden">
                            <Award className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      <div>
                        <CardTitle className="text-lg line-clamp-1">
                          {cert.Name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          #{cert.Certification_number}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={getStatusColor(getStatus(cert.Expiry_Date))}
                    >
                      {getStatus(cert.Expiry_Date)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-professional-blue" />
                      <span className="text-muted-foreground">Issuer:</span>
                      <span className="font-medium">{cert.Issuer}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-professional-blue" />
                      <span className="text-muted-foreground">Issue Date:</span>
                      <span>
                        {cert.Issued_Date
                          ? format(new Date(cert.Issued_Date), "MMM dd, yyyy")
                          : "--"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-professional-blue" />
                      <span className="text-muted-foreground">
                        Expiry Date:
                      </span>
                      <span
                        className={
                          getStatus(cert.Expiry_Date) === "Expired"
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {cert.Expiry_Date
                          ? format(new Date(cert.Expiry_Date), "MMM dd, yyyy")
                          : "--"}
                      </span>
                    </div>

                    {getStatus(cert.Expiry_Date) === "Expiring Soon" && (
                      <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">Expires within 90 days</span>
                      </div>
                    )}

                    {getStatus(cert.Expiry_Date) === "Expired" && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          This certification has expired
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-border">
                    <Dialog
                      open={editingCert?.id === cert.id}
                      onOpenChange={(open) => !open && setEditingCert(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEditClick(cert)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-background border border-border shadow-lg z-50">
                        <DialogHeader>
                          <DialogTitle>Edit Certification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="edit-cert-number">
                              Certificate Number *
                            </Label>
                            <Input
                              id="edit-cert-number"
                              value={formData.certificateNumber}
                              onChange={(e) =>
                                handleInputChange(
                                  "certificateNumber",
                                  e.target.value
                                )
                              }
                              className={
                                errors.certificateNumber ? "border-red-500" : ""
                              }
                            />
                            {errors.certificateNumber && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.certificateNumber}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="edit-cert-name">
                              Certificate Name *
                            </Label>
                            <Input
                              id="edit-cert-name"
                              value={formData.certificateName}
                              onChange={(e) =>
                                handleInputChange(
                                  "certificateName",
                                  e.target.value
                                )
                              }
                              className={
                                errors.certificateName ? "border-red-500" : ""
                              }
                            />
                            {errors.certificateName && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.certificateName}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="edit-cert-issuer">Issuer *</Label>
                            <Input
                              id="edit-cert-issuer"
                              value={formData.issuer}
                              onChange={(e) =>
                                handleInputChange("issuer", e.target.value)
                              }
                              className={errors.issuer ? "border-red-500" : ""}
                            />
                            {errors.issuer && (
                              <p className="text-sm text-red-500 mt-1">
                                {errors.issuer}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="edit-issue-date">
                                Issue Date *
                              </Label>
                              <Input
                                id="edit-issue-date"
                                type="date"
                                value={formData.issueDate}
                                onChange={(e) =>
                                  handleInputChange("issueDate", e.target.value)
                                }
                                className={
                                  errors.issueDate ? "border-red-500" : ""
                                }
                              />
                              {errors.issueDate && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.issueDate}
                                </p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="edit-expiry-date">
                                Expiry Date *
                              </Label>
                              <Input
                                id="edit-expiry-date"
                                type="date"
                                value={formData.expiryDate}
                                onChange={(e) =>
                                  handleInputChange(
                                    "expiryDate",
                                    e.target.value
                                  )
                                }
                                className={
                                  errors.expiryDate ? "border-red-500" : ""
                                }
                              />
                              {errors.expiryDate && (
                                <p className="text-sm text-red-500 mt-1">
                                  {errors.expiryDate}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button onClick={handleUpdateCertification}>
                              Update Certification
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setEditingCert(null);
                                resetForm();
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeleteCertification(cert.id, cert.Name)
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

          {certifications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Certifications
                </h3>
                <p className="text-muted-foreground mb-4">
                  Add your professional certifications to build buyer trust and
                  showcase your credentials.
                </p>
                <Button onClick={() => setIsAddingNew(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Certification
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
