import { render, screen } from '@testing-library/react';
import { MessageTypeSelector } from '@/app/components/message-type-selector';
import { ProtoByteTable } from '@/app/components/proto-byte-table';
import '@testing-library/jest-dom';

describe('MessageTypeSelector', () => {
  test('renders nothing when messageTypes is empty', () => {
    const { container } = render(
      <MessageTypeSelector
        messageTypes={[]}
        selectedType={null}
        onTypeSelected={jest.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders selector when messageTypes are provided', () => {
    render(
      <MessageTypeSelector
        messageTypes={['tutorial.Person', 'tutorial.AddressBook']}
        selectedType='tutorial.Person'
        onTypeSelected={jest.fn()}
      />
    );
    expect(screen.getByText('Message Type')).toBeInTheDocument();
    expect(screen.getByText('2 available')).toBeInTheDocument();
  });
});

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

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();

    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells.length).toBeGreaterThan(0);
  });

  test('renders field rows for each field in the data', () => {
    render(<ProtoByteTable data={sampleData} />);

    const values = ['John Doe', '123', 'john@example.com'];
    values.forEach((value) => {
      expect(
        screen.getByText((content) => content.includes(value), { exact: false })
      ).toBeInTheDocument();
    });
  });
});
