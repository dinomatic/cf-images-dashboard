import { useState, useCallback, memo } from 'react';
import type { DirectoryNode } from '../types';

interface DirectoryTreeProps {
  currentPath: string;
  tree: DirectoryNode | null;
  onPathChange: (path: string) => void;
  loading: boolean;
}

interface DirectoryItemProps {
  node: DirectoryNode;
  currentPath: string;
  onPathChange: (path: string) => void;
  depth: number;
}

const DirectoryItem = memo(function DirectoryItem({
  node,
  currentPath,
  onPathChange,
  depth
}: DirectoryItemProps) {
  // Only expand if current path is within this node's subtree
  const isInPath = currentPath === node.path || currentPath.startsWith(node.path + '/');
  const [expanded, setExpanded] = useState(isInPath);

  const isActive = currentPath === node.path;
  const hasSubdirs = node.subdirs && node.subdirs.length > 0;

  const handleClick = useCallback(() => {
    onPathChange(node.path);
    if (hasSubdirs && !expanded) {
      setExpanded(true);
    }
  }, [node.path, onPathChange, hasSubdirs, expanded]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  return (
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-all duration-200
          hover:bg-[#1a1a1a] rounded
          ${isActive ? 'bg-[#1a1a1a] border-neon-cyan' : 'border border-transparent'}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasSubdirs ? (
          <button
            onClick={handleToggle}
            className="w-4 h-4 flex items-center justify-center text-cyan hover:neon-cyan transition-all"
          >
            {expanded ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4 h-4 flex items-center justify-center text-gray-600">•</span>
        )}
        <span
          className={`
            font-mono text-sm transition-all duration-200
            ${isActive ? 'neon-cyan font-bold' : isInPath ? 'text-cyan' : 'text-gray-300 hover:text-cyan'}
          `}
        >
          {node.name}
        </span>
        {node.images && node.images.length > 0 && (
          <span className="text-xs text-gray-600 ml-auto">{node.images.length}</span>
        )}
      </div>

      {expanded && hasSubdirs && (
        <div className="fade-in">
          {[...node.subdirs!].sort((a, b) => a.name.localeCompare(b.name)).map((subdir) => (
            <DirectoryItem
              key={subdir.path}
              node={subdir}
              currentPath={currentPath}
              onPathChange={onPathChange}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function DirectoryTree({
  currentPath,
  tree,
  onPathChange,
  loading
}: DirectoryTreeProps) {
  const handleRootClick = useCallback(() => {
    onPathChange('');
  }, [onPathChange]);

  if (loading && !tree) {
    return (
      <div className="w-full md:w-[250px] lg:w-[300px] bg-dark h-full overflow-y-auto border-r border-[#222] p-4">
        <div className="flex items-center gap-3">
          <div className="spin-glow w-5 h-5" />
          <span className="text-cyan font-mono text-sm">Scanning sectors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[250px] lg:w-[300px] bg-dark h-full overflow-y-auto border-r border-[#222]">
      <div className="p-2">
        {/* Root item */}
        <div
          className={`
            flex items-center gap-2 py-1.5 px-2 cursor-pointer transition-all duration-200
            hover:bg-[#1a1a1a] rounded
            ${currentPath === '' ? 'bg-[#1a1a1a] border-neon-cyan' : 'border border-transparent'}
          `}
          onClick={handleRootClick}
        >
          <span className="w-4 h-4 flex items-center justify-center text-cyan">◉</span>
          <span
            className={`
              font-mono text-sm font-bold transition-all duration-200
              ${currentPath === '' ? 'neon-cyan' : 'text-gray-300 hover:text-cyan'}
            `}
          >
            ROOT
          </span>
        </div>

        {/* Full tree */}
        {tree?.subdirs && tree.subdirs.length > 0 ? (
          [...tree.subdirs].sort((a, b) => a.name.localeCompare(b.name)).map((node) => (
            <DirectoryItem
              key={node.path}
              node={node}
              currentPath={currentPath}
              onPathChange={onPathChange}
              depth={1}
            />
          ))
        ) : (
          <div className="text-gray-500 text-sm font-mono px-4 py-2 mt-2">
            No subsystems available
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(DirectoryTree);
