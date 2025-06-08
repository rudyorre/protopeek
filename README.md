# ProtoPeek

A modern, web-based tool for decoding and visualizing Protocol Buffers (protobuf) data. Built with Next.js, React, and TypeScript, this application provides an intuitive interface for exploring protobuf messages with or without schema files.

## Features

- **Multi-format Visualization**: View decoded protobuf data in multiple formats

  - **Tree View**: Hierarchical visualization of message structure
  - **Byte Table**: Detailed byte-level breakdown with field mappings
  - **Raw JSON**: Standard JSON output for easy copying
  - **Proto Structure**: Schema visualization when .proto files are provided

- **Flexible Input Options**:

  - Paste protobuf bytes directly
  - Optional .proto schema file upload for enhanced field naming

- **Modern UI/UX**:

  - Dark theme optimized for developers
  - Responsive design for all screen sizes
  - Interactive collapsible tree structures
  - Color-coded field types for better readability

- **Export Functionality**: Download decoded data as JSON files

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rudyorre/protopeek.git
cd protobuf-decoder
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm build
npm start
```

## Tech Stack

- **Framework**: Next.js 15.2.4
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Development**: TypeScript, ESLint

## Project Structure

```
protopeek/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   │   ├── header.tsx      # Navigation header
│   │   ├── footer.tsx      # Footer component
│   │   ├── proto-visualizer.tsx    # Tree view component
│   │   └── proto-byte-table.tsx    # Byte table component
│   ├── utils/              # Utility functions
│   │   └── sample-data.ts  # Sample protobuf data
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Main application page
├── components/ui/          # Reusable UI components (Radix-based)
├── lib/                   # Utility libraries
└── public/               # Static assets
```

## Usage

1. **Input Protobuf Data**: Paste your protobuf bytes in the text area
2. **Upload Schema (Optional)**: Upload a `.proto` file for better field naming and structure visualization
3. **Decode**: Click the "Decode Protobuf" button to process your data
4. **Explore**: Switch between different visualization modes using the tabs:
   - **Tree View**: Navigate through the message hierarchy
   - **Byte Table**: Examine byte-level details and field mappings
   - **Proto Structure**: View the schema structure (when available)
   - **Raw JSON**: Copy the decoded JSON data
5. **Export**: Download the decoded data as a JSON file

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).
