import imageCompression from "browser-image-compression"; 
import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age || "",
    gender: user?.gender || "",
    about: user?.about || "",
    skills: user?.skills?.join(", ") || "",
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.photoUrl?.startsWith("http")
      ? user.photoUrl
      : "https://via.placeholder.com/150"
  );

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [previewFullImage, setPreviewFullImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Optional: show a loading message
    setError("Compressing image...");
  
    try {
      const options = {
        maxSizeMB: 1,               // Max file size in MB
        maxWidthOrHeight: 1024,     // Resize to this max dimension
        useWebWorker: true,
      };
  
      const compressedFile = await imageCompression(file, options);
  
      // If compressed size is still above your backend limit
      if (compressedFile.size > 3 * 1024 * 1024) {
        setError("Image too large even after compression. Max allowed size is 3MB.");
        return;
      }
  
      setPhotoFile(compressedFile);
      setPhotoPreview(URL.createObjectURL(compressedFile));
      setError(""); // Clear previous error if any
    } catch (err) {
      setError("Image compression failed.");
      console.error(err);
    }
  };
  const saveProfile = async () => {
    setError("");
    setUploadProgress(0);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        data.append(key, value)
      );
      if (photoFile) data.append("photo", photoFile);

      const res = await axios.patch(`${BASE_URL}/profile/edit`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      dispatch(addUser(res.data.data));
      if (res.data.data?.photoUrl) {
        setPhotoPreview(`${res.data.data.photoUrl}?t=${Date.now()}`);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setUploadProgress(0);
    } catch (err) {
      setUploadProgress(0);
      setError(err?.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="pt-16 max-w-4xl mx-auto mt-10 mb-28 bg-base-200 shadow-xl rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row bg-base-200 rounded-xl shadow-lg overflow-hidden">
        {/* Profile Photo Section */}
        <div className="text-neutral-content p-6 flex flex-col items-center justify-center w-full md:w-1/3 gap-4">
          <img
            src={photoPreview}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full border-4 border-primary object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => setPreviewFullImage(photoPreview)}
          />

          <label className="w-full">
            <input
              type="file"
              accept="image/*"
              name="photo"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <div className="btn btn-outline btn-sm w-full">
              Upload New Photo
            </div>
          </label>
        </div>

        {/* Profile Info Form */}
        <div className="p-6 w-full md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Edit Your Profile</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label-text">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>

            <div>
              <label className="label-text">Age</label>
              <input
                type="number"
                name="age"
                min={1}
                value={formData.age}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label-text">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div>
              <label className="label-text">About</label>
              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
              ></textarea>
            </div>

            <div>
              <label className="label-text">
                Skills{" "}
                <span className="text-xs text-gray-400">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input input-bordered w-full"
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button className="btn btn-outline btn-sm">Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={saveProfile}>
              Save
            </button>
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress > 0 && (
            <div className="mt-4 w-full bg-gray-300 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast toast-top toast-center">
          <div className="alert alert-success">
            <span>Profile updated successfully.</span>
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreviewFullImage(null)}
        >
          <img
            src={previewFullImage}
            alt="Full Preview"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-xl border-4 border-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default EditProfile;
