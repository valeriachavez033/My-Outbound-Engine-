export default function VerifyRequest() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-3xl mb-4">✉️</div>
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          Check your email
        </h1>
        <p className="text-sm text-gray-500">
          A sign-in link has been sent to your email address. Click it to access
          your account.
        </p>
      </div>
    </main>
  );
}
