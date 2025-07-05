import { Link } from "react-router-dom";

const Logo = () => (
  <Link to="/" className="btn btn-ghost text-xl flex items-center gap-2">
    {/* Inline SVG for 👩‍💻 */}
    <svg
      width="24"
      height="24"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="512" cy="350" r="120" fill="#FFCC4D" />
      <rect x="312" y="550" width="400" height="300" rx="20" fill="#292F33" />
      <rect x="350" y="580" width="320" height="220" fill="#99AAB5" />
      <circle cx="412" cy="640" r="20" fill="#292F33" />
      <circle cx="460" cy="640" r="20" fill="#292F33" />
      <circle cx="508" cy="640" r="20" fill="#292F33" />
      <rect x="450" y="750" width="120" height="30" rx="10" fill="#CCD6DD" />
      <path d="M 450 900 Q 512 850 574 900" stroke="#292F33" strokeWidth="20" fill="none" />
    </svg>
   TinderDev
  </Link>
);

export default Logo;
