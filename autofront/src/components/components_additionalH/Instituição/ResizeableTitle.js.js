import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Table, Tag, Input, Modal, Select } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import CustomHeader from '../Header_additionalH';
import CertificateList from '../Alunos/CertificateList';

const { Content } = Layout;

const Inst = () => {
  const [submittedActivities, setSubmittedActivities] = useState([]);
  const [selectedButton, setSelectedButton] = useState('status');
  const [filteredInfo, setFilteredInfo] = useState({});
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [approvalAction, setApprovalAction] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
    const fakeData = [
      {
        key: '1',
        name: 'Thaissa Sarmento',
        class: 'Turma A',
        title: 'Workshop de Gerenciamento de Tempo',
        type: 'Workshop',
        hours: 10,
        certificate: [{ uid: '1', name: 'certificate1.pdf' }],
        status: 'Em análise',
      },
      {
        key: '2',
        name: 'Isaac Martins',
        class: 'Turma B',
        title: 'Curso de Desenvolvimento Web',
        type: 'Curso',
        hours: 20,
        certificate: [{ uid: '2', name: 'certificate2.pdf' }],
        status: 'Em análise',
      },
      {
        key: '3',
        name: 'Sandoval Marques',
        class: 'Turma C',
        title: 'Python para Iniciantes',
        type: 'Curso',
        hours: 40,
        certificate: [{ uid: '3', name: 'certificate3.pdf' }],
        status: 'Em análise',
      },
    ];

    setSubmittedActivities(fakeData);
    updatePendingApprovalCount(fakeData);
  }, []);

  const handleFilterButtonClick = () => {
    setShowFilters(!showFilters);
  };

  const updatePendingApprovalCount = (activities) => {
    const count = activities.filter(activity => activity.status.toLowerCase() === 'em análise').length;
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

  const handleConfirm = () => {
    setConfirmModalVisible(false);

    if (selectedActivity && selectedActivity.status === 'Em análise') {
      const updatedActivities = submittedActivities.map((activity) => {
        if (activity.key === selectedActivity.key) {
          return {
            ...activity,
            status: approvalAction ? 'Aprovado' : 'Rejeitado',
            rejectionReason: approvalAction ? '' : rejectionReason,
          };
        }
        return activity;
      });

      console.log('Atividade revisada:', {
        key: selectedActivity.key,
        name: selectedActivity.name,
        status: approvalAction ? 'Aprovado' : 'Rejeitado',
      });

      if (approvalAction) {
        updatePendingApprovalCount(updatedActivities);
      }

      setSubmittedActivities(updatedActivities);
    }
  };

  const handleChange = (pagination, filters) => {
    setFilteredInfo(filters);
  };

  const clearFilters = () => {
    setFilteredInfo({});
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

  const handlePendingApprovalClick = () => {
    setSelectedButton('status');
    setFilteredInfo({ status: ['Em análise'] });
  };

  const statusOptions = [
    { label: 'Em andamento', value: 'Em análise' },
    { label: 'Aprovado', value: 'Aprovado' },
    { label: 'Rejeitado', value: 'Rejeitado' },
  ];

  const { class: classFilter, name: nameFilter } = filteredInfo;
  const isAnyFilterApplied = Object.values(filteredInfo).some(Boolean);

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      filteredValue: nameFilter || null,
      onFilter: (value, record) => record.name.includes(value),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Filtrar por nome`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filtrar
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
    },
    {
      title: 'Turma',
      dataIndex: 'class',
      key: 'class',
      filters: [
        { text: 'Turma A', value: 'Turma A' },
        { text: 'Turma B', value: 'Turma B' },
        { text: 'Turma C', value: 'Turma C' },
      ],
      filteredValue: classFilter || null,
      onFilter: (value, record) => record.class.includes(value),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Filtrar por turma`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Filtrar
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Limpar
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
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
    },
    {
      title: 'Comprovante',
      dataIndex: 'certificate',
      key: 'certificate',
      render: (text, record) => (
        <CertificateList fileList={record.certificate} />
      ),
    },
    {
      title: 'Ação',
      key: 'action',
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleReview(record, true)} style={{ backgroundColor: '#87d068', color: 'white' }}>
            Aprovar
          </Button>
          <Button type="danger" onClick={() => handleReview(record, false)} style={{ backgroundColor: '#ff4d4f', color: 'white' }}>
            Rejeitar
          </Button>
        </Space>
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
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
  
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <Table
            dataSource={submittedActivities}
            columns={columns}
            pagination={false}
            scroll={{ x: 'max-content' }}
            onChange={handleChange}
            rowKey="key"
          />
        </div>
        <Modal
          title={`Confirmação de ${approvalAction ? 'Aprovação' : 'Reprovação'}`}
          visible={confirmModalVisible}
          onOk={handleConfirm}
          onCancel={() => setConfirmModalVisible(false)}
          okText="Confirmar"
          cancelText="Cancelar"
        >
          <p>Você tem certeza que deseja {approvalAction ? 'aprovar' : 'reprovar'} esta atividade?</p>
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