/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF7F2',
          dark: '#F0EBE3',
          darker: '#E5DDD2',
        },
        chem: {
          DEFAULT: '#639922',
          light: '#EAF3DE',
          dark: '#3B6D11',
        },
        math: {
          DEFAULT: '#BA7517',
          light: '#FAEEDA',
          dark: '#854F0B',
        },
        mkt: {
          DEFAULT: '#5C5B58',
          light: '#ECEAE6',
          dark: '#2C2C2A',
        },
        english: {
          DEFAULT: '#185FA5',
          light: '#E6F1FB',
          dark: '#0C447C',
        },
        apush: {
          DEFAULT: '#C9961A',
          light: '#FDF3D0',
          dark: '#7A5A0A',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}
