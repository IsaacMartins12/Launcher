import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Table, Tag, Modal, message } from 'antd';
import { PlusOutlined, SendOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomHeader from '../Header_additionalH';
import ActivityForm from './ActivityForm';
import CertificateList from './CertificateList';
import moment from 'moment';

const { Content } = Layout;

const Aluno = () => {
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [selectedButton, setSelectedButton] = useState('send');
  const [fileList, setFileList] = useState([]);

  // Buscar registros do backend ao carregar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:2500/aluno', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map(item => ({
              ...item,
              submissionDate: item.created_at,
            }));
            setSubmittedActivities(mapped);
          }
        })
        .catch(err => console.error('Erro ao buscar registros:', err));
    }
  }, []);


  const onFinishActivity = (values) => {
    setActivities([...activities, values]);
    setModalVisible(false);
  };

  const addActivity = () => {
    setModalVisible(true);
    setSelectedButton('send');
  };

  const handleSend = async () => {
    try {
      const token = localStorage.getItem('token');
      const submitted = activities.map((activity) => ({
        title: activity.title,
        type: activity.type,
        hours: activity.hours,
        certificate: activity.certificate.map((file) => file.name),
        status: 'Em Análise',
        submissionDate: moment().format('MM/DD/YYYY'),
        submissionTime: new Date().toLocaleTimeString(),
      }));

      const response = await fetch('http://localhost:2500/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitted),
      });

      if (response.ok) {
        setSubmittedActivities([...submittedActivities, ...submitted]);
        setActivities([]);
        setSelectedButton('status');
        message.success('Activities sent successfully.');
      } else {
        message.error('Failed to send activities. Please try again.');
      }
    } catch (error) {
      console.error('Error sending activities:', error);
      message.error('An error occurred. Please try again.');
    }
  };


  const onEditActivity = (record, index) => {
    console.log('Edit activity:', record, index);
  };

  const onDeleteActivity = (index) => {
    const newActivities = [...activities];
    newActivities.splice(index, 1);
    setActivities(newActivities);
  };

  const handleRemoveFile = (file, key) => {
    const updatedActivities = activities.map((activity) => {
      if (activity.key === key) {
        const updatedFiles = activity.certificate.filter((f) => f.uid !== file.uid);
        return { ...activity, certificate: updatedFiles };
      }
      return activity;
    });
    setActivities(updatedActivities);
  };

  const columns = [
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Tipo', dataIndex: 'type', key: 'type' },
    { title: 'Horas', dataIndex: 'hours', key: 'hours' },
    {
      title: 'Comprovante',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (text, record) => (
        <CertificateList fileList={record.certificate} onRemove={(file) => handleRemoveFile(file, record.key)} />
      ),
    },
    {
      title: 'Ação',
      key: 'action',
      render: (text, record, index) => (
        <Space size="middle">
          <span onClick={() => onEditActivity(record, index)} style={{ cursor: 'pointer' }}>
            <EditOutlined />
          </span>
          <span onClick={() => onDeleteActivity(index)} style={{ cursor: 'pointer' }}>
            <DeleteOutlined />
          </span>
        </Space>
      ),
    },
  ];

  const submittedColumns = [
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Tipo', dataIndex: 'type', key: 'type' },
    { title: 'Horas', dataIndex: 'hours', key: 'hours' },
    {
      title: 'Comprovante',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (text, record) => (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (text, record) => (
        <Tag color={record.status === 'Aprovado' ? 'green' : record.status === 'Rejeitado' ? 'red' : 'blue'}>
          {record.status}
        </Tag>
      ),
    },
    
      {
        title: 'Justificativa',
        dataIndex: 'rejectReason',
        key: 'rejectReason',
      },
    {
      title: 'Data de Envio',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      render: (text) => new Date(text).toLocaleDateString(), // Mostra apenas a data
    },
  ];

  const HoursColumns = [
    { title: 'Horas Cumpridas', dataIndex: 'hoursWorked', key: 'hoursWorked' },
    { title: 'Horas Restantes', dataIndex: 'hoursLeft', key: 'hoursLeft' },
    { title: 'Horas Necessárias', dataIndex: 'hoursRequired', key: 'hoursRequired' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <CustomHeader />
      <Content style={{ padding: '16px', backgroundColor: '#fff' }}>
        <div style={{ color: '#0f4abe', marginBottom: '8px' }}><h2 style={{ margin: 0 }}>Horas Complementares</h2></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Space size={12} wrap>
            <Button
              type="text"
              style={{
                fontWeight: selectedButton === 'send' ? 'bold' : 'normal',
                color: selectedButton === 'send' ? '#0f72be' : 'inherit',
                padding: '4px 8px',
              }}
              onClick={() => setSelectedButton('send')}
            >
              Enviar
            </Button>
            <Button
              type="text"
              style={{
                fontWeight: selectedButton === 'status' ? 'bold' : 'normal',
                color: selectedButton === 'status' ? '#0f72be' : 'inherit',
                padding: '4px 8px',
              }}
              onClick={() => setSelectedButton('status')}
            >
              Status
            </Button>
            <Button
              type="text"
              style={{
                fontWeight: selectedButton === 'view' ? 'bold' : 'normal',
                color: selectedButton === 'view' ? '#0f72be' : 'inherit',
                padding: '4px 8px',
              }}
              onClick={() => { setModalVisible(false); setSelectedButton('view'); }}
            >
              Horas
            </Button>
          </Space>
          {selectedButton === 'send' && (
            <Space wrap>
              <Button icon={<PlusOutlined />} onClick={addActivity} type="primary">
                Adicionar Atividade
              </Button>
              {activities.length > 0 && (
                <Button icon={<SendOutlined />} type="primary" onClick={handleSend}>
                  Enviar
                </Button>
              )}
            </Space>
          )}
        </div>
        <div style={{ borderBottom: '2px solid #e8e8e8', marginBottom: '12px' }}></div>
        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width="90%"
          style={{ maxWidth: '500px', top: 20 }}
        >
          {/* Usando o componente ActivityForm para enviar atividades */}
          <ActivityForm
            onFinish={onFinishActivity}
            activities={activities}
            setActivities={setActivities}
            fileList={fileList}
            setFileList={setFileList}
          />
        </Modal>

        {selectedButton === 'view' ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            {selectedButton === 'status' ? (
              <>
                <h2>Status de Envios</h2>
                <Table dataSource={submittedActivities} columns={submittedColumns} pagination={false} />
              </>
            ) : (
              <>
                <Table dataSource={submittedActivities} columns={HoursColumns} pagination={false} />
              </>
            )}
          </div>
        ) : (
          <>
            {selectedButton === 'status' ? (
              <Table dataSource={submittedActivities} columns={submittedColumns} pagination={false} scroll={{ x: 600 }} />
            ) : selectedButton === 'hours' ? (
              <>
                <h2>Horas Complementares</h2>
                <Table
                  dataSource={submittedActivities} // Substitua isso pelos dados reais da tabela de horas
                  columns={[
                    { title: 'Data', dataIndex: 'submissionDate', key: 'submissionDate', render: (text) => new Date(text).toLocaleDateString() },
                    { title: 'Horas', dataIndex: 'hours', key: 'hours' },
                    // Adicione mais colunas conforme necessário
                  ]}
                  pagination={false}
                />
              </>
            ) : (
              <Table dataSource={activities} columns={columns} pagination={false} scroll={{ x: 600 }} />
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default Aluno;