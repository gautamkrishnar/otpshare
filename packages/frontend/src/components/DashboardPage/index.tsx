import {
  Alert,
  Brand,
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MenuToggle,
  Page,
  PageSection,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { CheckCircleIcon, CopyIcon, UserIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../shared/ThemeToggle.tsx';
import { useAuth } from '../../hooks/useAuth';
import { useMarkOTPAsUsed, useOTPs } from '../../hooks/useOTPQueries';
import { ChangePasswordModal } from '../shared';
import styles from './DashboardPage.module.scss';

export const DashboardPage = () => {
  const { data, isLoading, error } = useOTPs();
  const markAsUsed = useMarkOTPAsUsed();
  const { user, logout, isAdmin } = useAuth();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const currentOTP = data?.available?.[0];
  const totalAvailable = data?.totalAvailable || 0;

  const handleCopy = () => {
    if (currentOTP) {
      navigator.clipboard.writeText(currentOTP.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMarkAsUsed = () => {
    if (currentOTP) {
      markAsUsed.mutate(currentOTP.id);
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <Page>
        <PageSection isFilled className={styles.dashboardPage__pageSection}>
          <Spinner size="xl" />
        </PageSection>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <PageSection>
          <Alert variant="danger" title="Error loading OTPs" />
        </PageSection>
      </Page>
    );
  }

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadBrand className={styles.dashboardPage__mastheadBrand}>
          <Brand src="/otp-logo.svg" alt="OTP Manager" heights={{ default: '40px' }} />
          <span className={styles.dashboardPage__mastheadTitle}>OTP Manager</span>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar isFullHeight isStatic>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
              {isAdmin && (
                <ToolbarItem>
                  <Button variant="secondary" onClick={() => navigate('/admin')}>
                    Admin
                  </Button>
                </ToolbarItem>
              )}
              <ToolbarItem>
                <ThemeToggle />
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  isOpen={isUserDropdownOpen}
                  onSelect={() => setIsUserDropdownOpen(false)}
                  onOpenChange={(isOpen: boolean) => setIsUserDropdownOpen(isOpen)}
                  popperProps={{ position: 'end' }}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      isExpanded={isUserDropdownOpen}
                      icon={<UserIcon />}
                    >
                      {user?.username || 'User'}
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      key="change-password"
                      onClick={() => setIsChangePasswordModalOpen(true)}
                    >
                      Change Password
                    </DropdownItem>
                    <DropdownItem key="logout" onClick={logout}>
                      Logout
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </MastheadContent>
    </Masthead>
  );

  return (
    <>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <Page masthead={masthead} className={styles.dashboardPage__page}>
        <PageSection isFilled className={styles.dashboardPage__pageSection}>
          <div className={styles.dashboardPage__container}>
            {currentOTP ? (
              <Card className={styles.dashboardPage__card}>
                <CardBody className={styles.dashboardPage__cardBody}>
                  {/* Counter */}
                  <div className={styles.dashboardPage__counter}>
                    <CheckCircleIcon className={styles.dashboardPage__counterIcon} />
                    {totalAvailable} code{totalAvailable !== 1 ? 's' : ''} available
                  </div>

                  {/* OTP Code Display */}
                  <button
                    onClick={handleCopy}
                    className={styles.dashboardPage__otpDisplay}
                    type="button"
                  >
                    {currentOTP.code}
                  </button>

                  {/* Copy Button */}
                  <Button
                    variant="secondary"
                    icon={<CopyIcon />}
                    onClick={handleCopy}
                    className={styles.dashboardPage__copyButton}
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>

                  {/* Mark as Used Button */}
                  <Button
                    variant="primary"
                    onClick={handleMarkAsUsed}
                    isLoading={markAsUsed.isPending}
                    size="lg"
                    className={styles.dashboardPage__markAsUsedButton}
                  >
                    Mark as Used
                  </Button>

                  {/* Info Text */}
                  {totalAvailable > 1 && (
                    <div className={styles.dashboardPage__infoText}>
                      Next code will appear after marking this one as used
                    </div>
                  )}
                </CardBody>
              </Card>
            ) : (
              <Card className={styles.dashboardPage__card}>
                <CardBody className={styles.dashboardPage__cardBody}>
                  <EmptyState variant="lg" titleText="No OTPs Available">
                    <EmptyStateBody>
                      There are no unused OTPs available at the moment. Please contact an
                      administrator to import new codes.
                    </EmptyStateBody>
                  </EmptyState>
                </CardBody>
              </Card>
            )}
          </div>
        </PageSection>
      </Page>
    </>
  );
};
