import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UploadModal from '../components/UploadModal';
import fileService from '../services/fileService';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ myFiles: 0, sharedWithMe: 0 });
  const [recentFiles, setRecentFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load my files and shared files in parallel
      const [myFilesResult, sharedResult] = await Promise.all([
        fileService.getMyFiles(),
        fileService.getSharedWithMe(),
      ]);

      const myFiles = myFilesResult.data || [];
      const sharedFiles = sharedResult.data || [];

      setStats({
        myFiles: myFiles.length,
        sharedWithMe: sharedFiles.length,
      });

      // Show last 4 files uploaded
      setRecentFiles(myFiles.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Welcome header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and share your files securely</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start"
            >
              <span className="text-base">+</span>
              Upload File
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <StatCard
              icon="📁"
              title="My Files"
              value={loading ? '...' : stats.myFiles}
              color="blue"
              link="/my-files"
            />
            <StatCard
              icon="🔗"
              title="Shared with Me"
              value={loading ? '...' : stats.sharedWithMe}
              color="green"
              link="/shared"
            />
            <StatCard
              icon="🛡️"
              title="Secure Storage"
              value="Active"
              color="purple"
              link="/dashboard"
            />
          </div>

          {/* Recent files section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Files</h2>
              <Link to="/my-files" className="text-blue-600 dark:text-blue-400 text-sm hover:text-blue-700 dark:hover:text-blue-300">
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full spinner mx-auto"></div>
              </div>
            ) : recentFiles.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <div className="text-5xl mb-3">📭</div>
                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-1">No files yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Upload your first file to get started</p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Upload File
                </button>
              </div>
            ) : (
              // File list - simple table style
              <div className="space-y-2">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                      {fileService.getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.fileName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {fileService.formatFileSize(file.fileSize)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            <QuickAction icon="⬆️" label="Upload File" onClick={() => setShowUpload(true)} />
            <QuickAction icon="📁" label="Browse Files" link="/my-files" />
            <QuickAction icon="🔗" label="Shared Files" link="/shared" />
          </div>
        </div>
      </div>

      <Footer />

      {/* Upload modal */}
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUploadSuccess={loadDashboardData}
      />
    </div>
  );
}

// Stat card component
function StatCard({ icon, title, value, color, link }) {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <Link to={link} className="block">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:border-blue-200 dark:hover:border-blue-600 transition-colors hover:shadow-sm">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${colorMap[color]}`}>
          {icon}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{title}</p>
      </div>
    </Link>
  );
}

// Quick action button
function QuickAction({ icon, label, onClick, link }) {
  const content = (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all cursor-pointer">
      <span className="text-2xl">{icon}</span>
      <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-1">{label}</p>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return <div onClick={onClick}>{content}</div>;
}

export default Dashboard;
