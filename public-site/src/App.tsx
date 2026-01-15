import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { HomePage } from "./pages/HomePage";
import { ClassesPage } from "./pages/ClassesPage";
import { CatalogPage } from "./pages/CatalogPage";
import { CoursePage } from "./pages/CoursePage";
import { VolunteerPage } from "./pages/VolunteerPage";
import { DonatePage } from "./pages/DonatePage";
import { SponsorPage } from "./pages/SponsorPage";
import { StorePage } from "./pages/StorePage";
import { AdventuresPage } from "./pages/AdventuresPage";
import { ContactPage } from "./pages/ContactPage";
import { ImpactPage } from "./pages/ImpactPage";

import "./styles/globals.css";

function AppLayout() {
  const location = useLocation();
  const isCoursePage = location.pathname.startsWith("/courses/");

  if (isCoursePage) {
    return (
      <div className="font-sans antialiased">
        <Routes>
          <Route path="/courses/:courseId" element={<CoursePage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased">
      <Header />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/sponsor" element={<SponsorPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/adventures" element={<AdventuresPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/impact" element={<ImpactPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
