import React from 'react';
import { Form, Button, Upload, Input, Select, InputNumber, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import CertificateList from './CertificateList';

const { Option } = Select;

const ActivityForm = ({ onFinish, activities, setActivities, fileList, setFileList, initialValues, categories = [] }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        category_id: initialValues.category_id || undefined,
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

  const handleSubmit = () => {
    form
      .validateFields(['title', 'category_id', 'hours'])
      .then((values) => {
        if (!fileList || fileList.length === 0) {
          message.warning('Anexe o comprovante da atividade.');
          return;
        }
        const selectedCategory = categories.find(c => c.id === values.category_id);
        onFinish({
          ...values,
          type: selectedCategory ? selectedCategory.name : 'Outro',
          certificate: fileList,
        });
        form.resetFields();
        setFileList([]);
      })
      .catch((errorInfo) => {
        console.log('Failed:', errorInfo);
      });
  };

  const selectedCategoryId = Form.useWatch('category_id', form);
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  return (
    <div>
      <Form form={form} layout="vertical">
        <Form.Item
          label="Título"
          name="title"
          rules={[{ required: true, message: 'Informe o título da atividade' }]}
        >
          <Input placeholder="Ex: Curso de Python Avançado" />
        </Form.Item>
        <Form.Item
          label="Categoria"
          name="category_id"
          rules={[{ required: true, message: 'Selecione a categoria' }]}
        >
          <Select placeholder="Selecione a categoria">
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>
                {cat.name} (máx. {cat.max_hours}h, peso {cat.weight}x)
              </Option>
            ))}
          </Select>
        </Form.Item>
        {selectedCategory && (
          <div style={{ marginTop: '-12px', marginBottom: '12px', fontSize: '12px', color: '#888' }}>
            {selectedCategory.description} — Limite: {selectedCategory.max_hours}h
          </div>
        )}
        <Form.Item
          label="Horas"
          name="hours"
          rules={[{ required: true, message: 'Informe a carga horária' }]}
        >
          <InputNumber min={1} max={500} style={{ width: '100%' }} placeholder="Carga horária" />
        </Form.Item>

        <Form.Item label="Comprovante">
          <Upload
            name="file"
            listType="picture"
            accept=".pdf,.jpg,.jpeg,.png"
            fileList={fileList}
            beforeUpload={() => false}
            onRemove={handleRemove}
            onChange={handleUploadChange}
          >
            <Button icon={<UploadOutlined />}>Fazer Upload</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSubmit}>
            Ok
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ActivityForm;