import {
  Button,
  Label,
  LabelGroup,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { CheckCircleIcon, TrashIcon, UndoIcon } from '@patternfly/react-icons';
import styles from './OTPToolbar.module.scss';

interface OTPToolbarProps {
  selectedCount: number;
  statusFilter: 'used' | 'unused' | undefined;
  searchTerm: string;
  onImportClick: () => void;
  onDownloadBackup: () => void;
  onBulkMarkAsUsed: () => void;
  onBulkMarkAsUnused: () => void;
  onBulkDelete: () => void;
  onStatusFilterChange: (status: 'used' | 'unused' | undefined) => void;
  onSearchChange: (value: string) => void;
  isMarkingAsUsed: boolean;
  isMarkingAsUnused: boolean;
  isDeleting: boolean;
}

export const OTPToolbar = ({
  selectedCount,
  statusFilter,
  searchTerm,
  onImportClick,
  onDownloadBackup,
  onBulkMarkAsUsed,
  onBulkMarkAsUnused,
  onBulkDelete,
  onStatusFilterChange,
  onSearchChange,
  isMarkingAsUsed,
  isMarkingAsUnused,
  isDeleting,
}: OTPToolbarProps) => (
  <Toolbar className={styles.toolbar}>
    <ToolbarContent>
      <ToolbarGroup className={styles.topRow}>
        <ToolbarItem>
          <Button variant="primary" onClick={onImportClick}>
            Import OTPs
          </Button>
        </ToolbarItem>
        <ToolbarItem className={styles.hideOnMobile}>
          <Button variant="secondary" onClick={onDownloadBackup}>
            Download Backup
          </Button>
        </ToolbarItem>
        <ToolbarItem className={styles.statusFilter}>
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
      </ToolbarGroup>

      <ToolbarGroup className={styles.searchRow}>
        <ToolbarItem className={styles.searchItem}>
          <SearchInput
            placeholder="Search codes"
            value={searchTerm}
            onChange={(_event, value) => onSearchChange(value)}
            onClear={() => onSearchChange('')}
          />
        </ToolbarItem>
      </ToolbarGroup>

      <ToolbarGroup className={styles.bulkActions}>
        <ToolbarItem>
          <Button
            variant="warning"
            onClick={onBulkMarkAsUsed}
            isLoading={isMarkingAsUsed}
            isDisabled={selectedCount === 0}
            icon={<CheckCircleIcon />}
            aria-label={`Mark ${selectedCount > 0 ? selectedCount : ''} as used`}
          />
        </ToolbarItem>
        <ToolbarItem>
          <Button
            variant="warning"
            onClick={onBulkMarkAsUnused}
            isLoading={isMarkingAsUnused}
            isDisabled={selectedCount === 0}
            icon={<UndoIcon />}
            aria-label={`Mark ${selectedCount > 0 ? selectedCount : ''} as unused`}
          />
        </ToolbarItem>
        <ToolbarItem>
          <Button
            variant="danger"
            onClick={onBulkDelete}
            isLoading={isDeleting}
            isDisabled={selectedCount === 0}
            icon={<TrashIcon />}
            aria-label={`Delete ${selectedCount > 0 ? selectedCount : ''} selected`}
          />
        </ToolbarItem>
      </ToolbarGroup>
    </ToolbarContent>
  </Toolbar>
);
