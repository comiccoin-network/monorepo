import { useState } from "react";
import { UPLOAD_CONFIG, isValidFileSize } from "@/config/env";

interface UseFileUploadOptions {
  onSuccess?: (file: File) => void;
  onError?: (error: string) => void;
}

interface UseFileUploadResult {
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
}

export const useFileUpload = (
  options: UseFileUploadOptions = {},
): UseFileUploadResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setError("No file selected");
      return;
    }

    if (!isValidFileSize(file.size)) {
      const error = UPLOAD_CONFIG.maxFileSizeErrorMessage;
      setError(error);
      options.onError?.(error);
      return;
    }

    try {
      setIsLoading(true);
      // Here you would typically upload the file to your server
      // For now, we'll just simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));
      options.onSuccess?.(file);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload file";
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleFileSelect,
    isLoading,
    error,
  };
};

/*
EXAMPLE USAGE:

const YourComponent = () => {
  const { handleFileSelect, isLoading, error } = useFileUpload({
    onSuccess: (file) => {
      console.log('File uploaded successfully:', file.name);
    },
    onError: (error) => {
      console.log('Upload failed:', error);
    }
  });

  return (
    <div>
      <input
        type="file"
        onChange={handleFileSelect}
        accept="image/*"
      />
      {isLoading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};
*/
