// ThemeContext.js
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    colorBgContainer: '#fff', // Defina as cores desejadas para o tema
    headerColor: '#1890ff', // Cor do Header
    // Outras propriedades de estilo do tema...
  });

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
