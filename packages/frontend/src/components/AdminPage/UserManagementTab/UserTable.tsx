import { Button, Label, Card, CardBody, Flex, FlexItem } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { format } from 'timeago.js';
import type { UserData } from '../../../types';
import styles from './UserTable.module.scss';

interface UserTableProps {
  users: UserData[];
  onDeleteClick: (id: number, username: string, role: string) => void;
}

const formatDate = (dateString: string) => {
  return format(dateString);
};

export const UserTable = ({ users, onDeleteClick }: UserTableProps) => {
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <>
      {/* Desktop Table View */}
      <div className={styles.desktopView}>
        <Table variant="compact">
          <Thead>
            <Tr>
              <Th>Username</Th>
              <Th>Role</Th>
              <Th>Created At</Th>
              <Th>Updated At</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => {
              const isLastAdmin = user.role === 'admin' && adminCount <= 1;

              return (
                <Tr key={user.id}>
                  <Td>{user.username}</Td>
                  <Td>
                    <Label isCompact color={user.role === 'admin' ? 'blue' : 'grey'}>
                      {user.role}
                    </Label>
                  </Td>
                  <Td>{formatDate(user.created_at)}</Td>
                  <Td>{formatDate(user.updated_at)}</Td>
                  <Td modifier="nowrap">
                    <Button
                      variant="danger"
                      icon={<TrashIcon />}
                      onClick={() => onDeleteClick(user.id, user.username, user.role)}
                      size="sm"
                      isDisabled={isLastAdmin}
                    >
                      Delete
                    </Button>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileView}>
        {users.map((user) => {
          const isLastAdmin = user.role === 'admin' && adminCount <= 1;

          return (
            <Card key={user.id} isCompact className={styles.mobileCard}>
              <CardBody>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem flex={{ default: 'flex_1' }}>
                        <strong className={styles.username}>{user.username}</strong>
                      </FlexItem>
                      <FlexItem>
                        <Label isCompact color={user.role === 'admin' ? 'blue' : 'grey'}>
                          {user.role}
                        </Label>
                      </FlexItem>
                    </Flex>
                  </FlexItem>

                  <FlexItem>
                    <div className={styles.mobileInfo}>
                      <div>
                        <small className={styles.mobileLabel}>Created:</small>
                        <div>{formatDate(user.created_at)}</div>
                      </div>
                      <div>
                        <small className={styles.mobileLabel}>Updated:</small>
                        <div>{formatDate(user.updated_at)}</div>
                      </div>
                    </div>
                  </FlexItem>

                  <FlexItem>
                    <Button
                      variant="danger"
                      icon={<TrashIcon />}
                      onClick={() => onDeleteClick(user.id, user.username, user.role)}
                      isDisabled={isLastAdmin}
                      isBlock
                    >
                      Delete
                    </Button>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </>
  );
};
