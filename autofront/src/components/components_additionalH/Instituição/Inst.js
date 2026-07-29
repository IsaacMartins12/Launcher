// Código editado com busca correta na tabela - Incompleto:

import React, { useState, useEffect, useMemo } from 'react';
import { Table, Spin, Layout, Space, Tag, Input, Modal, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import CustomHeader from '../Header_additionalH';
import CertificateList from '../Alunos/CertificateList';

const { Content } = Layout;

const bearerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcwMzMwNTk3MCwianRpIjoiMWM3MTgwZjEtYTA4Mi00NzJjLWE4NTktYmIxNzJkMmM1NmYzIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6eyJ1c2VybmFtZSI6IjE3MDgyMCJ9LCJuYmYiOjE3MDMzMDU5NzAsImNzcmYiOiIzYzViYTdkZS1hZTBlLTQxZmEtOTZhYy1lOTYxYjRmNGY0ZGMiLCJleHAiOjE3MDMzMDc3NzB9.ke-egxN8yWjcI_kNFUj2PBoZY5tGsAWfOjW9Q7fTMvc'

const Inst = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [selectedButton, setSelectedButton] = useState('status');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [approvalAction, setApprovalAction] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFilters, setShowFilters] = useState(false);


  const approvedActivities = useMemo(() => submittedActivities.filter(activity => activity.status === 'Aprovado'), [submittedActivities]);
  const rejectedActivities = useMemo(() => submittedActivities.filter(activity => activity.status === 'Rejeitado'), [submittedActivities]);

  //Pegar as requisições de atividades

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:2500/inst');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterButtonClick = () => {
    setShowFilters(!showFilters);
  };

  const statusOptions = [
    { label: 'Em andamento', value: 'Em análise' },
    { label: 'Aprovado', value: 'Aprovado' },
    { label: 'Rejeitado', value: 'Rejeitado' },
  ];

  const updatePendingApprovalCount = (activities) => {
    const count = activities.filter(activity => activity.status.toLowerCase() === 'Em análise').length;
    setPendingApprovalCount(count);
  };

  const handleReview = (record, pass) => {
    if (record.status === 'Em análise') {
      setSelectedActivity(record);
      setApprovalAction(pass);
      setRejectionReason(''); // Limpar motivo de rejeição ao abrir o modal
      setConfirmModalVisible(true);
    }
  };

  const handleApprove = (record) => {
    setSelectedActivity(record);
    setApprovalAction(true);
    setConfirmModalVisible(true);
  };

  const handleReject = (record) => {
    setSelectedActivity(record);
    setApprovalAction(false);
    setRejectionReason('');
    setConfirmModalVisible(true);
  };

  const handleConfirm = () => {
    if (selectedActivity && selectedActivity.certificate) {
      // Atualiza o status da atividade
      const updatedStatus = approvalAction ? 'Aprovado' : 'Rejeitado';
      const updatedActivity = {
        ...selectedActivity,
        status: updatedStatus,
        rejectionReason: approvalAction ? '' : rejectionReason,
      };
  
      // Atualiza a lista de atividades
      const updatedData = data.map((activity) =>
        activity.certificate === selectedActivity.certificate ? updatedActivity : activity
      );
  
      setData(updatedData);
  
      // Fecha o modal
      setConfirmModalVisible(false);
  
      // Loga o JSON atualizado após a confirmação
      console.log(`Atividade Atualizada:`, updatedActivity);
    }
  };

  const handleFilterRemove = (key) => {
    setFilteredInfo((prevFilters) => {
      const { [key]: removedFilter, ...restFilters } = prevFilters;
      return restFilters;
    });
  };

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const activeFilters = Object.entries(filteredInfo)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => (
      <Tag key={key} color="#108ee9" closable onClose={() => handleFilterRemove(key)}>
        {capitalizeFirstLetter(key)}: {value}
      </Tag>
    ));

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Hours',
      dataIndex: 'hours',
      key: 'hours',
    },
    {
      title: 'Certificate',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (certificate) => (
        <a href={certificate} target="_blank" rel="noopener noreferrer">
          {certificate}
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: statusOptions,
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Selecione o status"
            value={selectedKeys[0]}
            onSelect={(value) => {
              setSelectedKeys(value ? [value] : []);
              confirm({ closeDropdown: false });
            }}
          >
            {statusOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
          <Space>
            <Button
              onClick={() => {
                clearFilters();
                confirm({ closeDropdown: false });
              }}
              size="small"
              style={{ width: 90 }}
            >
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      render: (text) => (
        <span>
          <Tag color={text === 'Aprovado' ? 'green' : text === 'Rejeitado' ? 'red' : 'blue'}>{text}</Tag>
        </span>
      ),
    },
    {
      title: 'Ação',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => handleApprove(record)}
            style={{ backgroundColor: '#87d068', color: 'white' }}
          >
            Aprovar
          </Button>
          <Button
            type="danger"
            onClick={() => handleReject(record)}
            style={{ backgroundColor: '#ff4d4f', color: 'white' }}
          >
            Rejeitar
          </Button>
        </Space>
      ),
    },
  ];

  const handlePendingApprovalClick = () => {
    setSelectedButton('status');
    setFilteredInfo({ status: ['Em análise'] });
  };

  const { class: classFilter, name: nameFilter } = filteredInfo;
  const isAnyFilterApplied = Object.values(filteredInfo).some(Boolean);

  return (
    <Layout>
      <CustomHeader />
      <Content style={{ padding: '24px', backgroundColor: '#fff', marginTop: '40px', position: 'relative' }}>

        <div style={{ color: '#0f4abe', marginBottom: '24px' }}>
          <h1>Solicitações de Horas Complementares</h1>
        </div>
        <div style={{ textAlign: 'left', marginBottom: '16px', marginTop: '20px' }}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Button
                type="text"
                onClick={handlePendingApprovalClick}
                style={{
                  fontWeight: selectedButton === 'status' ? 'bold' : 'normal',
                  color: selectedButton === 'status' ? '#0f72be' : 'inherit',
                }}
              >
                <span>
                  Aguardando Aprovação ({pendingApprovalCount} pendentes)
                  {isAnyFilterApplied && (
                    <span style={{ marginLeft: '8px', color: '#1890ff' }}>
                      <SearchOutlined />
                    </span>
                  )}
                </span>
              </Button>
            </div>

            {showFilters && (
              <div style={{ marginLeft: '8px', display: 'flex', alignItems: 'center' }}>
                <Button type="text" onClick={handleFilterButtonClick}>
                  <FilterOutlined />
                </Button>
                {activeFilters}
              </div>
            )}

            {/* Adicionado o botão de filtro de volta */}
            {!showFilters && (
              <div style={{ marginLeft: '8px' }}>
                <Button type="text" onClick={handleFilterButtonClick}>
                  <FilterOutlined />
                </Button>
              </div>
            )}
          </Space>
        </div>

        <div style={{ borderBottom: '3px solid #ccc', marginBottom: '8px', position: 'relative' }}>
          <div
            style={{
              height: '4px',
              backgroundColor: '#0f72be',
              marginTop: '-2px',
              position: 'absolute',
              transition: 'width 0.3s ease',
            }}
          ></div>
        </div>

        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
          {/* Filter buttons */}
        </div>


        <Spin spinning={loading} tip="Loading...">
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowKey={(record) => record.certificate}
            onRow={(record) => ({
              onClick: () => {
                // Verifica se o modal de confirmação não está visível antes de enviar para o console
                if (!confirmModalVisible && record.status === 'Em análise') {
                  // Não há console.log aqui
                }
              },
            })}
          />
        </Spin>
        <Modal
          title={`Você tem certeza que deseja ${approvalAction ? 'aprovar' : 'reprovar'} esta atividade?`}
          visible={confirmModalVisible}
          onOk={handleConfirm}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Confirmar"
          cancelText="Cancelar"
        >
          {!approvalAction && (
            <div>
              <p>Motivo da Rejeição:</p>
              <Input.TextArea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
};

export default Inst;