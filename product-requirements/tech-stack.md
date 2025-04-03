# TryCrib Technical Stack

This document outlines the technical stack chosen for the TryCrib application based on the product requirements and preferences for UI lightness (Shadcn), managed services (Supabase), and easy deployment (Vercel).

| Category         | Recommendation        | Notes                                                        |
| :--------------- | :-------------------- | :----------------------------------------------------------- |
| **Framework**    | Next.js               | React-based, Vercel integration, SSR/SSG, API routes         |
| **Language**     | TypeScript            | Static typing, improved maintainability                      |
| **UI Library**   | Shadcn/ui             | User preference, based on Radix UI + Tailwind                |
| **Styling**      | Tailwind CSS          | Utility-first CSS, required by Shadcn/ui                     |
| **BaaS/Database**| Supabase              | User preference, provides Postgres, Auth, Storage            |
| **State Mgmt**   | React Context/Zustand | Start simple with Context, scale with Zustand if needed      |
| **Forms**        | React Hook Form       | Performant form handling                                     |
| **Validation**   | Zod                   | TypeScript-first schema validation                           |
| **Deployment**   | Vercel                | User preference, optimized for Next.js                       |
| **Version Ctrl** | Git / GitHub          | Standard practice                                            |

This stack provides a modern, efficient, and cohesive set of tools tailored to the project requirements.
