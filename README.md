backend pips - pip install fastapi uvicorn sqlalchemy pydantic python-dotenv
uvicorn app.main:app --reload


npx create vite@latest frontend
cd frontend
npm install
npm install axios
npm install tailwindcss @tailwindcss/vite

vite.config.ts
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})

