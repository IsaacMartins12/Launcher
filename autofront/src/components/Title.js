// src/components/Title.js
import React from 'react';
//import '../components_css/Title.css'; // Importa o arquivo CSS
import { Button } from 'antd';
import logoImage from "../img/Logo_Otimize__4_-removebg-preview.png";


// Componente funcional Title
const Title = () => {
  return (
    <>
      <div className="title-container">
        <div className="Logo">
          <img src={logoImage} alt="Logo" style={{ width: '150px', height: '120px', paddingTop: '5px', marginLeft: '-185px' }} />
        </div>
        <div className="title-text">Login</div>
        <div className="subtitle-text">Sign in to continue</div>
      </div>   
     </>
  );
};

export default Title;
