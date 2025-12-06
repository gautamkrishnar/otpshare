import {
  ActionGroup,
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Divider,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useDeleteAllOTPs } from '../../../hooks/useOTPQueries';
import { useSettings, useUpdateSettings } from '../../../hooks/useSettingsQueries';
import { FormikForm, FormikTextInput } from '../../shared';
import styles from './SettingsTab.module.scss';

const deleteConfirmationSchema = Yup.object({
  confirmText: Yup.string()
    .required('You must type DELETE to confirm')
    .matches(/^DELETE$/, 'You must type DELETE exactly'),
});

export const SettingsTab = () => {
  const { data, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();
  const deleteAllOTPs = useDeleteAllOTPs();

  const [jwtExpirationHours, setJwtExpirationHours] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (data?.settings?.jwt_expiration_hours) {
      setJwtExpirationHours(data.settings.jwt_expiration_hours);
    }
  }, [data]);

  const handleJwtExpirationChange = (value: string) => {
    setJwtExpirationHours(value);
    setHasChanges(true);

    // Validate input
    const hours = Number.parseInt(value, 10);
    if (value === '' || Number.isNaN(hours) || hours <= 0) {
      setValidationError('JWT expiration must be a positive number');
    } else {
      setValidationError('');
    }
  };

  const handleSave = () => {
    const hours = Number.parseInt(jwtExpirationHours, 10);
    if (Number.isNaN(hours) || hours <= 0) {
      setValidationError('JWT expiration must be a positive number');
      return;
    }

    updateSettings.mutate(
      {
        jwt_expiration_hours: jwtExpirationHours,
      },
      {
        onSuccess: () => {
          setHasChanges(false);
          setValidationError('');
        },
      },
    );
  };

  const handleReset = () => {
    if (data?.settings?.jwt_expiration_hours) {
      setJwtExpirationHours(data.settings.jwt_expiration_hours);
    }
    setHasChanges(false);
    setValidationError('');
  };

  return (
    <Card>
      <CardTitle>Settings</CardTitle>
      <CardBody>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Spinner size="xl" />
          </div>
        ) : error ? (
          <Alert variant="danger" title="Error loading settings" />
        ) : (
          <>
            {updateSettings.isSuccess && !hasChanges && (
              <Alert
                variant="success"
                title="Settings updated successfully"
                style={{ marginBottom: '1rem' }}
                isInline
              />
            )}
            {updateSettings.isError && (
              <Alert
                variant="danger"
                title="Error updating settings"
                style={{ marginBottom: '1rem' }}
                isInline
              />
            )}

            <Form>
              <FormGroup label="JWT Token Expiration (hours)" isRequired fieldId="jwt-expiration">
                <TextInput
                  isRequired
                  type="number"
                  id="jwt-expiration"
                  name="jwt-expiration"
                  value={jwtExpirationHours}
                  onChange={(_event, value) => handleJwtExpirationChange(value)}
                  validated={validationError ? 'error' : 'default'}
                  min={1}
                  aria-describedby="jwt-expiration-helper"
                  className={styles.jwtExpirationInput}
                />
                <div
                  id="jwt-expiration-helper"
                  style={{
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                    color: validationError
                      ? 'var(--pf-v5-global--danger-color--100)'
                      : 'var(--pf-v5-global--Color--200)',
                  }}
                >
                  {validationError ||
                    'Duration in hours before JWT tokens expire. Users will need to log in again after this period.'}
                </div>
              </FormGroup>

              <ActionGroup>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isDisabled={!hasChanges || !!validationError || updateSettings.isPending}
                  isLoading={updateSettings.isPending}
                >
                  Save Settings
                </Button>
                <Button
                  variant="link"
                  onClick={handleReset}
                  isDisabled={!hasChanges || updateSettings.isPending}
                >
                  Reset
                </Button>
              </ActionGroup>
            </Form>

            <Divider style={{ margin: '2rem 0' }} />

            <div>
              <h3 style={{ marginBottom: '1rem' }}>Danger Zone</h3>
              <Card
                isCompact
                style={{ border: '1px solid var(--pf-v5-global--danger-color--100)' }}
              >
                <CardBody>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>Delete All OTPs</strong>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        Permanently delete all OTP codes from the database. This action cannot be
                        undone.
                      </div>
                    </div>
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                      Delete All OTPs
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}
      </CardBody>

      <FormikForm
        initialValues={{ confirmText: '' }}
        validationSchema={deleteConfirmationSchema}
        onSubmit={async (_, { setSubmitting, resetForm }) => {
          deleteAllOTPs.mutate(undefined, {
            onSuccess: () => {
              setIsDeleteModalOpen(false);
              resetForm();
            },
            onSettled: () => {
              setSubmitting(false);
            },
          });
        }}
      >
        {({ isSubmitting, submitForm }) => (
          <Modal
            variant={ModalVariant.small}
            title="Delete All OTPs"
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <ModalBody>
              {deleteAllOTPs.isSuccess && (
                <Alert
                  variant="success"
                  title="All OTPs deleted successfully"
                  style={{ marginBottom: '1rem' }}
                  isInline
                />
              )}
              {deleteAllOTPs.isError && (
                <Alert
                  variant="danger"
                  title="Error deleting OTPs"
                  style={{ marginBottom: '1rem' }}
                  isInline
                />
              )}
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to delete <strong>all OTP codes</strong>? This action cannot
                be undone and will permanently remove all OTPs from the database.
              </p>
              <FormikTextInput
                name="confirmText"
                label="Type DELETE to confirm"
                type="text"
                placeholder="DELETE"
                isRequired
              />
            </ModalBody>
            <ModalFooter>
              <ActionGroup>
                <Button variant="danger" onClick={submitForm} isLoading={isSubmitting}>
                  Delete All OTPs
                </Button>
                <Button variant="link" onClick={() => setIsDeleteModalOpen(false)}>
                  Cancel
                </Button>
              </ActionGroup>
            </ModalFooter>
          </Modal>
        )}
      </FormikForm>
    </Card>
  );
};
