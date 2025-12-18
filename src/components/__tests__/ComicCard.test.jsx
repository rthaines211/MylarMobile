import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComicCard from '../comics/ComicCard';
import { ConfigProvider } from '../../context/ConfigContext';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
};

describe('ComicCard', () => {
  const mockComic = {
    ComicID: '123',
    ComicName: 'Spider-Man',
    ComicYear: '2023',
    ComicPublisher: 'Marvel',
    Total: 10,
  };

  it('renders comic name', () => {
    render(<ComicCard comic={mockComic} />, { wrapper: createWrapper() });
    expect(screen.getByText('Spider-Man')).toBeInTheDocument();
  });

  it('renders comic year and publisher', () => {
    render(<ComicCard comic={mockComic} />, { wrapper: createWrapper() });
    expect(screen.getByText(/2023/)).toBeInTheDocument();
    expect(screen.getByText(/Marvel/)).toBeInTheDocument();
  });

  it('renders issue count', () => {
    render(<ComicCard comic={mockComic} />, { wrapper: createWrapper() });
    expect(screen.getByText('10 issues')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalComic = {
      ComicID: '456',
      ComicName: 'Test Comic',
    };
    render(<ComicCard comic={minimalComic} />, { wrapper: createWrapper() });
    expect(screen.getByText('Test Comic')).toBeInTheDocument();
  });

  it('uses alternate field names', () => {
    const altComic = {
      id: '789',
      name: 'Batman',
      year: '2024',
      publisher: 'DC',
      totalIssues: 5,
    };
    render(<ComicCard comic={altComic} />, { wrapper: createWrapper() });
    expect(screen.getByText('Batman')).toBeInTheDocument();
    expect(screen.getByText('5 issues')).toBeInTheDocument();
  });
});
