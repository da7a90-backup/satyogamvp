'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, GripVertical, Plus, Search, X } from 'lucide-react';
import {
  getPageTagsWithEntities,
  getAvailableEntities,
  createHiddenTag,
  deleteHiddenTag,
  reorderTags,
  EntityType,
  HiddenTagWithEntity,
} from '@/lib/hidden-tags-api';

interface HiddenTagsManagerProps {
  pageTag: string;
  entityType: EntityType;
  title: string;
  description?: string;
  onUpdate?: () => void;
}

export default function HiddenTagsManager({
  pageTag,
  entityType,
  title,
  description,
  onUpdate,
}: HiddenTagsManagerProps) {
  const [tags, setTags] = useState<HiddenTagWithEntity[]>([]);
  const [availableEntities, setAvailableEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load existing tags
  useEffect(() => {
    loadTags();
  }, [pageTag, entityType]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await getPageTagsWithEntities(pageTag, entityType);
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load available entities when opening add dialog
  const loadAvailableEntities = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const entities = await getAvailableEntities(entityType, token, {
        page_tag: pageTag,
        search: searchQuery,
        limit: 50,
      });
      setAvailableEntities(entities);
    } catch (error) {
      console.error('Failed to load available entities:', error);
    }
  };

  useEffect(() => {
    if (showAddDialog) {
      loadAvailableEntities();
    }
  }, [showAddDialog, searchQuery]);

  const handleAddEntity = async (entityId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSaving(true);
      await createHiddenTag(
        {
          entity_id: entityId,
          entity_type: entityType,
          page_tag: pageTag,
          order_index: tags.length,
        },
        token
      );

      await loadTags();
      setShowAddDialog(false);
      setSearchQuery('');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add entity:', error);
      alert('Failed to add entity. It may already be tagged.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Remove this item from the page?')) return;

    try {
      setSaving(true);
      await deleteHiddenTag(tagId, token);
      await loadTags();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to remove tag:', error);
      alert('Failed to remove tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newTags = [...tags];
    const draggedItem = newTags[draggedIndex];
    newTags.splice(draggedIndex, 1);
    newTags.splice(index, 0, draggedItem);

    setTags(newTags);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSaving(true);
      const reorders = tags.map((tag, index) => ({
        tag_id: tag.id,
        new_order_index: index,
      }));

      await reorderTags(pageTag, reorders, token);
      await loadTags();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to reorder tags:', error);
      alert('Failed to save order');
      await loadTags(); // Reload to reset
    } finally {
      setSaving(false);
      setDraggedIndex(null);
    }
  };

  const getEntityTitle = (entity: any) => {
    return entity.title || entity.name || 'Untitled';
  };

  const getEntityImage = (entity: any) => {
    return entity.thumbnail_url || entity.featured_image || '/placeholder.jpg';
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          <button
            onClick={() => setShowAddDialog(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>

        {tags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items tagged for this page yet. Click "Add Item" to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div
                key={tag.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                  <Image
                    src={getEntityImage(tag.entity_data)}
                    alt={getEntityTitle(tag.entity_data)}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {getEntityTitle(tag.entity_data)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Order: {index + 1} of {tags.length}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  disabled={saving}
                  className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add {entityType} to {title}
                </h3>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {availableEntities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available {entityType}s found
                </div>
              ) : (
                <div className="grid gap-3">
                  {availableEntities.map((entity) => (
                    <button
                      key={entity.id}
                      onClick={() => handleAddEntity(entity.id)}
                      disabled={saving}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                        <Image
                          src={getEntityImage(entity)}
                          alt={getEntityTitle(entity)}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {getEntityTitle(entity)}
                        </h4>
                        {entity.published_at && (
                          <p className="text-sm text-gray-600">
                            {new Date(entity.published_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      <Plus className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
