import {
  Button,
  Label,
  LabelGroup,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';

interface OTPToolbarProps {
  selectedCount: number;
  statusFilter: 'used' | 'unused' | undefined;
  searchTerm: string;
  onImportClick: () => void;
  onDownloadBackup: () => void;
  onBulkMarkAsUsed: () => void;
  onBulkDelete: () => void;
  onStatusFilterChange: (status: 'used' | 'unused' | undefined) => void;
  onSearchChange: (value: string) => void;
  isMarkingAsUsed: boolean;
  isDeleting: boolean;
}

export const OTPToolbar = ({
  selectedCount,
  statusFilter,
  searchTerm,
  onImportClick,
  onDownloadBackup,
  onBulkMarkAsUsed,
  onBulkDelete,
  onStatusFilterChange,
  onSearchChange,
  isMarkingAsUsed,
  isDeleting,
}: OTPToolbarProps) => (
  <Toolbar>
    <ToolbarContent>
      <ToolbarItem>
        <Button variant="primary" onClick={onImportClick}>
          Import OTPs
        </Button>
      </ToolbarItem>
      <ToolbarItem>
        <Button variant="secondary" onClick={onDownloadBackup}>
          Download Backup
        </Button>
      </ToolbarItem>
      {selectedCount > 0 && (
        <>
          <ToolbarItem variant="separator" />
          <ToolbarItem>
            <Button variant="warning" onClick={onBulkMarkAsUsed} isLoading={isMarkingAsUsed}>
              Mark {selectedCount} as Used
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="danger" onClick={onBulkDelete} isLoading={isDeleting}>
              Delete {selectedCount} Selected
            </Button>
          </ToolbarItem>
        </>
      )}
      <ToolbarItem variant="separator" />
      <ToolbarItem alignSelf="center">
        <LabelGroup categoryName="Status">
          <Label
            key="unused"
            onClick={() => onStatusFilterChange('unused')}
            isCompact
            color={statusFilter === 'unused' ? 'blue' : 'grey'}
          >
            Unused
          </Label>
          <Label
            key="used"
            onClick={() => onStatusFilterChange('used')}
            isCompact
            color={statusFilter === 'used' ? 'blue' : 'grey'}
          >
            Used
          </Label>
          <Label
            key="all"
            onClick={() => onStatusFilterChange(undefined)}
            isCompact
            color={statusFilter === undefined ? 'blue' : 'grey'}
          >
            All
          </Label>
        </LabelGroup>
      </ToolbarItem>
      <ToolbarItem alignSelf="center">
        <SearchInput
          placeholder="Search codes"
          value={searchTerm}
          onChange={(_event, value) => onSearchChange(value)}
          onClear={() => onSearchChange('')}
        />
      </ToolbarItem>
    </ToolbarContent>
  </Toolbar>
);
