'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Download, ExternalLink, ChevronLeft, ChevronRight, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, DownloadItem } from '@/lib/store-api';

// Dynamically import ePub for EPUB rendering
let ePub: any;
if (typeof window !== 'undefined') {
  import('epubjs').then((module) => {
    ePub = module.default;
  });
}

interface EbookFile {
  name: string;
  url: string;
}

interface EnhancedEbookViewerProps {
  product: Product;
  onClose: () => void;
}

export function EnhancedEbookViewer({ product, onClose }: EnhancedEbookViewerProps) {
  const [files, setFiles] = useState<EbookFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [fileType, setFileType] = useState<'pdf' | 'epub' | 'other'>('other');
  const [epubReady, setEpubReady] = useState(false);

  const viewerRef = useRef<HTMLDivElement>(null);
  const epubBookRef = useRef<any>(null);
  const epubRenditionRef = useRef<any>(null);

  // Extract all ebook files from product
  useEffect(() => {
    const extractedFiles: EbookFile[] = [];

    // Add primary digital_content_url if exists
    if (product.digital_content_url) {
      extractedFiles.push({
        name: product.title,
        url: product.digital_content_url,
      });
    }

    // Add files from downloads array
    if (product.downloads && Array.isArray(product.downloads)) {
      product.downloads.forEach((download) => {
        if (download.url) {
          extractedFiles.push({
            name: download.name || 'Untitled',
            url: download.url,
          });
        }
      });
    }

    setFiles(extractedFiles);
    console.log('[EnhancedEbookViewer] Extracted files:', extractedFiles);
  }, [product]);

  // Detect file type from URL
  useEffect(() => {
    if (files.length === 0) return;

    const currentFile = files[currentFileIndex];
    const url = currentFile.url.toLowerCase();

    if (url.endsWith('.pdf')) {
      setFileType('pdf');
    } else if (url.endsWith('.epub')) {
      setFileType('epub');
    } else {
      setFileType('other');
    }

    console.log('[EnhancedEbookViewer] File type detected:', { url, fileType: url.endsWith('.pdf') ? 'pdf' : url.endsWith('.epub') ? 'epub' : 'other' });
  }, [files, currentFileIndex]);

  // Load EPUB when file type is epub
  useEffect(() => {
    if (fileType !== 'epub' || !viewerRef.current || !ePub || files.length === 0) {
      return;
    }

    // Clean up previous EPUB
    if (epubRenditionRef.current) {
      epubRenditionRef.current.destroy();
    }

    const currentFile = files[currentFileIndex];
    console.log('[EnhancedEbookViewer] Loading EPUB:', currentFile.url);

    try {
      const book = ePub(currentFile.url);
      epubBookRef.current = book;

      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        spread: 'none',
      });

      epubRenditionRef.current = rendition;
      rendition.display();
      setEpubReady(true);

      // Add keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
          rendition.prev();
        } else if (e.key === 'ArrowRight') {
          rendition.next();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (rendition) {
          rendition.destroy();
        }
      };
    } catch (error) {
      console.error('[EnhancedEbookViewer] Error loading EPUB:', error);
      setEpubReady(false);
    }
  }, [fileType, currentFileIndex, files]);

  const handleDownload = (fileIndex?: number) => {
    const index = fileIndex !== undefined ? fileIndex : currentFileIndex;
    const file = files[index];
    if (file) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenNewTab = () => {
    const currentFile = files[currentFileIndex];
    if (currentFile) {
      window.open(currentFile.url, '_blank');
    }
  };

  const goToPreviousFile = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
      setEpubReady(false);
    }
  };

  const goToNextFile = () => {
    if (currentFileIndex < files.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
      setEpubReady(false);
    }
  };

  const handleEpubPrevPage = () => {
    if (epubRenditionRef.current) {
      epubRenditionRef.current.prev();
    }
  };

  const handleEpubNextPage = () => {
    if (epubRenditionRef.current) {
      epubRenditionRef.current.next();
    }
  };

  if (files.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-[#FAF8F1] rounded-lg shadow-2xl w-full max-w-4xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
              Ebook Not Available
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            This ebook's files are not configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  const currentFile = files[currentFileIndex];
  const getFileExtension = (url: string) => {
    return url.split('.').pop()?.toUpperCase() || 'FILE';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F1] rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-white rounded-t-lg">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-[#000000] truncate" style={{ fontFamily: 'Optima, serif' }}>
              {product.title}
            </h2>
            {files.length > 1 && (
              <p className="text-sm text-[#717680] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {currentFile.name}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* File type badge */}
            <span className="px-2 py-1 bg-[#E5E7EB] text-[#717680] text-xs font-medium rounded">
              {getFileExtension(currentFile.url)}
            </span>

            {/* Open in New Tab (only for PDF) */}
            {fileType === 'pdf' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenNewTab}
                className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            )}

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload()}
              className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-[#717680] hover:text-[#000000]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 bg-[#E5E7EB] overflow-hidden">
          {fileType === 'pdf' && (
            <iframe
              src={currentFile.url}
              className="w-full h-full"
              title={currentFile.name}
              style={{ border: 'none' }}
            />
          )}

          {fileType === 'epub' && (
            <div className="relative w-full h-full">
              <div ref={viewerRef} className="w-full h-full bg-white" />

              {/* EPUB Navigation Controls */}
              {epubReady && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEpubPrevPage}
                    className="border-[#E5E7EB]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-4 py-1 text-sm text-[#717680] flex items-center" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Use arrow keys to navigate
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEpubNextPage}
                    className="border-[#E5E7EB]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {fileType === 'other' && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white rounded-lg p-8 max-w-md text-center">
                <div className="w-16 h-16 bg-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-[#717680]" />
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
                  {getFileExtension(currentFile.url)} {currentFile.url.toLowerCase().endsWith('.zip') ? 'Archive' : 'Format'}
                </h3>
                <p className="text-[#717680] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {currentFile.url.toLowerCase().endsWith('.zip')
                    ? 'This is a compressed archive containing multiple files. Download and extract to access the contents.'
                    : currentFile.url.toLowerCase().endsWith('.mobi')
                    ? 'MOBI files can be read on Kindle devices and apps. Download to transfer to your device.'
                    : 'This file format cannot be previewed in the browser. Please download to view on your device.'
                  }
                </p>
                <Button
                  onClick={() => handleDownload()}
                  className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download {getFileExtension(currentFile.url)} File
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white rounded-b-lg">
          {files.length > 1 ? (
            <div className="flex items-center justify-between">
              {/* File Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousFile}
                  disabled={currentFileIndex === 0}
                  className="border-[#E5E7EB]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous File
                </Button>

                <span className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  File {currentFileIndex + 1} of {files.length}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextFile}
                  disabled={currentFileIndex === files.length - 1}
                  className="border-[#E5E7EB]"
                >
                  Next File
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Download All Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  files.forEach((_, index) => handleDownload(index));
                }}
                className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All ({files.length})
              </Button>
            </div>
          ) : (
            <p className="text-sm text-[#717680] text-center" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {fileType === 'pdf'
                ? "Use your browser's built-in PDF controls to navigate, zoom, and search."
                : fileType === 'epub'
                ? "Use arrow keys to navigate pages. Click download to save to your device."
                : "Click download to save this file to your device."
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
