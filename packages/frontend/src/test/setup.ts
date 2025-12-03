import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import api from '../services/api';
import { server } from './mocks/server';

// Configure the API instance to use localhost base URL in tests
api.defaults.baseURL = 'http://localhost/api';

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  server.resetHandlers();
});

// Stop MSW server after all tests
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Set window.location for URL resolution
Object.defineProperty(window, 'location', {
  value: {
    ...window.location,
    href: 'http://localhost/',
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
    replace: vi.fn(),
  },
  writable: true,
  configurable: true,
});
