'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

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
  
    // Get any previously stored data (ensure it's an array)
    let storedData = sessionStorage.getItem('classificationData');
    let existingData: any[] = [];
    try {
      existingData = storedData ? JSON.parse(storedData) : [];
      if (!Array.isArray(existingData)) {
        console.warn("⚠️ existingData was not an array, resetting to empty array.");
        existingData = [];
      }
    } catch (error) {
      console.error("❌ Error parsing sessionStorage data:", error);
      existingData = [];
    }
  
    // Helper function to clean the API result string
    const cleanResponse = (responseStr: string): string => {
      return responseStr
        .replace(/`/g, '')      // remove all backticks
        .replace(/\\n/g, ' ')    // remove escaped newlines
        .replace(/\n/g, ' ')     // remove raw newlines
        .replace(/\\"/g, '"')    // replace escaped quotes with normal quotes
        .replace(/\s{2,}/g, ' '); // collapse multiple spaces into one
    };
  
    // Process each image one by one
    for (const image of images) {
      const formData = new FormData();
      formData.append('images', image); // Ensure API expects this key
  
      try {
        const response = await fetch('/api/classify', {
          method: 'POST',
          body: formData,
        });
  
        const data = await response.json();
        console.log("🔍 API Full Response:", data);
  
        if (!response.ok) {
          console.error(`❌ API Error ${response.status}:`, data);
          continue; // Skip this image and move on
        }
  
        if (data.result) {
          // Clean the API result string
          let cleanedResult = data.result;
          if (typeof cleanedResult === "string") {
            cleanedResult = cleanResponse(cleanedResult);
          }
          console.log("✅ Cleaned entry:", cleanedResult);
  
          // Append cleaned result to existing data array
          existingData.push(cleanedResult);
          sessionStorage.setItem('classificationData', JSON.stringify(existingData));
        } else {
          console.error("❌ API Response did not contain expected 'result' field:", data);
        }
      } catch (error) {
        console.error('❌ Error processing image:', error);
      }
    }
  
    setIsLoading(false);
    router.push('/spreadsheet'); // Navigate to spreadsheet page when done
  };
  

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Image Classifier</h1>
          <p className="text-gray-500">Upload your images and get AI-powered analysis</p>
        </div>
        
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-xl p-6 transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center space-y-4">
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
            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {/* Image Preview Gallery */}
        {images.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Uploaded Images ({images.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <div 
                  key={URL.createObjectURL(image)} 
                  className="relative w-32 h-32 overflow-hidden rounded-lg border border-gray-200"
                >
                  <Image
                    src={URL.createObjectURL(image)}
                    alt={`Uploaded image ${index + 1}`}
                    width={128}
                    height={128}
                    className="object-contain w-full h-full"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✖
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
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Processing Images...' : 'Analyze Images'}
        </button>
      </div>
    </main>
  );
}
