import React from 'react';
import { List, Button, Space } from 'antd';

const CertificateList = ({ fileList, onRemove }) => (
  <List
    dataSource={fileList}
    renderItem={(file) => (
      <List.Item key={file.uid}>
        <Space>
          <span>{file.name}</span> {/* Renderiza o nome do arquivo */}
          <Button type="link" onClick={() => onRemove(file)}>
            Remove
          </Button>
        </Space>
      </List.Item>
    )}
  />
);

export default CertificateList;