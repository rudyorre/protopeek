import { render, screen, fireEvent } from '@testing-library/react';
import { ProtoVisualizer } from '@/app/components/proto-visualizer';
import '@testing-library/jest-dom';

describe('ProtoVisualizer', () => {
    // Define sample data as an object first
    const sampleDataObject = {
        message: 'Person',
        fields: {
            name: {
                type: 'string',
                value: 'John Doe'
            },
            id: {
                type: 'int32',
                value: 123
            },
            email: {
                type: 'string',
                value: 'john@example.com'
            },
            address: {
                type: 'message',
                value: {
                    street: {
                        type: 'string',
                        value: '123 Main St'
                    },
                    city: {
                        type: 'string',
                        value: 'New York'
                    }
                }
            }
        }
    };

    // Convert to JSON string as expected by the component
    const sampleData = JSON.stringify(sampleDataObject);

    test('renders the message name', () => {
        render(<ProtoVisualizer data={sampleData} />);
        expect(screen.getByText('Person')).toBeInTheDocument();
    });

    test('renders top-level fields', () => {
        render(<ProtoVisualizer data={sampleData} />);
        expect(screen.getByText('name:')).toBeInTheDocument();
        expect(screen.getByText('"John Doe"')).toBeInTheDocument();
        expect(screen.getByText('id:')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByText('email:')).toBeInTheDocument();
        expect(screen.getByText('"john@example.com"')).toBeInTheDocument();
    });

    test('renders nested message fields', () => {
        render(<ProtoVisualizer data={sampleData} />);

        // The address field is rendered as just "address" (without the colon)
        expect(screen.getByText('address')).toBeInTheDocument();

        // The street and city fields should be visible without needing to click
        // They appear to be expanded by default based on the HTML
        expect(screen.getByText('street:')).toBeInTheDocument();
        expect(screen.getByText('"123 Main St"')).toBeInTheDocument();
        expect(screen.getByText('city:')).toBeInTheDocument();
        expect(screen.getByText('"New York"')).toBeInTheDocument();
    });
});