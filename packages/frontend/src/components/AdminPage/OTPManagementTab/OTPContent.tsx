import {
  Alert,
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Spinner,
} from '@patternfly/react-core';
import type { OTPWithUser } from '../../../types';
import { OTPTable } from './OTPTable.tsx';

interface OTPContentProps {
  isLoading: boolean;
  error: unknown;
  otps: OTPWithUser[] | undefined;
  searchTerm: string;
  selectedOTPs: Set<number>;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOTP: (id: number, checked: boolean) => void;
  onMarkAsUsed: (id: number) => void;
  onMarkAsUnused: (id: number) => void;
  onDelete: (id: number) => void;
  onImportClick: () => void;
  isMarkingAsUsed: boolean;
  isMarkingAsUnused: boolean;
  isDeleting: boolean;
}

export const OTPContent = ({
  isLoading,
  error,
  otps,
  searchTerm,
  selectedOTPs,
  isAllSelected,
  onSelectAll,
  onSelectOTP,
  onMarkAsUsed,
  onMarkAsUnused,
  onDelete,
  onImportClick,
  isMarkingAsUsed,
  isMarkingAsUnused,
  isDeleting,
}: OTPContentProps) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger" title="Error loading OTPs" />;
  }

  if (!otps || otps.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <EmptyState variant="lg" titleText={searchTerm ? 'No results found' : 'No OTPs available'}>
          <EmptyStateBody>
            {searchTerm
              ? 'No OTPs match your search criteria. Try adjusting your filters or search term.'
              : 'There are no OTPs in the system. Click "Import OTPs" to add codes.'}
          </EmptyStateBody>
          {!searchTerm && (
            <EmptyStateFooter>
              <EmptyStateActions>
                <Button variant="primary" onClick={onImportClick}>
                  Import OTPs
                </Button>
              </EmptyStateActions>
            </EmptyStateFooter>
          )}
        </EmptyState>
      </div>
    );
  }

  return (
    <OTPTable
      otps={otps}
      selectedOTPs={selectedOTPs}
      isAllSelected={isAllSelected}
      onSelectAll={onSelectAll}
      onSelectOTP={onSelectOTP}
      onMarkAsUsed={onMarkAsUsed}
      onMarkAsUnused={onMarkAsUnused}
      onDelete={onDelete}
      isMarkingAsUsed={isMarkingAsUsed}
      isMarkingAsUnused={isMarkingAsUnused}
      isDeleting={isDeleting}
    />
  );
};
