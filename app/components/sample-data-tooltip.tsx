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
    title: 'Simple Message',
    description: 'Basic protobuf with string and numeric fields'
  },
  {
    type: 'repeated',
    title: 'Repeated Fields',
    description: 'Demonstrates arrays and repeated elements'
  },
  {
    type: 'complex',
    title: 'Nested Structure',
    description: 'Advanced message with nested objects and types'
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
        top: rect.bottom + scrollTop + (trigger === 'link' ? 8 : 12),
        left: rect.left + scrollLeft + (trigger === 'link' ? 0 : rect.width - 320) // 320px = w-80
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
          className="text-blue-400 hover:text-blue-300 cursor-pointer hover:underline underline-offset-2 decoration-1 transition-all duration-200 inline-flex items-center gap-0.5"
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
      className="fixed z-50 w-80 border border-gray-600/50 bg-[#1f1f1f] shadow-2xl rounded-xl backdrop-blur-sm opacity-0 scale-95 animate-[fadeInScale_200ms_ease-out_forwards]"
      data-tooltip-content
      style={{
        top: tooltipPosition.top,
        left: Math.max(8, Math.min(tooltipPosition.left, window.innerWidth - 320 - 8)), // Updated for new width (320px = w-80)
        animationDelay: '0ms'
      }}
    >
      {/* Header with close button */}
      <div className="relative px-5 py-4 border-b border-gray-700/50">
        <h3 className="text-base font-medium text-white pr-8">
          Sample Data
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-3 top-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {sampleData.map((sample, index) => (
          <button
            key={sample.type}
            onClick={() => handleSampleSelect(sample.type)}
            className="group w-full text-left p-4 rounded-lg border border-gray-700/50 bg-[#2a2a2a] hover:border-blue-500/60 hover:bg-[#2f2f2f] hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="block font-medium text-white text-sm group-hover:text-blue-100 transition-colors">
                  {sample.title}
                </span>
                <span className="block text-xs text-gray-400 mt-1.5 leading-relaxed">
                  {sample.description}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3.5 border-t border-gray-700/50 bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] rounded-b-xl">
        <p className="text-xs text-gray-500 leading-relaxed">
          Click any sample to load protobuf data for testing
        </p>
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
