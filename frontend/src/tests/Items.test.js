import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DataProvider } from '../state/DataContext';
import { MemoryRouter } from 'react-router-dom';
import Items from '../pages/Items';

// We mock the global fetch function to control API responses in our tests.
global.fetch = jest.fn();

const mockApiResponse = (data) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <DataProvider>
        <Items />
      </DataProvider>
    </MemoryRouter>
  );
};

describe('Items Component', () => {
  beforeEach(() => {
    // Reset the mock before each test
    fetch.mockClear();
  });

  it('should display a skeleton loader on initial render and then show items', async () => {
    const mockData = {
      items: [{ id: 1, name: 'Test Item 1' }],
      totalPages: 1,
      currentPage: 1,
    };
    fetch.mockImplementationOnce(() => mockApiResponse(mockData));

    renderComponent();

    // Initially, the skeleton loader should be visible.
    expect(screen.getByTestId('skeleton-loader')).toBeInTheDocument();

    // Wait for the component to update after the fetch call
    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    });

    // The skeleton loader should no longer be visible
    expect(screen.queryByTestId('skeleton-loader')).not.toBeInTheDocument();
  });

  it('should filter items when a user types in the search box', async () => {
    // Mock the initial load with a list of items
    const initialData = {
      items: [
        { id: 1, name: 'First Item' },
        { id: 2, name: 'Another Gadget' },
      ],
      totalPages: 1,
      currentPage: 1,
    };
    fetch.mockImplementationOnce(() => mockApiResponse(initialData));
    renderComponent();
    await waitFor(() => expect(screen.getByText('First Item')).toBeInTheDocument());

    // Mock the response for the search query
    const searchData = {
      items: [{ id: 2, name: 'Searched Gadget' }],
      totalPages: 1,
      currentPage: 1,
    };
    fetch.mockImplementationOnce(() => mockApiResponse(searchData));

    const searchInput = screen.getByPlaceholderText(/Search items/i);
    fireEvent.change(searchInput, { target: { value: 'Gadget' } });

    // Wait for the debounced search and re-render
    await waitFor(() => {
      expect(screen.queryByText('First Item')).not.toBeInTheDocument(); // Old item is gone
      expect(screen.getByText('Searched Gadget')).toBeInTheDocument(); // New item is present
    });

    // Check if the fetch was called with the correct search parameter
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('q=Gadget'), expect.any(Object));
  });

  it('should fetch the next page when the "Next" button is clicked', async () => {
    // Initial load for page 1
    fetch.mockImplementationOnce(() => mockApiResponse({ items: [{id: 1, name: 'Item on Page 1'}], totalPages: 2, currentPage: 1 }));
    renderComponent();

    await waitFor(() => expect(screen.getByText('Item on Page 1')).toBeInTheDocument());

    // Mock the response for page 2
    const page2Data = { items: [{ id: 2, name: 'Item on Page 2' }], totalPages: 2, currentPage: 2 };
    fetch.mockImplementationOnce(() => mockApiResponse(page2Data));

    const nextButton = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextButton);

    await waitFor(() => expect(screen.getByText('Item on Page 2')).toBeInTheDocument());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('page=2'), expect.any(Object));
  });
});