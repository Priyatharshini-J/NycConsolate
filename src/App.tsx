/* eslint-disable @typescript-eslint/no-explicit-any */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BuyerLayout } from "./components/layout/BuyerLayout";
import { SellerLayout } from "./components/layout/SellerLayout";
import ProductSearch from "./pages/ProductSearch";
import SellerSearch from "./pages/SellerSearch";
import Transactions from "./pages/Transactions";
import AccountProfile from "./pages/AccountProfile";
import ChangePassword from "./pages/ChangePassword";
import UploadProducts from "./pages/seller/UploadProducts";
import ManageProducts from "./pages/seller/ManageProducts";
import MyCertifications from "./pages/seller/MyCertifications";
import SellerTransactions from "./pages/seller/SellerTransactions";
import SellerProfile from "./pages/seller/SellerProfile";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import Login from "./pages/Login";

const queryClient = new QueryClient();

type currentUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  user_type: string;
  role_details: { role_name: string; role_id: string };
};

function App() {
  const [isFetching, setIsFetching] = useState(true);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [currUser, setCurrUser] = useState<currentUser>({
    user_id: 0,
    first_name: "",
    last_name: "",
    user_type: "",
    role_details: { role_name: "", role_id: "" },
  });

  useEffect(() => {
    const Zcatalyst = (window as any).catalyst;
    Zcatalyst.auth
      .isUserAuthenticated()
      .then(() => {
        setIsUserAuthenticated(true);
      })
      .catch((err: any) => {
        console.error(err);
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, []);

  useEffect(() => {
    const catalyst = (window as any).catalyst;
    const userManagement = catalyst.userManagement;
    const currentUserPromise = userManagement.getCurrentProjectUser();
    currentUserPromise
      .then((response: any) => {
        console.log("user - ", response.content);
        setCurrUser(response.content);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }, []);

  if (isFetching) {
    return <p>Loading...</p>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect based on auth and user type */}
            {!isUserAuthenticated && (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            )}

            {isUserAuthenticated &&
              (currUser.role_details.role_name === "App User" ||
                currUser.role_details.role_name === "Buyer") && (
                <>
                  <Route
                    path="/"
                    element={<Navigate to="/products" replace />}
                  />
                  <Route
                    path="/app"
                    element={<Navigate to="/products" replace />}
                  />

                  {/* Buyer Routes */}
                  <Route
                    path="/products"
                    element={
                      <BuyerLayout>
                        <ProductSearch />
                      </BuyerLayout>
                    }
                  />
                  <Route
                    path="/sellers"
                    element={
                      <BuyerLayout>
                        <SellerSearch />
                      </BuyerLayout>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <BuyerLayout>
                        <Transactions />
                      </BuyerLayout>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <BuyerLayout>
                        <AccountProfile />
                      </BuyerLayout>
                    }
                  />
                  <Route
                    path="/password"
                    element={
                      <BuyerLayout>
                        <ChangePassword />
                      </BuyerLayout>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </>
              )}

            {isUserAuthenticated &&
              (currUser.role_details.role_name === "App Administrator" ||
                currUser.role_details.role_name === "Seller") && (
                <>
                  <Route
                    path="/"
                    element={<Navigate to="/seller/upload-products" replace />}
                  />
                  <Route
                    path="/app"
                    element={<Navigate to="/seller/upload-products" replace />}
                  />

                  {/* Seller Routes */}
                  <Route
                    path="/seller/upload-products"
                    element={
                      <SellerLayout>
                        <UploadProducts />
                      </SellerLayout>
                    }
                  />
                  <Route
                    path="/seller/manage-products"
                    element={
                      <SellerLayout>
                        <ManageProducts />
                      </SellerLayout>
                    }
                  />
                  <Route
                    path="/seller/certifications"
                    element={
                      <SellerLayout>
                        <MyCertifications />
                      </SellerLayout>
                    }
                  />
                  <Route
                    path="/seller/transactions"
                    element={
                      <SellerLayout>
                        <SellerTransactions />
                      </SellerLayout>
                    }
                  />
                  <Route
                    path="/seller/profile"
                    element={
                      <SellerLayout>
                        <SellerProfile />
                      </SellerLayout>
                    }
                  />
                  <Route
                    path="/seller/password"
                    element={
                      <SellerLayout>
                        <ChangePassword />
                      </SellerLayout>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </>
              )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
