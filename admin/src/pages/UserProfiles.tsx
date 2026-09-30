import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { API_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import User2FACard from "../components/UserProfile/User2FACard";
import PageMeta from "../components/common/PageMeta";

export default function UserProfiles() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode");
  const targetId = searchParams.get("id");

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff"
  });

  const fetchProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      if (mode === "add") {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (targetId) {
        const res = await fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const users = await res.json();
          const matchedUser = users.find((u: any) => u.id === parseInt(targetId));
          if (matchedUser) {
            setProfile(matchedUser);
          } else {
            alert("User not found.");
            navigate("/staff");
          }
        } else {
          alert("Failed to load staff profiles.");
          navigate("/staff");
        }
      } else {
        const res = await fetch(`${API_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token, mode, targetId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(addForm)
      });
      if (res.ok) {
        navigate("/staff");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create staff member.");
      }
    } catch (err: any) {
      alert(err.message || "Error creating staff member.");
    }
  };

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white";

  return (
    <>
      <PageMeta
        title={mode === "add" ? "Add Member | Selectt" : targetId ? "Edit Staff Profile | Selectt" : "Admin Profile | Selectt"}
        description="User Profiles Dashboard for Selectt Admin"
      />
      <div className="flex items-center justify-between mb-5">
        <PageBreadcrumb pageTitle={mode === "add" ? "Add Member" : targetId ? "Edit Staff Profile" : "Profile"} />
        {(mode === "add" || targetId) && (
          <button 
            onClick={() => navigate("/staff")} 
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            &larr; Back to Staff
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading details...</div>
      ) : mode === "add" ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 max-w-xl mx-auto shadow-theme-xs">
          <h3 className="mb-5 text-lg font-bold text-gray-800 dark:text-white/90 lg:mb-7">
            Add New Member
          </h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">First Name</label>
                <input required type="text" className={inp} value={addForm.first_name} onChange={e => setAddForm(f => ({...f, first_name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Last Name</label>
                <input required type="text" className={inp} value={addForm.last_name} onChange={e => setAddForm(f => ({...f, last_name: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email Address</label>
              <input required type="email" className={inp} value={addForm.email} onChange={e => setAddForm(f => ({...f, email: e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
              <input type="text" className={inp} value={addForm.phone} onChange={e => setAddForm(f => ({...f, phone: e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
              <input required type="password" className={inp} value={addForm.password} onChange={e => setAddForm(f => ({...f, password: e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">User Type</label>
              <select className={inp} value={addForm.role} onChange={e => setAddForm(f => ({...f, role: e.target.value}))}>
                <option value="staff">Staff</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => navigate("/staff")} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl font-semibold text-sm">Add Member</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile Details
          </h3>
          <div className="space-y-6">
            <UserMetaCard profile={profile} onSave={fetchProfile} />
            <UserInfoCard profile={profile} onSave={fetchProfile} />
            <User2FACard profile={profile} onSave={fetchProfile} />
          </div>
        </div>
      )}
    </>
  );
}

