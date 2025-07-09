import React, { useState } from 'react';
import { FaUserFriends, FaCrown, FaListOl, FaCheckCircle } from 'react-icons/fa';
import { MdGroups } from 'react-icons/md';
import { playersData as mockPlayers } from '../constants/players';
import Select from 'react-select';

const arrangementStyles = [
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'fixed_teams', label: 'Fixed Teams' },
  { value: 'random', label: 'Random Pairing' },
];

// Dữ liệu giả cho bảng xếp hạng
const rankingData = [
  { name: 'Nguyen Van A', points: 120, skillLevel: 'advanced' },
  { name: 'Tran Thi B', points: 110, skillLevel: 'intermediate' },
  { name: 'Le Van C', points: 105, skillLevel: 'advanced' },
  { name: 'Pham Thi D', points: 98, skillLevel: 'newbie' },
  { name: 'Vo Van E', points: 95, skillLevel: 'intermediate' },
  { name: 'Nguyen Thi F', points: 90, skillLevel: 'advanced' },
  { name: 'Tran Van G', points: 85, skillLevel: 'newbie' },
  { name: 'Le Thi H', points: 80, skillLevel: 'intermediate' },
];

export default function HomePage() {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [style, setStyle] = useState('');
  const playersData = mockPlayers;

  const togglePlayer = (id) => {
    setSelectedPlayers((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    console.log('Selected players:', selectedPlayers);
    console.log('Arrangement style:', style);
  };

  const arrangementOptions = arrangementStyles.map((opt) => ({ value: opt.value, label: opt.label }));

  return (
    <div className="min-h-screen flex flex-col items-center py-2 px-2">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        {/* Card chọn kiểu sắp xếp */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-5 border border-sky-200 mb-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-sky-100 text-sky-600 text-lg font-bold shadow"><FaListOl /></span>
              <h2 className="text-lg font-bold tracking-tight text-sky-700">1. Kiểu sắp xếp đội</h2>
            </div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Kiểu sắp xếp</label>
            <Select
              className="react-select-container text-xs"
              classNamePrefix="react-select"
              options={arrangementOptions}
              placeholder="Chọn kiểu sắp xếp"
              value={arrangementOptions.find((opt) => opt.value === style) || null}
              onChange={(opt) => setStyle(opt ? opt.value : '')}
              isSearchable={false}
              styles={{
                control: (base, state) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  borderColor: state.isFocused ? '#38bdf8' : '#bae6fd',
                  boxShadow: state.isFocused ? '0 0 0 2px #38bdf833' : '',
                  minHeight: '36px',
                  fontSize: '0.95rem',
                  background: '#f0f9ff',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#38bdf8' : state.isFocused ? '#e0f2fe' : '#fff',
                  color: state.isSelected ? '#fff' : '#222',
                  fontWeight: state.isSelected ? 700 : 500,
                  fontSize: '0.95rem',
                }),
                menu: (base) => ({ ...base, borderRadius: '0.75rem', boxShadow: '0 4px 16px #0001' }),
              }}
              theme={theme => ({
                ...theme,
                colors: { ...theme.colors, primary: '#38bdf8', primary25: '#e0f2fe' }
              })}
            />
          </div>
          {/* Card chọn người chơi */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-5 border border-sky-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-lg font-bold shadow"><MdGroups /></span>
              <h2 className="text-lg font-bold tracking-tight text-emerald-700">2. Chọn người chơi</h2>
            </div>
            <p className="text-gray-500 mb-2 text-xs">Chọn tối thiểu 4 người (chia hết cho 4) để tổ chức trận đấu.</p>
            <div className="overflow-y-auto max-h-48 pr-1 custom-scrollbar mb-1">
              {playersData.map((player) => {
                const isSelected = selectedPlayers.includes(player._id);
                return (
                  <label
                    key={player._id}
                    className={`flex items-center justify-between mb-2 px-3 py-2 rounded-lg cursor-pointer border text-xs transition-all duration-150 hover:bg-emerald-50/60 ${isSelected ? 'border-emerald-200' : 'border-gray-100'}`}
                  >
                    <div className="flex items-center gap-2 pl-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePlayer(player._id)}
                        className="accent-emerald-500 w-4 h-4"
                      />
                      {player.avatar && <img src={player.avatar} alt={player.name} className="w-6 h-6 rounded-full object-cover border border-gray-100" />}
                      <span className="font-semibold text-gray-800">{player.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full font-bold shadow-sm border bg-gray-50 text-gray-500 border-gray-100">{player.point || '1.0'}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Đã chọn: <b className="text-emerald-700">{selectedPlayers.length}</b> người chơi</span>
            </div>
          </div>
          {/* Nút tổ chức trận đấu */}
          <button
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-base shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={selectedPlayers.length < 4 || selectedPlayers.length % 4 !== 0 || !style}
          >
            <FaCheckCircle className="text-base" />
            Tổ chức trận đấu
          </button>
          {(selectedPlayers.length < 4 || selectedPlayers.length % 4 !== 0 || !style) && (
            <p className="text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
              * Cần chọn đủ kiểu sắp xếp và số người chơi hợp lệ
            </p>
          )}
        </div>
        {/* Bảng xếp hạng */}
        <div className="flex-1 bg-white/90 backdrop-blur rounded-2xl shadow-lg p-5 flex flex-col border border-yellow-100 min-w-[240px]">
          <div className="flex items-center gap-2 mb-2 text-yellow-600">
            <FaCrown className="text-lg" />
            <h2 className="text-lg font-bold tracking-tight">BẢNG XẾP HẠNG</h2>
          </div>
          <div className="overflow-y-auto max-h-[220px]">
            <ol className="space-y-1">
              {playersData.slice(0, 8).map((player, idx) => (
                <li key={player._id} className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-1 shadow border border-yellow-50 text-xs">
                  <span className="w-5 text-center font-bold text-gray-400">{idx + 1}</span>
                  {player.avatar && <img src={player.avatar} alt={player.name} className="w-6 h-6 rounded-full object-cover border border-gray-100" />}
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">{player.name}</span>
                    <span className="block text-[10px] text-gray-400">Nam • 1.0</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0e7ef; border-radius: 6px; }
      `}</style>
    </div>
  );
}
