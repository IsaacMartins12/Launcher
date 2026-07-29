// Main.js

import React from 'react';
import { Layout } from 'antd';
import { Routes, Route } from 'react-router-dom';
import CustomHeader from './Header';
import CustomSidebar from './Sidebar';
import Upload from './components_Main/Upload';
import Mirror from './components_Main/Mirror';

import '../../components_css/Main.css';

const { Content, Sider } = Layout;

const Main = ({ collapsed, onToggle }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <CustomSidebar collapsed={collapsed} />
      <Layout className="site-layout" style={{ marginLeft: collapsed ? 80 : 200, transition: 'margin-left 0.2s' }}>
        <CustomHeader collapsed={collapsed} onToggle={onToggle} />
        <Content
          className="content"
          style={{
            margin: '0',
            padding: '24px',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <Routes>
            <Route
              path="/upload/*"
              element={<Upload collapsed={collapsed} onToggle={onToggle} />}
            />
            <Route path="/mirror/*" element={<Mirror />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Main;
