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
  });

  const [photoFile, setPhotoFile] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(
    user?.photoUrl?.startsWith("http")
      ? user.photoUrl
      : `${BASE_URL}${user?.photoUrl || "/uploads/default.png"}`
  );

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [previewFullImage, setPreviewFullImage] = useState(null); // 👈 NEW

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const saveProfile = async () => {
    setError("");
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (photoFile) data.append("photo", photoFile);

      const res = await axios.patch(`${BASE_URL}/profile/edit`, data, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(addUser(res.data.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-base-200 shadow-xl rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Profile Photo */}
        <div className="bg-blue-50 p-6 flex flex-col items-center w-full md:w-1/3">
          <img
            src={photoPreview}
            alt="Profile Preview"
            className="w-28 h-28 rounded-full object-cover shadow-md cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setPreviewFullImage(photoPreview)} // 👈 NEW
          />
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered file-input-sm mt-3 w-full"
            onChange={handlePhotoChange}
          />
          <span className="text-xs mt-2 text-gray-500">Upload New Photo</span>
        </div>

        {/* Profile Info Form */}
        <div className="p-6 w-full md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Edit Your Profile</h2>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
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

            {error && <p className="text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button className="btn btn-outline btn-sm">Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={saveProfile}>
              Save
            </button>
          </div>
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

      {/* 👇 Image Modal Preview */}
      {previewFullImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
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
