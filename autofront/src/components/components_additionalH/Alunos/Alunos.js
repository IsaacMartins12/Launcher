import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Table, Tag, Modal, message, Radio, Card, Row, Col, Menu, Statistic } from 'antd';
import { PlusOutlined, SendOutlined, EditOutlined, DeleteOutlined, CloudUploadOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import ActivityForm from './ActivityForm';
import CertificateList from './CertificateList';
import moment from 'moment';

const { Content, Sider } = Layout;

const Aluno = () => {
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [selectedButton, setSelectedButton] = useState('send');
  const [fileList, setFileList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [collapsed, setCollapsed] = useState(false);

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
        message.success('Atividades enviadas com sucesso!');
      } else {
        message.error('Erro ao enviar atividades.');
      }
    } catch (error) {
      console.error('Error sending activities:', error);
      message.error('Erro de conexão com o servidor.');
    }
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

  // Estatísticas
  const totalHours = submittedActivities.reduce((acc, item) => acc + (item.hours || 0), 0);
  const approvedHours = submittedActivities.filter(i => i.status === 'Aprovado').reduce((acc, item) => acc + (item.hours || 0), 0);
  const pendingCount = submittedActivities.filter(i => i.status === 'Em Análise').length;
  const rejectedCount = submittedActivities.filter(i => i.status === 'Rejeitado').length;

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
        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => onDeleteActivity(index)}>
          Remover
        </Button>
      ),
    },
  ];

  const submittedColumns = [
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Tipo', dataIndex: 'type', key: 'type' },
    { title: 'Horas', dataIndex: 'hours', key: 'hours', width: 80 },
    {
      title: 'Comprovante',
      dataIndex: 'certificate',
      key: 'certificate',
      ellipsis: true,
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer">{text}</a>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (text, record) => (
        <Tag color={record.status === 'Aprovado' ? 'green' : record.status === 'Rejeitado' ? 'red' : 'blue'}>
          {record.status}
        </Tag>
      ),
    },
    {
      title: 'Justificativa',
      dataIndex: 'rejection_reason',
      key: 'rejection_reason',
      render: (text) => text ? <Tag color="orange">{text}</Tag> : '-',
    },
    {
      title: 'Data',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
      width: 110,
      render: (text) => text ? new Date(text).toLocaleDateString() : '-',
    },
  ];

  const menuItems = [
    { key: 'send', icon: <CloudUploadOutlined />, label: 'Enviar' },
    { key: 'status', icon: <HistoryOutlined />, label: 'Histórico' },
    { key: 'view', icon: <CheckCircleOutlined />, label: 'Resumo' },
  ];

  const renderContent = () => {
    if (selectedButton === 'send') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#333' }}>Enviar Atividades</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Adicione atividades e envie para aprovação</p>
            </div>
            <Space>
              <Button icon={<PlusOutlined />} onClick={addActivity} type="primary">
                Adicionar
              </Button>
              {activities.length > 0 && (
                <Button icon={<SendOutlined />} type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={handleSend}>
                  Enviar ({activities.length})
                </Button>
              )}
            </Space>
          </div>
          <Table
            dataSource={activities}
            columns={columns}
            pagination={false}
            scroll={{ x: 600 }}
            locale={{ emptyText: 'Nenhuma atividade adicionada. Clique em "Adicionar" para começar.' }}
          />
        </div>
      );
    }

    if (selectedButton === 'status') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#333' }}>Histórico de Envios</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Acompanhe o status das suas solicitações</p>
            </div>
            <Radio.Group
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              optionType="button"
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="Todos">Todos ({submittedActivities.length})</Radio.Button>
              <Radio.Button value="Em Análise">Pendentes ({pendingCount})</Radio.Button>
              <Radio.Button value="Aprovado">Aprovados ({submittedActivities.filter(i => i.status === 'Aprovado').length})</Radio.Button>
              <Radio.Button value="Rejeitado">Rejeitados ({rejectedCount})</Radio.Button>
            </Radio.Group>
          </div>
          <Table
            dataSource={statusFilter === 'Todos' ? submittedActivities : submittedActivities.filter(i => i.status === statusFilter)}
            columns={submittedColumns}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 700 }}
            rowKey={(record) => record.id || Math.random()}
          />
        </div>
      );
    }

    if (selectedButton === 'view') {
      return (
        <div>
          <h3 style={{ margin: '0 0 16px', color: '#333' }}>Resumo de Horas</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card bordered style={{ textAlign: 'center' }}>
                <Statistic title="Total Enviado" value={totalHours} suffix="h" valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered style={{ textAlign: 'center' }}>
                <Statistic title="Aprovadas" value={approvedHours} suffix="h" valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered style={{ textAlign: 'center' }}>
                <Statistic title="Meta" value={200} suffix="h" valueStyle={{ color: '#666' }} />
              </Card>
            </Col>
          </Row>
          <Card style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 500 }}>Progresso</span>
              <span style={{ color: '#888' }}>{approvedHours}/200h</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '8px', height: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((approvedHours / 200) * 100, 100)}%`, backgroundColor: '#52c41a', height: '100%', borderRadius: '8px', transition: 'width 0.3s' }}></div>
            </div>
          </Card>
          <Card title="Detalhamento por Status" style={{ marginTop: '16px' }}>
            <Row gutter={[16, 8]}>
              <Col span={8}><Statistic title="Pendentes" value={pendingCount} prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />} /></Col>
              <Col span={8}><Statistic title="Aprovados" value={submittedActivities.filter(i => i.status === 'Aprovado').length} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Col>
              <Col span={8}><Statistic title="Rejeitados" value={rejectedCount} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} /></Col>
            </Row>
          </Card>
        </div>
      );
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
        breakpoint="md"
        collapsedWidth={60}
        style={{ backgroundColor: '#001529' }}
      >
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: collapsed ? '14px' : '16px' }}>
          {collapsed ? 'HC' : 'Horas Comp.'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedButton]}
          onClick={(e) => setSelectedButton(e.key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
          {/* Cards de resumo no topo */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #1890ff' }}>
                <Statistic title="Enviadas" value={submittedActivities.length} valueStyle={{ fontSize: '20px' }} prefix={<CloudUploadOutlined style={{ color: '#1890ff' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #faad14' }}>
                <Statistic title="Pendentes" value={pendingCount} valueStyle={{ fontSize: '20px' }} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #52c41a' }}>
                <Statistic title="Aprovadas" value={approvedHours} suffix="h" valueStyle={{ fontSize: '20px' }} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #ff4d4f' }}>
                <Statistic title="Rejeitadas" value={rejectedCount} valueStyle={{ fontSize: '20px' }} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} />
              </Card>
            </Col>
          </Row>

          {/* Conteúdo principal */}
          <Card style={{ minHeight: '400px' }}>
            {renderContent()}
          </Card>
        </Content>
      </Layout>

      <Modal
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '500px', top: 20 }}
      >
        <ActivityForm
          onFinish={onFinishActivity}
          activities={activities}
          setActivities={setActivities}
          fileList={fileList}
          setFileList={setFileList}
        />
      </Modal>
    </Layout>
  );
};

export default Aluno;
