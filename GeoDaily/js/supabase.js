const SUPABASE_URL = 'https://agcvwfyxxvzvqtpkyqrw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnY3Z3Znl4eHZ6dnF0cGt5cXJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjc1NjIsImV4cCI6MjA5MDcwMzU2Mn0.KBGQqRJYQFzGDNRKHm0OdvHXHZAK8skUl7lDLP990k4';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
};

export async function submitScore({ username, country, dayKey, cluesUsed, score }) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ username, country, day_key: dayKey, clues_used: cluesUsed, score }),
  });
  return res.ok;
}

export async function fetchLeaderboard(dayKey) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?day_key=eq.${dayKey}&order=score.desc&limit=10`,
    { headers }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchStats(dayKey) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/scores?day_key=eq.${dayKey}&select=clues_used,score`,
    { headers }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows.length) return null;

  const total = rows.length;
  const avgScore = Math.round(rows.reduce((s, r) => s + r.score, 0) / total);
  const clue1 = rows.filter(r => r.clues_used === 1).length;
  const clue2 = rows.filter(r => r.clues_used === 2).length;
  const clue3 = rows.filter(r => r.clues_used === 3).length;
  const clue4 = rows.filter(r => r.clues_used === 4).length;

  return { total, avgScore, clue1, clue2, clue3, clue4 };
}