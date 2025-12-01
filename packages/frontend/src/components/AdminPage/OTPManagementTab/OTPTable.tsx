import { Button, Checkbox, Label } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { format } from 'timeago.js';
import type { OTPWithUser } from '../../../types';

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
  <Table variant="compact">
    <Thead>
      <Tr>
        <Th>
          <Checkbox
            id="select-all"
            isChecked={isAllSelected}
            onChange={(_event, checked) => onSelectAll(checked)}
            aria-label="Select all OTPs"
          />
        </Th>
        <Th>Code</Th>
        <Th>Status</Th>
        <Th>Created</Th>
        <Th>Used</Th>
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
          <Td>
            {otp.status === 'unused' ? (
              <Button
                variant="warning"
                onClick={() => onMarkAsUsed(otp.id)}
                size="sm"
                isLoading={isMarkingAsUsed}
                style={{ marginRight: '0.5rem' }}
              >
                Mark as Used
              </Button>
            ) : (
              <Button
                variant="warning"
                onClick={() => onMarkAsUnused(otp.id)}
                size="sm"
                isLoading={isMarkingAsUnused}
                style={{ marginRight: '0.5rem' }}
              >
                Mark as Unused
              </Button>
            )}
            <Button
              variant="danger"
              icon={<TrashIcon />}
              onClick={() => onDelete(otp.id)}
              size="sm"
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </Td>
        </Tr>
      ))}
    </Tbody>
  </Table>
);
