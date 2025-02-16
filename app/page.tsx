'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      setImages(prev => [...prev, ...validFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (images.length === 0) return;

    setIsLoading(true);
    const formData = new FormData();
    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">Image Classifier</h1>
            <p className="text-gray-500">Upload your images and get AI-powered analysis</p>
          </div>
          
          {/* Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <svg 
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-blue-500 hover:text-blue-600"
                >
                  <span className="font-semibold">Click to upload</span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>

          {/* Image Preview Gallery */}
          {images.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Uploaded Images ({images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={URL.createObjectURL(image)} 
                    className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                  >
                    <Image
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={images.length === 0 || isLoading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg 
                  className="animate-spin h-5 w-5 text-white" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Processing...</span>
              </div>
            ) : (
              'Analyze Images'
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
              <div className="prose prose-blue max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{result}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
