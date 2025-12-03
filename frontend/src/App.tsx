import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadScreen from './pages/UploadScreen';
import RecordReviewScreen from './pages/RecordReviewScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/record/:id" element={<RecordReviewScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
