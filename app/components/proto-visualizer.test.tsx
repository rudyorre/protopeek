import { render, screen, fireEvent } from '@testing-library/react';
import { ProtoVisualizer } from '@/app/components/proto-visualizer';
import '@testing-library/jest-dom';

describe('ProtoVisualizer', () => {
  // Use DecodedField[] array format for sample data
  const sampleDataArray = [
    {
      fieldNumber: 1,
      type: 'string',
      value: 'John Doe',
    },
    {
      fieldNumber: 2,
      type: 'int32',
      value: '123',
    },
    {
      fieldNumber: 3,
      type: 'string',
      value: 'john@example.com',
    },
    {
      fieldNumber: 4,
      type: 'message',
      value: [
        {
          fieldNumber: 1,
          type: 'string',
          value: '123 Main St',
        },
        {
          fieldNumber: 2,
          type: 'string',
          value: 'New York',
        },
      ],
    },
  ];
  const sampleData = JSON.stringify({
    type: 'message',
    message: 'Person',
    value: sampleDataArray,
  });

  test('renders the message name', () => {
    render(<ProtoVisualizer data={sampleData} />);
    expect(screen.getByText('Person')).toBeInTheDocument();
  });

  test('renders top-level fields', () => {
    render(<ProtoVisualizer data={sampleData} />);
    // There are multiple '1:' etc, so use getAllByText and check count
    expect(
      screen.getAllByText('1:', { exact: false }).length
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('John Doe', { exact: false })).toBeInTheDocument();
    expect(
      screen.getAllByText('2:', { exact: false }).length
    ).toBeGreaterThanOrEqual(1);
    // Use getAllByText for '123' since it appears in both id and '123 Main St'
    expect(
      screen.getAllByText('123', { exact: false }).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('3:', { exact: false }).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText('john@example.com', { exact: false })
    ).toBeInTheDocument();
  });

  test('renders nested message fields', () => {
    render(<ProtoVisualizer data={sampleData} />);
    // The nested message field (address) is fieldNumber 4
    expect(
      screen.getAllByText('4:', { exact: false }).length
    ).toBeGreaterThanOrEqual(1);
    // The nested fields (street/city) are fieldNumbers 1 and 2
    expect(
      screen.getAllByText('1:', { exact: false }).length
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByText('123 Main St', { exact: false })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('2:', { exact: false }).length
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('New York', { exact: false })).toBeInTheDocument();
  });
});
