"use client";

import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface MediaItem {
  id: number;
  url: string;
  mime: string;
  name: string;
}

interface PreviewMediaProps {
  media: MediaItem[];
}

const PreviewMedia = ({ media }: PreviewMediaProps) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Separate images and videos
  const images = media.filter((item) => item.mime.startsWith("image/"));
  const videos = media.filter((item) => item.mime.startsWith("video/"));

  const openMediaModal = (item: MediaItem) => {
    setSelectedMedia(item);
  };

  const closeMediaModal = () => {
    setSelectedMedia(null);
  };

  return (
    <div>
      {/* Media Gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative h-48 cursor-pointer rounded-lg overflow-hidden"
            onClick={() => openMediaModal(image)}
          >
            <Image
              src={image.url}
              alt={image.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
        ))}

        {videos.map((video) => (
          <div
            key={video.id}
            className="relative h-48 cursor-pointer rounded-lg overflow-hidden bg-gray-800"
            onClick={() => openMediaModal(video)}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayIcon className="h-16 w-16 text-white opacity-80" />
            </div>
            <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 text-sm truncate">
              {video.name}
            </p>
          </div>
        ))}
      </div>

      {/* Media Lightbox/Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={closeMediaModal}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-gray-800 hover:bg-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          <div className="max-w-6xl max-h-[80vh] relative">
            {selectedMedia.mime.startsWith("image/") ? (
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.name}
                width={1200}
                height={800}
                className="max-h-[80vh] object-contain"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="max-h-[80vh] max-w-full"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewMedia;
