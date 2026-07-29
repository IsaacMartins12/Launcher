import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, UploadOutlined, FileDoneOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../../components_css/Main.css';
import logoImage from "../../img/Logo_Autonote_3.png";

const { Sider } = Layout;

const CustomSidebar = ({ collapsed }) => (
  <Sider trigger={null} collapsible collapsed={collapsed} className="sider" style={{ height: '100vh', position: 'fixed', left: 0 }}>
    <div className="logo-container">
      <img src={logoImage} alt="Logo" className="logo" />
      {!collapsed && <span className="autonote-text">Autonote</span>}
    </div>
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
      <Menu.Item key="1" icon={<UserOutlined />} title="User">
        <Link to="/main/user">Usuário</Link>
      </Menu.Item>
      <Menu.Item key="2" icon={<UploadOutlined />} title="Upload">
        <Link to="/main/upload">Upload de Planilhas</Link>
      </Menu.Item>
      <Menu.Item key="3" icon={<FileDoneOutlined />} title="Mirror">
        <Link to="/main/mirror">Espelho do Portal</Link>
      </Menu.Item>
      <Menu.Item key="4" icon={<InfoCircleOutlined />} title="About">
        <Link to="/main/about">Sobre Nós</Link>
      </Menu.Item>
    </Menu>
  </Sider>
);

export default CustomSidebar;
