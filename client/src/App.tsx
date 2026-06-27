import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { capturePageview } from "./lib/posthog";
import Home from "./pages/Home";
import Report from "./pages/Report";
import NameGenerator from "./pages/NameGenerator";
import PremiumSuccess from "./pages/PremiumSuccess";
import RestaurantFailureRate from "./pages/RestaurantFailureRate";
import HowToChooseRestaurantLocation from "./pages/HowToChooseRestaurantLocation";
import RestaurantRentCalculator from "./pages/RestaurantRentCalculator";
import RestaurantLocationAnalysis from "./pages/RestaurantLocationAnalysis";
import HoustonRestaurantLocation from "./pages/cities/HoustonRestaurantLocation";
import ChicagoRestaurantLocation from "./pages/cities/ChicagoRestaurantLocation";
import NewYorkRestaurantLocation from "./pages/cities/NewYorkRestaurantLocation";
import LosAngelesRestaurantLocation from "./pages/cities/LosAngelesRestaurantLocation";
import DallasRestaurantLocation from "./pages/cities/DallasRestaurantLocation";

function PostHogPageView() {
  const [location] = useLocation();
  useEffect(() => {
    capturePageview(location || "/");
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <PostHogPageView />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/restaurant-name-generator"} component={NameGenerator} />
        <Route path={"/restaurant-failure-rate"} component={RestaurantFailureRate} />
        <Route path={"/how-to-choose-restaurant-location"} component={HowToChooseRestaurantLocation} />
        <Route path={"/restaurant-rent-calculator"} component={RestaurantRentCalculator} />
        <Route path={"/restaurant-location-analysis"} component={RestaurantLocationAnalysis} />
        <Route path={"/restaurant-location-analysis-houston"} component={HoustonRestaurantLocation} />
        <Route path={"/restaurant-location-analysis-chicago"} component={ChicagoRestaurantLocation} />
        <Route path={"/restaurant-location-analysis-new-york"} component={NewYorkRestaurantLocation} />
        <Route path={"/restaurant-location-analysis-los-angeles"} component={LosAngelesRestaurantLocation} />
        <Route path={"/restaurant-location-analysis-dallas"} component={DallasRestaurantLocation} />
        <Route path={"/premium/success"} component={PremiumSuccess} />
        <Route path={"/report"} component={Report} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
