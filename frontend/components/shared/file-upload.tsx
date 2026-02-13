"use client";

import React, { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, File, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Attachment } from "@/types";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  onRemove?: (attachmentId: string) => void;
  attachments?: Attachment[];
  className?: string;
  maxSize?: number; // in MB
  accept?: string;
}

export function FileUpload({ 
  onUpload, 
  onRemove, 
  attachments = [], 
  className,
  maxSize = 10,
  accept = "*/*"
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFiles(files);
    }
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      await handleFiles(files);
    }
  }, []);

  const handleFiles = async (files: File[]) => {
    // Filter by size
    const validFiles = files.filter(file => file.size <= maxSize * 1024 * 1024);
    
    if (validFiles.length < files.length) {
      alert(`Some files were skipped because they exceed the ${maxSize}MB limit.`);
    }

    if (validFiles.length > 0) {
      setIsUploading(true);
      try {
        await onUpload(validFiles);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFileIcon = (type: string) => {
    if (type === 'image') return <ImageIcon className="w-4 h-4" />;
    if (type === 'pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-2 text-center",
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        ) : (
          <Upload className={cn("w-8 h-8", isDragging ? "text-blue-500" : "text-slate-400")} />
        )}
        
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {isUploading ? "Uploading..." : "Click or drag files to upload"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Max file size: {maxSize}MB
          </p>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {attachments.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded bg-slate-100 text-slate-500">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{file.size}</span>
                </div>
              </div>
              
              {onRemove && (
                <button
                  onClick={() => onRemove(file.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
