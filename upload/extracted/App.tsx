import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BankProvider } from "./contexts/BankContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Emprestimos from "./pages/Emprestimos";
import Investidores from "./pages/Investidores";
import Trocas from "./pages/Trocas";
import ConfigTrocas from "./pages/ConfigTrocas";
import ComprasVendas from "./pages/ComprasVendas";
import Caixa from "./pages/Caixa";
import Doadores from "./pages/Doadores";
import Leiloes from "./pages/Leiloes";
import Sorteios from "./pages/Sorteios";
import Loterica from "./pages/Loterica";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/emprestimos"} component={Emprestimos} />
      <Route path={"/investidores"} component={Investidores} />
      <Route path={"/trocas"} component={Trocas} />
      <Route path={"/config-trocas"} component={ConfigTrocas} />
      <Route path={"/compras-vendas"} component={ComprasVendas} />
      <Route path={"/caixa"} component={Caixa} />
      <Route path={"/doadores"} component={Doadores} />
      <Route path={"/leiloes"} component={Leiloes} />
      <Route path={"/sorteios"} component={Sorteios} />
      <Route path={"/loterica"} component={Loterica} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <BankProvider>
          <TooltipProvider>
            <Toaster
              theme="dark"
              richColors
              position="top-right"
            />
            <Layout>
              <Router />
            </Layout>
          </TooltipProvider>
        </BankProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
