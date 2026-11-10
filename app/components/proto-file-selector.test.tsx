import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProtoFileSelector } from '@/app/components/proto-file-selector';
import '@testing-library/jest-dom';

describe('ProtoFileSelector', () => {
  const mockOnFilesSelected = jest.fn();

  beforeEach(() => {
    mockOnFilesSelected.mockClear();
    jest.clearAllMocks();
  });

  test('renders the file upload button', () => {
    render(
      <ProtoFileSelector
        onFilesSelected={mockOnFilesSelected}
        selectedFiles={[]}
      />
    );

    expect(screen.getByText('Proto Files')).toBeInTheDocument();
    expect(screen.getByText('Select .proto files')).toBeInTheDocument();
  });

  test('displays selected files and allows clearing', () => {
    render(
      <ProtoFileSelector
        onFilesSelected={mockOnFilesSelected}
        selectedFiles={[
          {
            name: 'person.proto',
            path: 'person.proto',
            content: 'syntax = "proto3"; message Person { string name = 1; }',
          },
        ]}
      />
    );

    expect(screen.getByText('person.proto')).toBeInTheDocument();
    const clearBtn = screen.getByText('Clear All');
    fireEvent.click(clearBtn);
    expect(mockOnFilesSelected).toHaveBeenCalledWith([]);
  });

  test('allows loading inline .proto schema from modal', async () => {
    render(
      <ProtoFileSelector
        onFilesSelected={mockOnFilesSelected}
        selectedFiles={[]}
      />
    );

    fireEvent.click(screen.getByText('Select .proto files'));
    const inlineTab = await screen.findByText('Write / Paste .proto Inline');
    fireEvent.click(inlineTab);

    const loadBtn = await screen.findByText('Load Inline Schema');
    fireEvent.click(loadBtn);

    await waitFor(() => {
      expect(mockOnFilesSelected).toHaveBeenCalledTimes(1);
    });
  });
});
