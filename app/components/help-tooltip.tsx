'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

interface HelpTooltipProps {
  shortcuts: KeyboardShortcut[];
}

export function HelpTooltip({ shortcuts }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        aria-label="Show keyboard shortcuts"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {isOpen && (
        <Card className="absolute top-10 right-0 z-50 w-80 border-gray-700 bg-[#202124] shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">
                Keyboard Shortcuts
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
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-gray-300">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-gray-200 font-mono">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
