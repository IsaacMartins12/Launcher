import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeContext } from './assets/ThemeContext';

import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Title from './components/Title';
import Main from './components/components_autonote/Main';
import Upload from './components/components_autonote/components_Main/Upload';
import Mirror from './components/components_autonote/components_Main/Mirror';
import Aluno from './components/components_additionalH/Alunos/Alunos';
import Inst from './components/components_additionalH/Instituição/Inst';

import CertificateList from './components/components_additionalH/Alunos/CertificateList'; // Importe o CertificateList

import './components_css/Login.css';
import './components_css/Title.css';
import './components_css/Cadastro.css';
import './components_css/Main.css';

import './App.css';

const ThemeProvider = ({ children }) => {
  const [theme] = useState({
    colorBgContainer: '#fff',
  });

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

function App() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/main/*" element={<Main collapsed={collapsed} onToggle={toggleSidebar} />} />
          <Route path="/upload/*" element={<Upload collapsed={collapsed} onToggle={toggleSidebar} />} />
          <Route path="/mirror/*" element={<Mirror collapsed={collapsed} onToggle={toggleSidebar} />} />
          {/* Adicione a rota para a tela do Aluno */}
          <Route path="/aluno/*" element={<Aluno />} />
          {/* Adicione a rota simulada para o upload */}
          <Route path="/upload-simulado" element={<UploadSimulado />} />
          <Route path='/inst/*' element={<Inst />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function Home() {
  return (
    <div>
      <Login />
     {/*<Title />*/} 
    </div>
  );
}

// Componente de Upload Simulado
const UploadSimulado = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = (files) => {
    setUploadedFiles(files);
    // Lógica adicional de manipulação de arquivos, se necessário
  };

  return (
    <div>
      <h1>Upload Simulado</h1>
      {/* Adicione o formulário de upload simulado */}
      <UploadForm onUpload={handleUpload} />
      {/* Renderiza a lista de arquivos enviados */}
      <CertificateList fileList={uploadedFiles} onRemove={(file) => setUploadedFiles(uploadedFiles.filter(f => f !== file))} />
    </div>
  );
};

// Componente de Formulário de Upload Simulado / O backend vai aqui
const UploadForm = ({ onUpload }) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).map(file => URL.createObjectURL(file));
    onUpload(files);
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      {/* Adicione outros elementos do formulário conforme necessário */}
    </div>
  );
};

export default App;

