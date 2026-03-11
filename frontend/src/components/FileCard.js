import React, { useState, useEffect } from 'react';
import fileService from '../services/fileService';
import api from '../services/api';
import { toast } from 'react-toastify';

function FileCard({ file, onDelete, showOwner = false }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSharesModal, setShowSharesModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  // ✅ Default is now DOWNLOAD so users can preview + download
  const [sharePermission, setSharePermission] = useState('DOWNLOAD');
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shares, setShares] = useState([]);
  const [loadingShares, setLoadingShares] = useState(false);

  // Download the file
  const handleDownload = async () => {
    try {
      setDownloading(true);
      await fileService.downloadFile(file.id, file.fileName);
      toast.success('Download started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  // Share the file
  const handleShare = async (e) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;
    try {
      setSharing(true);
      await fileService.shareFile(file.id, shareEmail, sharePermission);
      toast.success(`File shared with ${shareEmail}`);
      setShowShareModal(false);
      setShareEmail('');
      setSharePermission('DOWNLOAD');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sharing failed');
    } finally {
      setSharing(false);
    }
  };

  // Load list of people this file is shared with
  const handleViewShares = async () => {
    try {
      setLoadingShares(true);
      setShowSharesModal(true);
      const res = await api.get(`/files/${file.id}/shares`);
      setShares(res.data.data || []);
    } catch (err) {
      toast.error('Could not load share info');
    } finally {
      setLoadingShares(false);
    }
  };

  // Remove a share (stop sharing with someone)
  const handleRemoveShare = async (shareId, name) => {
    if (!window.confirm(`Stop sharing with ${name}?`)) return;
    try {
      await api.delete(`/files/share/${shareId}`);
      toast.success(`Removed share with ${name}`);
      // Remove from local list
      setShares(shares.filter(s => s.shareId !== shareId));
    } catch (err) {
      toast.error('Could not remove share');
    }
  };

  // Generate temp link
  const handleGenerateLink = async () => {
    try {
      const result = await fileService.generateDownloadLink(file.id);
      await navigator.clipboard.writeText(result.data);
      toast.success('Link copied! Expires in 1 hour.');
    } catch (err) {
      toast.error('Failed to generate link');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-sm transition-all">

      {/* File icon and name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
          {fileService.getFileIcon(file.fileType)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm" title={file.fileName}>
            {file.fileName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {fileService.formatFileSize(file.fileSize)} · {formatDate(file.uploadDate)}
          </p>
        </div>
      </div>

      {/* File type badge */}
      <div className="mb-3">
        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
          {file.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {downloading ? '...' : '⬇ Download'}
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
        >
          ↗ Share
        </button>

        {/* ✅ New button: see who this file is shared with */}
        <button
          onClick={handleViewShares}
          className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
          title="See who you shared this with"
        >
          👥
        </button>

        <button
          onClick={handleGenerateLink}
          className="bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
          title="Copy temporary link"
        >
          🔗
        </button>

        {onDelete && (
          <button
            onClick={() => onDelete(file.id)}
            className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
          >
            🗑
          </button>
        )}
      </div>

      {/* ── Share File Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Share File</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">{file.fileName}</p>

            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Share with (email)
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Permission
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* ✅ DOWNLOAD is now the first and default option */}
                  <label className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    sharePermission === 'DOWNLOAD'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      value="DOWNLOAD"
                      checked={sharePermission === 'DOWNLOAD'}
                      onChange={(e) => setSharePermission(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-lg">⬇</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Download</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Can save file</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                    sharePermission === 'VIEW'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      value="VIEW"
                      checked={sharePermission === 'VIEW'}
                      onChange={(e) => setSharePermission(e.target.value)}
                      className="hidden"
                    />
                    <span className="text-lg">👁</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">View Only</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Preview only</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowShareModal(false); setShareEmail(''); }}
                  className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sharing}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {sharing ? 'Sharing...' : 'Share File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Who I Shared With Modal ── */}
      {showSharesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Shared With</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{file.fileName}</p>
              </div>
              <button
                onClick={() => setShowSharesModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ×
              </button>
            </div>

            {loadingShares ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🔒</div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Not shared with anyone yet</p>
                <button
                  onClick={() => { setShowSharesModal(false); setShowShareModal(true); }}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700"
                >
                  Share this file
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.shareId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {share.sharedWithName?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {share.sharedWithName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{share.sharedWithEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Permission badge */}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        share.permission === 'DOWNLOAD'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      }`}>
                        {share.permission === 'DOWNLOAD' ? '⬇' : '👁'} {share.permission}
                      </span>

                      {/* Remove share button */}
                      <button
                        onClick={() => handleRemoveShare(share.shareId, share.sharedWithName)}
                        className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400 text-lg leading-none"
                        title="Remove share"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}

                {/* Share with more button */}
                <button
                  onClick={() => { setShowSharesModal(false); setShowShareModal(true); }}
                  className="w-full mt-2 border border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 py-2 rounded-xl text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  + Share with someone else
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileCard;