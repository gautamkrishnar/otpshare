import { Button, Checkbox, Label, Card, CardBody, Flex, FlexItem } from '@patternfly/react-core';
import { TrashIcon, CheckCircleIcon, UndoIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { format } from 'timeago.js';
import type { OTPWithUser } from '../../../types';
import styles from './OTPTable.module.scss';

interface OTPTableProps {
  otps: OTPWithUser[];
  selectedOTPs: Set<number>;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOTP: (id: number, checked: boolean) => void;
  onMarkAsUsed: (id: number) => void;
  onMarkAsUnused: (id: number) => void;
  onDelete: (id: number) => void;
  isMarkingAsUsed: boolean;
  isMarkingAsUnused: boolean;
  isDeleting: boolean;
}

const formatDateWithUser = (dateString: string | null, username?: string) => {
  if (!dateString) return '-';
  const timeAgo = format(dateString);
  return username ? `${timeAgo} by ${username}` : timeAgo;
};

export const OTPTable = ({
  otps,
  selectedOTPs,
  isAllSelected,
  onSelectAll,
  onSelectOTP,
  onMarkAsUsed,
  onMarkAsUnused,
  onDelete,
  isMarkingAsUsed,
  isMarkingAsUnused,
  isDeleting,
}: OTPTableProps) => (
  <>
    {/* Desktop Table View */}
    <div className={styles.desktopView}>
      <Table variant="compact">
        <Thead>
          <Tr>
            <Th width={10}>
              <Checkbox
                id="select-all"
                isChecked={isAllSelected}
                onChange={(_event, checked) => onSelectAll(checked)}
                aria-label="Select all OTPs"
              />
            </Th>
            <Th width={15}>Code</Th>
            <Th width={15}>Status</Th>
            <Th width={30}>Created</Th>
            <Th width={30}>Used</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {otps.map((otp) => (
            <Tr key={otp.id}>
              <Td>
                <Checkbox
                  id={`select-${otp.id}`}
                  isChecked={selectedOTPs.has(otp.id)}
                  onChange={(_event, checked) => onSelectOTP(otp.id, checked)}
                  aria-label={`Select OTP ${otp.code}`}
                />
              </Td>
              <Td>{otp.code}</Td>
              <Td>
                <Label isCompact color={otp.status === 'used' ? 'green' : 'grey'}>
                  {otp.status}
                </Label>
              </Td>
              <Td>{formatDateWithUser(otp.created_at, otp.createdByUsername)}</Td>
              <Td>{formatDateWithUser(otp.used_at, otp.usedByUsername)}</Td>
              <Td modifier="nowrap">
                <div className={styles.actionButtons}>
                  {otp.status === 'unused' ? (
                    <Button
                      variant="warning"
                      onClick={() => onMarkAsUsed(otp.id)}
                      size="sm"
                      isLoading={isMarkingAsUsed}
                      icon={<CheckCircleIcon />}
                      aria-label="Mark as used"
                    />
                  ) : (
                    <Button
                      variant="warning"
                      onClick={() => onMarkAsUnused(otp.id)}
                      size="sm"
                      isLoading={isMarkingAsUnused}
                      icon={<UndoIcon />}
                      aria-label="Mark as unused"
                    />
                  )}
                  <Button
                    variant="danger"
                    icon={<TrashIcon />}
                    onClick={() => onDelete(otp.id)}
                    size="sm"
                    isLoading={isDeleting}
                    aria-label="Delete"
                  />
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>

    {/* Mobile Card View */}
    <div className={styles.mobileView}>
      {otps.map((otp) => (
        <Card key={otp.id} isCompact className={styles.mobileCard}>
          <CardBody>
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <FlexItem>
                    <Checkbox
                      id={`select-mobile-${otp.id}`}
                      isChecked={selectedOTPs.has(otp.id)}
                      onChange={(_event, checked) => onSelectOTP(otp.id, checked)}
                      aria-label={`Select OTP ${otp.code}`}
                    />
                  </FlexItem>
                  <FlexItem flex={{ default: 'flex_1' }}>
                    <strong className={styles.otpCode}>{otp.code}</strong>
                  </FlexItem>
                  <FlexItem>
                    <Label isCompact color={otp.status === 'used' ? 'green' : 'grey'}>
                      {otp.status}
                    </Label>
                  </FlexItem>
                </Flex>
              </FlexItem>

              <FlexItem>
                <div className={styles.mobileInfo}>
                  <div>
                    <small className={styles.mobileLabel}>Created:</small>
                    <div>{formatDateWithUser(otp.created_at, otp.createdByUsername)}</div>
                  </div>
                  {otp.used_at && (
                    <div>
                      <small className={styles.mobileLabel}>Used:</small>
                      <div>{formatDateWithUser(otp.used_at, otp.usedByUsername)}</div>
                    </div>
                  )}
                </div>
              </FlexItem>

              <FlexItem>
                <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                  {otp.status === 'unused' ? (
                    <FlexItem>
                      <Button
                        variant="warning"
                        onClick={() => onMarkAsUsed(otp.id)}
                        isLoading={isMarkingAsUsed}
                        icon={<CheckCircleIcon />}
                        aria-label="Mark as used"
                      />
                    </FlexItem>
                  ) : (
                    <FlexItem>
                      <Button
                        variant="warning"
                        onClick={() => onMarkAsUnused(otp.id)}
                        isLoading={isMarkingAsUnused}
                        icon={<UndoIcon />}
                        aria-label="Mark as unused"
                      />
                    </FlexItem>
                  )}
                  <FlexItem>
                    <Button
                      variant="danger"
                      icon={<TrashIcon />}
                      onClick={() => onDelete(otp.id)}
                      isLoading={isDeleting}
                      aria-label="Delete"
                    />
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </div>
  </>
);
