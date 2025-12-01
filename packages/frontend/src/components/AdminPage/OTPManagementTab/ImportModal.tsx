import {
  Button,
  FormGroup,
  HelperText,
  HelperTextItem,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalVariant,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import type { FormikProps } from 'formik';
import type { RefObject } from 'react';
import { useMemo } from 'react';
import * as Yup from 'yup';
import { FormikForm, FormikTextArea } from '../../shared';
import type { VendorType } from '../../../types';
import { ImportTypeSelector } from './ImportTypeSelector.tsx';
import { useParserMetadata } from '../../../hooks/useParserQueries';

const importOTPSchema = Yup.object({
  codes: Yup.string()
    .required('Please enter at least one OTP code')
    .test('has-codes', 'Please enter at least one valid OTP code', (value) => {
      if (!value) return false;
      const codes = value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      return codes.length > 0;
    }),
});

const importOTPFileSchema = Yup.object({
  file: Yup.mixed().required('Please select a file to upload'),
});

interface ImportModalProps {
  isOpen: boolean;
  importType: 'text' | 'file';
  isImportTypeSelectOpen: boolean;
  vendorType: VendorType;
  isVendorSelectOpen: boolean;
  textModeFormRef: RefObject<FormikProps<{ codes: string }>>;
  fileModeFormRef: RefObject<FormikProps<{ file: File | undefined }>>;
  onClose: () => void;
  onImportTypeChange: (type: 'text' | 'file') => void;
  onImportTypeToggle: (isOpen: boolean) => void;
  onVendorTypeChange: (type: VendorType) => void;
  onVendorSelectToggle: (isOpen: boolean) => void;
  onTextImport: (codes: string[]) => void;
  onFileImport: (file: File, vendorType: VendorType) => void;
  isImportingText: boolean;
  isImportingFile: boolean;
}

export const ImportModal = ({
  isOpen,
  importType,
  isImportTypeSelectOpen,
  vendorType,
  isVendorSelectOpen,
  textModeFormRef,
  fileModeFormRef,
  onClose,
  onImportTypeChange,
  onImportTypeToggle,
  onVendorTypeChange,
  onVendorSelectToggle,
  onTextImport,
  onFileImport,
  isImportingText,
  isImportingFile,
}: ImportModalProps) => {
  const { data: parsersMetadata } = useParserMetadata();

  const selectedParserMeta = useMemo(
    () => parsersMetadata?.find((p) => p.vendorType === vendorType),
    [parsersMetadata, vendorType],
  );

  const acceptedFileTypes = useMemo(() => {
    if (!selectedParserMeta) return '';
    return [...selectedParserMeta.fileExtensions, ...selectedParserMeta.mimeTypes].join(',');
  }, [selectedParserMeta]);

  return (
  <Modal variant={ModalVariant.medium} title="Import OTPs" isOpen={isOpen} onClose={onClose}>
    {importType === 'text' ? (
      <>
        <ModalBody>
          <FormikForm
            innerRef={textModeFormRef}
            initialValues={{ codes: '' }}
            validationSchema={importOTPSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              const codes = values.codes
                .split('\n')
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

              onTextImport(codes);
              resetForm();
              setSubmitting(false);
            }}
          >
            <>
              <ImportTypeSelector
                importType={importType}
                isOpen={isImportTypeSelectOpen}
                onSelect={onImportTypeChange}
                onToggle={onImportTypeToggle}
              />
              <FormikTextArea
                name="codes"
                label="OTP Codes"
                helperText="Enter one code per line. Codes can be of any length and format."
                rows={10}
                placeholder="CODE001&#10;CODE002&#10;CODE003"
              />
            </>
          </FormikForm>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              textModeFormRef.current?.submitForm();
            }}
            isLoading={isImportingText}
          >
            Import
          </Button>
          <Button variant="link" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </>
    ) : (
      <>
        <ModalBody>
          <FormikForm
            innerRef={fileModeFormRef}
            initialValues={{ file: undefined }}
            validationSchema={importOTPFileSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              if (!values.file) return;

              onFileImport(values.file, vendorType);
              resetForm();
              setSubmitting(false);
            }}
          >
            <>
              <ImportTypeSelector
                importType={importType}
                isOpen={isImportTypeSelectOpen}
                onSelect={onImportTypeChange}
                onToggle={onImportTypeToggle}
              />
              <FormGroup label="Vendor" isRequired fieldId="vendor-type">
                <Select
                  isOpen={isVendorSelectOpen}
                  selected={vendorType}
                  onSelect={(_event, selection) => {
                    onVendorTypeChange(selection as VendorType);
                    onVendorSelectToggle(false);
                  }}
                  onOpenChange={onVendorSelectToggle}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => onVendorSelectToggle(!isVendorSelectOpen)}
                    >
                      {selectedParserMeta?.name || 'Select vendor'}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    {parsersMetadata?.map((parser) => (
                      <SelectOption key={parser.vendorType} value={parser.vendorType}>
                        {parser.name}
                      </SelectOption>
                    ))}
                  </SelectList>
                </Select>
              </FormGroup>

              {selectedParserMeta && (
                <HelperText>
                  <HelperTextItem variant="indeterminate">
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
                      {selectedParserMeta.description}
                    </pre>
                  </HelperTextItem>
                </HelperText>
              )}

              <FormGroup label="Upload File" isRequired fieldId="file-upload">
                <input
                  type="file"
                  id="file-upload"
                  accept={acceptedFileTypes}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      fileModeFormRef.current?.setFieldValue('file', selectedFile);
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </FormGroup>
            </>
          </FormikForm>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="primary"
            onClick={() => {
              fileModeFormRef.current?.submitForm();
            }}
            isDisabled={isImportingFile}
            isLoading={isImportingFile}
          >
            Import
          </Button>
          <Button variant="link" isDisabled={isImportingFile} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </>
    )}
  </Modal>
  );
};
