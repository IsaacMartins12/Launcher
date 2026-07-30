import React from 'react';
import { Form, Button, Upload, Input, Select } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CertificateList from './CertificateList';

const { Option } = Select;

const ActivityForm = ({ onFinish, activities, setActivities, fileList, setFileList, initialValues }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        type: initialValues.type,
        hours: initialValues.hours,
      });
      if (initialValues.certificate) {
        setFileList(initialValues.certificate);
      }
    } else {
      form.resetFields();
    }
  }, [initialValues]);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList([...newFileList]);
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFileList);
  };

 {/*   const handleSubmit = () => {
    form
      .validateFields(['title', 'type', 'hours'])
      .then(async (values) => {
        // Enviar a imagem para o servidor
        const formData = new FormData();
        formData.append('image', fileList[0].originFileObj);

        const response = await fetch('http://localhost:2500/files', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        // Adicionar dados e URL da imagem ao objeto values
        onFinish({ ...values, certificate: fileList, imageUrl: result.imageUrl });

        form.resetFields();
        setFileList([]); // Limpar a lista de arquivos após o envio do formulário
      })
      .catch((errorInfo) => {
        console.log('Failed:', errorInfo);
      });
  }; */}
//
  const handleSubmit = () => {
    form
      .validateFields(['title', 'type', 'hours'])
      .then((values) => {
        onFinish({ ...values, certificate: fileList });
        form.resetFields();
        setFileList([]); // Limpa a lista de arquivos após o envio do formulário
      })
      .catch((errorInfo) => {
        console.log('Failed:', errorInfo);
      });
  };

  return (
    <div>
      <div style={{ color: '#0f4abe' }}>
        <h2 style={{ marginBottom: '4px' }}>Adicionar Atividade</h2>
        <div style={{ borderBottom: '3px solid #ccc', marginBottom: '12px', marginTop: '0px' }}></div>
      </div>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: 'Please enter the title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Tipo"
          name="type"
          rules={[{ required: true, message: 'Please select the type!' }]}
        >
          <Select>
            <Option value="curso">Curso</Option>
            <Option value="workshop">Workshop</Option>
            <Option value="outro">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Horas"
          name="hours"
          rules={[{ required: true, message: 'Please enter the hours!' }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Comprovante"
          name="certificate"
          valuePropName="fileList"
          getValueFromEvent={handleUploadChange}
        >
          <Upload
            name="logo"
            listType="picture"
            accept=".pdf, .jpg, .jpeg"
            fileList={fileList}
            beforeUpload={() => false}
            onRemove={handleRemove}
            onChange={handleUploadChange}
          >
            <Button icon={<UploadOutlined />}>Fazer Upload</Button>
          </Upload>
        </Form.Item>
        {/*CertificateList mostra a lista de arquivos */}
        <CertificateList fileList={fileList} onRemove={handleRemove} />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Ok
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ActivityForm;