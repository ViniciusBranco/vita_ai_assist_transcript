import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import UploadScreen from './pages/UploadScreen';
import HistoryScreen from './pages/HistoryScreen';
import RecordReviewScreen from './pages/RecordReviewScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/record/:id" element={<RecordReviewScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
