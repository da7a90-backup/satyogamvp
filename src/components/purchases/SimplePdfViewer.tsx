'use client';

import { X, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimplePdfViewerProps {
  product: {
    title: string;
    description?: string;
    digital_content_url?: string;
  };
  onClose: () => void;
}

export function SimplePdfViewer({ product, onClose }: SimplePdfViewerProps) {
  const pdfUrl = product.digital_content_url;

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${product.title}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

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
            {/* Open in New Tab */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenNewTab}
              className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
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

        {/* PDF Viewer - Using native browser PDF viewer via iframe */}
        <div className="flex-1 bg-[#E5E7EB]">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={product.title}
            style={{ border: 'none' }}
          />
        </div>

        {/* Footer with instructions */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white rounded-b-lg">
          <p className="text-sm text-[#717680] text-center" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Use your browser's built-in PDF controls to navigate, zoom, and search. Click "Open in New Tab" for full-screen viewing.
          </p>
        </div>
      </div>
    </div>
  );
}
