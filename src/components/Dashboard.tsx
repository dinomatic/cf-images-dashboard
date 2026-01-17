import { useState, useEffect, useCallback } from 'react';
import type { CloudflareImage, DirectoryNode } from '../types';
import DirectoryTree from './DirectoryTree';
import ContentGrid from './ContentGrid';
import Breadcrumb from './Breadcrumb';
import ImageModal from './ImageModal';

function Dashboard() {
  const [currentPath, setCurrentPath] = useState('');
  const [fullTree, setFullTree] = useState<DirectoryNode | null>(null);
  const [selectedImage, setSelectedImage] = useState<CloudflareImage | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In dev, use empty string to go through Vite proxy
  // In production, use the full API URL
  const apiBaseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || '');

  // Fetch the full tree once on mount
  useEffect(() => {
    const fetchTree = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/api/organize`, {
          headers: {
            'X-API-Key': import.meta.env.VITE_DASHBOARD_API_KEY || '',
          },
        });
        if (!response.ok) {
          throw new Error(`Transmission failed: ${response.status}`);
        }
        const data = await response.json();
        setFullTree(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Signal lost');
      } finally {
        setLoading(false);
      }
    };
    fetchTree();
  }, []);

  // Find current node in tree based on path
  const findNode = useCallback((tree: DirectoryNode | null, targetPath: string): DirectoryNode | null => {
    if (!tree) return null;
    if (targetPath === '' || targetPath === tree.path) return tree;

    // Recursive search through subdirs
    function search(node: DirectoryNode): DirectoryNode | null {
      if (node.path === targetPath) return node;
      if (!node.subdirs) return null;

      for (const subdir of node.subdirs) {
        if (targetPath === subdir.path || targetPath.startsWith(subdir.path + '/')) {
          const result = search(subdir);
          if (result) return result;
        }
      }
      return null;
    }

    return search(tree);
  }, []);

  const currentNode = findNode(fullTree, currentPath);
  const currentSubdirs = currentNode?.subdirs || [];
  const currentImages = currentNode?.images || [];

  const handlePathChange = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const handleImageClick = useCallback((image: CloudflareImage) => {
    setSelectedImage(image);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-4 left-4 z-40 bg-dark p-3 rounded-lg border-neon-cyan hover-glow"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 md:z-0
          h-full bg-dark
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <DirectoryTree
          currentPath={currentPath}
          tree={fullTree}
          onPathChange={handlePathChange}
          loading={loading}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[#050505]">
        {/* Breadcrumb */}
        <Breadcrumb path={currentPath} onNavigate={handlePathChange} />

        {/* Error message */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <p className="text-red-400 font-mono text-sm">
              <span className="font-bold">TRANSMISSION FAILED:</span> {error}
            </p>
          </div>
        )}

        {/* Content grid - shows both directories and images */}
        <ContentGrid
          subdirs={currentSubdirs}
          images={currentImages}
          onDirClick={handlePathChange}
          onImageClick={handleImageClick}
          loading={loading}
        />
      </main>

      {/* Image modal */}
      <ImageModal image={selectedImage} onClose={handleModalClose} />
    </div>
  );
}

export default Dashboard;
