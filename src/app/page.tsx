import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personal Finance Tracker</h1>
          <p className="text-gray-500">Upload your bank statement to get started</p>
        </header>
        <Dashboard />
      </main>
    </div>
  );
}
