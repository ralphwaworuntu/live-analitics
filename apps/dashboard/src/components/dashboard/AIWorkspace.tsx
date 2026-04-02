"use client";

import { FormEvent, useMemo, useState } from "react";

import { sendAIMessage } from "@/lib/api";
import { getSelectedPolres, useAppStore } from "@/store";

const actionPrompts = [
  "Ringkas situasi 24 jam terakhir dan tandai risiko utama.",
  "Susun prioritas patroli berdasarkan aktivitas terakhir.",
  "Bandingkan posture wilayah ini dengan baseline normal.",
];

export default function AIWorkspace() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const selectedPolres = useAppStore(getSelectedPolres);
  const messages = useAppStore((state) => state.aiMessages);
  const addAIMessage = useAppStore((state) => state.addAIMessage);

  const visibleMessages = useMemo(() => messages.slice(-8), [messages]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPolres || !input.trim()) {
      return;
    }

    const message = input.trim();
    setInput("");
    setLoading(true);

    addAIMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    });

    try {
      const response = await sendAIMessage({
        polresId: selectedPolres.id,
        message,
      });
      addAIMessage(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-[tactical-rise_0.35s_ease]">
      <section className="glass-card px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="eyebrow">AI Command Cell</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
              Workspace AI yang dirancang untuk briefing, rekomendasi, dan kontrol konteks.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
              AI bukan lagi kotak chat kecil. Halaman ini diposisikan sebagai strategic copilot untuk meringkas situasi, menilai risiko, dan mengusulkan tindakan berdasarkan wilayah yang sedang dipilih operator.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <AIStat label="Focused Jurisdiction" value={selectedPolres ? selectedPolres.name : "Not selected"} />
            <AIStat label="Prompt Modes" value="Ask / Summarize / Recommend" />
            <AIStat label="Evidence Style" value="Grounded references" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="glass-card flex min-h-[640px] flex-col p-4 sm:min-h-[720px] sm:p-5">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
            <div>
              <div className="eyebrow">Conversation Deck</div>
              <h2 className="mt-3 text-lg font-semibold">Operational Dialogue</h2>
            </div>
            <div className="rounded-full border border-[var(--color-success)]/30 bg-[var(--color-success)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-success)]">
              Ready
            </div>
          </div>

          <div className="mt-5 flex-1 space-y-3 overflow-auto pr-1">
            {visibleMessages.map((message) => (
              <div
                key={message.id}
                className={`rounded-3xl border px-5 py-4 text-sm ${
                  message.role === "assistant"
                    ? "mr-8 border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-text)]"
                    : "ml-8 border-[var(--color-brand-primary)]/32 bg-[var(--color-brand-primary)]/12 text-[var(--color-text)]"
                }`}
              >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
                    {message.role === "assistant" ? "Strategic Response" : "Operator Instruction"}
                  </div>
                <div className="mt-2 leading-7 text-[var(--color-muted)]">{message.content}</div>
                {message.references?.length ? (
                  <div className="mt-3 text-[11px] uppercase tracking-[0.16em] text-[var(--color-info)]">
                    {message.references.join(" | ")}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 rounded-[26px] border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {actionPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)] transition-colors hover:border-[var(--color-brand-primary)]/40 hover:text-[var(--color-text)]"
                >
                  {prompt.split(" ").slice(0, 3).join(" ")}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={4}
                disabled={!selectedPolres || loading}
                placeholder={
                  selectedPolres
                    ? `Susun pertanyaan atau instruksi AI untuk ${selectedPolres.name}`
                    : "Pilih polres dari sidebar atau peta dahulu"
                }
                className="flex-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition-colors placeholder-[var(--color-muted)] focus:border-[var(--color-brand-primary)] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!selectedPolres || loading}
                className="rounded-2xl bg-[var(--color-brand-primary)] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-60"
              >
                {loading ? "Working" : "Run Brief"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <div className="eyebrow">Context Lock</div>
            <h3 className="mt-3 text-base font-semibold">Jurisdiction Context</h3>
            <div className="mt-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 text-sm text-[var(--color-muted)]">
              {selectedPolres ? (
                <>
                  <div className="text-lg font-semibold text-[var(--color-text)]">{selectedPolres.name}</div>
                  <div className="mt-2">Status {selectedPolres.status} • Pulau {selectedPolres.island}</div>
                  <div className="mt-1">Semua prompt AI sekarang diarahkan ke konteks ini.</div>
                </>
              ) : (
                "Belum ada polres aktif. AI akan jauh lebih berguna setelah konteks wilayah ditentukan."
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Mode Guidance</div>
            <div className="mt-4 space-y-3">
              <ModeCard title="Ask" description="Tanya bebas untuk menjelaskan situasi, prosedur, atau langkah awal." />
              <ModeCard title="Summarize" description="Minta ringkasan 24 jam, perubahan posture, dan pola laporan." />
              <ModeCard title="Recommend" description="Minta AI menyusun prioritas patroli atau tindak lanjut yang tegas." />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="eyebrow">Output Contract</div>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>Ringkasan singkat yang mudah dipahami operator lapangan.</li>
              <li>Penanda risiko agar escalation path cepat terbaca.</li>
              <li>Referensi yang tetap tampil agar hasil AI lebih dapat dipercaya.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function AIStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-subtle)]">{label}</div>
      <div className="mt-3 text-lg font-semibold text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function ModeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="text-sm font-semibold text-[var(--color-text)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--color-muted)]">{description}</div>
    </div>
  );
}
