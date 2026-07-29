import React from 'react';
import { Layout, Avatar, Breadcrumb } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;

const CustomHeader = ({ collapsed, onToggle }) => (
  <Header className="site-layout-background header" style={{ position: 'fixed', width: '100%', zIndex: 1, display: 'flex', justifyContent: 'space-between' }}>
    <div className="avatar-container">
      <Avatar size={40} icon={<UserOutlined style={{ color: 'White' }} />} shape="circle" />
    </div>
  </Header>
);

export default CustomHeader;
