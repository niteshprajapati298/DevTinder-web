import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";
import Logo from "../../assests/Logo";
const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeUser());
      return navigate("/login");
    } catch (err) {
      // Error logic maybe redirect to error page
    }
  };

  return (
    <div className="navbar bg-base-300 fixed top-0 left-0 w-full z-50 shadow">

      <div className="flex-1">
      <Logo/>
      </div>
      {user && (
        <div className="flex-none">
          <div className="form-control">Welcome {user.firstName}</div>
          <div className="dropdown dropdown-end mx-2 flex">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
  <img
    alt="user photo"
    src={
      user?.photoUrl?.startsWith("http")
        ? user.photoUrl
        : `${BASE_URL}${user.photoUrl}`
    }
  />
</div>

            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </Link>
              </li>
              <li>
                <Link to="/connections">Connections</Link>
              </li>

              <li>
                <Link to="/requests">Requests</Link>
              </li>
              <li>
                <a onClick={handleLogout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
export default NavBar;
