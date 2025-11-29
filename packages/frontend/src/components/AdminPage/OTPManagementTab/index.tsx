import { Card, CardBody, CardTitle } from '@patternfly/react-core';
import type { FormikProps } from 'formik';
import { useRef, useState } from 'react';
import {
  useAdminOTPs,
  useDeleteBulkOTPs,
  useDeleteOTP,
  useImportOTPs,
  useImportOTPsFromFile,
  useMarkBulkOTPsAsUsed,
  useMarkOTPAsUsed,
} from '../../../hooks/useOTPQueries.ts';
import { adminAPI } from '../../../services/api.ts';
import { VendorType } from '../../../types';
import { ImportModal } from './ImportModal.tsx';
import { OTPContent } from './OTPContent.tsx';
import { OTPToolbar } from './OTPToolbar.tsx';

export const OTPManagementTab = () => {
  const [statusFilter, setStatusFilter] = useState<'used' | 'unused' | undefined>('unused');
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'text' | 'file'>('text');
  const [isImportTypeSelectOpen, setIsImportTypeSelectOpen] = useState(false);
  const [vendorType, setVendorType] = useState<VendorType>(VendorType.TPLINK_OMADA);
  const [isVendorSelectOpen, setIsVendorSelectOpen] = useState(false);
  const [selectedOTPs, setSelectedOTPs] = useState<Set<number>>(new Set());

  const { data, isLoading, error } = useAdminOTPs({
    status: statusFilter,
    search: searchTerm || undefined,
  });
  const importOTPs = useImportOTPs();
  const importOTPsFromFile = useImportOTPsFromFile();
  const deleteOTP = useDeleteOTP();
  const deleteBulkOTPs = useDeleteBulkOTPs();
  const markBulkOTPsAsUsed = useMarkBulkOTPsAsUsed();
  const markOTPAsUsed = useMarkOTPAsUsed();
  const textModeFormRef = useRef<FormikProps<{ codes: string }>>(null);
  const fileModeFormRef = useRef<FormikProps<{ file: File | undefined }>>(null);

  const handleDownloadBackup = async () => {
    try {
      await adminAPI.downloadBackup();
    } catch (err) {
      console.error('Failed to download backup:', err);
    }
  };

  const handleModalClose = () => {
    setIsImportModalOpen(false);
    setImportType('text');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.otps) {
      setSelectedOTPs(new Set(data.otps.map((otp) => otp.id)));
    } else {
      setSelectedOTPs(new Set());
    }
  };

  const handleSelectOTP = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedOTPs);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedOTPs(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedOTPs.size === 0) return;
    deleteBulkOTPs.mutate(Array.from(selectedOTPs), {
      onSuccess: () => setSelectedOTPs(new Set()),
    });
  };

  const handleBulkMarkAsUsed = () => {
    if (selectedOTPs.size === 0) return;
    markBulkOTPsAsUsed.mutate(Array.from(selectedOTPs), {
      onSuccess: () => setSelectedOTPs(new Set()),
    });
  };

  const handleTextImport = (codes: string[]) => {
    importOTPs.mutate(codes, { onSuccess: handleModalClose });
  };

  const handleFileImport = (file: File, vendor: VendorType) => {
    importOTPsFromFile.mutate({ file, vendorType: vendor }, { onSuccess: handleModalClose });
  };

  const isAllSelected =
    data?.otps && data.otps.length > 0 && selectedOTPs.size === data.otps.length;

  return (
    <>
      <Card>
        <CardTitle>OTP Management</CardTitle>
        <CardBody>
          <OTPToolbar
            selectedCount={selectedOTPs.size}
            statusFilter={statusFilter}
            searchTerm={searchTerm}
            onImportClick={() => setIsImportModalOpen(true)}
            onDownloadBackup={handleDownloadBackup}
            onBulkMarkAsUsed={handleBulkMarkAsUsed}
            onBulkDelete={handleBulkDelete}
            onStatusFilterChange={setStatusFilter}
            onSearchChange={setSearchTerm}
            isMarkingAsUsed={markBulkOTPsAsUsed.isPending}
            isDeleting={deleteBulkOTPs.isPending}
          />

          {data?.stats && (
            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <strong>Statistics:</strong> Total: {data.stats.total} | Used: {data.stats.used} |
              Unused: {data.stats.unused}
            </div>
          )}

          <OTPContent
            isLoading={isLoading}
            error={error}
            otps={data?.otps}
            searchTerm={searchTerm}
            selectedOTPs={selectedOTPs}
            isAllSelected={!!isAllSelected}
            onSelectAll={handleSelectAll}
            onSelectOTP={handleSelectOTP}
            onMarkAsUsed={(id) => markOTPAsUsed.mutate(id)}
            onDelete={(id) => deleteOTP.mutate(id)}
            onImportClick={() => setIsImportModalOpen(true)}
            isMarkingAsUsed={markOTPAsUsed.isPending}
            isDeleting={deleteOTP.isPending}
          />
        </CardBody>
      </Card>

      <ImportModal
        isOpen={isImportModalOpen}
        importType={importType}
        isImportTypeSelectOpen={isImportTypeSelectOpen}
        vendorType={vendorType}
        isVendorSelectOpen={isVendorSelectOpen}
        textModeFormRef={textModeFormRef}
        fileModeFormRef={fileModeFormRef}
        onClose={handleModalClose}
        onImportTypeChange={setImportType}
        onImportTypeToggle={setIsImportTypeSelectOpen}
        onVendorTypeChange={setVendorType}
        onVendorSelectToggle={setIsVendorSelectOpen}
        onTextImport={handleTextImport}
        onFileImport={handleFileImport}
        isImportingText={importOTPs.isPending}
        isImportingFile={importOTPsFromFile.isPending}
      />
    </>
  );
};
