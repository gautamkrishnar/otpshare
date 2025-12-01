import {
  ActionGroup,
  Alert,
  Button,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { useState } from 'react';
import * as Yup from 'yup';
import { useCreateUser, useDeleteUser, useUsers } from '../../../hooks/useUserQueries';
import type { CreateUserInput } from '../../../types';
import { FormikForm, FormikSelect, FormikTextInput } from '../../shared';
import { UserTable } from './UserTable';

const createUserSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be at most 50 characters'),
  role: Yup.string().required('Role is required').oneOf(['user', 'admin'], 'Invalid role'),
});

const deleteUserSchema = Yup.object({
  confirmText: Yup.string()
    .required('You must type DELETE to confirm')
    .matches(/^DELETE$/, 'You must type DELETE exactly'),
});

export const UserManagementTab = () => {
  const { data, isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: number;
    username: string;
    role: string;
  } | null>(null);

  const handleDeleteClick = (id: number, username: string, role: string) => {
    // Check if this is the last admin
    const adminCount = data?.users.filter((u) => u.role === 'admin').length || 0;

    if (role === 'admin' && adminCount <= 1) {
      return; // Don't allow deletion of last admin
    }

    setUserToDelete({ id, username, role });
    setIsDeleteModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardTitle>User Management</CardTitle>
        <CardBody>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                  Create User
                </Button>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Spinner size="xl" />
            </div>
          ) : error ? (
            <Alert variant="danger" title="Error loading users" />
          ) : data?.users.length === 0 ? (
            <div style={{ padding: '2rem' }}>
              <EmptyState variant="lg" titleText="No users found">
                <EmptyStateBody>
                  There are no users in the system. Click "Create User" to add your first user.
                </EmptyStateBody>
                <EmptyStateFooter>
                  <EmptyStateActions>
                    <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                      Create User
                    </Button>
                  </EmptyStateActions>
                </EmptyStateFooter>
              </EmptyState>
            </div>
          ) : (
            <UserTable users={data?.users ?? []} onDeleteClick={handleDeleteClick} />
          )}
        </CardBody>
      </Card>

      <FormikForm
        initialValues={{ username: '', password: '', role: 'user' } as CreateUserInput}
        validationSchema={createUserSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          createUser.mutate(values, {
            onSuccess: () => {
              setIsCreateModalOpen(false);
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
            title="Create User"
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          >
            <ModalBody>
              <FormikTextInput name="username" label="Username" type="text" isRequired />

              <FormikTextInput name="password" label="Password" type="password" isRequired />

              <FormikSelect
                name="role"
                label="Role"
                isRequired
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'admin', label: 'Admin' },
                ]}
              >
                {undefined}
              </FormikSelect>
            </ModalBody>
            <ModalFooter>
              <ActionGroup>
                <Button variant="primary" onClick={submitForm} isLoading={isSubmitting}>
                  Create
                </Button>
                <Button variant="link" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </ActionGroup>
            </ModalFooter>
          </Modal>
        )}
      </FormikForm>

      <FormikForm
        initialValues={{ confirmText: '' }}
        validationSchema={deleteUserSchema}
        onSubmit={async (_, { setSubmitting, resetForm }) => {
          if (userToDelete) {
            deleteUser.mutate(userToDelete.id, {
              onSuccess: () => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
                resetForm();
              },
              onSettled: () => {
                setSubmitting(false);
              },
            });
          }
        }}
      >
        {({ isSubmitting, submitForm }) => (
          <Modal
            variant={ModalVariant.small}
            title="Delete User"
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setUserToDelete(null);
            }}
          >
            <ModalBody>
              <p style={{ marginBottom: '1rem' }}>
                Are you sure you want to delete user <strong>{userToDelete?.username}</strong>? This
                action cannot be undone.
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
                  Delete
                </Button>
                <Button
                  variant="link"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setUserToDelete(null);
                  }}
                >
                  Cancel
                </Button>
              </ActionGroup>
            </ModalFooter>
          </Modal>
        )}
      </FormikForm>
    </>
  );
};
