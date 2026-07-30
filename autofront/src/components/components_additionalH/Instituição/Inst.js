import React, { useState, useEffect } from 'react';
import { Table, Spin, Layout, Space, Tag, Input, Modal, Button, message, Radio, Card, Row, Col, Menu, Statistic } from 'antd';
import { CheckOutlined, CloseOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, TeamOutlined, DashboardOutlined, UnorderedListOutlined } from '@ant-design/icons';

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

  useEffect(() => {
    fetchData();
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
        const updatedData = data.map((item) =>
          item.id === selectedActivity.id ? { ...item, status: updatedStatus, rejection_reason: body.rejection_reason || null } : item
        );
        setData(updatedData);
        message.success(`Atividade ${updatedStatus.toLowerCase()} com sucesso!`);
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
    { title: 'Tipo', dataIndex: 'type', key: 'type' },
    { title: 'Horas', dataIndex: 'hours', key: 'hours', width: 70 },
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
      width: 200,
      render: (_, record) => {
        if (record.status !== 'Em Análise') {
          return <Tag>{record.status}</Tag>;
        }
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
      },
    },
  ];

  const menuItems = [
    { key: 'list', icon: <UnorderedListOutlined />, label: 'Solicitações' },
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
            {currentView === 'list' ? renderList() : renderDashboard()}
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
          <p>Tem certeza que deseja <strong>aprovar</strong> esta atividade?</p>
        ) : (
          <div>
            <p>Tem certeza que deseja <strong>rejeitar</strong> esta atividade?</p>
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
    </Layout>
  );
};

export default Inst;
