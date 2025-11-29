import {
  Brand,
  Button,
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
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OTPManagementTab } from './OTPManagementTab';
import { UserManagementTab } from './UserManagementTab';
import { ThemeToggle } from '../shared/ThemeToggle.tsx';
import { useAuth } from '../../hooks/useAuth';
import styles from './AdminPage.module.scss';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('otps');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
                <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                  User Dashboard
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <ThemeToggle />
              </ToolbarItem>
              <ToolbarItem>
                <Dropdown
                  isOpen={isUserDropdownOpen}
                  onSelect={() => setIsUserDropdownOpen(false)}
                  onOpenChange={(isOpen: boolean) => setIsUserDropdownOpen(isOpen)}
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

  const sidebar = (
    <PageSidebar isSidebarOpen={isSidebarOpen}>
      <PageSidebarBody>
        <Nav>
          <NavList>
            <NavItem
              itemId="otps"
              isActive={activeTab === 'otps'}
              onClick={() => setActiveTab('otps')}
            >
              OTP Management
            </NavItem>
            <NavItem
              itemId="users"
              isActive={activeTab === 'users'}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </NavItem>
          </NavList>
        </Nav>
      </PageSidebarBody>
    </PageSidebar>
  );

  return (
    <Page masthead={masthead} sidebar={sidebar}>
      <PageSection>
        {activeTab === 'otps' && <OTPManagementTab />}
        {activeTab === 'users' && <UserManagementTab />}
      </PageSection>
    </Page>
  );
};
