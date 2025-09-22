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
import { ProductCard } from "@/components/products/ProductCard";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { BASE_URL, buyerAccountId } from "../constants";

export default function ProductSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [certificationFilter, setCertificationFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/server/b2b_backend_function/getProducts`
      );
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch order", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleContactSeller = async (
    productName: string,
    productId: string,
    sellerId: string,
    sellerName: string
  ) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/server/b2b_backend_function/postDeal`,
        {
          buyerAccountId,
          name: `${productName}_${Date.now()}`,
          productId,
          sellerId,
          initiatedDate: formatDate(new Date()),
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
  };

  const handleSearch = async (filterName, value) => {
    if (filterName === "word") {
      setSearchQuery(value);
    } else if (filterName === "category") {
      setSelectedCategory(value);
    } else if (filterName === "rating") {
      setRatingFilter(value);
    }

    if (value !== "" && filterName !== "rating") {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/search/${filterName}/${value}`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    } else if (filterName === "rating" && value !== "") {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BASE_URL}/server/b2b_backend_function/searchRating/${value}`
        );
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setLoading(false);
      }
    } else {
      fetchProducts();
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
              Product Search
            </h1>
            <p className="text-muted-foreground">
              Find the perfect products for your business needs
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card rounded-lg border p-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by product name, category, or ID..."
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
                value={selectedCategory}
                onValueChange={(value) => handleSearch("category", value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agricultural Products">
                    Agricultural Products
                  </SelectItem>
                  <SelectItem value="Electronics & Technology">
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

              {/* <Select
                value={certificationFilter}
                onValueChange={(value) => handleSearch("certification", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Seller Certification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iso9001">ISO 9001</SelectItem>
                  <SelectItem value="ce">CE Certified</SelectItem>
                  <SelectItem value="gots">GOTS Certified</SelectItem>
                  <SelectItem value="energy-star">Energy Star</SelectItem>
                </SelectContent>
              </Select> */}

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
                    fetchProducts();
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
              <h2 className="text-xl font-semibold">Search Results</h2>
              <p className="text-sm text-muted-foreground">
                {products.length} products found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
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
