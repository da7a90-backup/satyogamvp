'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Upload, Save, RefreshCw } from 'lucide-react';

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

  const { data: session } = useSession();
  const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

  useEffect(() => {
    if (session?.user?.accessToken) {
      fetchPageData();
    }
  }, [pageSlug, session]);

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

      // Initialize edited content state
      const initialContent: {[key: number]: SectionContent} = {};
      data.sections.forEach((section: PageSection) => {
        if (section.content) {
          initialContent[section.id] = { ...section.content };
        }
      });
      setEditedContent(initialContent);

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

  const handleSaveSection = async (sectionId: number) => {
    try {
      setSaving(true);
      const token = session?.user?.accessToken;

      const response = await fetch(`${FASTAPI_URL}/api/admin/content/sections/${sectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: editedContent[sectionId],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save section');
      }

      toast({
        title: 'Success',
        description: 'Section updated successfully',
      });

      // Refresh data
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

  const renderImageField = (sectionId: number, field: string, label: string, currentValue?: string) => {
    const uploadKey = `${sectionId}-${field}`;
    const isUploading = uploadingImages[uploadKey];

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Input
              type="text"
              value={editedContent[sectionId]?.[field] || ''}
              onChange={(e) => handleInputChange(sectionId, field, e.target.value)}
              placeholder="Enter image URL or upload below"
            />
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id={`${sectionId}-${field}-upload`}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(sectionId, field, file);
                }
              }}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById(`${sectionId}-${field}-upload`)?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
        {(currentValue || editedContent[sectionId]?.[field]) && (
          <div className="mt-2">
            <img
              src={editedContent[sectionId]?.[field] || currentValue}
              alt={label}
              className="max-w-xs h-auto rounded border"
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="p-8">
        <p className="text-red-500">Failed to load page data</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-2">Edit content for: {pageSlug}</p>
      </div>

      <div className="space-y-6">
        {pageData.sections.map((section) => (
          <Card key={section.id} className="p-6">
            <div className="mb-4 pb-4 border-b">
              <h2 className="text-xl font-semibold">{section.section_slug}</h2>
              <p className="text-sm text-gray-500">Type: {section.section_type} | Order: {section.order_index}</p>
            </div>

            <div className="space-y-4">
              {/* Text Fields */}
              {section.content?.eyebrow !== undefined && (
                <div>
                  <Label>Eyebrow</Label>
                  <Input
                    value={editedContent[section.id]?.eyebrow || ''}
                    onChange={(e) => handleInputChange(section.id, 'eyebrow', e.target.value)}
                    placeholder="Eyebrow text"
                  />
                </div>
              )}

              {section.content?.heading !== undefined && (
                <div>
                  <Label>Heading</Label>
                  <Input
                    value={editedContent[section.id]?.heading || ''}
                    onChange={(e) => handleInputChange(section.id, 'heading', e.target.value)}
                    placeholder="Heading text"
                  />
                </div>
              )}

              {section.content?.subheading !== undefined && (
                <div>
                  <Label>Subheading</Label>
                  <Input
                    value={editedContent[section.id]?.subheading || ''}
                    onChange={(e) => handleInputChange(section.id, 'subheading', e.target.value)}
                    placeholder="Subheading text"
                  />
                </div>
              )}

              {section.content?.tagline !== undefined && (
                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={editedContent[section.id]?.tagline || ''}
                    onChange={(e) => handleInputChange(section.id, 'tagline', e.target.value)}
                    placeholder="Tagline text"
                  />
                </div>
              )}

              {section.content?.subtitle !== undefined && (
                <div>
                  <Label>Subtitle</Label>
                  <Input
                    value={editedContent[section.id]?.subtitle || ''}
                    onChange={(e) => handleInputChange(section.id, 'subtitle', e.target.value)}
                    placeholder="Subtitle text"
                  />
                </div>
              )}

              {section.content?.description !== undefined && (
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={editedContent[section.id]?.description || ''}
                    onChange={(e) => handleInputChange(section.id, 'description', e.target.value)}
                    placeholder="Description text"
                    rows={4}
                  />
                </div>
              )}

              {section.content?.quote !== undefined && (
                <div>
                  <Label>Quote</Label>
                  <Textarea
                    value={editedContent[section.id]?.quote || ''}
                    onChange={(e) => handleInputChange(section.id, 'quote', e.target.value)}
                    placeholder="Quote text"
                    rows={3}
                  />
                </div>
              )}

              {/* Video Fields */}
              {section.content?.video_url !== undefined && (
                <div>
                  <Label>Video URL</Label>
                  <Input
                    value={editedContent[section.id]?.video_url || ''}
                    onChange={(e) => handleInputChange(section.id, 'video_url', e.target.value)}
                    placeholder="Video URL"
                  />
                </div>
              )}

              {/* Image Fields */}
              {section.content?.image_url !== undefined && renderImageField(section.id, 'image_url', 'Image', section.content.image_url)}
              {section.content?.background_image !== undefined && renderImageField(section.id, 'background_image', 'Background Image', section.content.background_image)}
              {section.content?.background_decoration !== undefined && renderImageField(section.id, 'background_decoration', 'Background Decoration', section.content.background_decoration)}
              {section.content?.video_thumbnail !== undefined && renderImageField(section.id, 'video_thumbnail', 'Video Thumbnail', section.content.video_thumbnail)}
              {section.content?.logo_url !== undefined && renderImageField(section.id, 'logo_url', 'Logo', section.content.logo_url)}

              {/* CTA Fields */}
              {section.content?.button_text !== undefined && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Button Text</Label>
                    <Input
                      value={editedContent[section.id]?.button_text || ''}
                      onChange={(e) => handleInputChange(section.id, 'button_text', e.target.value)}
                      placeholder="Button text"
                    />
                  </div>
                  <div>
                    <Label>Button Link</Label>
                    <Input
                      value={editedContent[section.id]?.button_link || ''}
                      onChange={(e) => handleInputChange(section.id, 'button_link', e.target.value)}
                      placeholder="/path/to/page"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => handleSaveSection(section.id)}
                disabled={saving}
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
          </Card>
        ))}

        {/* Accordion Sections */}
        {pageData.accordion_sections.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Accordion Sections</h2>
            <Card className="p-6">
              <p className="text-gray-600">Accordion editing coming soon...</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
