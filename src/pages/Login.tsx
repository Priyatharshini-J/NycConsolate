/* eslint-disable @typescript-eslint/no-explicit-any */
import emblemOfIndia from "@/assets/emblem-of-india.svg";
import { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    (window as any).catalyst.auth.signIn("login", {
      service_url: "/",
      redirect_url: "/",
    });
  }, []);

  return (
    <div className="min-h-screen bg-gov-navy relative overflow-hidden">
      {/* Government Header */}
      <header className="bg-white shadow-sm border-b-4 border-gov-orange">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-4 bg-gradient-to-r from-gov-orange via-white to-green-600"></div>
              <span className="text-sm font-medium text-gray-700">
                GOVERNMENT OF INDIA
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Header */}
      <div className="bg-gov-navy-dark">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <img
                src={emblemOfIndia}
                alt="Emblem of India"
                className="h-12 w-auto bg-white rounded-full p-1"
              />
              <div className="text-white">
                <h1 className="text-xl font-bold">
                  Consulate General of India
                </h1>
                <p className="text-lg">New York, USA</p>
                <p className="text-xs opacity-80">
                  Serving the States of: Connecticut, Maine, Massachusetts, New
                  Hampshire, New Jersey, New York, Ohio, Pennsylvania, Rhode
                  Island, Vermont, and Delaware
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* World Map Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJkb3RzIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxLjUiIGZpbGw9IiNmZmYiLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNkb3RzKSIvPgo8L3N2Zz4=')] bg-repeat"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-2">Trade</h1>
              <h2 className="text-4xl font-light mb-6">CONNECT</h2>
              <p className="text-2xl text-gov-orange font-medium mb-8">
                Glad to see you
              </p>
            </div>
          </div>
          {/* Right Side - Login Form - aligned right */}
          <div className="flex justify-end items-center h-full">
            <div
              id="login"
              className="bg-white p-8 rounded shadow-md size-full max-w-sm max-h-[63%]"
            ></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gov-navy-light bg-gov-navy-dark text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            This website belongs to Directorate General of Foreign Trade,
            Ministry of Commerce and Industry, Government of India
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
