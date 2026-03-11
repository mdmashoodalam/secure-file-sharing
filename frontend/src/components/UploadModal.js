import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import fileService from '../services/fileService';
import { toast } from 'react-toastify';

// Modal for uploading files with drag & drop support
function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

 

  // Called when user drops or selects a file
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('File type not allowed or file too large (max 10MB)');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  // Setup dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 1024 * 1024 * 1024, //1gb
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip'],
    },
    multiple: false, // Only allow one file at a time
  });

  // Upload the selected file
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      await fileService.uploadFile(file, (prog) => setProgress(prog));

      toast.success('File uploaded successfully! 🎉');
      setFile(null);
      setProgress(0);
      onClose();
      if (onUploadSuccess) onUploadSuccess();

    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-lg animate-fade-in">

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload File</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : file
              ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <input {...getInputProps()} />

          {file ? (
            // Show selected file info
            <div>
              <div className="text-4xl mb-2">{fileService.getFileIcon(file.type)}</div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{file.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{fileService.formatFileSize(file.size)}</p>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="mt-2 text-red-500 dark:text-red-400 text-xs hover:text-red-700 dark:hover:text-red-300"
              >
                Remove
              </button>
            </div>
          ) : (
            // Show drag & drop instructions
            <div>
              <div className="text-4xl mb-3">📂</div>
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">Drop it here!</p>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">Drag & drop your file here</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">or click to browse</p>
                </>
              )}
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">
                PDF, Images, Word, Excel, ZIP — Max 10MB
              </p>
            </div>
          )}
        </div>

        {/* Upload progress bar */}
        {uploading && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {uploading ? `Uploading ${progress}%` : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
