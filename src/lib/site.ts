export const SITE = {
  name: 'Asmit Desai',
  description:
    'Security engineering student, CTF player, and detection engineer. PES University.',
  // Set NEXT_PUBLIC_SITE_URL in the environment for absolute URLs (RSS, metadata).
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://asmit.dev').replace(/\/$/, ''),
};
