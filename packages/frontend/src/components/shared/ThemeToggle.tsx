import { Button } from '@patternfly/react-core';
import { MoonIcon, SunIcon } from '@patternfly/react-icons';
import { useTheme } from '../../hooks/useTheme.ts';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      variant="plain"
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      {isDarkMode ? <SunIcon /> : <MoonIcon />}
      <span style={{ marginLeft: '0.5rem' }}>
        {isDarkMode ? 'Light' : 'Dark'}
      </span>
    </Button>
  );
};
