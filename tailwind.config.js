const dracula = require('tailwind-dracula/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: dracula.light,
        foreground: dracula.darker,
        card: dracula.light,
        "card-foreground": dracula.darker,
        primary: dracula.purple,
        "primary-foreground": dracula.darker,
        secondary: dracula.pink,
        "secondary-foreground": dracula.darker,
        muted: dracula.light,
        "muted-foreground": dracula.darker,
        accent: dracula.cyan,
        "accent-foreground": dracula.darker,
        destructive: dracula.red,
        "destructive-foreground": dracula.light,
        border: dracula.light,
        input: dracula.light,
        ring: dracula.purple,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require('tailwind-dracula')('dracula'),
  ],
}
