import {
  ActionGroup,
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Spinner,
  TextInput,
} from '@patternfly/react-core';
import { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../../../hooks/useSettingsQueries';

export const SettingsTab = () => {
  const { data, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();

  const [jwtExpirationHours, setJwtExpirationHours] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState('');

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
      }
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
              <FormGroup
                label="JWT Token Expiration (hours)"
                isRequired
                fieldId="jwt-expiration"
              >
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
                />
                <div id="jwt-expiration-helper" style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: validationError ? 'var(--pf-v5-global--danger-color--100)' : 'var(--pf-v5-global--Color--200)' }}>
                  {validationError || 'Duration in hours before JWT tokens expire. Users will need to log in again after this period.'}
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
          </>
        )}
      </CardBody>
    </Card>
  );
};
