zoeflockadmin-frontend/
├── public/                       # Static assets (favicon, logos, etc.)
│
├── src/
│   ├── app/                      # App Router (Next.js 13+)
│   │   ├── layout.tsx           # Global layout (sidebar wrapper)
│   │   ├── page.tsx             # Index route (redirect/login)
│   │   ├── auth/                # Public auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/           # Protected admin/dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Admin dashboard home
│   │   │   ├── members/         # Feature route: members
│   │   │   ├── groups/          # Feature route: groups
│   │   │   ├── events/          # Feature route: events
│   │   │   └── donations/       # Feature route: donations
│   │   └── not-found.tsx        # Custom 404 page
│
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Buttons, inputs, modals, toasts
│   │   ├── layout/              # Sidebar, topbar, page wrapper
│   │   └── shared/              # Reusable parts (Avatar, Card, etc.)
│
│   ├── features/                # Feature-specific components
│   │   ├── members/             # MemberTable, MemberForm
│   │   ├── groups/              # GroupTable, GroupForm
│   │   ├── events/              # EventCard, EventForm
│   │   └── donations/           # DonationChart, DonationForm
│
│   ├── context/                 # Global contexts (Auth, Theme)
│   │   └── AuthContext.tsx
│
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.ts           # Get user, permissions
│   │   ├── useAxios.ts          # Axios instance + interceptors
│   │   └── usePermission.ts     # Permission checker
│
│   ├── lib/                     # Core logic & helpers
│   │   ├── http.ts              # Axios client with baseURL & token
│   │   ├── auth.ts              # Local storage, cookie helpers
│   │   └── helpers.ts           # Date formatting, classNames, etc.
│
│   ├── middleware.ts            # Route protection (optional)
│   ├── types/                   # TypeScript types
│   │   ├── user.ts              # User, Role, Permissions types
│   │   └── member.ts
│
│   ├── constants/               # App constants (roles, routes, etc.)
│   │   └── nav.ts               # Dynamic sidebar nav builder
│
│   ├── styles/                  # Global styles
│   │   └── globals.css
│
│   └── utils/                   # Non-core utilities
│       └── validators.ts        # Input validation helpers
│
├── .env.local                   # Base URL for Laravel API, keys
├── next.config.js               # Next.js config
├── tsconfig.json                # Aliases + strict type settings
└── package.json
