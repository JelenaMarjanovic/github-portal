import { FaGithubAlt } from 'react-icons/fa';

const UserCard = ({ user }) => {
  return (
    <div className="user-card">
      <img src={user.avatar_url} alt={user.name} className="avatar" />
      <h2>{user.name || user.login}</h2>
      <p className="bio">{user.bio}</p>
      <a
        href={user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="profile-btn"
      >
        <FaGithubAlt /> View GitHub Profile
      </a>
    </div>
  );
};

export default UserCard;
