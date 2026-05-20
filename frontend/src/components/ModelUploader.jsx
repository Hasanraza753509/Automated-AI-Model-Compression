import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function ModelUploader({ onUpload, isUploading, uploadProgress }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Invalid file. Please upload a .pth or .pt file.');
      return;
    }
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      onUpload(f);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.pth', '.pt'] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    disabled: isUploading,
  });

  const dropzoneClass = `dropzone ${isDragActive ? 'active' : ''} ${file ? 'accepted' : ''}`;

  return (
    <div className="w-full max-w-2xl mx-auto fade-in-up">
      <div {...getRootProps()} className={dropzoneClass} id="model-upload-zone">
        <input {...getInputProps()} id="model-file-input" />

        {isUploading ? (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
              background: 'rgba(5, 150, 105, 0.08)', border: '1px solid rgba(5, 150, 105, 0.18)',
            }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-accent-primary)' }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Uploading...</p>
              <p className="text-sm font-mono" style={{ color: 'var(--color-accent-primary)' }}>{uploadProgress}% complete</p>
            </div>
            <div className="progress-bar w-full max-w-sm">
              <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{
              background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.18)',
            }}>
              <FileCheck size={32} style={{ color: 'var(--color-accent-green)' }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold mb-1" style={{ color: 'var(--color-accent-green)' }}>{file.name}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to configure</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300" style={{
              background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.12)',
            }}>
              <Upload size={28} style={{ color: 'var(--color-accent-primary)' }} />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {isDragActive ? 'Drop your model here' : 'Drag & drop your .pth model'}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>or click to browse • Max 500 MB • .pth / .pt files</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 mt-5 p-4 rounded-xl text-sm fade-in-scale" style={{
          background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.18)', color: '#dc2626',
        }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
}
