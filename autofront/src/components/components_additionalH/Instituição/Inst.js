import React, { useState, useEffect } from 'react';
import { Table, Spin, Layout, Space, Tag, Input, Modal, Button, message, Radio } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import CustomHeader from '../Header_additionalH';

const { Content } = Layout;

const Inst = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [approvalAction, setApprovalAction] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

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
      if (Array.isArray(result)) {
        setData(result);
      }
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
        // Atualiza localmente
        const updatedData = data.map((item) =>
          item.id === selectedActivity.id ? { ...item, status: updatedStatus } : item
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

  const filteredData = statusFilter === 'Todos'
    ? data
    : data.filter(item => item.status === statusFilter);

  const columns = [
    {
      title: 'Aluno',
      dataIndex: 'aluno',
      key: 'aluno',
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Horas',
      dataIndex: 'hours',
      key: 'hours',
      width: 80,
    },
    {
      title: 'Certificado',
      dataIndex: 'certificate',
      key: 'certificate',
      ellipsis: true,
    },
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <CustomHeader />
      <Content style={{ padding: '16px', backgroundColor: '#fff' }}>
        <div style={{ color: '#0f4abe', marginBottom: '8px' }}>
          <h2 style={{ margin: 0 }}>Solicitações de Horas Complementares</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Radio.Group
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="Todos">Todos ({data.length})</Radio.Button>
            <Radio.Button value="Em Análise">Pendentes ({data.filter(i => i.status === 'Em Análise').length})</Radio.Button>
            <Radio.Button value="Aprovado">Aprovados ({data.filter(i => i.status === 'Aprovado').length})</Radio.Button>
            <Radio.Button value="Rejeitado">Rejeitados ({data.filter(i => i.status === 'Rejeitado').length})</Radio.Button>
          </Radio.Group>
        </div>
        <div style={{ borderBottom: '2px solid #e8e8e8', marginBottom: '12px' }}></div>

        <Spin spinning={loading}>
          <Table
            dataSource={filteredData}
            columns={columns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 700 }}
            rowKey={(record) => record.id}
          />
        </Spin>

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
      </Content>
    </Layout>
  );
};

export default Inst;
