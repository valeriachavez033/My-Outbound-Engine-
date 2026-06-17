export default function DashboardHome() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your outbound metrics will appear here once sequences are running.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Sent this week", value: "—" },
          { label: "Open rate", value: "—" },
          { label: "Positive replies", value: "—" },
          { label: "Spend used", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="text-xs text-gray-400 mb-1">{card.label}</div>
            <div className="text-2xl font-semibold text-gray-300">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-400">
          Start by adding your{" "}
          <a href="/context" className="text-brand-500 hover:underline">
            product context
          </a>
          , then{" "}
          <a href="/prospects" className="text-brand-500 hover:underline">
            import prospects
          </a>
          .
        </p>
      </div>
    </div>
  );
}
