import { API_URL } from "../../config/api";
import { useRef } from "react";
import { useAuth } from "../../context/AuthContext";

interface Props {
  profile: any;
  onSave: () => void;
}

export default function UserMetaCard({ profile, onSave }: Props) {
  const { token, user: currentUser, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("avatar", file);
    if (profile?.id) {
      uploadData.append("userId", profile.id.toString());
    }

    try {
      const res = await fetch(`${API_URL}/api/upload-avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: uploadData
      });
      if (res.ok) {
        const data = await res.json();
        if (profile?.id === currentUser?.id) {
          updateUser({ image: data.imageUrl });
        }
        onSave();
      } else {
        console.error("Failed to upload image");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/images/user/owner.jpg";
    if (imagePath.startsWith("/uploads")) return `${API_URL}${imagePath}`;
    return imagePath;
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div 
            className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 cursor-pointer group shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <img src={getImageUrl(profile?.image)} alt="user" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-[10px] font-medium">Upload</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="text-center xl:text-left">
            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              {profile?.first_name} {profile?.last_name}
            </h4>
            <div className="flex flex-col items-center gap-1 xl:flex-row xl:gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${profile?.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' : 'bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'}`}>
                {profile?.role === 'admin' ? 'Admin' : 'Staff'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
