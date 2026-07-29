import React, { useState } from 'react';
import { Layout, Button, Space, Table, Tag, Modal, message } from 'antd';
import { PlusOutlined, SendOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CustomHeader from '../Header_additionalH';
import ActivityForm from './ActivityForm';
import CertificateList from './CertificateList';
import moment from 'moment';

const { Content } = Layout;

{/*const reasonFromBackend = 'Motivo de rejeição do back-end'; - Adicionar a url do servidor onde o motivo da rejeição vai estar/}
{/* // Criar uma cópia do estado atualizado com o motivo de rejeição
const updatedSubmittedActivities = submittedActivities.map((activity) => {
  // Atualizar o objeto correspondente com o motivo de rejeição
  return { ...activity, rejectReason: reasonFromBackend };
});

// Atualizar o estado
setSubmittedActivities(updatedSubmittedActivities);
 */}

const Aluno = () => {
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [selectedButton, setSelectedButton] = useState('send');
  const [fileList, setFileList] = useState([]);
  const [rejectReason, setRejectReason] = useState('');


  const onFinishActivity = (values) => {
    setActivities([...activities, values]);
    setModalVisible(false);
    setRejectReason(''); // Limpa o motivo de rejeição após o envio
  };

  const addActivity = () => {
    setModalVisible(true);
    setSelectedButton('send');
  };

  const handleSend = async () => {
    try {
      const submitted = activities.map((activity) => ({
        title: activity.title,
        type: activity.type,
        hours: activity.hours,
        certificate: activity.certificate.map((file) => file.name),
        status: 'Em Análise',
        submissionDate: moment().format('MM/DD/YYYY'),
        submissionTime: new Date().toLocaleTimeString(),
      }));
  
      console.log('JSON Gerado:', submitted);
  
      const response = await fetch('http://localhost:2500/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //body: JSON.stringify({ submittedActivities: submitted }),
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
      <Content style={{ padding: '24px', backgroundColor: '#fff', marginTop: '30px' }}>
        <div style={{ color: '#0f4abe', marginBottom: '24px' }}><h1>Horas Complementares</h1></div>
        <div style={{ textAlign: 'left', marginBottom: '16px', marginTop: '16px' }}>
          <Space size={20}>
            <Button
              type="text"
              style={{
                fontWeight: selectedButton === 'send' ? 'bold' : 'normal',
                color: selectedButton === 'send' ? '#0f72be' : 'inherit',
              }}
              onClick={() => {
                setSelectedButton('send');
              }}
            >
              Enviar
            </Button>
            <Button
              type="text"
              style={{
                fontWeight: selectedButton === 'status' ? 'bold' : 'normal',
                color: selectedButton === 'status' ? '#0f72be' : 'inherit',
              }}
              onClick={() => {
                setSelectedButton('status');
              }}
            >
              Status
            </Button>
            <Button
              type="text"
              style={{
                fontWeight: selectedButton === 'view' ? 'bold' : 'normal',
                color: selectedButton === 'view' ? '#0f72be' : 'inherit',
              }}
              onClick={() => {
                setModalVisible(false);
                setSelectedButton('view');
              }}
            >
              Horas
            </Button>
          </Space>
        </div>
        {/* Adiciona a linha cinza abaixo dos botões */}
        <div style={{ borderBottom: '3px solid #ccc', marginBottom: '8px' }}>
          <div
            style={{
              height: '4px',
              backgroundColor: '#0f72be',
              width: selectedButton === 'send' ? '5%' : selectedButton === 'status' ? '5%' : selectedButton === 'view' ? '5%' : '0%',
              marginLeft: selectedButton === 'status' ? '7%' : selectedButton === 'view' ? '13%' : '0%', // Ajusta a margem à esquerda quando 'vie  w' é selecionado
              marginTop: '-2px', // Move a barra azul para cima para ficar em cima da cinza
              position: 'absolute',
              transition: 'width 0.3s ease',
            }}
          ></div>
        </div>
        <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '16px' }}>
        {selectedButton === 'send' && (
            <Space style={{ marginBottom: '16px' }}>
              <Button
                icon={<PlusOutlined />}
                onClick={addActivity} // Abrir o modal ao clicar no botão
                type="primary"
                
              >
                Adicionar Atividade
              </Button>
              {activities.length > 0 && ( // Renderiza o botão Send apenas se houver pelo menos uma atividade
                <Button icon={<SendOutlined />} type="primary" onClick={handleSend}>
                  Enviar
                </Button>
              )}
            </Space>
          )}

        </div>
        <Modal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          style={{ maxHeight: '50vh' }}

          
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
              <Table dataSource={submittedActivities} columns={submittedColumns} pagination={false} />
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
              <Table dataSource={activities} columns={columns} pagination={false} />
            )}
          </>
        )}
      </Content>
    </Layout>
  );
};

export default Aluno;