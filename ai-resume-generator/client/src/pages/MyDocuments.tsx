import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { FiArrowLeft, FiDownload, FiTrash2, FiEdit, FiFileText, FiFile, FiFilePlus } from 'react-icons/fi';
import { resumeAPI } from '../services/api';
import { useStore } from '../store';

type DocumentType = 'resume' | 'cover-letter' | 'portfolio';

interface Document {
  id: string;
  type: DocumentType;
  title: string;
  updatedAt: string;
  previewText?: string;
  // Add other common document fields here
}

export const MyDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Record<DocumentType, Document[]>>({
    'resume': [],
    'cover-letter': [],
    'portfolio': []
  });
  const [activeTab, setActiveTab] = useState<DocumentType>('resume');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) {
        setError('You must be logged in to view your documents');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch all document types
        const [resumes] = await Promise.all([
          resumeAPI.getResumes(),
          // Add other API calls for cover letters and portfolios when implemented
          // coverLetterAPI.getUserCoverLetters(),
          // portfolioAPI.getUserPortfolios(),
        ]);

        setDocuments({
          'resume': resumes.success ? resumes.data || [] : [],
          'cover-letter': [], // Update when cover letters are implemented
          'portfolio': []     // Update when portfolios are implemented
        });

        if (!resumes.success) {
          setError('Failed to load some documents');
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('An error occurred while loading your documents');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [user]);

  const handleDeleteDocument = async (id: string, type: DocumentType) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.replace('-', ' ')}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      let success = false;
      
      switch (type) {
        case 'resume': {
          const response = await resumeAPI.deleteResume(id);
          success = response?.success === true;
          break;
        }
        default:
          throw new Error('Delete not implemented for this document type');
      }
      
      if (success) {
        // Remove the deleted document from the state
        setDocuments(prev => ({
          ...prev,
          [type]: prev[type].filter(doc => doc.id !== id)
        }));
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert(`Failed to delete document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditDocument = (id: string, type: DocumentType) => {
    // Navigate to the appropriate editor based on document type
    switch (type) {
      case 'resume':
        navigate(`/resume/${id}`);
        break;
      // Add cases for other document types when implemented
      // case 'cover-letter':
      //   navigate(`/cover-letter/${id}`);
      //   break;
      default:
        console.warn('Edit not implemented for document type:', type);
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      let blob: Blob;
      let filename = `${doc.title.replace(/\s+/g, '_').toLowerCase()}`;
      
      switch (doc.type) {
        case 'resume':
          // For now, we'll generate a simple text file as a placeholder
          const resumeContent = `Resume: ${doc.title}\n\n` +
            `Last Updated: ${new Date(doc.updatedAt).toLocaleDateString()}\n\n`;
          
          blob = new Blob([resumeContent], { type: 'text/plain' });
          filename += '.txt';
          break;
          
        default:
          throw new Error('Export not implemented for this document type');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      const docBody = window.document.body;
      
      link.href = url;
      link.download = filename;
      docBody.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      docBody.removeChild(link);
      
    } catch (err) {
      console.error('Error exporting document:', err);
      alert(`Failed to export document: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Helper function to safely create DOM elements
  const createElement = (tag: string, props: Record<string, any> = {}): HTMLElement | null => {
    if (typeof window === 'undefined' || !window.document) return null;
    
    const element = window.document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === 'className' && value) {
        element.className = String(value);
      } else if (key === 'style' && value && typeof value === 'object') {
        Object.assign((element as HTMLElement).style, value);
      } else if (value !== undefined && value !== null) {
        element.setAttribute(key, String(value));
      }
    });
    return element;
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'resume':
        return <FiFileText className="text-blue-500" size={20} />;
      case 'cover-letter':
        return <FiFileText className="text-green-500" size={20} />;
      case 'portfolio':
        return <FiFile className="text-purple-500" size={20} />;
      default:
        return <FiFile size={20} />;
    }
  };

  const getCreateDocumentPath = (type: DocumentType) => {
    switch (type) {
      case 'resume':
        return '/resume/new';
      // Add cases for other document types when implemented
      // case 'cover-letter':
      //   return '/cover-letter/new';
      default:
        return '/';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Documents</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
        <Button 
          onClick={() => navigate(getCreateDocumentPath(activeTab))}
          className="flex items-center gap-2"
        >
          <FiFilePlus size={18} />
          Create New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
        </Button>
      </div>

      {/* Document Type Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(['resume', 'cover-letter', 'portfolio'] as DocumentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`${
                activeTab === type
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
            >
              {getDocumentIcon(type)}
              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              {documents[type].length > 0 && (
                <span className="ml-1 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {documents[type].length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Document List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {documents[activeTab].length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              {getDocumentIcon(activeTab)}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab.replace('-', ' ')}s</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new {activeTab.replace('-', ' ')}.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => navigate(getCreateDocumentPath(activeTab))}
                className="inline-flex items-center gap-2"
              >
                <FiFilePlus size={16} />
                New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
              </Button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {documents[activeTab].map((doc) => (
              <li key={doc.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {doc.title}
                        </p>
                        <p className="flex items-center text-sm text-gray-500">
                          <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        title="Download"
                      >
                        <FiDownload size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDocument(doc.id, doc.type)}
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.id, doc.type)}
                        title="Delete"
                        className="text-red-500 hover:bg-red-50"
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyDocuments;
