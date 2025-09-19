/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

type currentUser = {
  user_id: number;
  first_name: string;
  last_name: string;
  user_type: string;
  role_details: { role_name: string; role_id: string };
};

const NotFound = () => {
  const location = useLocation();
  const [currUser, setCurrUser] = useState<currentUser>({
    user_id: 0,
    first_name: "",
    last_name: "",
    user_type: "",
    role_details: { role_name: "", role_id: "" },
  });

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
        <a
          href={
            currUser.role_details.role_name === "App User"
              ? "/products"
              : currUser.role_details.role_name === "App Admin"
              ? "/sellers"
              : "/" // fallback if needed
          }
          className="text-blue-500 underline hover:text-blue-700"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
