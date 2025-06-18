'use client';

import { useEffect } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrl === event.ctrlKey &&
        !!s.shift === event.shiftKey &&
        !!s.alt === event.altKey
      );

      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function KeyboardShortcutsHelp({ shortcuts }: { shortcuts: KeyboardShortcut[] }) {
  return (
    <div className="text-xs text-gray-400 space-y-1">
      <div className="font-medium text-gray-300">Keyboard Shortcuts:</div>
      {shortcuts.map((shortcut, index) => (
        <div key={index} className="flex justify-between">
          <span>{shortcut.description}</span>
          <span className="font-mono">
            {shortcut.ctrl && 'Ctrl+'}{shortcut.shift && 'Shift+'}{shortcut.alt && 'Alt+'}{shortcut.key.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}
