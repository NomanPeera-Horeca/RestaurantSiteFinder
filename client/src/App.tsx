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
