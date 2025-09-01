import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ShortcutHandlers {
  onSearch?: () => void;
  onNewProject?: () => void;
  onNewTask?: () => void;
  onEscape?: () => void;
  onExport?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handlers.onSearch?.();
      }

      // Cmd/Ctrl + N: New Project
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handlers.onNewProject?.();
      }

      // Cmd/Ctrl + T: New Task
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        handlers.onNewTask?.();
      }

      // Cmd/Ctrl + E: Export
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        handlers.onExport?.();
      }

      // Cmd/Ctrl + 1-7: Quick theme switch
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const themes = ['moon', 'sun', 'comet', 'earth', 'rocket', 'saturn', 'sparkle'];
        const index = parseInt(e.key) - 1;
        if (themes[index]) {
          const event = new CustomEvent('theme-change', { detail: themes[index] });
          window.dispatchEvent(event);
        }
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        handlers.onEscape?.();
      }

      // Alt + H: Go home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        router.push('/');
      }

      // Alt + C: Go to completed
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        router.push('/completed');
      }

      // Alt + R: Go to recycle bin
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        router.push('/recycle-bin');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers, router]);
}

export const KEYBOARD_SHORTCUTS = [
  { keys: ['⌘', 'K'], description: 'Search' },
  { keys: ['⌘', 'N'], description: 'New Project' },
  { keys: ['⌘', 'T'], description: 'New Task' },
  { keys: ['⌘', 'E'], description: 'Export Data' },
  { keys: ['⌘', '1-7'], description: 'Switch Theme' },
  { keys: ['Alt', 'H'], description: 'Go Home' },
  { keys: ['Alt', 'C'], description: 'Completed Tasks' },
  { keys: ['Alt', 'R'], description: 'Recycle Bin' },
  { keys: ['Esc'], description: 'Close Modal' },
];