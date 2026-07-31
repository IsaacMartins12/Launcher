import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:2500/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: values.username, password: values.password }),
      });
      const data = await response.json();

      if (data.is_Logged) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('is_admin', data.is_Admin ? 'true' : 'false');
        message.success('Login realizado com sucesso!');
        navigate(data.is_Admin ? '/inst' : '/aluno');
      } else {
        message.error('Credenciais inválidas');
      }
    } catch (error) {
      message.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Left side - branding */}
        <div style={styles.brandingSide}>
          <div style={styles.brandingContent}>
            <div style={styles.logoIcon}>📚</div>
            <h1 style={styles.brandTitle}>Horas Complementares</h1>
            <p style={styles.brandSubtitle}>
              Gerencie suas atividades extracurriculares de forma simples e organizada.
            </p>
            <div style={styles.features}>
              <div style={styles.feature}>✓ Envie certificados</div>
              <div style={styles.feature}>✓ Acompanhe aprovações</div>
              <div style={styles.feature}>✓ Controle seu progresso</div>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <div style={styles.formSide}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Entrar</h2>
            <p style={styles.formSubtitle}>Acesse sua conta para continuar</p>

            <Form name="login" onFinish={onFinish} layout="vertical" size="large">
              <Form.Item
                name="username"
                rules={[{ required: true, message: 'Informe sua matrícula' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bbb' }} />}
                  placeholder="Matrícula ou usuário"
                  style={styles.input}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Informe sua senha' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bbb' }} />}
                  placeholder="Senha"
                  style={styles.input}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={styles.submitButton}
                >
                  Entrar
                </Button>
              </Form.Item>
            </Form>

            <div style={styles.footer}>
              <span style={{ color: '#888', fontSize: '13px' }}>
                Sistema de Horas Complementares
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '900px',
    minHeight: '500px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  },
  brandingSide: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  brandingContent: {
    color: '#fff',
    textAlign: 'center',
  },
  logoIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  brandTitle: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#fff',
  },
  brandSubtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  features: {
    textAlign: 'left',
    display: 'inline-block',
  },
  feature: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '13px',
    marginBottom: '8px',
    paddingLeft: '4px',
  },
  formSide: {
    flex: 1,
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
  },
  formContainer: {
    width: '100%',
    maxWidth: '320px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#888',
    marginBottom: '32px',
  },
  input: {
    borderRadius: '8px',
    height: '48px',
  },
  submitButton: {
    height: '48px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 600,
    backgroundColor: '#1a1a2e',
    borderColor: '#1a1a2e',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
  },
};

export default Login;
