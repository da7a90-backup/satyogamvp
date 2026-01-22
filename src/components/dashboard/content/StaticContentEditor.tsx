'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import {
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Link2,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import ImageFieldEditor from './ImageFieldEditor';
import VideoFieldEditor from './VideoFieldEditor';
import LivePreviewPanel from './LivePreviewPanel';

interface SectionContent {
  id?: number;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  tagline?: string;
  description?: string;
  quote?: string;
  video_url?: string;
  video_thumbnail?: string;
  video_type?: string;
  logo_url?: string;
  logo_alt?: string;
  subtitle?: string;
  image_url?: string;
  image_alt?: string;
  background_image?: string;
  background_decoration?: string;
  image_gravity?: string;
  button_text?: string;
  button_link?: string;
  [key: string]: any;
}

interface PageSection {
  id: number;
  section_slug: string;
  section_type: string;
  order_index: number;
  is_active: boolean;
  content: SectionContent;
  tabs?: any[];
  decorations?: any[];
}

interface PageData {
  page_slug: string;
  sections: PageSection[];
  accordion_sections: any[];
}

interface StaticContentEditorProps {
  pageSlug: string;
  title: string;
}

export default function StaticContentEditor({ pageSlug, title }: StaticContentEditorProps) {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{[key: string]: boolean}>({});
  const [editedContent, setEditedContent] = useState<{[sectionId: number]: SectionContent}>({});
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: number]: boolean}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalContent, setOriginalContent] = useState<{[sectionId: number]: SectionContent}>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session } = useSession();
  const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

  // Debug: track component renders
  useEffect(() => {
    console.log('[StaticContentEditor] Component rendered', {
      showPreview,
      loading,
      saving,
      hasUnsavedChanges,
      pageDataExists: !!pageData,
      sessionExists: !!session
    });
  });

  // Memoize onClose handler to prevent LivePreviewPanel remounts
  const handleClosePreview = useCallback(() => {
    console.log('[StaticContentEditor] Closing preview');
    setShowPreview(false);
  }, []);

  // Memoize fetchPageData to prevent infinite loops
  const fetchPageDataMemoized = useCallback(async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken;

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/pages/${pageSlug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page data');
      }

      const data = await response.json();
      setPageData(data);

      // Initialize edited content state and keep copy of original
      const initialContent: {[key: number]: SectionContent} = {};
      const initialOriginal: {[key: number]: SectionContent} = {};
      const initialExpanded: {[key: number]: boolean} = {};
      data.sections.forEach((section: PageSection) => {
        if (section.content) {
          initialContent[section.id] = { ...section.content };
          initialOriginal[section.id] = { ...section.content }; // Deep copy for comparison
        }
        initialExpanded[section.id] = true; // Expand all by default
      });
      setEditedContent(initialContent);
      setOriginalContent(initialOriginal);
      setExpandedSections(initialExpanded);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Error fetching page data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load page content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [pageSlug, session?.user?.accessToken, FASTAPI_URL]);

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchPageDataMemoized();
    }
  }, [fetchPageDataMemoized, session?.user?.accessToken]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken;

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/pages/${pageSlug}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch page data');
      }

      const data = await response.json();
      setPageData(data);

      // Initialize edited content state and keep copy of original
      const initialContent: {[key: number]: SectionContent} = {};
      const initialOriginal: {[key: number]: SectionContent} = {};
      const initialExpanded: {[key: number]: boolean} = {};
      data.sections.forEach((section: PageSection) => {
        if (section.content) {
          initialContent[section.id] = { ...section.content };
          initialOriginal[section.id] = { ...section.content }; // Deep copy for comparison
        }
        initialExpanded[section.id] = true; // Expand all by default
      });
      setEditedContent(initialContent);
      setOriginalContent(initialOriginal);
      setExpandedSections(initialExpanded);
      setHasUnsavedChanges(false);

    } catch (error) {
      console.error('Error fetching page data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load page content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (sectionId: number, field: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleImageUpload = async (sectionId: number, field: string, file: File) => {
    const uploadKey = `${sectionId}-${field}`;
    try {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));

      const token = session?.user?.accessToken;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', `${pageSlug}-${field}`);

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update the field with the CDN URL
      handleInputChange(sectionId, field, data.cdn_url);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleVideoUpload = async (sectionId: number, field: string, file: File) => {
    const uploadKey = `${sectionId}-${field}`;
    try {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));

      const token = session?.user?.accessToken;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', `${pageSlug}-${field}`);

      console.log(`[StaticContentEditor] Uploading video: ${file.name} (${file.size} bytes)`);

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();

      console.log(`[StaticContentEditor] Video uploaded successfully: ${data.cdn_url}`);

      // Update the field with the CDN URL
      handleInputChange(sectionId, field, data.cdn_url);

      toast({
        title: 'Success',
        description: `Video uploaded successfully! (${(data.file_size / 1024 / 1024).toFixed(2)} MB)`,
      });

    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleSaveSection = async (sectionId: number) => {
    try {
      setSaving(true);
      const token = session?.user?.accessToken;

      // Get only the fields that have changed
      const changedFields = getChangedFields(sectionId);

      // If no fields changed, don't send request
      if (Object.keys(changedFields).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No fields were modified',
        });
        setSaving(false);
        return;
      }

      console.log('[StaticContentEditor] Saving only changed fields:', Object.keys(changedFields));

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: changedFields, // Only send changed fields
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save section');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: (
          <div>
            <p className="mb-2">Section updated successfully!</p>
            <p className="text-xs text-gray-500">
              {result.cache_hint || 'Changes may take up to 1 hour to appear. Click "Refresh Cache" to see changes immediately.'}
            </p>
          </div>
        ),
      });

      setHasUnsavedChanges(false);

      // Refresh data to update original content
      await fetchPageData();

    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: 'Error',
        description: 'Failed to save section',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionExpanded = (sectionId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Get only changed fields for a section
  const getChangedFields = (sectionId: number): Partial<SectionContent> => {
    const edited = editedContent[sectionId] || {};
    const original = originalContent[sectionId] || {};
    const changed: Partial<SectionContent> = {};

    Object.keys(edited).forEach(key => {
      if (edited[key] !== original[key]) {
        changed[key] = edited[key];
      }
    });

    return changed;
  };

  // Force refresh cache for the current page
  const handleForceRefresh = async () => {
    try {
      setIsRefreshing(true);
      const token = session?.user?.accessToken;

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/revalidate/${pageSlug}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message || 'Cache refreshed successfully',
        });
      } else {
        toast({
          title: 'Warning',
          description: 'Cache refresh may not be fully configured',
          variant: 'default',
        });
      }

    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast({
        title: 'Info',
        description: 'Manual refresh: Visit /?preview=true to see changes immediately',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading page content...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="p-8 max-w-md mx-4">
          <p className="text-red-500 text-center mb-4">Failed to load page data</p>
          <Button onClick={fetchPageData} className="w-full">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Editor Panel */}
      <div className={`flex flex-col ${showPreview ? 'w-3/5' : 'w-full'} transition-all duration-300`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                {title}
              </h1>
              <p className="text-purple-100 text-sm mt-1">
                Editing: <span className="font-medium">{pageSlug}</span>
                {hasUnsavedChanges && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-yellow-900 rounded text-xs font-medium">
                    Unsaved Changes
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleForceRefresh}
                disabled={isRefreshing}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
                title="Force refresh cache to see changes immediately"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Cache
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {pageData.sections.map((section) => {
            const isExpanded = expandedSections[section.id];
            const isUploading = Object.keys(uploadingImages).some(
              key => key.startsWith(`${section.id}-`) && uploadingImages[key]
            );

            return (
              <Card key={section.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Section Header */}
                <div
                  className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleSectionExpanded(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`
                        p-2 rounded-lg ${isExpanded ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}
                      `}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800">{section.section_slug}</h2>
                        <p className="text-xs text-gray-500">
                          {section.section_type} • Order: {section.order_index}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUploading && (
                        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                {isExpanded && (
                  <div className="p-6 space-y-6">
                    {/* Text Content Group */}
                    {(section.content?.eyebrow !== undefined ||
                      section.content?.heading !== undefined ||
                      section.content?.subheading !== undefined ||
                      section.content?.tagline !== undefined ||
                      section.content?.subtitle !== undefined ||
                      section.content?.description !== undefined ||
                      section.content?.quote !== undefined) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b">
                          <FileText className="h-4 w-4" />
                          Text Content
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                          {section.content?.eyebrow !== undefined && (
                            <div>
                              <Label className="text-sm">Eyebrow</Label>
                              <Input
                                value={editedContent[section.id]?.eyebrow || ''}
                                onChange={(e) => handleInputChange(section.id, 'eyebrow', e.target.value)}
                                placeholder="Small text above heading"
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.heading !== undefined && (
                            <div>
                              <Label className="text-sm">Heading</Label>
                              <Input
                                value={editedContent[section.id]?.heading || ''}
                                onChange={(e) => handleInputChange(section.id, 'heading', e.target.value)}
                                placeholder="Main heading"
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.subheading !== undefined && (
                            <div>
                              <Label className="text-sm">Subheading</Label>
                              <Input
                                value={editedContent[section.id]?.subheading || ''}
                                onChange={(e) => handleInputChange(section.id, 'subheading', e.target.value)}
                                placeholder="Secondary heading"
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.tagline !== undefined && (
                            <div>
                              <Label className="text-sm">Tagline</Label>
                              <Input
                                value={editedContent[section.id]?.tagline || ''}
                                onChange={(e) => handleInputChange(section.id, 'tagline', e.target.value)}
                                placeholder="Short tagline"
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.subtitle !== undefined && (
                            <div>
                              <Label className="text-sm">Subtitle</Label>
                              <Input
                                value={editedContent[section.id]?.subtitle || ''}
                                onChange={(e) => handleInputChange(section.id, 'subtitle', e.target.value)}
                                placeholder="Subtitle text"
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.description !== undefined && (
                            <div>
                              <Label className="text-sm">Description</Label>
                              <Textarea
                                value={editedContent[section.id]?.description || ''}
                                onChange={(e) => handleInputChange(section.id, 'description', e.target.value)}
                                placeholder="Main description content"
                                rows={4}
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.quote !== undefined && (
                            <div>
                              <Label className="text-sm">Quote</Label>
                              <Textarea
                                value={editedContent[section.id]?.quote || ''}
                                onChange={(e) => handleInputChange(section.id, 'quote', e.target.value)}
                                placeholder="Inspirational quote"
                                rows={3}
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Media Group */}
                    {(section.content?.image_url !== undefined ||
                      section.content?.background_image !== undefined ||
                      section.content?.background_decoration !== undefined ||
                      section.content?.video_thumbnail !== undefined ||
                      section.content?.logo_url !== undefined ||
                      section.content?.video_url !== undefined) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b">
                          <ImageIcon className="h-4 w-4" />
                          Media Assets
                        </h3>

                        <div className="space-y-4">
                          {section.content?.video_url !== undefined && (
                            <VideoFieldEditor
                              label="Hero Video"
                              value={editedContent[section.id]?.video_url || ''}
                              onChange={(value) => handleInputChange(section.id, 'video_url', value)}
                              onUpload={(file) => handleVideoUpload(section.id, 'video_url', file)}
                              isUploading={uploadingImages[`${section.id}-video_url`]}
                              helperText="Upload a video file (max 500MB) or enter a URL. Uploaded videos will be stored in Cloudflare R2."
                            />
                          )}

                          {section.content?.image_url !== undefined && (
                            <ImageFieldEditor
                              label="Main Image"
                              value={editedContent[section.id]?.image_url || ''}
                              onChange={(value) => handleInputChange(section.id, 'image_url', value)}
                              onUpload={(file) => handleImageUpload(section.id, 'image_url', file)}
                              isUploading={uploadingImages[`${section.id}-image_url`]}
                            />
                          )}

                          {section.content?.background_image !== undefined && (
                            <ImageFieldEditor
                              label="Background Image"
                              value={editedContent[section.id]?.background_image || ''}
                              onChange={(value) => handleInputChange(section.id, 'background_image', value)}
                              onUpload={(file) => handleImageUpload(section.id, 'background_image', file)}
                              isUploading={uploadingImages[`${section.id}-background_image`]}
                              gravity={editedContent[section.id]?.image_gravity || null}
                              onGravityChange={(value) => handleInputChange(section.id, 'image_gravity', value)}
                              showGravitySelector={true}
                            />
                          )}

                          {section.content?.background_decoration !== undefined && (
                            <ImageFieldEditor
                              label="Background Decoration"
                              value={editedContent[section.id]?.background_decoration || ''}
                              onChange={(value) => handleInputChange(section.id, 'background_decoration', value)}
                              onUpload={(file) => handleImageUpload(section.id, 'background_decoration', file)}
                              isUploading={uploadingImages[`${section.id}-background_decoration`]}
                            />
                          )}

                          {section.content?.video_thumbnail !== undefined && (
                            <ImageFieldEditor
                              label="Video Thumbnail"
                              value={editedContent[section.id]?.video_thumbnail || ''}
                              onChange={(value) => handleInputChange(section.id, 'video_thumbnail', value)}
                              onUpload={(file) => handleImageUpload(section.id, 'video_thumbnail', file)}
                              isUploading={uploadingImages[`${section.id}-video_thumbnail`]}
                            />
                          )}

                          {section.content?.logo_url !== undefined && (
                            <ImageFieldEditor
                              label="Logo"
                              value={editedContent[section.id]?.logo_url || ''}
                              onChange={(value) => handleInputChange(section.id, 'logo_url', value)}
                              onUpload={(file) => handleImageUpload(section.id, 'logo_url', file)}
                              isUploading={uploadingImages[`${section.id}-logo_url`]}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Call-to-Action Group */}
                    {(section.content?.button_text !== undefined ||
                      section.content?.button_link !== undefined) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b">
                          <Link2 className="h-4 w-4" />
                          Call-to-Action
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          {section.content?.button_text !== undefined && (
                            <div>
                              <Label className="text-sm">Button Text</Label>
                              <Input
                                value={editedContent[section.id]?.button_text || ''}
                                onChange={(e) => handleInputChange(section.id, 'button_text', e.target.value)}
                                placeholder="Click me"
                                className="mt-1"
                              />
                            </div>
                          )}

                          {section.content?.button_link !== undefined && (
                            <div>
                              <Label className="text-sm">Button Link</Label>
                              <Input
                                value={editedContent[section.id]?.button_link || ''}
                                onChange={(e) => handleInputChange(section.id, 'button_link', e.target.value)}
                                placeholder="/path/to/page"
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="pt-4 border-t flex justify-end">
                      <Button
                        onClick={() => handleSaveSection(section.id)}
                        disabled={saving || isUploading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Section
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {/* Accordion Sections Notice */}
          {pageData.accordion_sections.length > 0 && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Accordion Sections</h2>
              <p className="text-sm text-blue-700">
                This page has {pageData.accordion_sections.length} accordion section(s).
                Advanced editing coming soon...
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="w-2/5 h-screen">
          <LivePreviewPanel
            pageSlug={pageSlug}
            onClose={handleClosePreview}
          />
        </div>
      )}
    </div>
  );
}
