import { render, screen } from '@testing-library/react';
import { ProtoByteTable } from '@/app/components/proto-byte-table';
import '@testing-library/jest-dom';

describe('ProtoByteTable', () => {
  // Use DecodedField[] array format with all values as strings
  const sampleData = JSON.stringify([
    {
      fieldNumber: 1,
      type: 'string',
      value: 'John Doe',
      wireType: undefined,
      byteRange: [0, 8]
    },
    {
      fieldNumber: 2,
      type: 'int32',
      value: '123',
      wireType: undefined,
      byteRange: [8, 12]
    },
    {
      fieldNumber: 3,
      type: 'string',
      value: 'john@example.com',
      wireType: undefined,
      byteRange: [12, 28]
    }
  ]);

  test('renders the table with headers', () => {
    render(<ProtoByteTable data={sampleData} />);

    // Check that a table exists
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    // Verify the table has header cells
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells.length).toBeGreaterThan(0);

    // Check for specific headers
    const commonHeaders = ['Byte Range', 'Field Number', 'Type', 'Content'];
    commonHeaders.forEach(header => {
      expect(screen.getByText(header, { exact: false })).toBeInTheDocument();
    });
  });

  test('renders field rows for each field in the data', () => {
    render(<ProtoByteTable data={sampleData} />);

    // Check for field numbers and types
    ['1', '2', '3'].forEach(num => {
      expect(screen.getAllByText(num, { exact: false }).length).toBeGreaterThan(0);
    });
    ['string', 'int32'].forEach(type => {
      expect(screen.getAllByText(type, { exact: false }).length).toBeGreaterThan(0);
    });

    // Check for string values
    ['John Doe', '123', 'john@example.com'].forEach(value => {
      expect(screen.getByText(value, { exact: false })).toBeInTheDocument();
    });
  });
});