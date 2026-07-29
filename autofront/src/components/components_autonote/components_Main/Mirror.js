  // Mirror.js
  import React from 'react';
  import { Layout, Card,Breadcrumb } from 'antd';
  import { Link } from 'react-router-dom'; // Este é um exemplo do local correto para os imports
  import CustomBreadcrumb from '../../Breadcrumb';
  const { Content } = Layout;


  const Mirror = () => {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Layout>
          <Content style={{ margin: '32px' }}>
            <Breadcrumb style={{ margin: '32px 0', color: '#0764d4' }}>
              <Breadcrumb.Item>
                <Link to="/main">Home</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to="/mirror">Mirror</Link>
              </Breadcrumb.Item>
            </Breadcrumb>
            <Card title="Conteúdo do componente Mirror">
              <p>Este é o conteúdo do componente Espelho do Portal.</p>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  };

  export default Mirror;
