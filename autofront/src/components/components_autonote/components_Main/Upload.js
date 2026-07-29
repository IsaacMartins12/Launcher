import React, { useState } from 'react';
import { Layout, Typography, Row, Col, Upload, message, Divider, Breadcrumb } from 'antd';
import { InboxOutlined, DeleteOutlined, FileExcelOutlined, LoadingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import '../../../components_css/Upload.css';

const { Content } = Layout;
const { Text, Title, Paragraph } = Typography;

const UploadPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = ({ fileList }) => {
    const uniqueFiles = fileList.filter((file, index, self) =>
      index === self.findIndex((f) => f.uid === file.uid)
    );
    setUploadedFiles(uniqueFiles);
    uniqueFiles.forEach((file) => {
      if (file.status === 'done') {
        message.success(`${file.name} carregado com sucesso.`);
      }
    });
  };

  const handleDeleteFile = (file) => {
    const updatedFiles = uploadedFiles.filter((existingFile) => existingFile.uid !== file.uid);
    setUploadedFiles(updatedFiles);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', backgroundColor: '#FFFFFF' }}>
        <Breadcrumb style={{ margin: '32px 0', color: '#0764d4' }}>
          <Breadcrumb.Item>
            <Link to="/main">Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/upload">Upload</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} md={18} lg={16}>
            <div className="upload-container">
              <div className="upload-title">
                <Title level={3}>Selecione as planilhas com notas</Title>
              </div>

              <div
                className="upload-area"
                style={{
                  minHeight: '60vh',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: '#FFFFFF',
                }}
              >
                <Upload
                  showUploadList={false}
                  multiple={true}
                  onChange={handleUpload}
                  className="custom-upload"
                  accept=".xlsx" // Adicionando a restrição para aceitar apenas arquivos .xlsx
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <InboxOutlined style={{ fontSize: '50px', color: '#1890ff', marginBottom: '8px' }} />
                    <Text style={{ color: '#1890ff', fontSize: '16px' }}>Arraste e solte os arquivos ou clique para carregar</Text>
                  </div>
                </Upload>
              </div>

              {uploadedFiles.length === 0 && (
                <div className="upload-message">
                  <Text type="danger">Nenhum arquivo selecionado!</Text>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="file-list">
                  <Title level={4} style={{ marginBottom: '16px' }}>Planilhas Carregadas</Title>
                  <Row gutter={[16, 16]} justify="start">
                    {uploadedFiles.map((file, index) => (
                      <Col key={file.uid} xs={24} sm={12} md={8} lg={8}>
                        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <FileExcelOutlined style={{ fontSize: '24px', color: 'green', marginRight: '8px' }} />
                            <Paragraph style={{ margin: '0', marginTop: '8px' }}>{file.name}</Paragraph>
                          </a>
                          <DeleteOutlined style={{ fontSize: '16px', color: 'red', cursor: 'pointer', alignSelf: 'flex-end' }} onClick={() => handleDeleteFile(file)} />
                          {file.status === 'uploading' && <LoadingOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                        </div>
                        {(index + 1) % 3 === 0 && index !== uploadedFiles.length - 1 && <Divider key={`divider-${index}`} />}
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default UploadPage;
