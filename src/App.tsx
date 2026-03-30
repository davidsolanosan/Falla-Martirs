/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from './lib/DataContext';
import { LanguageProvider } from './lib/i18n';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Censo from './pages/Censo';
import Cuotas from './pages/Cuotas';
import Loteria from './pages/Loteria';
import Eventos from './pages/Eventos';
import Documentos from './pages/Documentos';
import Configuracion from './pages/Configuracion';

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/censo" element={<Censo />} />
              <Route path="/cuotas" element={<Cuotas />} />
              <Route path="/loteria" element={<Loteria />} />
              <Route path="/eventos" element={<Eventos />} />
              <Route path="/documentos" element={<Documentos />} />
              <Route path="/configuracion" element={<Configuracion />} />
            </Routes>
          </Layout>
        </Router>
      </DataProvider>
    </LanguageProvider>
  );
}
