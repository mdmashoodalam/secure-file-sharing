import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FileCard from '../components/FileCard';
import UploadModal from '../components/UploadModal';
import fileService from '../services/fileService';
import { toast } from 'react-toastify';

function MyFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await fileService.getMyFiles();
      setFiles(result.data || []);
    } catch (err) {
      toast.error('Failed to load your files');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    // Ask user to confirm before deleting
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileService.deleteFile(fileId);
      toast.success('File deleted');
      // Remove from local state (no need to reload all files)
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Filter files by search term
  const filteredFiles = files.filter(f =>
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Files</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {files.length} file{files.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium self-start"
            >
              + Upload New File
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="w-full sm:w-80 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full spinner mx-auto mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Loading your files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            // Empty state
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="text-6xl mb-4">
                {searchTerm ? '🔍' : '📭'}
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-lg mb-2">
                {searchTerm ? 'No files found' : 'No files yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                {searchTerm
                  ? `No files match "${searchTerm}"`
                  : 'Upload your first file to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-blue-700"
                >
                  Upload File
                </button>
              )}
            </div>
          ) : (
            // Files grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadSuccess={loadFiles}
      />
    </div>
  );
}

export default MyFiles;
