import { FormGroup, MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';

interface ImportTypeSelectorProps {
  importType: 'text' | 'file';
  isOpen: boolean;
  onSelect: (type: 'text' | 'file') => void;
  onToggle: (isOpen: boolean) => void;
}

export const ImportTypeSelector = ({
  importType,
  isOpen,
  onSelect,
  onToggle,
}: ImportTypeSelectorProps) => (
  <FormGroup label="Import Type" isRequired fieldId="import-type">
    <Select
      isOpen={isOpen}
      selected={importType}
      onSelect={(_event, selection) => {
        onSelect(selection as 'text' | 'file');
        onToggle(false);
      }}
      onOpenChange={onToggle}
      toggle={(toggleRef) => (
        <MenuToggle ref={toggleRef} onClick={() => onToggle(!isOpen)}>
          {importType === 'text' ? 'Plain Text' : 'Voucher Export'}
        </MenuToggle>
      )}
    >
      <SelectList>
        <SelectOption value="text">Plain Text</SelectOption>
        <SelectOption value="file">Voucher Export</SelectOption>
      </SelectList>
    </Select>
  </FormGroup>
);