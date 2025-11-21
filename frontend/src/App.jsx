import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth'; 
import AppRouter from './routers/AppRouter';
import './style/index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App;
