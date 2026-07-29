import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Select, Alert, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, ReadOutlined } from '@ant-design/icons';
import '../components_css/Cadastro.css';

const { Option } = Select;

const Cadastro = () => {
  const [turmaDisabled, setTurmaDisabled] = useState(true);
  const [passwordP, setPasswordP] = useState('');
  const [passwordS, setPasswordS] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [turmaError, setTurmaError] = useState(false);

  const onFinish = async (values) => {
    const jsonData = JSON.stringify(values);
    console.log('Form Values:', values);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: jsonData
    };

    try {
      const response = await fetch("http://localhost:2500/cadastro", options);
      const data = await response.json();

      console.log('Cadastro Response:', data);

      if (data.success) {
        message.success('Cadastro feito com sucesso');
        // Adicione aqui qualquer lógica adicional após o cadastro bem-sucedido
      } else {
        message.error('Erro ao cadastrar. Por favor, tente novamente.');
      }
    } catch (error) {
      message.error('Erro no servidor. Por favor, tente novamente.');
      console.error('Erro:', error);
    }
  };

  const handleInstituicaoChange = (value) => {
    setTurmaDisabled(!value);
    setPasswordError(false);
    setTurmaError(false);
  };

  const handlePasswordChange = (value, field) => {
    if (field === 'passwordP') {
      setPasswordP(value);
    } else if (field === 'passwordS') {
      setPasswordS(value);
    }

    if (field === 'passwordP') {
      setPasswordError(value !== passwordS && passwordS !== '');
    } else if (field === 'passwordS') {
      setPasswordError(value !== passwordP && passwordP !== '');
    }
  };

  const handleTurmaChange = (value) => {
    setTurmaError(turmaDisabled && !value);
  };

  return (
    <div>
      <Row justify="center" align="middle" style={{ height: '100vh' }}>
        <Col span={7}>
          <div className="cadastro-container" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="cadastro-title">
              <strong style={{ paddingTop: '20px', paddingBottom: '20px', display: 'block' }}>Cadastro</strong>
            </div>
            {passwordError && (
              <Alert message="As senhas não coincidem. Por favor, insira senhas iguais." type="error" showIcon style={{ marginBottom: '16px' }} />
            )}
            {turmaError && (
              <Alert message="Por favor, selecione uma turma." type="error" showIcon style={{ marginBottom: '16px' }} />
            )}
            <Form name="basic" initialValues={{ remember: true }} onFinish={onFinish}>
              <Form.Item
                name="usernameP"
                rules={[{ required: true, message: 'Por favor, insira o nome de usuário!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Usuário" size="large" />
              </Form.Item>
              <Form.Item
                name="passwordP"
                rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Senha"
                  size="large"
                  onChange={(e) => handlePasswordChange(e.target.value, 'passwordP')}
                />
              </Form.Item>
              <Form.Item
                name="passwordS"
                rules={[{ required: true, message: 'Por favor, insira sua senha!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirme sua senha"
                  size="large"
                  onChange={(e) => handlePasswordChange(e.target.value, 'passwordS')}
                />
              </Form.Item>
              <Col span={24}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Por favor, insira seu e-mail!' },
                    { type: 'email', message: 'Por favor, insira um e-mail válido!' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="E-mail" size="large" />
                </Form.Item>
              </Col>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item
                    name="instituicao"
                    rules={[{ required: true, message: 'Por favor, selecione a instituição!' }]}
                  >
                    <Select
                      placeholder="Instituição"
                      size="large"
                      onChange={() => handleInstituicaoChange(true)}
                      allowClear
                      suffixIcon={<ReadOutlined />}
                      style={{ width: '100%' }}
                    >
                      <Option value="instituicaoA">Instituição A</Option>
                      <Option value="instituicaoB">Instituição B</Option>
                      {/* Adicione mais opções conforme necessário */}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="turma"
                    rules={[
                      { required: !turmaDisabled, message: 'Por favor, selecione a turma!' },
                    ]}
                  >
                    <Select
                      placeholder="Turma"
                      size="large"
                      disabled={turmaDisabled}
                      suffixIcon={<TeamOutlined />}
                      className={turmaDisabled ? 'turma-disabled' : ''}
                      style={{ width: '100%', opacity: turmaDisabled ? 0.5 : 1 }}
                      onChange={handleTurmaChange}
                    >
                      <Option value="turmaA">Turma A</Option>
                      <Option value="turmaB">Turma B</Option>
                      {/* Adicione mais opções conforme necessário */}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24} style={{ textAlign: 'center' }}>
                  <Form.Item>
                    <Button className="btn_cadastro" type="primary" htmlType="submit" style={{ width: '70%', fontSize: '14px', height: '50px', borderRadius: '40px' }}>
                      Cadastrar
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Cadastro;
