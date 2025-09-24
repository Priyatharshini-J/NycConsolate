import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/common/StarRating";
import { useOverlayToast } from "@/hooks/use-overlay-toast";
import {
  Calendar,
  MessageCircle,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import axios from "axios";
import { BASE_URL, buyerAccountId } from "../constants";

interface Deal {
  id: string;
  Deal_Name: string;
  Vendor_Name: { name: string; id: string };
  Product_Name: { name: string; id: string };
  Stage: string;
  Deal_Initiated_Date: string;
  Closing_Date: string;
  Estimated_Deal_Range?: string;
}

export default function Transactions() {
  const [feedbackModal, setFeedbackModal] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, overlayVisible } = useOverlayToast();

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/getBuyerDeals/${buyerAccountId}`
        );
        setDeals(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

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

  const canProvideFeedback = (stage: Deal["Stage"]) => {
    return stage === "Closed Won" || stage === "Closed Lost";
  };

  const handleSubmitFeedback = async (dealId: string, vendorId: string) => {
    if (!feedback.trim() || rating === 0) {
      showToast({
        title: "Missing Information",
        description: "Please provide both feedback and rating.",
      });
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/server/b2b_backend_function/postFeedback`,
        {
          dealId,
          vendorId,
          rating,
          comments: feedback,
        }
      );

      if (res.data.code === "SUCCESS") {
        showToast({
          title: "Feedback Submitted",
          description:
            "Thank you for your feedback. It helps improve our marketplace.",
        });
      } else {
        showToast({
          title: "Feedback Submission failed",
          description: "Feedback submission failed. Please try again sometime.",
        });
      }
    } catch (err) {
      console.error("Failed to post feedback", err);
      showToast({
        title: "Feedback Submission failed",
        description: "Feedback submission failed. Please try again sometime.",
      });
    }

    setFeedbackModal(null);
    setFeedback("");
    setRating(0);
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
              My Transactions
            </h1>
            <p className="text-muted-foreground">
              Track your deals and manage business relationships
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Deals
                    </p>
                    <p className="text-2xl font-bold">{deals.length}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-professional-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Deals
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        deals.filter(
                          (d) =>
                            d.stage === "Seller Contacted" ||
                            d.stage === "Negotiating Terms"
                        ).length
                      }
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-professional-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Won Deals
                    </p>
                    <p className="text-2xl font-bold text-professional-success">
                      {deals.filter((d) => d.Stage === "Closed Won").length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-professional-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-professional-success">
                      {(
                        (deals.filter((d) => d.Stage === "Closed Won").length /
                          deals.length) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-professional-warning" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deals List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">All Transactions</h2>
            <div className="space-y-4">
              {deals.map((deal: Deal) => (
                <Card
                  key={deal.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {deal.Deal_Name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Deal ID: {deal.id}
                        </p>
                      </div>
                      <Badge
                        className={`${getStageColor(
                          deal.Stage
                        )} flex items-center gap-1`}
                      >
                        {getStageIcon(deal.Stage)}
                        {deal.Stage}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Seller
                        </p>
                        <p>{deal.Vendor_Name.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Product
                        </p>
                        <p>{deal.Product_Name?.name || "NA"}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          Created
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
                          Closing Date
                        </p>
                        <div className="flex items-center gap-1">
                          {deal.Closing_Date ? (
                            <Calendar className="h-3 w-3" />
                          ) : (
                            ""
                          )}
                          <span>
                            {deal.Closing_Date
                              ? new Date(deal.Closing_Date).toLocaleDateString()
                              : "In Negotiation"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {deal.Estimated_Deal_Range && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Estimated Deal Range
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          {deal.Estimated_Deal_Range}
                        </p>
                      </div>
                    )}

                    {canProvideFeedback(deal.Stage) && (
                      <div className="pt-2 border-t border-border">
                        <Dialog
                          open={feedbackModal === deal.id}
                          onOpenChange={(open) =>
                            setFeedbackModal(open ? deal.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Star className="h-4 w-4 mr-2" />
                              Provide Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Provide Feedback for {deal.Deal_Name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Rating
                                </label>
                                <StarRating
                                  rating={rating}
                                  interactive
                                  onRatingChange={setRating}
                                  size="lg"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Comments
                                </label>
                                <Textarea
                                  placeholder="Share your experience with this seller..."
                                  value={feedback}
                                  onChange={(e) => setFeedback(e.target.value)}
                                  rows={4}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    handleSubmitFeedback(
                                      deal.id,
                                      deal.Vendor_Name.id
                                    )
                                  }
                                >
                                  Submit Feedback
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setFeedbackModal(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
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
