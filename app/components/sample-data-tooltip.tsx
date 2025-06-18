'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SampleDataOption {
  type: 'simple' | 'repeated' | 'complex';
  title: string;
  description: string;
}

interface SampleDataTooltipProps {
  onLoadSample: (type: 'simple' | 'repeated' | 'complex') => void;
  trigger?: 'button' | 'link';
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

export function SampleDataTooltip({ onLoadSample, trigger = 'button' }: SampleDataTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);

  const handleSampleSelect = (type: 'simple' | 'repeated' | 'complex') => {
    onLoadSample(type);
    setIsOpen(false);
  };

  // Calculate tooltip position when opening
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setTooltipPosition({
        top: rect.bottom + scrollTop + (trigger === 'link' ? 6 : 10),
        left: rect.left + scrollLeft + (trigger === 'link' ? 0 : rect.width - 288) // 288px = w-72
      });
    }
  }, [isOpen, trigger]);

  // Handle click outside and escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the trigger and the tooltip content
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Also check if the click is not inside the tooltip content
        const tooltipElement = document.querySelector('[data-tooltip-content]');
        if (!tooltipElement || !tooltipElement.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const renderTrigger = () => {
    if (trigger === 'link') {
      return (
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="text-blue-400 hover:text-blue-300 cursor-pointer hover:underline inline"
        >
          try sample encodings
        </span>
      );
    }

    return (
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
    );
  };

  const renderTooltipContent = () => (
    <div 
      className="fixed z-50 w-72 border border-gray-700 bg-[#202124] shadow-lg rounded-lg"
      data-tooltip-content
      style={{
        top: tooltipPosition.top,
        left: Math.max(8, Math.min(tooltipPosition.left, window.innerWidth - 288 - 8)) // Ensure it stays within viewport
      }}
    >
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Sample Data
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="px-4 pb-4 space-y-2">
        {sampleData.map((sample) => (
          <button
            key={sample.type}
            onClick={() => handleSampleSelect(sample.type)}
            className="w-full text-left p-3 rounded-md border border-gray-700 bg-[#303134] hover:border-blue-500 hover:bg-[#353739] transition-colors"
          >
            <span className="block font-medium text-white text-sm">
              {sample.title}
            </span>
            <span className="block text-xs text-gray-400 mt-1">
              {sample.description}
            </span>
          </button>
        ))}
        <div className="pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-400">
            Click any sample to load protobuf data for testing
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <span className="relative inline" ref={containerRef}>
        {renderTrigger()}
      </span>

      {isOpen && typeof window !== 'undefined' && createPortal(
        renderTooltipContent(),
        document.body
      )}
    </>
  );
}
