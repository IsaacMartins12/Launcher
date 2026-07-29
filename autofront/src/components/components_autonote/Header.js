import React from 'react';
import { Layout, Button, Avatar, Breadcrumb } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const CustomHeader = ({ collapsed, onToggle }) => (
  <Header className="site-layout-background header" style={{ position: 'fixed', width: '100%', zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined style={{ color: 'White' }} /> : <MenuFoldOutlined style={{ color: 'White' }} />}
        onClick={onToggle}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />

    </div>
    <div className="avatar-container">
      <Avatar size={40} icon={<UserOutlined style={{ color: 'White' }} />} shape="circle" />
    </div>
  </Header>
);

export default CustomHeader;