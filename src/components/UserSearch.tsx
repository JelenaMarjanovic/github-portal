import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchGithubUser, searchGithubUser } from '../api/github';
import UserCard from './UserCard';
import RecentSearches from './RecentSearches';
import SuggestionsDropdown from './SuggestionsDropdown';

const UserSearch = () => {
  const [username, setUsername] = useState('');
  const [submittedUsername, setSubmittedUsername] = useState('');
  const [recentUsers, setRecentUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem('recentUsers');
    return stored ? JSON.parse(stored) : [];
  });

  const [debouncedUsername] = useDebounce(username, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch specific user
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', submittedUsername],
    queryFn: () => fetchGithubUser(submittedUsername),
    enabled: !!submittedUsername
  });

  // Fetch suggestion for user search
  const { data: suggestions } = useQuery({
    queryKey: ['user-suggestion', debouncedUsername],
    queryFn: () => searchGithubUser(debouncedUsername),
    enabled: debouncedUsername.length > 1
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      return;
    }

    setSubmittedUsername(trimmedUsername);
    setUsername('');

    setRecentUsers(prev => {
      const updated = [
        trimmedUsername,
        ...prev.filter(user => user !== trimmedUsername)
      ];

      return updated.slice(0, 5); // return only last five recent searches
    });
  };

  useEffect(() => {
    localStorage.setItem('recentUsers', JSON.stringify(recentUsers));
  }, [recentUsers]);

  return (
    <>
      <form onSubmit={handleSubmit} className="form">
        <div className="dropdown-wrapper">
          <input
            type="text"
            placeholder="Enter GitHub Username..."
            value={username}
            onChange={e => {
              const val = e.target.value;
              setUsername(val);
              setShowSuggestions(val.trim().length > 1);
            }}
          />
          {/* show only 5 suggestions */}
          {showSuggestions && suggestions?.length > 0 && (
            <SuggestionsDropdown
              suggestions={suggestions}
              show={showSuggestions}
              onSelect={selectedUser => {
                setUsername(selectedUser);
                setShowSuggestions(false);

                if (submittedUsername !== selectedUser) {
                  setSubmittedUsername(selectedUser);
                } else {
                  refetch();
                }
              }}
            />
          )}
        </div>

        <button type="submit">Search</button>
      </form>

      {isLoading && <p className="status">Loading...</p>}

      {isError && <p className="status error">{error.message}</p>}

      {data && <UserCard user={data} />}

      {recentUsers.length > 0 && (
        <RecentSearches
          users={recentUsers}
          onSelect={username => {
            setUsername(username);
            setSubmittedUsername(username);
          }}
        />
      )}
    </>
  );
};

export default UserSearch;
