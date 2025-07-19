
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { api } from '../../services/mockApi';
import { ICONS } from '../../constants';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if(['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension!)) return ICONS.imageFile;
    if(['zip', 'rar', '7z'].includes(extension!)) return ICONS.zipFile;
    if(['exe', 'msi'].includes(extension!)) return ICONS.exeFile;
    return ICONS.otherFile;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setIsUploading(true);
    for (const file of files) {
      try {
        await api.uploadFile(file);
        onUpload(file);
      } catch (error) {
        console.error("Upload failed for file:", file.name, error);
        alert(`Upload failed for ${file.name}`);
      }
    }
    setIsUploading(false);
    setFiles([]);
    onClose();
  };
  
  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Files">
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${
            isDragActive
              ? "border-sky-500 bg-sky-50"
              : "border-slate-300 hover:border-sky-400"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-slate-500">
            Drag 'n' drop some files here, or click to select files
          </p>
        </div>
        {files.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            <h4 className="font-semibold text-slate-700">Selected Files:</h4>
            {files.map((file) => (
              <div
                key={`${file.name}-${file.lastModified}`}
                className="flex items-center justify-between p-2 bg-slate-100 rounded-md"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <span className="text-sm text-slate-800 truncate">
                    {file.name}
                  </span>
                </div>
                {/* 修复可访问性问题：添加 aria-label */}
                <button
                  onClick={() => removeFile(file.name)}
                  className="text-red-500 hover:text-red-700"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
          isLoading={isUploading}
        >
          Upload
        </Button>
      </div>
    </Modal>
  );
};

export default FileUploadModal;
