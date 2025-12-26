import AuthForm from "./components/auth/authForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 text-center text-white">
        <h1 className="text-3xl font-semibold tracking-tight">CampFinder</h1>
        <p className="text-sm text-gray-300">
          Sign in to view and manage your campsites.
        </p>
        <AuthForm />
      </div>
    </main>
  );
}
