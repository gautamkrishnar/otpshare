import { ActionGroup, Alert, Brand, Button, Card, CardBody, Spinner } from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { useCheckAdminExists, useCreateInitialAdmin } from '../../hooks/useAuthQueries';
import { authAPI } from '../../services/api';
import { FormikForm, FormikTextInput } from '../shared';
import { ThemeToggle } from '../shared/ThemeToggle.tsx';
import styles from './LoginPage.module.scss';

const loginSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { data: adminCheck, isLoading: isCheckingAdmin } = useCheckAdminExists();
  const createInitialAdmin = useCreateInitialAdmin();

  if (isCheckingAdmin) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginPage__themeToggleWrapper}>
          <ThemeToggle />
        </div>
        <div className={styles.loginPage__container}>
          <Card className={styles.loginPage__card}>
            <CardBody className={styles.loginPage__cardBody}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <Spinner size="xl" />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  const hasAdmin = adminCheck?.hasAdmin ?? true;

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginPage__themeToggleWrapper}>
        <ThemeToggle />
      </div>
      <div className={styles.loginPage__container}>
        <Card className={styles.loginPage__card}>
          <CardBody className={styles.loginPage__cardBody}>
            <div className={styles.loginPage__logoWrapper}>
              <Brand src="/otp-logo.svg" alt="OTP Manager" heights={{ default: '80px' }} />
              <h1 className={styles.loginPage__title}>OTP Manager</h1>
            </div>

            {!hasAdmin ? (
              <>
                <Alert
                  variant="info"
                  title="Welcome! Create your admin account"
                  isInline
                  className={styles.loginPage__alert}
                >
                  No admin user exists. Please create an admin account to get started.
                </Alert>
                <FormikForm
                  initialValues={{ username: '', password: '' }}
                  validationSchema={loginSchema}
                  onSubmit={async (values, { setSubmitting, setStatus }) => {
                    setStatus(null);
                    try {
                      const response = await createInitialAdmin.mutateAsync({
                        username: values.username,
                        password: values.password,
                      });
                      login(response.user, response.token);
                      navigate('/admin');
                    } catch (err: unknown) {
                      const error = err as { response?: { data?: { error?: string } } };
                      setStatus({
                        error: error.response?.data?.error || 'Failed to create admin account',
                      });
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({ isSubmitting, status }) => (
                    <>
                      {status?.error && (
                        <Alert
                          variant="danger"
                          title={status.error}
                          isInline
                          className={styles.loginPage__alert}
                        />
                      )}

                      <FormikTextInput
                        name="username"
                        label="Admin Username"
                        type="text"
                        isRequired
                      />

                      <FormikTextInput
                        name="password"
                        label="Admin Password"
                        type="password"
                        isRequired
                      />

                      <ActionGroup>
                        <Button variant="primary" type="submit" isBlock isLoading={isSubmitting}>
                          Create Admin Account
                        </Button>
                      </ActionGroup>
                    </>
                  )}
                </FormikForm>
              </>
            ) : (
              <FormikForm
                initialValues={{ username: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={async (values, { setSubmitting, setStatus }) => {
                  setStatus(null);
                  try {
                    const response = await authAPI.login(values.username, values.password);
                    login(response.user, response.token);
                    navigate(response.user.role === 'admin' ? '/admin' : '/dashboard');
                  } catch {
                    setStatus({ error: 'Invalid username or password' });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, status }) => (
                  <>
                    {status?.error && (
                      <Alert
                        variant="danger"
                        title={status.error}
                        isInline
                        className={styles.loginPage__alert}
                      />
                    )}

                    <FormikTextInput name="username" label="Username" type="text" isRequired />

                    <FormikTextInput name="password" label="Password" type="password" isRequired />

                    <ActionGroup>
                      <Button variant="primary" type="submit" isBlock isLoading={isSubmitting}>
                        Login
                      </Button>
                    </ActionGroup>
                  </>
                )}
              </FormikForm>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
