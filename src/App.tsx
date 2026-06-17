import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Overview from "@/pages/Overview";
import Alerts from "@/pages/Alerts";
import Strategy from "@/pages/Strategy";
import Linkage from "@/pages/Linkage";
import Shift from "@/pages/Shift";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/linkage" element={<Linkage />} />
          <Route path="/shift" element={<Shift />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
