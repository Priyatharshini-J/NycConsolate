import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-professional-teal bg-clip-text text-transparent">
              B2B Marketplace Portal
            </h1>
            <Button 
              asChild
              className="bg-gradient-to-r from-primary to-professional-teal hover:opacity-90 transition-opacity"
            >
              <a href="/products">Enter Portal</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-professional-blue bg-clip-text text-transparent">
            Welcome to Your B2B Marketplace
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with trusted sellers, discover quality products, and manage your business relationships all in one professional platform.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary to-professional-teal hover:opacity-90 transition-opacity"
            >
              <a href="/products">
                Buyer Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              asChild
              className="border-professional-teal text-professional-teal hover:bg-professional-teal hover:text-white"
            >
              <a href="/seller/upload-products">
                Seller Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t bg-card py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 B2B Marketplace Portal. Professional business connections made simple.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
