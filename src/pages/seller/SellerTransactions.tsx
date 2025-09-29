import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOverlayToast } from "@/hooks/use-overlay-toast";
import {
  Calendar,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
  Pencil,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { BASE_URL } from "../../constants";
import { useAccount } from "../../context/AccountContext";

interface Deal {
  id: string;
  Deal_Name: string;
  Account_Name: { name: string; id: string };
  // buyerCompany: string;
  Product_Name: { name: string; id: string };
  Stage: string;
  Estimated_Deal_Range: string;
  Deal_Initiated_Date: string;
  Closing_Date: string;
  Quantity: string;
  // buyerEmail?: string;
  // priority: "High" | "Medium" | "Low";
}

export default function SellerTransactions() {
  const { accountId, contactId, loadingAuth } = useAccount();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loadingAuth && accountId) {
      const fetchSellerDeals = async () => {
        try {
          const res = await axios.get(
            `${BASE_URL}/server/b2b_backend_function/getSellerDeals/${accountId}`
          );
          setDeals(res.data);
        } catch (err) {
          console.error("Failed to fetch Products", err);
        } finally {
          setLoading(false);
        }
      };

      fetchSellerDeals();
    }
  }, [accountId, loadingAuth]);

  const [filter, setFilter] = useState<string>("all");
  const { showToast, overlayVisible } = useOverlayToast();

  const getStageIcon = (stage: Deal["Stage"]) => {
    switch (stage) {
      case "Seller Contacted":
        return <MessageCircle className="h-4 w-4" />;
      case "Negotiating Terms":
        return <Clock className="h-4 w-4" />;
      case "Agreement Reached":
        return <Clock className="h-4 w-4" />;
      case "Closed Won":
        return <CheckCircle2 className="h-4 w-4" />;
      case "Closed Lost":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: Deal["Stage"]) => {
    switch (stage) {
      case "Seller Contacted":
        return "bg-blue-100 text-blue-800";
      case "Negotiating Terms":
        return "bg-yellow-100 text-yellow-800";
      case "Agreement Reached":
        return "bg-yellow-100 text-yellow-800";
      case "Closed Won":
        return "bg-green-100 text-green-800";
      case "Closed Lost":
        return "bg-red-100 text-red-800";
    }
  };

  // const getPriorityColor = (priority: Deal["priority"]) => {
  //   switch (priority) {
  //     case "High":
  //       return "bg-red-50 text-red-700 border-red-200";
  //     case "Medium":
  //       return "bg-yellow-50 text-yellow-700 border-yellow-200";
  //     case "Low":
  //       return "bg-gray-50 text-gray-700 border-gray-200";
  //   }
  // };

  const canUpdateStage = (currentStage: Deal["Stage"]) => {
    return (
      currentStage === "Seller Contacted" ||
      currentStage === "Negotiating Terms" ||
      currentStage === "Agreement Reached"
    );
  };

  const getNextStages = (currentStage: Deal["Stage"]) => {
    switch (currentStage) {
      case "Seller Contacted":
        return ["Negotiating Terms"];
      case "Negotiating Terms":
        return ["Agreement Reached", "Closed Won", "Closed Lost"];
      case "Agreement Reached":
        return ["Closed Won", "Closed Lost"];
      default:
        return [];
    }
  };

  const handleStageUpdate = async (dealId: string, newStage: Deal["Stage"]) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/server/b2b_backend_function/deal/${dealId}`,
        {
          stage: newStage,
        }
      );
      const deal = deals.find((d) => d.id === dealId);
      if (response.data.code === "SUCCESS") {
        setDeals((prev) =>
          prev.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  stage: newStage,
                  lastActionDate: new Date().toISOString().split("T")[0],
                }
              : deal
          )
        );
        showToast({
          title: "Deal Stage Updated",
          description: `${deal?.Deal_Name} has been moved to ${newStage}.`,
        });
        window.location.reload();
      } else {
        showToast({
          title: "Deal Stage Updation Failed",
          description: `${deal?.Deal_Name} has been not been moved to ${newStage}. Please try again later.`,
        });
      }
    } catch (error) {
      console.error("Error in Edit Product:", error);
      showToast({
        title: "Deal Stage Updation Failed",
        description: `Deal stage updation failed. Please try again later.`,
      });
    }
  };

  const filteredDeals =
    Array.isArray(deals) && deals.length > 0
      ? deals.filter((deal) => {
          if (filter === "all") return true;
          return deal.Stage === filter;
        })
      : [];

  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(filteredDeals.map((d) => [d.id, d.Quantity]))
  );

  const stats = {
    total: Array.isArray(deals) ? deals.length : 0,
    contacted: Array.isArray(deals)
      ? deals.filter((d) => d.Stage === "Seller Contacted").length
      : 0,
    negotiation: Array.isArray(deals)
      ? Number(deals.filter((d) => d.Stage === "Negotiating Terms").length) +
        Number(deals.filter((d) => d.Stage === "Agreement Reached").length)
      : 0,
    won: Array.isArray(deals)
      ? deals.filter((d) => d.Stage === "Closed Won").length
      : 0,
    lost: Array.isArray(deals)
      ? deals.filter((d) => d.Stage === "Closed Lost").length
      : 0,
    winRate:
      Array.isArray(deals) && deals.length > 0
        ? Math.round(
            (deals.filter((d) => d.Stage === "Closed Won").length /
              deals.length) *
              100
          )
        : 0,
  };

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (Array.isArray(deals) && deals.length > 0) {
      setQuantities(Object.fromEntries(deals.map((d) => [d.id, d.Quantity])));
    } else {
      setQuantities({});
    }
  }, [deals]);

  const handleQuantityChange = (id, newValue) => {
    const numValue = Number(newValue);
    if (numValue >= 1) {
      setQuantities((prev) => ({ ...prev, [id]: numValue }));
    }
  };

  const handleSave = async (id) => {
    const newQuantity = quantities[id];
    try {
      const response = await axios.put(
        `${BASE_URL}/server/b2b_backend_function/deal/${id}`,
        {
          quantity: newQuantity,
        }
      );
      if (response.data.code === "SUCCESS") {
        showToast({
          title: "Deal Quantity Updated successfully.",
          description: `Your Deal Quantity has been successfully updated to ${newQuantity} for Deal id - ${id}`,
        });
        window.location.reload();
      } else {
        showToast({
          title: "Deal Quantity Updation Failed",
          description: `Deal Quantity Updation Failed for Deal id - ${id}. Please try again later.`,
        });
      }
    } catch (error) {
      console.error("Error in Edit Product:", error);
      showToast({
        title: "Deal Quantity Updation Failed",
        description: `Deal Quantity Updation Failed for Deal id - ${id}. Please try again later.`,
      });
    }
    setEditingId(null);
  };

  const handleCancel = (id) => {
    // Reset quantity to original if cancel
    const original = filteredDeals.find((d) => d.id === id)?.Quantity || "";
    setQuantities((prev) => ({ ...prev, [id]: original }));
    setEditingId(null);
  };

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
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Transactions
            </h1>
            <p className="text-muted-foreground">
              Manage your deals and track business opportunities
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Deals
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Contacted
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.contacted}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    In Negotiation
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.negotiation}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Won
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.won}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Lost
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.lost}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Win Rate
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-2xl font-bold text-professional-success">
                      {stats.winRate}%
                    </p>
                    <TrendingUp className="h-4 w-4 text-professional-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by stage:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48 bg-background z-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="all">All Deals</SelectItem>
                <SelectItem value="Seller Contacted">
                  Seller Contacted
                </SelectItem>
                <SelectItem value="Negotiating Terms">
                  Negotiating Terms
                </SelectItem>
                <SelectItem value="Closed Won">Closed Won</SelectItem>
                <SelectItem value="Closed Lost">Closed Lost</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredDeals.length} deals found
            </span>
          </div>

          {(!Array.isArray(filteredDeals) || filteredDeals.length === 0) && (
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === "all" ? "No Deals Yet" : `No ${filter} Deals`}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "all"
                    ? "Buyer contact requests will appear here once they discover your products."
                    : `You don't have any deals in ${filter} stage currently.`}
                </p>
              </CardContent>
            </Card>
          )}
          {/* Deals List */}
          <div className="space-y-4">
            {(Array.isArray(filteredDeals) ? filteredDeals : []).map((deal) => (
              <Card key={deal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg">
                          {deal.Deal_Name}
                        </CardTitle>
                        <Badge
                          className={`${getStageColor(
                            deal.Stage
                          )} flex items-center gap-1`}
                        >
                          {getStageIcon(deal.Stage)}
                          {deal.Stage}
                        </Badge>
                        {/* <Badge
                      variant="outline"
                      className={getPriorityColor(deal.priority)}
                    >
                      {deal.priority} Priority
                    </Badge> */}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Deal ID: {deal.id} • Product:{" "}
                        {deal.Product_Name?.name || "NA"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {deal.Estimated_Deal_Range}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Buyer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Buyer</p>
                      <p className="font-medium">{deal.Account_Name.name}</p>
                      {/* <p className="text-muted-foreground">{deal.buyerCompany}</p> */}
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Contact
                      </p>
                      <p>{"Available in CRM"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Initiated
                      </p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(
                            deal.Deal_Initiated_Date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Closing
                      </p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(deal.Closing_Date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">
                        Quantity
                      </p>
                      {!editingId || editingId !== deal.id ? (
                        <div className="flex items-center gap-2">
                          <span>{quantities[deal.id]}</span>
                          {canUpdateStage(deal.Stage) && (
                            <button
                              className="text-muted-foreground hover:text-blue-600"
                              onClick={() => setEditingId(deal.id)}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={quantities[deal.id]}
                            onChange={(e) =>
                              handleQuantityChange(deal.id, e.target.value)
                            }
                            className="border border-blue-300 rounded px-2 py-1 w-20 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                          <button
                            onClick={() => handleSave(deal.id)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="Save"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleCancel(deal.id)}
                            className="text-gray-400 hover:text-red-500"
                            aria-label="Cancel"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage Update Actions */}
                  {canUpdateStage(deal.Stage) && (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Update Stage:</span>
                        {getNextStages(deal.Stage).map((stage) => (
                          <Button
                            key={stage}
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStageUpdate(deal.id, stage as Deal["Stage"])
                            }
                            className={cn(
                              "flex items-center gap-1",
                              stage === "Agreement Reached" &&
                                "border-yellow-300 text-yellow-700 hover:bg-red-50",
                              stage === "Closed Won" &&
                                "border-green-300 text-green-700 hover:bg-green-50",
                              stage === "Closed Lost" &&
                                "border-red-300 text-red-700 hover:bg-red-50"
                            )}
                          >
                            {stage === "Negotiating Terms" && (
                              <ArrowRight className="h-3 w-3" />
                            )}
                            {stage === "Agreement Reached" && (
                              <ArrowRight className="h-3 w-3" />
                            )}
                            {stage === "Closed Won" && (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            {stage === "Closed Lost" && (
                              <XCircle className="h-3 w-3" />
                            )}
                            Move to {stage}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Deal Info */}
                  {(deal.Stage === "Closed Won" ||
                    deal.Stage === "Closed Lost") && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        Deal completed on{" "}
                        {new Date(deal.Closing_Date).toLocaleDateString()}
                        {deal.Stage === "Closed Won" &&
                          " - Congratulations! 🎉"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
