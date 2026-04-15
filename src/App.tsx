import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InspectionForm from './pages/InspectionForm';
import ImportConsole from './pages/ImportConsole';
import ROICalculator from './pages/ROICalculator';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inspeccion" element={<InspectionForm />} />
          <Route path="roi/:id" element={<ROICalculator />} />
          <Route path="import" element={<ImportConsole />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
