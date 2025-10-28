
import React from 'react';

interface ImageViewerProps {
  title: string;
  imageUrl: string | null;
  children?: React.ReactNode;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ title, imageUrl, children }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center justify-center w-full h-full min-h-[300px] md:min-h-[400px]">
      <h3 className="text-xl font-semibold text-gray-200 mb-4">{title}</h3>
      <div className="w-full h-full flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="max-w-full max-h-full object-contain rounded-md" />
        ) : (
            <div className="text-gray-500">{children || 'No image loaded'}</div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
