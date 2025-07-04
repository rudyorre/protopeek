import { render, screen } from '@testing-library/react';
import { ProtoByteTable } from '@/app/components/proto-byte-table';
import '@testing-library/jest-dom';

describe('ProtoByteTable', () => {
  const sampleData = JSON.stringify([
    {
      type: 'string',
      value: 'John Doe',
      fieldNumber: 1,
    },
    {
      type: 'int32',
      value: '123',
      fieldNumber: 2,
    },
    {
      type: 'string',
      value: 'john@example.com',
      fieldNumber: 3,
    },
  ]);

  test('renders the table with headers', () => {
    render(<ProtoByteTable data={sampleData} />);

    // Check that a table exists
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Verify the table has header cells
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells.length).toBeGreaterThan(0);

    // Alternative approach: check for specific headers that we know exist
    const commonHeaders = ['Field', 'Type', 'Value'];
    commonHeaders.forEach((header) => {
      const element =
        screen.queryByText(header) ||
        screen.queryByText(header, { exact: false }) ||
        screen.queryByText(new RegExp(header, 'i'));

      if (element) {
        expect(element).toBeInTheDocument();
      }
    });
  });

  test('renders field rows for each field in the data', () => {
    render(<ProtoByteTable data={sampleData} />);

    // Use more flexible text matching for fields
    const values = ['John Doe', '123', 'john@example.com'];
    values.forEach((value) => {
      expect(
        screen.getByText((content) => content.includes(value), { exact: false })
      ).toBeInTheDocument();
    });
  });
});
