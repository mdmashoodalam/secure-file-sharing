import api from './api';

const fileService = {

  // Upload a file
  uploadFile: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        if (onUploadProgress) onUploadProgress(progress);
      },
    });

    return response.data;
  },

  // Get files uploaded by current user
  getMyFiles: async () => {
    const response = await api.get('/files/my-files');
    return response.data;
  },

  // Get all files (admin only)
  getAllFiles: async () => {
    const response = await api.get('/files/all');
    return response.data;
  },

  // ✅ FIXED: Download a file with correct content-type and file extension
  downloadFile: async (fileId, fileName) => {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob', // get raw binary
    });

    // ✅ Read the actual content-type from server response headers
    // This ensures PDF stays PDF, docx stays docx, etc.
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    // ✅ Create blob with the correct MIME type from server
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    // ✅ Use the original file name (includes correct extension like .pdf, .docx)
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // fileName has the real extension
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Clean up the object URL after download
    setTimeout(() => window.URL.revokeObjectURL(url), 3000);
  },

  // Share a file with someone by email
  shareFile: async (fileId, shareWithEmail, permission = 'VIEW') => {
    const response = await api.post('/files/share', {
      fileId,
      shareWithEmail,
      permission,
    });
    return response.data;
  },

  // Get files shared with me
  getSharedWithMe: async () => {
    const response = await api.get('/files/shared-with-me');
    return response.data;
  },

  // Generate a temporary download link
  generateDownloadLink: async (fileId) => {
    const response = await api.post(`/files/generate-link/${fileId}`);
    return response.data;
  },

  // Delete a file
  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  // Format file size nicely
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Get file icon based on file type
  getFileIcon: (fileType) => {
    if (!fileType) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('zip')) return '🗜️';
    if (fileType.includes('text')) return '📃';
    return '📄';
  },
};

export default fileService;