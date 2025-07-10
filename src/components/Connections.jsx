import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/conectionSlice";
import { Link } from "react-router-dom";
import { BsChatDots } from "react-icons/bs"; // install with: npm install react-icons

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const dispatch = useDispatch();
  const [previewImg, setPreviewImg] = useState(null);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.connection));
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections) return null;

  if (connections.length === 0) {
    return <h1 className="text-center my-10 text-lg text-gray-400">No Connections Found</h1>;
  }

  return (
    <div className="text-center my-10 pt-16">
      <h1 className="text-3xl font-semibold text-white mb-6">Connections</h1>

      {connections.map((user) => {
        const { _id, firstName, lastName, photoUrl, age, gender, about } = user;
        const imageUrl = photoUrl?.startsWith("http") ? photoUrl : `${BASE_URL}${photoUrl}`;

        return (
          <div
            key={_id}
            className="flex items-center bg-base-300 rounded-lg shadow-md p-4 m-4 w-11/12 md:w-1/2 mx-auto"
          >
            {/* User Avatar */}
            <img
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-full object-cover cursor-pointer transition-transform hover:scale-105"
              src={imageUrl}
              onClick={() => setPreviewImg(imageUrl)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/100";
              }}
            />

            {/* User Info */}
            <div className="ml-4 text-left flex-grow">
              <h2 className="text-xl font-bold">{firstName} {lastName}</h2>
              {age && gender && (
                <p className="text-sm text-gray-500">{age}, {gender}</p>
              )}
              <p className="text-sm mt-1">{about}</p>
            </div>
            <Link
              to="/chat"
              state={{ user }} // pass user as route state
              title="Start Chat"
            >
              <BsChatDots className="text-4xl"/>
            </Link>
          </div>
        );
      })}

      {/* Modal for image preview */}
      {previewImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImg(null)}
        >
          <img
            src={previewImg}
            alt="Full View"
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg border-4 border-white"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Connections;
