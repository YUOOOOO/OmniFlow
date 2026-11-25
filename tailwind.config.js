/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
          5: 'var(--surface-5)',
          6: 'var(--surface-6)',
          hover: 'var(--surface-hover)',
        },
        canvas: {
          bg: 'var(--canvas-bg)',
          alt: 'var(--canvas-bg-alt)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        focus: 'var(--focus-blue)',
        activity: {
          green: 'var(--activity-green)',
          orange: 'var(--activity-orange)',
        },
        agent: 'rgb(var(--agent-rgb) / <alpha-value>)',
        panel: {
          terminal: 'var(--panel-terminal)',
          browser: 'var(--panel-browser)',
          editor: 'var(--panel-editor)',
          canvas: 'var(--panel-canvas)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      boxShadow: {
        'node': '0 2px 8px var(--shadow-node)',
        'node-focus': '0 2px 12px var(--shadow-node-focused)',
      },
    },
  },
  plugins: [],
}
