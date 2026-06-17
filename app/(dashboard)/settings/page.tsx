"use client";

import { useEffect, useState } from "react";

interface SettingsForm {
  instantlyApiKey: string;
  anthropicApiKey: string;
  slackWebhookUrl: string;
  sendingDomain: string;
  spendCapWeeklyUsd: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    instantlyApiKey: "",
    anthropicApiKey: "",
    slackWebhookUrl: "",
    sendingDomain: "",
    spendCapWeeklyUsd: "500",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(({ settings }) => {
        if (settings) {
          setForm({
            instantlyApiKey: settings.instantlyApiKey ?? "",
            anthropicApiKey: settings.anthropicApiKey ?? "",
            slackWebhookUrl: settings.slackWebhookUrl ?? "",
            sendingDomain: settings.sendingDomain ?? "",
            spendCapWeeklyUsd: String(settings.spendCapWeeklyUsd ?? 500),
          });
        }
        setLoading(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your API keys, sending domain, and spend cap.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sending */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">
            Sending
          </h2>

          <Field label="Instantly API key" hint="Found in Instantly → Settings → API">
            <input
              type="password"
              value={form.instantlyApiKey}
              onChange={(e) =>
                setForm((f) => ({ ...f, instantlyApiKey: e.target.value }))
              }
              placeholder="sk-..."
              className={inputClass}
            />
          </Field>

          <Field label="Sending domain" hint="e.g. mail.yourcompany.com">
            <input
              type="text"
              value={form.sendingDomain}
              onChange={(e) =>
                setForm((f) => ({ ...f, sendingDomain: e.target.value }))
              }
              placeholder="mail.yourcompany.com"
              className={inputClass}
            />
          </Field>
        </section>

        {/* AI */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">
            AI
          </h2>

          <Field label="Anthropic API key" hint="Used for sequence generation and reply classification">
            <input
              type="password"
              value={form.anthropicApiKey}
              onChange={(e) =>
                setForm((f) => ({ ...f, anthropicApiKey: e.target.value }))
              }
              placeholder="sk-ant-..."
              className={inputClass}
            />
          </Field>
        </section>

        {/* Budget */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">
            Budget
          </h2>

          <Field
            label="Weekly spend cap (USD)"
            hint="Total AI API spend allowed per week across all prospects"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={form.spendCapWeeklyUsd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, spendCapWeeklyUsd: e.target.value }))
                }
                className={`${inputClass} pl-7`}
              />
            </div>
          </Field>
        </section>

        {/* Notifications */}
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">
            Notifications
          </h2>

          <Field
            label="Slack webhook URL"
            hint="Get pinged when a prospect replies positively"
          >
            <input
              type="url"
              value={form.slackWebhookUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, slackWebhookUrl: e.target.value }))
              }
              placeholder="https://hooks.slack.com/services/..."
              className={inputClass}
            />
          </Field>
        </section>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Saved ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}
