import { Button, Checkbox, Label } from '@patternfly/react-core';
import { TrashIcon } from '@patternfly/react-icons';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import type { OTPWithUser } from '../../../types';

interface OTPTableProps {
  otps: OTPWithUser[];
  selectedOTPs: Set<number>;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOTP: (id: number, checked: boolean) => void;
  onMarkAsUsed: (id: number) => void;
  onDelete: (id: number) => void;
  isMarkingAsUsed: boolean;
  isDeleting: boolean;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

export const OTPTable = ({
  otps,
  selectedOTPs,
  isAllSelected,
  onSelectAll,
  onSelectOTP,
  onMarkAsUsed,
  onDelete,
  isMarkingAsUsed,
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
        <Th>Created At</Th>
        <Th>Used At</Th>
        <Th>Used By</Th>
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
          <Td>{formatDate(otp.created_at)}</Td>
          <Td>{formatDate(otp.used_at)}</Td>
          <Td>{otp.username || '-'}</Td>
          <Td>
            {otp.status === 'unused' && (
              <Button
                variant="warning"
                onClick={() => onMarkAsUsed(otp.id)}
                size="sm"
                isLoading={isMarkingAsUsed}
                style={{ marginRight: '0.5rem' }}
              >
                Mark as Used
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
