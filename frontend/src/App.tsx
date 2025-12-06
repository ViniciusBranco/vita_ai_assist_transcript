import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import UploadScreen from './pages/UploadScreen';
import HistoryScreen from './pages/HistoryScreen';
import RecordReviewScreen from './pages/RecordReviewScreen';
import PatientRecordScreen from './pages/PatientRecordScreen';
import PatientListScreen from './pages/PatientListScreen';
import PatientEditScreen from './pages/PatientEditScreen';
import PatientHistoryScreen from './pages/PatientHistoryScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/record/:id" element={<RecordReviewScreen />} />
          <Route path="/patient/:patientId/record/:recordId" element={<PatientRecordScreen />} />
          <Route path="/patients" element={<PatientListScreen />} />
          <Route path="/patients/:id" element={<PatientEditScreen />} />
          <Route path="/patients/:id/full-history" element={<PatientHistoryScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
