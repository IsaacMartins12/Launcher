// Breadcrumb.js
import React from 'react';
import { Breadcrumb } from 'antd';
import { Link } from 'react-router-dom';

const CustomBreadcrumb = ({ items }) => {
  return (
    <Breadcrumb style={{ margin: '20px 0' }}>
      {items.map((item, index) => (
        <Breadcrumb.Item key={index}>
          {item.link ? <Link to={item.link}>{item.title}</Link> : <span>{item.title}</span>}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default CustomBreadcrumb;
