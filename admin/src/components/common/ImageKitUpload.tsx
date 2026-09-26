import React from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';

const URL_ENDPOINT = (import.meta as any).env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/selectt';
const PUBLIC_KEY = (import.meta as any).env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_6cuIDfKYa22dql//M1rxKCv0Y0o=';
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000';

interface ImageKitUploadProps {
  onSuccess: (res: { url: string; fileId: string; name: string; thumbnailUrl: string }) => void;
  onError?: (err: any) => void;
  folder?: string;
  className?: string;
  buttonLabel?: string;
}

export default function ImageKitUpload({
  onSuccess,
  onError,
  folder = '/selectt/cars',
  className = '',
  buttonLabel = 'Upload to ImageKit'
}: ImageKitUploadProps) {
  const authenticator = async () => {
    try {
      const response = await fetch(`${API_URL}/api/imagekit/auth`);
      if (!response.ok) {
        throw new Error(`Auth endpoint failed with status: ${response.status}`);
      }
      const data = await response.json();
      return {
        signature: data.signature,
        expire: data.expire,
        token: data.token
      };
    } catch (err: any) {
      throw new Error(`ImageKit authentication error: ${err.message}`);
    }
  };

  return (
    <IKContext
      urlEndpoint={URL_ENDPOINT}
      publicKey={PUBLIC_KEY}
      authenticator={authenticator}
    >
      <div className={`relative inline-block ${className}`}>
        <IKUpload
          fileName={`car_${Date.now()}`}
          folder={folder}
          onError={(err: any) => {
            console.error('ImageKit Upload Failed:', err);
            if (onError) onError(err);
          }}
          onSuccess={(res: any) => {
            console.log('ImageKit Upload Succeeded:', res);
            onSuccess(res);
          }}
          useUniqueFileName={true}
          className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
      </div>
    </IKContext>
  );
}
