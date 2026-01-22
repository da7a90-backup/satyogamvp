'use client';

import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load react-pdf to avoid SSR issues
let Document: any;
let Page: any;
let pdfjs: any;

if (typeof window !== 'undefined') {
  const reactPdf = require('react-pdf');
  Document = reactPdf.Document;
  Page = reactPdf.Page;
  pdfjs = reactPdf.pdfjs;

  // Configure PDF.js worker
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

  // Import CSS styles
  require('react-pdf/dist/Page/AnnotationLayer.css');
  require('react-pdf/dist/Page/TextLayer.css');
}

interface EbookViewerModalProps {
  product: {
    title: string;
    description?: string;
    thumbnail_url?: string;
    featured_image?: string;
    digital_content_url?: string;
  };
  onClose: () => void;
}

export function EbookViewerModal({ product, onClose }: EbookViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const pdfUrl = product.digital_content_url;

  // Ensure component is mounted before rendering PDF
  useEffect(() => {
    setMounted(true);
  }, []);

  // Log the URL for debugging
  useEffect(() => {
    if (pdfUrl) {
      console.log('PDF URL:', pdfUrl);
    }
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded successfully. Pages:', numPages);
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    setError(`Failed to load ebook: ${error.message || 'The file may be corrupted or unavailable.'}`);
    setLoading(false);
  }

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(2.0, prev + 0.1));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.1));
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= numPages) {
      setPageNumber(value);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') {
        goToPreviousPage();
      } else if (e.code === 'ArrowRight') {
        goToNextPage();
      } else if (e.code === 'Equal' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomIn();
      } else if (e.code === 'Minus' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pageNumber, numPages, scale]); // Add dependencies

  if (!pdfUrl) {
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
            This ebook's file URL is not configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F1] rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB] bg-white rounded-t-lg">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-[#000000] truncate" style={{ fontFamily: 'Optima, serif' }}>
              {product.title}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="border-[#E5E7EB]"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-[#717680] min-w-[60px] text-center" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="border-[#E5E7EB]"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5 ml-2"
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

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-[#E5E7EB] p-4">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#7D1A13] mx-auto mb-4" />
                <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Loading ebook...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="bg-white rounded-lg p-8 max-w-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
                  Unable to Load Ebook
                </h3>
                <p className="text-[#717680] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {error}
                </p>
                <Button
                  onClick={onClose}
                  className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {!error && mounted && Document && Page && (
            <div className="flex items-center justify-center">
              <Document
                file={{
                  url: pdfUrl,
                  httpHeaders: {
                    'Accept': 'application/pdf',
                  },
                  withCredentials: false,
                }}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="shadow-lg"
                options={{
                  cMapUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/`,
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="bg-white"
                />
              </Document>
            </div>
          )}

          {!error && !mounted && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#7D1A13] mx-auto mb-4" />
                <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Initializing PDF viewer...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!error && numPages > 0 && (
          <div className="p-4 border-t border-[#E5E7EB] bg-white rounded-b-lg">
            <div className="flex items-center justify-between">
              {/* Page Info */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={pageNumber <= 1}
                  className="border-[#E5E7EB]"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Page
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={numPages}
                    value={pageNumber}
                    onChange={handlePageInput}
                    className="w-16 px-2 py-1 text-sm text-center border border-[#E5E7EB] rounded focus:outline-none focus:ring-2 focus:ring-[#7D1A13]"
                  />
                  <span className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    of {numPages}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className="border-[#E5E7EB]"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Keyboard Shortcuts Help */}
              <p className="text-xs text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                Use arrow keys to navigate • Cmd/Ctrl +/- to zoom
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
