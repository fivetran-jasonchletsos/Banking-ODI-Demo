import { HashRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ArchitecturePage from './pages/ArchitecturePage';
import PipelinePage from './pages/PipelinePage';
import FraudPage from './pages/FraudPage';
import LendingPage from './pages/LendingPage';
import AMLPage from './pages/AMLPage';
import PolicyPage from './pages/PolicyPage';
import DepositsPage from './pages/DepositsPage';
import CommercialPage from './pages/CommercialPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/deposits" element={<DepositsPage />} />
          <Route path="/lending" element={<LendingPage />} />
          <Route path="/fraud" element={<FraudPage />} />
          <Route path="/aml" element={<AMLPage />} />
          <Route path="/commercial" element={<CommercialPage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/policy" element={<PolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
