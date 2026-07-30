import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Table, Tag, Modal, message, Radio, Card, Row, Col, Menu, Statistic, Avatar, Dropdown, Form, Input, Descriptions, Tooltip, Badge, Popover, List } from 'antd';
import { PlusOutlined, SendOutlined, EditOutlined, DeleteOutlined, CloudUploadOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, HistoryOutlined, UserOutlined, LogoutOutlined, ReloadOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ActivityForm from './ActivityForm';
import CertificateList from './CertificateList';

const { Content, Sider, Header } = Layout;

const Aluno = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [selectedButton, setSelectedButton] = useState('send');
  const [fileList, setFileList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [collapsed, setCollapsed] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [profileForm] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:2500/aluno', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(result => {
          const items = Array.isArray(result) ? result : (result.data || []);
          const mapped = items.map(item => ({ ...item, submissionDate: item.created_at }));
          setSubmittedActivities(mapped);
        })
        .catch(err => console.error('Erro ao buscar registros:', err));

      fetch('http://localhost:2500/perfil', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { if (data.name) setProfile(data); })
        .catch(err => console.error('Erro ao buscar perfil:', err));

      fetch('http://localhost:2500/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setCategories(data); })
        .catch(err => console.error('Erro ao buscar categorias:', err));

      fetchNotifications(token);
    }
  }, []);

  const fetchNotifications = (token) => {
    if (!token) token = localStorage.getItem('token');
    fetch('http://localhost:2500/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.notifications) setNotifications(data.notifications);
        if (data.unread_count !== undefined) setUnreadCount(data.unread_count);
      })
      .catch(err => console.error('Erro ao buscar notificações:', err));
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:2500/notifications/read-all', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const onFinishActivity = (values) => {
    if (editingIndex !== null) {
      const updated = [...activities];
      updated[editingIndex] = values;
      setActivities(updated);
      setEditingIndex(null);
    } else {
      setActivities([...activities, values]);
    }
    setModalVisible(false);
  };

  const addActivity = () => {
    setEditingIndex(null);
    setFileList([]);
    setModalVisible(true);
  };

  const editActivity = (index) => {
    setEditingIndex(index);
    setFileList(activities[index].certificate || []);
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
        category_id: activity.category_id || null,
      }));

      const response = await fetch('http://localhost:2500/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(submitted),
      });

      if (response.ok) {
        // Refresh list from server to get accurate data
        const refreshRes = await fetch('http://localhost:2500/aluno', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const refreshData = await refreshRes.json();
        const items = Array.isArray(refreshData) ? refreshData : (refreshData.data || []);
        setSubmittedActivities(items.map(item => ({ ...item, submissionDate: item.created_at })));
        setActivities([]);
        setSelectedButton('status');
        message.success('Atividades enviadas com sucesso!');
      } else {
        const err = await response.json();
        message.error(err.error || 'Erro ao enviar atividades.');
      }
    } catch (error) {
      message.error('Erro de conexão com o servidor.');
    }
  };

  const onDeleteActivity = (index) => {
    Modal.confirm({
      title: 'Remover atividade',
      content: `Deseja remover "${activities[index].title}"?`,
      okText: 'Remover',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        const newActivities = [...activities];
        newActivities.splice(index, 1);
        setActivities(newActivities);
        message.success('Atividade removida.');
      },
    });
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleResubmit = async (registro) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:2500/aluno/${registro.id}/resubmit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const updated = submittedActivities.map(item =>
          item.id === registro.id ? { ...item, status: 'Em Análise', rejection_reason: null } : item
        );
        setSubmittedActivities(updated);
        message.success('Reenviado para análise!');
      } else {
        const err = await response.json();
        message.error(err.error || 'Erro ao reenviar.');
      }
    } catch (error) {
      message.error('Erro de conexão.');
    }
  };

  const handleUpdateProfile = async (values) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:2500/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(values),
      });
      if (response.ok) {
        setProfile({ ...profile, ...values });
        setEditProfileVisible(false);
        message.success('Perfil atualizado!');
      } else {
        message.error('Erro ao atualizar perfil.');
      }
    } catch (error) {
      message.error('Erro de conexão.');
    }
  };

  // Estatísticas
  const totalHours = submittedActivities.reduce((acc, item) => acc + (item.hours || 0), 0);
  const approvedHours = submittedActivities.filter(i => i.status === 'Aprovado').reduce((acc, item) => acc + (item.weighted_hours || item.hours || 0), 0);
  const pendingCount = submittedActivities.filter(i => i.status === 'Em Análise').length;
  const rejectedCount = submittedActivities.filter(i => i.status === 'Rejeitado').length;

  const columns = [
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Categoria', dataIndex: 'type', key: 'type' },
    { title: 'Horas', dataIndex: 'hours', key: 'hours', width: 70 },
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
      width: 180,
      render: (text, record, index) => (
        <Space size="small">
          <Button size="small" icon={<EditOutlined />} onClick={() => editActivity(index)}>
            Editar
          </Button>
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => onDeleteActivity(index)}>
            Excluir
          </Button>
        </Space>
      ),
    },
  ];

  const submittedColumns = [
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Categoria', dataIndex: 'category', key: 'category', width: 120 },
    { title: 'Horas', dataIndex: 'hours', key: 'hours', width: 70 },
    { title: 'Horas Pond.', dataIndex: 'weighted_hours', key: 'weighted_hours', width: 100, render: (val) => val ? `${val}h` : '-' },
    { title: 'Comprovante', dataIndex: 'certificate', key: 'certificate', ellipsis: true, render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">{text}</a> },
    { title: 'Status', key: 'status', width: 120, render: (text, record) => <Tag color={record.status === 'Aprovado' ? 'green' : record.status === 'Rejeitado' ? 'red' : 'blue'}>{record.status}</Tag> },
    { title: 'Justificativa', dataIndex: 'rejection_reason', key: 'rejection_reason', render: (text) => text ? <Tag color="orange">{text}</Tag> : '-' },
    {
      title: 'Ação',
      key: 'action',
      width: 110,
      render: (_, record) => {
        if (record.status === 'Rejeitado') {
          return (
            <Tooltip title="Reenviar para análise">
              <Button size="small" icon={<ReloadOutlined />} onClick={() => handleResubmit(record)} type="primary">
                Reenviar
              </Button>
            </Tooltip>
          );
        }
        return '-';
      },
    },
  ];

  const menuItems = [
    { key: 'send', icon: <CloudUploadOutlined />, label: 'Enviar' },
    { key: 'status', icon: <HistoryOutlined />, label: 'Histórico' },
    { key: 'view', icon: <CheckCircleOutlined />, label: 'Resumo' },
  ];

  const avatarMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Meu Perfil', onClick: () => setProfileVisible(true) },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Sair', danger: true, onClick: handleLogout },
  ];

  const renderContent = () => {
    if (selectedButton === 'send') {
      return (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#333' }}>Enviar Atividades</h3>
              <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Adicione, edite ou exclua antes de enviar para aprovação</p>
            </div>
            <Space>
              <Button icon={<PlusOutlined />} onClick={addActivity} type="primary">Adicionar</Button>
              {activities.length > 0 && (
                <Button icon={<SendOutlined />} type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={handleSend}>
                  Enviar ({activities.length})
                </Button>
              )}
            </Space>
          </div>
          <Table dataSource={activities} columns={columns} pagination={false} scroll={{ x: 600 }} locale={{ emptyText: 'Nenhuma atividade adicionada. Clique em "Adicionar" para começar.' }} rowKey={(r, i) => i} />
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
            <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} optionType="button" buttonStyle="solid" size="small">
              <Radio.Button value="Todos">Todos ({submittedActivities.length})</Radio.Button>
              <Radio.Button value="Em Análise">Pendentes ({pendingCount})</Radio.Button>
              <Radio.Button value="Aprovado">Aprovados ({submittedActivities.filter(i => i.status === 'Aprovado').length})</Radio.Button>
              <Radio.Button value="Rejeitado">Rejeitados ({rejectedCount})</Radio.Button>
            </Radio.Group>
          </div>
          <Table dataSource={statusFilter === 'Todos' ? submittedActivities : submittedActivities.filter(i => i.status === statusFilter)} columns={submittedColumns} pagination={{ pageSize: 8 }} scroll={{ x: 700 }} rowKey={(record) => record.id || Math.random()} />
        </div>
      );
    }
    if (selectedButton === 'view') {
      return (
        <div>
          <h3 style={{ margin: '0 0 16px', color: '#333' }}>Resumo de Horas</h3>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}><Card bordered style={{ textAlign: 'center' }}><Statistic title="Total Enviado" value={totalHours} suffix="h" valueStyle={{ color: '#1890ff' }} /></Card></Col>
            <Col xs={24} sm={12} md={8}><Card bordered style={{ textAlign: 'center' }}><Statistic title="Aprovadas" value={approvedHours} suffix="h" valueStyle={{ color: '#52c41a' }} /></Card></Col>
            <Col xs={24} sm={12} md={8}><Card bordered style={{ textAlign: 'center' }}><Statistic title="Meta" value={200} suffix="h" valueStyle={{ color: '#666' }} /></Card></Col>
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
      <Sider collapsible collapsed={collapsed} onCollapse={(val) => setCollapsed(val)} breakpoint="md" collapsedWidth={60} style={{ backgroundColor: '#001529' }}>
        <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: collapsed ? '14px' : '16px' }}>
          {collapsed ? 'HC' : 'Horas Comp.'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedButton]} onClick={(e) => setSelectedButton(e.key)} items={menuItems} />
      </Sider>
      <Layout>
        <Header style={{ backgroundColor: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontWeight: 500, fontSize: '16px', color: '#333' }}>
            {profile ? `Olá, ${profile.name.split(' ')[0]}` : 'Carregando...'}
          </span>
          <Space size="middle">
            <Popover
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Notificações</span>
                  {unreadCount > 0 && (
                    <Button type="link" size="small" onClick={handleMarkAllRead}>
                      Marcar todas como lidas
                    </Button>
                  )}
                </div>
              }
              trigger="click"
              placement="bottomRight"
              content={
                <div style={{ width: 320, maxHeight: 400, overflow: 'auto' }}>
                  {notifications.length === 0 ? (
                    <p style={{ color: '#888', textAlign: 'center', padding: '16px 0' }}>Nenhuma notificação</p>
                  ) : (
                    <List
                      dataSource={notifications.slice(0, 20)}
                      renderItem={(item) => (
                        <List.Item style={{ backgroundColor: item.is_read ? '#fff' : '#f6ffed', padding: '8px 12px' }}>
                          <List.Item.Meta
                            title={<span style={{ fontSize: '13px' }}>{item.message}</span>}
                            description={<span style={{ fontSize: '11px', color: '#999' }}>{new Date(item.created_at).toLocaleString('pt-BR')}</span>}
                          />
                        </List.Item>
                      )}
                    />
                  )}
                </div>
              }
              onOpenChange={(visible) => { if (visible) fetchNotifications(); }}
            >
              <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: '20px', cursor: 'pointer', color: '#555' }} />
              </Badge>
            </Popover>
            <Dropdown menu={{ items: avatarMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={6}><Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #1890ff' }}><Statistic title="Enviadas" value={submittedActivities.length} valueStyle={{ fontSize: '20px' }} prefix={<CloudUploadOutlined style={{ color: '#1890ff' }} />} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #faad14' }}><Statistic title="Pendentes" value={pendingCount} valueStyle={{ fontSize: '20px' }} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #52c41a' }}><Statistic title="Aprovadas" value={approvedHours} suffix="h" valueStyle={{ fontSize: '20px' }} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} /></Card></Col>
            <Col xs={12} sm={6}><Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #ff4d4f' }}><Statistic title="Rejeitadas" value={rejectedCount} valueStyle={{ fontSize: '20px' }} prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />} /></Card></Col>
          </Row>
          <Card style={{ minHeight: '400px' }}>{renderContent()}</Card>
        </Content>
      </Layout>

      {/* Modal adicionar/editar atividade */}
      <Modal
        title={editingIndex !== null ? 'Editar Atividade' : 'Adicionar Atividade'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingIndex(null); }}
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
          initialValues={editingIndex !== null ? activities[editingIndex] : null}
          categories={categories}
        />
      </Modal>

      {/* Modal Perfil */}
      <Modal
        title="Meu Perfil"
        open={profileVisible}
        onCancel={() => setProfileVisible(false)}
        footer={[
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => { setProfileVisible(false); setEditProfileVisible(true); profileForm.setFieldsValue(profile); }}>
            Editar
          </Button>,
          <Button key="close" onClick={() => setProfileVisible(false)}>Fechar</Button>,
        ]}
      >
        {profile && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Nome">{profile.name}</Descriptions.Item>
            <Descriptions.Item label="Matrícula">{profile.username}</Descriptions.Item>
            <Descriptions.Item label="Turma">{profile.turma}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{profile.is_admin ? 'Administrador' : 'Aluno'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal Editar Perfil */}
      <Modal
        title="Editar Perfil"
        open={editProfileVisible}
        onCancel={() => setEditProfileVisible(false)}
        onOk={() => profileForm.submit()}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="turma" label="Turma" rules={[{ required: true, message: 'Informe a turma' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Aluno;
