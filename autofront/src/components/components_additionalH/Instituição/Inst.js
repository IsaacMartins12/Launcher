import React, { useState, useEffect } from 'react';
import { Table, Spin, Layout, Space, Tag, Input, InputNumber, Modal, Button, message, Radio, Card, Row, Col, Menu, Statistic, Tooltip, Form } from 'antd';
import { CheckOutlined, CloseOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, TeamOutlined, DashboardOutlined, UnorderedListOutlined, UndoOutlined, AppstoreOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Content, Sider } = Layout;

const Inst = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [approvalAction, setApprovalAction] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentView, setCurrentView] = useState('list');
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2500/inst', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      const items = Array.isArray(result) ? result : (result.data || []);
      setData(items);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:2500/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (Array.isArray(result)) setCategories(result);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    categoryForm.setFieldsValue({ weight: 1.0 });
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    categoryForm.setFieldsValue(cat);
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = (cat) => {
    Modal.confirm({
      title: 'Excluir Categoria',
      content: `Deseja excluir "${cat.name}"? Só é possível se não houver registros vinculados.`,
      okText: 'Excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`http://localhost:2500/categories/${cat.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            message.success('Categoria removida!');
            fetchCategories();
          } else {
            const err = await response.json();
            message.error(err.error || 'Erro ao excluir.');
          }
        } catch (error) {
          message.error('Erro de conexão.');
        }
      },
    });
  };

  const handleSaveCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      const token = localStorage.getItem('token');
      const url = editingCategory
        ? `http://localhost:2500/categories/${editingCategory.id}`
        : 'http://localhost:2500/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        message.success(editingCategory ? 'Categoria atualizada!' : 'Categoria criada!');
        setCategoryModalVisible(false);
        fetchCategories();
      } else {
        const err = await response.json();
        message.error(err.error || 'Erro ao salvar.');
      }
    } catch (error) {
      // validation error
    }
  };

  const handleApprove = (record) => {
    setSelectedActivity(record);
    setApprovalAction(true);
    setRejectionReason('');
    setConfirmModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedActivity(record);
    setApprovalAction(false);
    setRejectionReason('');
    setConfirmModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!selectedActivity) return;

    const token = localStorage.getItem('token');
    const updatedStatus = approvalAction ? 'Aprovado' : 'Rejeitado';

    try {
      const body = {
        id_certificate: selectedActivity.id,
        status: updatedStatus,
      };
      if (!approvalAction && rejectionReason.trim()) {
        body.rejection_reason = rejectionReason.trim();
      }

      const response = await fetch('http://localhost:2500/inst', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedData = data.map((item) =>
          item.id === selectedActivity.id ? { ...item, status: updatedStatus, rejection_reason: body.rejection_reason || null } : item
        );
        setData(updatedData);
        message.success(`Atividade ${updatedStatus.toLowerCase()} com sucesso!`);
        if (result.warning) {
          message.warning(result.warning, 8);
        }
      } else {
        message.error('Erro ao atualizar status.');
      }
    } catch (error) {
      console.error('Erro:', error);
      message.error('Erro de conexão com o servidor.');
    }

    setConfirmModalVisible(false);
    setSelectedActivity(null);
  };

  const handleRevert = async (record) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:2500/inst', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id_certificate: record.id, status: 'Em An\u00e1lise' }),
      });
      if (response.ok) {
        const updatedData = data.map((item) =>
          item.id === record.id ? { ...item, status: 'Em Análise', rejection_reason: null } : item
        );
        setData(updatedData);
        message.success('Status revertido para análise!');
      } else {
        message.error('Erro ao reverter status.');
      }
    } catch (error) {
      message.error('Erro de conexão.');
    }
  };

  const pendingCount = data.filter(item => item.status === 'Em Análise').length;
  const approvedCount = data.filter(item => item.status === 'Aprovado').length;
  const rejectedCount = data.filter(item => item.status === 'Rejeitado').length;
  const totalHours = data.filter(i => i.status === 'Aprovado').reduce((acc, item) => acc + (item.hours || 0), 0);

  const filteredData = statusFilter === 'Todos'
    ? data
    : data.filter(item => item.status === statusFilter);

  const columns = [
    { title: 'Aluno', dataIndex: 'aluno', key: 'aluno' },
    { title: 'Título', dataIndex: 'title', key: 'title' },
    { title: 'Categoria', dataIndex: 'category', key: 'category', width: 120 },
    { title: 'Horas', dataIndex: 'hours', key: 'hours', width: 70 },
    { title: 'Horas Pond.', dataIndex: 'weighted_hours', key: 'weighted_hours', width: 100, render: (val) => val ? `${val}h` : '-' },
    { title: 'Certificado', dataIndex: 'certificate', key: 'certificate', ellipsis: true },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (text) => {
        const color = text === 'Aprovado' ? 'green' : text === 'Rejeitado' ? 'red' : 'blue';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ação',
      key: 'action',
      width: 250,
      render: (_, record) => {
        if (record.status === 'Em Análise') {
          return (
            <Space size="small" wrap>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Aprovar
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                Rejeitar
              </Button>
            </Space>
          );
        }
        return (
          <Tooltip title="Reverter para Em Análise">
            <Button size="small" icon={<UndoOutlined />} onClick={() => handleRevert(record)}>
              Reverter
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  const menuItems = [
    { key: 'list', icon: <UnorderedListOutlined />, label: 'Solicitações' },
    { key: 'categories', icon: <AppstoreOutlined />, label: 'Categorias' },
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  ];

  const renderDashboard = () => (
    <div>
      <h3 style={{ margin: '0 0 16px', color: '#333' }}>Painel Geral</h3>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card bordered>
            <Statistic title="Total de Horas Aprovadas" value={totalHours} suffix="h" valueStyle={{ color: '#52c41a', fontSize: '28px' }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered>
            <Statistic title="Total de Solicitações" value={data.length} valueStyle={{ color: '#1890ff', fontSize: '28px' }} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card title="Distribuição por Status" style={{ marginTop: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#faad14' }}>{pendingCount}</div>
              <div style={{ color: '#888' }}>Pendentes</div>
            </div>
          </Col>
          <Col xs={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>{approvedCount}</div>
              <div style={{ color: '#888' }}>Aprovadas</div>
            </div>
          </Col>
          <Col xs={8}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff4d4f' }}>{rejectedCount}</div>
              <div style={{ color: '#888' }}>Rejeitadas</div>
            </div>
          </Col>
        </Row>
      </Card>
      <Card title="Últimas Ações" style={{ marginTop: '16px' }}>
        <Table
          dataSource={data.filter(i => i.status !== 'Em Análise').slice(-5).reverse()}
          columns={[
            { title: 'Aluno', dataIndex: 'aluno', key: 'aluno' },
            { title: 'Título', dataIndex: 'title', key: 'title' },
            { title: 'Status', dataIndex: 'status', key: 'status', render: (t) => <Tag color={t === 'Aprovado' ? 'green' : 'red'}>{t}</Tag> },
          ]}
          pagination={false}
          size="small"
          rowKey={(r) => r.id}
        />
      </Card>
    </div>
  );

  const renderList = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>Solicitações</h3>
          <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Gerencie as solicitações de horas complementares</p>
        </div>
        <Radio.Group
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="Todos">Todos ({data.length})</Radio.Button>
          <Radio.Button value="Em Análise">Pendentes ({pendingCount})</Radio.Button>
          <Radio.Button value="Aprovado">Aprovados ({approvedCount})</Radio.Button>
          <Radio.Button value="Rejeitado">Rejeitados ({rejectedCount})</Radio.Button>
        </Radio.Group>
      </div>
      <Spin spinning={loading}>
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          rowKey={(record) => record.id}
        />
      </Spin>
    </div>
  );

  const renderCategories = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#333' }}>Categorias de Atividade</h3>
          <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>Gerencie categorias, pesos e limites de horas</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCategory}>
          Nova Categoria
        </Button>
      </div>
      <Table
        dataSource={categories}
        pagination={false}
        rowKey={(r) => r.id}
        columns={[
          { title: 'Nome', dataIndex: 'name', key: 'name' },
          { title: 'Limite (h)', dataIndex: 'max_hours', key: 'max_hours', width: 100 },
          { title: 'Peso', dataIndex: 'weight', key: 'weight', width: 80, render: (v) => `${v}x` },
          { title: 'Descrição', dataIndex: 'description', key: 'description', ellipsis: true },
          {
            title: 'Ações',
            key: 'actions',
            width: 160,
            render: (_, record) => (
              <Space size="small">
                <Button size="small" icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
                  Editar
                </Button>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCategory(record)}>
                  Excluir
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );

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
          {collapsed ? 'AD' : 'Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentView]}
          onClick={(e) => setCurrentView(e.key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
          {/* Cards resumo no topo */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #1890ff' }}>
                <Statistic title="Total" value={data.length} valueStyle={{ fontSize: '20px' }} prefix={<TeamOutlined style={{ color: '#1890ff' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #faad14' }}>
                <Statistic title="Pendentes" value={pendingCount} valueStyle={{ fontSize: '20px' }} prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" bordered={false} style={{ backgroundColor: '#fff', borderLeft: '3px solid #52c41a' }}>
                <Statistic title="Aprovadas" value={approvedCount} valueStyle={{ fontSize: '20px' }} prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} />
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
            {currentView === 'list' && renderList()}
            {currentView === 'categories' && renderCategories()}
            {currentView === 'dashboard' && renderDashboard()}
          </Card>
        </Content>
      </Layout>

      <Modal
        title={approvalAction ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
        open={confirmModalVisible}
        onOk={handleConfirm}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Confirmar"
        cancelText="Cancelar"
        okButtonProps={{
          danger: !approvalAction,
          style: approvalAction ? { backgroundColor: '#52c41a', borderColor: '#52c41a' } : {},
        }}
      >
        {approvalAction ? (
          <p>Tem certeza que deseja aprovar esta atividade?</p>
        ) : (
          <div>
            <p>Tem certeza que deseja rejeitar esta atividade?</p>
            <p style={{ marginTop: '12px', marginBottom: '4px' }}>Motivo da rejeição:</p>
            <Input.TextArea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Descreva o motivo..."
            />
          </div>
        )}
      </Modal>

      {/* Modal Categoria */}
      <Modal
        title={editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
        open={categoryModalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setCategoryModalVisible(false)}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input placeholder="Ex: Monitoria" />
          </Form.Item>
          <Form.Item name="max_hours" label="Limite de Horas" rules={[{ required: true, message: 'Informe o limite' }]}>
            <InputNumber min={1} max={500} style={{ width: '100%' }} placeholder="Máximo de horas aprovadas por aluno" />
          </Form.Item>
          <Form.Item name="weight" label="Peso" rules={[{ required: true, message: 'Informe o peso' }]}>
            <InputNumber min={0.1} max={5} step={0.1} style={{ width: '100%' }} placeholder="Multiplicador (ex: 1.5)" />
          </Form.Item>
          <Form.Item name="description" label="Descrição">
            <Input.TextArea rows={2} placeholder="Descrição da categoria (opcional)" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Inst;
