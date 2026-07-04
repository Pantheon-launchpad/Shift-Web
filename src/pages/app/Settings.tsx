import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, Github, Moon, Sun, Trash2 } from 'lucide-react';
import { GlassCard, PrimaryButton } from '../../components/app/ui';
import { useAppStore } from '../../stores/useAppStore';
import { useStore } from '../../stores/useStore';

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-mono text-[11px] uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>{children}</h3>;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={checked}
      className="w-10 h-6 rounded-full relative transition-colors shrink-0"
      style={{ background: checked ? 'var(--violet)' : 'var(--line)' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ left: checked ? 18 : 2 }}
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const userName = useAppStore((s) => s.userName);
  const updateUserName = useAppStore((s) => s.updateUserName);
  const aiSuggestions = useAppStore((s) => s.aiSuggestions);
  const emailReminders = useAppStore((s) => s.emailReminders);
  const toggleAiSuggestions = useAppStore((s) => s.toggleAiSuggestions);
  const toggleEmailReminders = useAppStore((s) => s.toggleEmailReminders);
  const signOut = useAppStore((s) => s.signOut);
  const deleteAllData = useAppStore((s) => s.deleteAllData);
  const connections = useAppStore((s) => s.connections);
  const toggleConnection = useAppStore((s) => s.toggleConnection);
  const { theme, toggleTheme } = useStore();

  const [name, setName] = useState(userName);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const exportData = () => {
    const { isAuthenticated: _a, signIn: _b, ...serializable } = useAppStore.getState();
    void _a;
    void _b;
    const blob = new Blob([JSON.stringify(serializable, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shift-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const handleDelete = () => {
    deleteAllData();
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 flex flex-col gap-6">
      <div>
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Account, preferences, and data.</p>
      </div>

      <section>
        <SectionTitle>Profile</SectionTitle>
        <GlassCard className="flex items-center gap-4 flex-wrap p-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => updateUserName(name)}
            className="flex-1 min-w-[180px] h-11 rounded-xl px-3.5 text-sm outline-none"
            style={{ background: 'var(--glass)', border: '1px solid var(--line)', color: 'var(--text)' }}
          />
          <button onClick={() => updateUserName(name)} className="btn btn-ghost text-xs py-2 px-3.5">Save</button>
        </GlassCard>
      </section>

      <section>
        <SectionTitle>Appearance</SectionTitle>
        <GlassCard className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? <Moon size={16} color="var(--text-muted)" /> : <Sun size={16} color="var(--text-muted)" />}
            <span className="text-sm" style={{ color: 'var(--text)' }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
          </div>
          <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
        </GlassCard>
      </section>

      <section>
        <SectionTitle>Notifications</SectionTitle>
        <GlassCard className="flex flex-col divide-y p-0" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>Daily reminder</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Nudge me if I haven&rsquo;t started today&rsquo;s task.</p>
            </div>
            <Toggle checked={emailReminders} onChange={toggleEmailReminders} />
          </div>
          <div className="flex items-center justify-between p-5" style={{ borderTop: '1px solid var(--line)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--text)' }}>AI suggestions</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Let Shift proactively suggest ways to break down tasks.</p>
            </div>
            <Toggle checked={aiSuggestions} onChange={toggleAiSuggestions} />
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionTitle>Connected accounts</SectionTitle>
        <GlassCard className="flex flex-col divide-y p-0" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center gap-2.5">
              <Github size={16} color="var(--text-muted)" />
              <span className="text-sm" style={{ color: 'var(--text)' }}>GitHub</span>
            </div>
            <button
              onClick={() => toggleConnection('github')}
              className="btn btn-ghost text-xs py-1.5 px-3"
            >
              {connections.github ? 'Disconnect' : 'Connect'}
            </button>
          </div>
          <div className="flex items-center justify-between p-5" style={{ borderTop: '1px solid var(--line)' }}>
            <div className="flex items-center gap-2.5">
              <span className="w-4 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>F</span>
              <span className="text-sm" style={{ color: 'var(--text)' }}>Figma</span>
            </div>
            <button
              onClick={() => toggleConnection('figma')}
              className="btn btn-ghost text-xs py-1.5 px-3"
            >
              {connections.figma ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </GlassCard>
      </section>

      <section>
        <SectionTitle>Data</SectionTitle>
        <GlassCard className="flex items-center justify-between flex-wrap gap-3 p-5">
          <div>
            <p className="text-sm" style={{ color: 'var(--text)' }}>Export your data</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Download goals, activity, and posts as JSON.</p>
          </div>
          <button onClick={exportData} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5">
            <Download size={13} /> Export
          </button>
        </GlassCard>
      </section>

      <section>
        <SectionTitle>Session</SectionTitle>
        <GlassCard className="flex items-center justify-between flex-wrap gap-3 p-5">
          <div>
            <p className="text-sm" style={{ color: 'var(--text)' }}>Sign out</p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Your goals and history stay on this device &mdash; signing back in picks up where you left off.</p>
          </div>
          <button onClick={handleSignOut} className="btn btn-ghost text-xs py-1.5 px-3">Sign out</button>
        </GlassCard>
      </section>

      <section>
        <SectionTitle>Danger zone</SectionTitle>
        <GlassCard style={{ borderColor: 'rgba(248,113,113,0.35)' }} className="p-5">
          {confirmingDelete ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2" style={{ color: '#f87171' }}>
                <AlertTriangle size={15} />
                <p className="text-sm">This erases every goal, streak, activity entry, and post stored on this device. It can&rsquo;t be undone &mdash; export your data first if you want a copy.</p>
              </div>
              <div className="flex gap-2">
                <PrimaryButton onClick={handleDelete} style={{ background: '#f87171' }}>Yes, delete everything</PrimaryButton>
                <button onClick={() => setConfirmingDelete(false)} className="btn btn-ghost">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm" style={{ color: 'var(--text)' }}>Delete all data</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Permanently erase everything stored on this device.</p>
              </div>
              <button onClick={() => setConfirmingDelete(true)} className="btn btn-ghost text-xs py-1.5 px-3 gap-1.5" style={{ color: '#f87171' }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </GlassCard>
      </section>
    </div>
  );
}
