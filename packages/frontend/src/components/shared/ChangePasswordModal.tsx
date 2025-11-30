import {
  Alert,
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
} from '@patternfly/react-core';
import type { FormikProps } from 'formik';
import { useRef, useState } from 'react';
import * as Yup from 'yup';
import { FormikForm, FormikTextInput } from './index';
import { useChangePassword } from '../../hooks/useAuthQueries';

const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters long')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const formRef = useRef<FormikProps<FormValues>>(null);
  const changePassword = useChangePassword();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: FormValues) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await changePassword.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSuccessMessage('Password changed successfully!');
      formRef.current?.resetForm();

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1500);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      setErrorMessage(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleClose = () => {
    formRef.current?.resetForm();
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  return (
    <Modal
      variant={ModalVariant.small}
      title="Change Password"
      isOpen={isOpen}
      onClose={handleClose}
    >
      <ModalBody>
        {successMessage && <Alert variant="success" title={successMessage} isInline />}
        {errorMessage && <Alert variant="danger" title={errorMessage} isInline />}

        <FormikForm
          innerRef={formRef}
          initialValues={{
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={changePasswordSchema}
          onSubmit={handleSubmit}
        >
          <FormikTextInput
            label="Current Password"
            name="currentPassword"
            type="password"
            isRequired
          />
          <FormikTextInput
            label="New Password"
            name="newPassword"
            type="password"
            isRequired
          />
          <FormikTextInput
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            isRequired
          />
        </FormikForm>
      </ModalBody>
      <ModalFooter>
        <Button
          variant="primary"
          onClick={() => formRef.current?.submitForm()}
          isLoading={changePassword.isPending}
          isDisabled={successMessage !== null}
        >
          Change Password
        </Button>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
