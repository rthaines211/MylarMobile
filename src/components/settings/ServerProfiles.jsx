import { useState } from 'react';
import { Plus, Trash2, Check, Server, Edit2 } from 'lucide-react';

const PROFILE_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export default function ServerProfiles({ profiles, activeProfile, onSelect, onAdd, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (profile) => {
    setEditingId(profile.id);
    setEditName(profile.name);
  };

  const handleSaveEdit = (profile) => {
    if (editName.trim()) {
      onUpdate({ ...profile, name: editName.trim() });
    }
    setEditingId(null);
    setEditName('');
  };

  const handleAdd = () => {
    const newProfile = {
      id: Date.now().toString(),
      name: `Server ${profiles.length + 1}`,
      color: PROFILE_COLORS[profiles.length % PROFILE_COLORS.length],
      serverUrl: '',
      apiKey: '',
      mylarDbPath: '',
    };
    onAdd(newProfile);
  };

  return (
    <div className="space-y-3">
      {/* Profile List */}
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            activeProfile === profile.id
              ? 'border-accent-primary bg-accent-primary/10'
              : 'border-bg-tertiary bg-bg-secondary'
          }`}
        >
          {/* Color indicator */}
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: profile.color }}
          />

          {/* Profile info */}
          <div className="flex-1 min-w-0">
            {editingId === profile.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => handleSaveEdit(profile)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(profile)}
                autoFocus
                className="w-full px-2 py-1 bg-bg-primary border border-accent-primary rounded text-sm text-text-primary focus:outline-none"
              />
            ) : (
              <>
                <p className="font-medium text-text-primary truncate">{profile.name}</p>
                <p className="text-xs text-text-muted truncate">
                  {profile.serverUrl || 'Not configured'}
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {activeProfile === profile.id ? (
              <Check className="w-5 h-5 text-accent-primary" />
            ) : (
              <button
                onClick={() => onSelect(profile.id)}
                className="p-2 rounded-full active:bg-bg-tertiary"
              >
                <Server className="w-4 h-4 text-text-muted" />
              </button>
            )}

            <button
              onClick={() => handleStartEdit(profile)}
              className="p-2 rounded-full active:bg-bg-tertiary"
            >
              <Edit2 className="w-4 h-4 text-text-muted" />
            </button>

            {profiles.length > 1 && (
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${profile.name}"?`)) {
                    onDelete(profile.id);
                  }
                }}
                className="p-2 rounded-full active:bg-bg-tertiary"
              >
                <Trash2 className="w-4 h-4 text-accent-danger" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add New Profile */}
      <button
        onClick={handleAdd}
        className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-bg-tertiary rounded-lg text-text-muted active:border-accent-primary active:text-accent-primary"
      >
        <Plus className="w-5 h-5" />
        <span>Add Server Profile</span>
      </button>
    </div>
  );
}
