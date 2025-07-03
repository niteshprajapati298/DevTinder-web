import { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();
  const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
  const [preview, setPreview] = useState(false);

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        `${BASE_URL}/request/send/${status}/${userId}`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUserFromFeed(userId));
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  const resolvedPhotoUrl = photoUrl?.startsWith("http")
    ? photoUrl
    : `${BASE_URL}${photoUrl}`;

  return (
    <>
      <div className="card bg-base-300 w-96 h-[600px] shadow-xl overflow-hidden flex flex-col">
        {/* 70% Image */}
        <div
          className="cursor-pointer h-[70%] w-full"
          onClick={() => setPreview(true)}
        >
          <img
            src={resolvedPhotoUrl}
            alt={`${firstName} ${lastName}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300";
            }}
          />
        </div>

        {/* 30% Text + Buttons */}
        <div className="card-body p-4 h-[30%]">
          <h2 className="card-title text-lg">{firstName + " " + lastName}</h2>
          {age && gender && (
            <p className="text-sm text-gray-400">{age + ", " + gender}</p>
          )}
          <p className="text-sm line-clamp-2">{about}</p>
          <div className="card-actions justify-between mt-2">
          <button
            className="btn btn-primary ml-16"
            onClick={() => handleSendRequest("ignored", _id)}
          >
            Ignore
          </button>
          <button
            className="btn btn-secondary mr-16"
            onClick={() => handleSendRequest("interested", _id)}
          >
            Interested
          </button>
          </div>
        </div>
      </div>

      {/* Fullscreen image preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setPreview(false)}
        >
          <img
            src={resolvedPhotoUrl}
            alt="Full preview"
            className="max-w-[90%] max-h-[90%] rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default UserCard;