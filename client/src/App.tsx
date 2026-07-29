import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Report from "./pages/Report";
import EmbedAnalyze from "./pages/EmbedAnalyze";
import HoustonRestaurantLocation from "./pages/cities/HoustonRestaurantLocation";
import RestaurantSiteSelectionAnalysis from "./pages/RestaurantSiteSelectionAnalysis";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/embed/analyze"} component={EmbedAnalyze} />
      <Route path={"/restaurant-site-selection-analysis"} component={RestaurantSiteSelectionAnalysis} />
      <Route path={"/restaurant-location-analysis-houston"} component={HoustonRestaurantLocation} />
      <Route path={"/report"} component={Report} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
