const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  bill: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6',
  send: 'M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z',
  activity: 'M3 12h4l3-8 4 16 3-8h4',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  plus: 'M12 5v14M5 12h14',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M3 3l18 18M10.6 6.1A9.8 9.8 0 0112 6c6 0 10 6 10 6a17 17 0 01-3.3 3.8M6.5 7.5A17 17 0 002 12s4 7 10 7a9.6 9.6 0 004-.9',
  check: 'M5 12l5 5 9-10',
  back: 'M15 5l-7 7 7 7',
  backspace: 'M21 5H9l-6 7 6 7h12V5zM13 9l4 6M17 9l-4 6',
  logout: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z',
  alert: 'M12 8v5M12 16.5v.5M10.3 4l-8 14a2 2 0 001.7 3h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z',
};

export default function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}