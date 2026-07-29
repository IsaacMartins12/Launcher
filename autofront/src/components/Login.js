import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from "../img/Logo_Otimize__4_-removebg-preview.png";
import {message} from 'antd';

const isLoginSuccessful = false;

const Login = () => {
  const navigate = useNavigate(); // Utiliza o hook useNavigate para redirecionamento
  const [isAluno, setIsAluno] = useState(false); // Estado para verificar se é um aluno

  const onFinish = (values) => {
    // Lógica de autenticação ou validação do login aqui
    const login = {
      "username" : values.username,
      "password" : values.password,
    }

    const jsonData = JSON.stringify(login);

    // Simulando um login bem sucedido
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Outros cabeçalhos, se necessário
      },
      body: jsonData
    };
    
    // Fazer a requisição usando fetch
    fetch("http://localhost:2500/login", options)
      .then(response => response.json())
      .then(data => {
        
        if (data.is_Logged == 1){
        const isLoginSuccessful = true;
        localStorage.setItem('token', data.token);
        message.success('Login feito com sucesso');

        if (!data.is_Admin) {
          // Verifica se o login foi feito pelo aluno (condição de exemplo)
          //if (values.username === 'aluno' && values.password === '123') {
            setIsAluno(true);
            // Redirecionamento para a página desejada após o login bem sucedido
            navigate('/aluno'); // Redireciona para '/aluno'
          } else {
            //navigate('/main'); // Redireciona para '/main' se não for aluno
            message.success('Você é um usuario admin');
            navigate('/inst'); // Redireciona para '/' se não for aluno
    
        }
      }
      else{
        console.log(data)
        message.error('Login não foi efetuado');
      }

      })
      .catch(error => {
        // Lógica a ser executada em caso de erro na requisição
        message.error('Erro no servidor');
        navigate('/inst');
      });

  };

  return (
    <div className="login-page">
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col xs={22} sm={16} md={12} lg={8} xl={7}>
          <div className="login-container" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>

            {/* Div adicionada para o título do login */}
            <div className="login-title">
              <strong style={{ paddingTop: '20px', paddingBottom: '20px', display: 'block' }}>Login</strong>
            </div>
            <Form name="basic" initialValues={{ remember: true }} onFinish={onFinish}>
              <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
                <Input prefix={<UserOutlined />} placeholder="Usuário" size="large" />
              </Form.Item>
              <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                <Input.Password prefix={<LockOutlined />} placeholder="Senha" size="large" />
              </Form.Item>
              <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 10 }}>
                <Checkbox style={{ fontSize: '14px', color: 'white', marginLeft: '-2px' }}>
                  Mantenha-me conectado
                </Checkbox>
                <a href="/forgot-password" style={{ fontSize: '14px', marginLeft: '22px' }}>Esqueceu a senha ?</a>
              </Form.Item>
              <Form.Item>
                <Button className='btn_login' type="primary" htmlType="submit" style={{ width: '50%', fontSize: '14px', height: '50px', borderRadius: '40px' }}>
                  Entrar
                </Button>
              </Form.Item>
              <Form.Item>
                <Link to="/cadastro" style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center' }}>
                  Cadastre-se <ArrowRightOutlined style={{ marginLeft: '5px' }} />
                </Link>
              </Form.Item>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
