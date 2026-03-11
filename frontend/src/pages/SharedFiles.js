import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { toast } from 'react-toastify';

function SharedFiles() {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    try {
      setLoading(true);
      // Single API call that returns everything we need
      const res = await api.get('/files/shared-with-me/details');
      setSharedFiles(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load shared files');
    } finally {
      setLoading(false);
    }
  };

  // Download the file as original format
  const handleDownload = async (file) => {
    try {
      toast.info('Preparing download...');
      const response = await api.get(`/files/download/${file.fileId}`, {
        responseType: 'blob',
      });

      // Read real content-type from server so file saves with correct extension
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 3000);

      toast.success(`Downloading ${file.fileName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    }
  };

  // Open previewable files (PDF, image, text) in a new browser tab
  // Open file in browser tab for preview
const handlePreview = async (file) => {
  try {
    toast.info('Opening preview...');

    const response = await api.get(`/files/download/${file.fileId}`, {
      responseType: 'blob',
    });

    // Get the real content-type from server response headers
    const contentType = response.headers['content-type'] || file.fileType || 'application/octet-stream';

    // Create blob with correct type
    const blob = new Blob([response.data], { type: contentType });
    const blobUrl = window.URL.createObjectURL(blob);

    // Open in new tab
    const newTab = window.open(blobUrl, '_blank');

    // If browser blocked the popup, fallback to direct link
    if (!newTab) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    // Clean up after 30 seconds (give browser time to load it)
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 30000);

  } catch (err) {
    console.error('Preview error:', err);
    if (err.response?.status === 403) {
      toast.error('You do not have permission to preview this file');
    } else {
      toast.error('Could not open preview. Try downloading instead.');
    }
  }
};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shared with Me</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {sharedFiles.length > 0
                ? `${sharedFiles.length} file${sharedFiles.length !== 1 ? 's' : ''} shared with you`
                : 'Files that other users have shared with you'}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading shared files...</p>
            </div>
          ) : sharedFiles.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg mb-2">No shared files yet</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                When someone shares a file with you, it will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sharedFiles.map((file) => (
                <SharedFileCard
                  key={file.shareId}
                  file={file}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────
// File Card Component
// ─────────────────────────────────────────────
function SharedFileCard({ file, onDownload, onPreview }) {
  const canDownload = file.permission === 'DOWNLOAD';
  const previewable = isPreviewable(file.fileType);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md dark:hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600 transition-all">

      {/* ── Top preview area ── */}
      <div className={`h-32 flex items-center justify-center ${getFileBgColor(file.fileType)}`}>
        <div className="text-center">
          <div className="text-5xl mb-1">{getFileIcon(file.fileType)}</div>
          <span className="text-xs font-semibold uppercase tracking-wide opacity-60">
            {getFileExtension(file.fileName, file.fileType)}
          </span>
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-4">

        {/* File name */}
        <h3
          className="font-semibold text-gray-900 dark:text-white text-sm truncate mb-1"
          title={file.fileName}
        >
          {file.fileName}
        </h3>

        {/* File size */}
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
          {formatFileSize(file.fileSize)}
        </p>

        {/* Shared by - owner avatar + name */}
        <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {file.ownerName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">Shared by</p>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
              {file.ownerName || file.ownerEmail || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Date + permission badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(file.sharedDate)}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            canDownload
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}>
            {canDownload ? '⬇ Download' : '👁 View'}
          </span>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-col gap-2">

          {/* Download button - only for DOWNLOAD permission */}
          {canDownload && (
            <button
              onClick={() => onDownload(file)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              ⬇ Download File
            </button>
          )}

          {/* Preview button - for images, PDFs, text (any permission) */}
          {previewable && (
            <button
              onClick={() => onPreview(file)}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              👁 Preview in Browser
            </button>
          )}

          {/* Non-previewable files with VIEW-only: let them download to open */}
          {!canDownload && !previewable && (
            <button
              onClick={() => onDownload(file)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              ⬇ Download to Open
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────

// Get big emoji icon based on MIME type
function getFileIcon(fileType) {
  if (!fileType) return '📄';
  if (fileType.includes('image/png'))  return '🖼️';
  if (fileType.includes('image/jpeg')) return '📷';
  if (fileType.includes('image/gif'))  return '🎞️';
  if (fileType.includes('image'))      return '🖼️';
  if (fileType.includes('pdf'))        return '📕';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('zip'))        return '🗜️';
  if (fileType.includes('text'))       return '📃';
  return '📄';
}

// Get background color for the preview area
function getFileBgColor(fileType) {
  if (!fileType) return 'bg-gray-50';
  if (fileType.includes('image'))      return 'bg-purple-50';
  if (fileType.includes('pdf'))        return 'bg-red-50';
  if (fileType.includes('word') || fileType.includes('document')) return 'bg-blue-50';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'bg-green-50';
  if (fileType.includes('zip'))        return 'bg-yellow-50';
  if (fileType.includes('text'))       return 'bg-gray-50';
  return 'bg-gray-50';
}

// Get short extension label like "PDF", "DOCX", "PNG"
function getFileExtension(fileName, fileType) {
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop().toUpperCase();
  }
  if (!fileType) return 'FILE';
  const parts = fileType.split('/');
  return parts[parts.length - 1].toUpperCase();
}

// Check if file can be previewed in browser
function isPreviewable(fileType) {
  if (!fileType) return false;
  return (
    fileType.includes('image') ||
    fileType.includes('pdf') ||
    fileType.includes('text/plain')
  );
}

// Format bytes to readable string
function formatFileSize(bytes) {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default SharedFiles;