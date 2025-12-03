// src/components/reports/EvidenceUpload.jsx
import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from '../ui';

const EvidenceUpload = ({ onFilesChange, maxFiles = 5, maxSize = 10 * 1024 * 1024 }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError('');

    // Validate number of files
    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Tối đa ${maxFiles} file`);
      return;
    }

    // Validate file sizes
    const invalidFiles = selectedFiles.filter(f => f.size > maxSize);
    if (invalidFiles.length > 0) {
      setError(`Một số file quá lớn (tối đa ${(maxSize / 1024 / 1024).toFixed(0)}MB)`);
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const invalidTypes = selectedFiles.filter(f => !validTypes.includes(f.type));
    if (invalidTypes.length > 0) {
      setError('Chỉ chấp nhận ảnh (JPG, PNG, GIF, WEBP) hoặc PDF');
      return;
    }

    const newFiles = selectedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles.map(f => f.file));
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          id="evidence-upload"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
        <label
          htmlFor="evidence-upload"
          className={`cursor-pointer ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            Click để upload bằng chứng (screenshots, ảnh chụp)
          </p>
          <p className="text-xs text-gray-500">
            Tối đa {maxFiles} file, mỗi file ≤ {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Hỗ trợ: JPG, PNG, GIF, WEBP, PDF
          </p>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            File đã chọn ({files.length}/{maxFiles}):
          </p>
          {files.map((fileData, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Preview or Icon */}
              {fileData.preview ? (
                <img
                  src={fileData.preview}
                  alt={fileData.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded">
                  <FileText className="w-6 h-6 text-gray-500" />
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileData.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileData.size)}
                </p>
              </div>

              {/* Success Icon */}
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />

              {/* Remove Button */}
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EvidenceUpload;
