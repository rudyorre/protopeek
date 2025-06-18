'use client';

import { useState } from 'react';
import { Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SampleDataOption {
  type: 'simple' | 'repeated' | 'complex';
  title: string;
  description: string;
}

interface SampleDataTooltipProps {
  onLoadSample: (type: 'simple' | 'repeated' | 'complex') => void;
}

const sampleData: SampleDataOption[] = [
  {
    type: 'simple',
    title: 'Simple',
    description: 'Basic message with a single string field'
  },
  {
    type: 'repeated',
    title: 'Repeated',
    description: 'Message with repeated fields and arrays'
  },
  {
    type: 'complex',
    title: 'Complex',
    description: 'Advanced message with nested structures'
  }
];

export function SampleDataTooltip({ onLoadSample }: SampleDataTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSampleSelect = (type: 'simple' | 'repeated' | 'complex') => {
    onLoadSample(type);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
        aria-label="Load sample data"
      >
        <Database className="h-4 w-4 mr-1" />
        <span className="text-label-medium">Samples</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-10 right-0 z-50 w-72 border-gray-700 bg-[#202124] shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">
                Sample Data
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleData.map((sample) => (
              <button
                key={sample.type}
                onClick={() => handleSampleSelect(sample.type)}
                className="w-full text-left p-3 rounded-md border border-gray-700 bg-[#303134] hover:border-blue-500 hover:bg-[#353739] transition-colors"
              >
                <div className="font-medium text-white text-sm">
                  {sample.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {sample.description}
                </div>
              </button>
            ))}
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                Click any sample to load protobuf data for testing
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
