import { memo, useCallback, useMemo } from 'react';

interface BreadcrumbProps {
  path: string;
  onNavigate: (newPath: string) => void;
}

function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const segments = useMemo(() => {
    if (!path) return [];
    return path.split('/').filter(Boolean);
  }, [path]);

  const handleNavigate = useCallback((index: number) => {
    if (index === -1) {
      onNavigate('');
    } else {
      const newPath = segments.slice(0, index + 1).join('/');
      onNavigate(newPath);
    }
  }, [segments, onNavigate]);

  return (
    <nav className="flex items-center gap-1 font-mono text-sm px-4 py-3 bg-dark border-b border-[#222]">
      {/* Root */}
      <button
        onClick={() => handleNavigate(-1)}
        className={`
          transition-all duration-200 hover:neon-cyan
          ${segments.length === 0 ? 'neon-lime font-bold' : 'text-lime hover:text-cyan'}
        `}
      >
        ROOT
      </button>

      {segments.map((segment, index) => (
        <span key={index} className="flex items-center gap-1">
          <span className="text-gray-600 mx-1">/</span>
          <button
            onClick={() => handleNavigate(index)}
            className={`
              transition-all duration-200
              ${index === segments.length - 1
                ? 'neon-lime font-bold'
                : 'text-lime hover:text-cyan hover:neon-cyan'}
            `}
          >
            {segment}
          </button>
        </span>
      ))}
    </nav>
  );
}

export default memo(Breadcrumb);
