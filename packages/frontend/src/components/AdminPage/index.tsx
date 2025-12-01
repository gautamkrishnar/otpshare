import {
  Brand,
  Dropdown,
  DropdownItem,
  DropdownList,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadMain,
  MastheadToggle,
  MenuToggle,
  Nav,
  NavItem,
  NavList,
  Page,
  PageSection,
  PageSidebar,
  PageSidebarBody,
  PageToggleButton,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { BarsIcon, UserIcon } from '@patternfly/react-icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ChangePasswordModal } from '../shared';
import { ThemeToggle } from '../shared/ThemeToggle.tsx';
import styles from './AdminPage.module.scss';
import { OTPManagementTab } from './OTPManagementTab';
import { SettingsTab } from './SettingsTab';
import { UserManagementTab } from './UserManagementTab';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('otps');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1200);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <PageToggleButton
            variant="plain"
            aria-label="Global navigation"
            isSidebarOpen={isSidebarOpen}
            onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <BarsIcon />
          </PageToggleButton>
        </MastheadToggle>
        <MastheadBrand className={styles.adminPage__mastheadBrand}>
          <Brand src="/otp-logo.svg" alt="OTP Manager" heights={{ default: '40px' }} />
          <span className={styles.adminPage__mastheadTitle}>OTP Manager</span>
        </MastheadBrand>
      </MastheadMain>
      <MastheadContent>
        <Toolbar isFullHeight isStatic>
          <ToolbarContent>
            <ToolbarGroup align={{ default: 'alignEnd' }}>
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

  const handleNavItemClick = (callback: () => void) => {
    callback();
    // Close sidebar on mobile after clicking a nav item
    if (window.innerWidth < 1200) {
      setIsSidebarOpen(false);
    }
  };

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItem
              itemId="otps"
              isActive={activeTab === 'otps'}
              onClick={() => handleNavItemClick(() => setActiveTab('otps'))}
            >
              OTP Management
            </NavItem>
            <NavItem
              itemId="users"
              isActive={activeTab === 'users'}
              onClick={() => handleNavItemClick(() => setActiveTab('users'))}
            >
              User Management
            </NavItem>
            <NavItem
              itemId="settings"
              isActive={activeTab === 'settings'}
              onClick={() => handleNavItemClick(() => setActiveTab('settings'))}
            >
              Settings
            </NavItem>
            <NavItem
              itemId="preview"
              onClick={() => handleNavItemClick(() => navigate('/dashboard'))}
            >
              Preview
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <>
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
      <Page masthead={masthead} sidebar={sidebar}>
        <PageSection>
          {activeTab === 'otps' && <OTPManagementTab />}
          {activeTab === 'users' && <UserManagementTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </PageSection>
      </Page>
    </>
  );
};
