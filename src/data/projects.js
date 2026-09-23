// ============ ADD / EDIT PROJECTS HERE ============
// Images go in: public/images/projects/<project-folder>/   (URL: /images/projects/<folder>/file.jpg)
// If an image file is missing, a placeholder is shown automatically.
// category must be one of: "Games", "XR / MR", "Multiplayer", "Interactive Apps"
export const categories = ["All", "Games", "XR / MR", "Multiplayer", "Interactive Apps"];

export const projects = [
  {
    id: "bagheera-ludo", featured: true,
    title: "Bagheera Ludo", category: "Multiplayer",
    image: "/images/projects/bagheera-ludo/cover.jpg",
    images: ["/images/projects/bagheera-ludo/1.jpg", "/images/projects/bagheera-ludo/2.jpg"],
    description: "Unity multiplayer Ludo game built with C# and WebSocket communication.",
    role: "Sole Unity developer",
    technologies: ["Unity", "C#", "WebSocket", "REST API"], platform: "Android, iOS",
    features: ["Real-time multiplayer", "Backend API integration", "Custom UI and game systems"],
    challenges: "Add details here (e.g. keeping game state in sync over WebSocket).",
    contribution: "Independently developed gameplay, UI, networking and API integration.",
    link: "", github: "",
  },
  {
    id: "bagheera-carrom", featured: true,
    title: "Bagheera Carrom", category: "Multiplayer",
    image: "/images/projects/bagheera-carrom/cover.jpg", images: [],
    description: "Unity multiplayer carrom game built with Photon Fusion and C#.",
    role: "Unity Developer", technologies: ["Unity", "Photon Fusion", "C#"], platform: "Android, iOS",
    features: ["Online multiplayer", "Physics-based gameplay"],
    challenges: "Add details here.", contribution: "Add your contribution here.", link: "", github: "",
  },
  {
    id: "xr-educational-activities", featured: true,
    title: "XR Educational Activities", category: "XR / MR",
    image: "/images/projects/xr-educational/cover.jpg", images: [],
    description: "Interactive educational Mixed Reality activities for Meta Quest.",
    role: "XR Developer", technologies: ["Unity", "C#", "Meta Quest", "XR/MR"], platform: "Meta Quest",
    features: ["Interactive 3D objects", "Reusable activity modules"],
    challenges: "Add details here.", contribution: "Built reusable, modular activities for students.", link: "", github: "",
  },
  {
    id: "multiplayer-xr", featured: true,
    title: "Multiplayer XR Activities", category: "XR / MR",
    image: "/images/projects/multiplayer-xr/cover.jpg", images: [],
    description: "Shared XR/MR environment where students and teachers interact together.",
    role: "XR Developer", technologies: ["Unity", "Netcode", "Meta Quest"], platform: "Meta Quest",
    features: ["Shared virtual space", "Student and teacher roles"],
    challenges: "Add details here.", contribution: "Built multiplayer systems with Unity Netcode.", link: "", github: "",
  },
  {
    id: "american-roulette",
    title: "American Roulette", category: "Games",
    image: "/images/projects/american-roulette/cover.jpg", images: [],
    description: "Unity multiplayer casino game with animation, UI/UX and 2D gameplay.",
    role: "Unity Developer", technologies: ["Unity", "C#", "Animation", "UI/UX", "2D"], platform: "Add platform",
    features: ["Multiplayer tables", "Animated wheel and UI"],
    challenges: "Add details here.", contribution: "Add your contribution here.", link: "", github: "",
  },
  {
    id: "spell-the-pics",
    title: "Spell The Pics", category: "Games",
    image: "/images/projects/spell-the-pics/cover.jpg", images: [],
    description: "Kids word game built with Unity and C#.",
    role: "Unity Developer", technologies: ["Unity", "C#"], platform: "Add platform",
    features: ["Picture-based spelling"],
    challenges: "Add details here.", contribution: "Add your contribution here.", link: "", github: "",
  },
];
