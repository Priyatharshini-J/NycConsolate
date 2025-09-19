import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SellerCard } from "@/components/sellers/SellerCard";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { BASE_URL, buyerAccountId } from "../constants";

export default function SellerSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/server/b2b_backend_function/getVendors`
      );
      setSellers(res.data);
    } catch (err) {
      console.error("Failed to fetch order", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleContactSeller = async (sellerId: string, sellerName: string) => {
    // This would integrate with your CRM to create a deal record
    try {
      const response = await axios.post(
        `${BASE_URL}/server/b2b_backend_function/postDeal`,
        {
          buyerAccountId,
          name: `${sellerName}_${Date.now()}`,
          sellerId,
          closingDate: formatDate(new Date()),
        }
      );
      if (response.data.code === "SUCCESS") {
        toast({
          title: "Contact Request Sent",
          description: `Your contact request has been sent to ${sellerName}. A deal record has been created in your transactions.`,
        });
      } else {
        toast({
          title: "Contact Request Failed",
          description: `Your contact request has failed. Try again after sometime.`,
        });
      }
    } catch (error) {
      console.error("Error in Creating a product deal:", error);
    }
    toast({
      title: "Contact Request Sent",
      description: `Your contact request has been sent to ${sellerName}. A deal record has been created in your transactions.`,
    });
  };

  const handleSearch = async (filterName, value) => {
    if (filterName === "word") {
      setSearchQuery(value);
    } else if (filterName === "certification") {
      setCertificationFilter(value);
    } else if (filterName === "rating") {
      setRatingFilter(value);
    }

    if (value !== "" && filterName === "word") {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/searchSellers/${value}`
        );
        setSellers(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    } else if (filterName === "rating" && value !== "") {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/searchSellerRating/${value}`
        );
        setSellers(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    } else if (filterName === "certification" && value !== "") {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/searchSellerCertification/${value}`
        );
        setSellers(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    } else {
      fetchSellers();
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
              Seller Search
            </h1>
            <p className="text-muted-foreground">
              Discover trusted sellers based on your product requirements
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by product category, seller name, or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSearch("word", searchQuery)
                  }
                />
              </div>
              <Button
                onClick={() => handleSearch("word", searchQuery)}
                className="bg-gradient-to-r from-primary to-professional-teal"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              <Select
                value={certificationFilter}
                onValueChange={(value) => handleSearch("certification", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Certification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ISO 9001">ISO 9001</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="Global Organic">Global Organic</SelectItem>
                  <SelectItem value="Cisco">Cisco</SelectItem>
                  <SelectItem value="Quality Assurance">
                    Quality Assurance
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={ratingFilter}
                onValueChange={(value) => handleSearch("rating", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                </SelectContent>
              </Select>

              {(selectedCategory || certificationFilter || ratingFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("");
                    setCertificationFilter("");
                    setRatingFilter("");
                    fetchSellers();
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Seller Results</h2>
              <p className="text-sm text-muted-foreground">
                {sellers.length} sellers found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellers.map((seller) => (
                <SellerCard
                  key={seller.id}
                  seller={seller}
                  onContactSeller={handleContactSeller}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
