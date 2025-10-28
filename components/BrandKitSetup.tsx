import React, { useState, useEffect } from 'react';
import { BrandKitData } from '../App';

interface BrandKitSetupProps {
  onClose: () => void;
  onSave: (data: BrandKitData) => void;
  currentBrandKit: BrandKitData | null;
}

const BrandKitSetup: React.FC<BrandKitSetupProps> = ({ onClose, onSave, currentBrandKit }) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [contactNumber, setContactNumber] = useState('');
  const [socialMedia, setSocialMedia] = useState('');

  useEffect(() => {
      if (currentBrandKit) {
          setLogoFile(currentBrandKit.logoFile);
          setContactNumber(currentBrandKit.contactNumber);
          setSocialMedia(currentBrandKit.socialMedia);
      }
  }, [currentBrandKit]);
  
  useEffect(() => {
    if (!logoFile) {
        setLogoPreview(null);
        return;
    }
    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFile])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSave = () => {
    onSave({ logoFile, contactNumber, socialMedia });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4 border border-gray-700">
        <h2 className="text-2xl font-bold text-white text-center">Setup Your Brand Kit</h2>
        
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Brand Logo</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="mx-auto h-24 w-auto" />
              ) : (
                <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-400">
                <label htmlFor="logo-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-blue-500 px-2">
                  <span>Upload a file</span>
                  <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg, image/svg+xml" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, SVG up to 2MB</p>
            </div>
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-300">Contact Number</label>
          <input
            type="text"
            id="contact"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Social Media */}
        <div>
          <label htmlFor="social" className="block text-sm font-medium text-gray-300">Social Media Handle</label>
          <input
            type="text"
            id="social"
            value={socialMedia}
            onChange={(e) => setSocialMedia(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="@YourBrand"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg">
            Cancel
          </button>
          <button onClick={handleSave} className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
            Save Brand Kit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandKitSetup;
