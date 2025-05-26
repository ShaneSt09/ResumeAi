import React from 'react';
import { FiDownload, FiX, FiFileText, FiFile, FiFileText as FiFilePdf } from 'react-icons/fi';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'docx' | 'txt') => Promise<void>;
  isExporting: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, isExporting }) => {
  if (!isOpen) return null;

  const exportOptions = [
    { format: 'pdf', label: 'PDF Document', icon: <FiFilePdf className="text-red-500" size={24} /> },
    { format: 'docx', label: 'Word Document', icon: <FiFile className="text-blue-500" size={24} /> },
    { format: 'txt', label: 'Plain Text', icon: <FiFileText className="text-gray-500" size={24} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Export Resume</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isExporting}
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">Choose a format to export your resume:</p>
          
          <div className="grid grid-cols-1 gap-4">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => onExport(option.format as 'pdf' | 'docx' | 'txt')}
                disabled={isExporting}
                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="mr-4">
                  {option.icon}
                </div>
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-500">.{(option.format === 'docx' ? 'docx' : option.format).toUpperCase()}</div>
                </div>
                <div className="ml-auto text-gray-400">
                  <FiDownload />
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;