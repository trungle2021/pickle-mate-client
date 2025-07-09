import React, { useEffect, useState } from 'react';

export default function MatchPage() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/matches')
      .then(res => res.json())
      .then(data => setMatches(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Danh sách trận đấu</h1>
      <ul className="space-y-2">
        {matches.map((match, index) => (
          <li key={match._id} className="p-3 border rounded shadow-sm">
            <div><strong>Trận {index + 1}</strong></div>
            <div>Team 1: {match.team1.map(p => p.name || p).join(', ')}</div>
            <div>Team 2: {match.team2.map(p => p.name || p).join(', ')}</div>
            <div>Sân: {match.court}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
