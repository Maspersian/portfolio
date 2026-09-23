# Muhammed Afnan S – Unity/XR Portfolio (React + Vite + Tailwind)

## Run locally
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # production build in /dist

## Edit content
- Personal info, email, LinkedIn, GitHub, skills, experience: `src/data/siteConfig.js`
- Projects: `src/data/projects.js`

## 1. Where project images go
`public/images/projects/<project-folder>/` e.g. `public/images/projects/bagheera-ludo/cover.jpg`.
Reference them as `/images/projects/bagheera-ludo/cover.jpg`. Missing files show a placeholder automatically.

## 2. Add a new project
Copy any object in `src/data/projects.js`, give it a unique `id`, fill the fields, and put its images in a new folder.
Set `featured: true` to show it at the top. `category`: Games | XR / MR | Multiplayer | Interactive Apps.

## 3. Multiple screenshots
List them in `images: ["/images/projects/my-game/1.jpg", "/images/projects/my-game/2.jpg"]`. The detail modal shows a slider with thumbnails (arrow keys work).

## 4. Replace the CV
Put your file at `public/assets/Muhammed_Afnan_S_CV.pdf` (same name), or change `cv` in `siteConfig.js`.

## 5. Change LinkedIn / GitHub / email
`linkedin`, `github`, `email` in `src/data/siteConfig.js`.

## 6. Contact form
Opens the visitor's mail app (mailto). For a real backend, use Formspree/Web3Forms and post to it in `Contact` in `Sections.jsx`.

## 7. Deploy to Vercel
1. Push the folder to a GitHub repo.
2. vercel.com → Add New Project → import the repo.
3. Framework: Vite (auto). Build `npm run build`, output `dist`. Deploy.
Or: `npm i -g vercel && vercel`.
