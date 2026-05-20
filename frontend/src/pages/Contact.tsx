import { useState, type FormEvent } from "react";
import { Reveal, RevealLines } from "../components/landing/Reveal";

export function Contact() {
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    // Wire to your backend / lead capture here.
    setSent(true);
  }

  return (
    <main className="page-enter" data-screen-label="05 Contact">
      <section className="px-8 md:px-12 pt-[140px] pb-20" style={{ minHeight: "100vh" }}>
        <div className="max-w-[1600px] mx-auto">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-60">— Contact / Deploy</p>
          </Reveal>

          <div className="grid grid-cols-12 gap-12 mt-12">
            <div className="col-span-12 lg:col-span-7">
              <RevealLines
                className="font-display"
                stagger={110}
                lines={["Tell us where", "you <em>operate</em>."]}
              />

              <Reveal delay={400}>
                <p className="text-2xl mt-10 max-w-[560px] leading-snug" style={{ color: "var(--fg-2)" }}>
                  We answer within a single working day. A founder is on the first call.
                </p>
              </Reveal>

              {sent ? (
                <Reveal>
                  <div className="mt-16 p-10 rounded-sm" style={{ background: "var(--bg-deep)", border: "1px solid var(--bg-line)" }}>
                    <p className="font-mono text-[11px] tracking-[0.22em] uppercase opacity-70">— Acknowledged</p>
                    <h3 className="font-display text-5xl mt-4">
                      We have your signal<em style={{ color: "var(--accent)" }}>.</em>
                    </h3>
                    <p className="text-xl mt-4 opacity-85 leading-snug">
                      A founder will reach out within 24 hours. In the meantime, your access link is on its way.
                    </p>
                  </div>
                </Reveal>
              ) : (
                <Reveal delay={500}>
                  <form onSubmit={submit} className="mt-14 space-y-2 max-w-[640px]">
                    <input className="lux-input" placeholder="Your name" required />
                    <input className="lux-input" type="email" placeholder="Operational email" required />
                    <input className="lux-input" placeholder="Organization · role" />
                    <input className="lux-input" placeholder="Region of operations" />
                    <textarea className="lux-input" placeholder="What event types worry you most?" rows={3} style={{ resize: "none" }} />
                    <div className="pt-8 flex flex-wrap items-center gap-4">
                      <button type="submit" className="magnetic">
                        Send to founders <span className="arrow">→</span>
                      </button>
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">
                        Or write to <span style={{ color: "var(--accent)" }}>founders@raasta.pk</span>
                      </p>
                    </div>
                  </form>
                </Reveal>
              )}
            </div>

            <div className="col-span-12 lg:col-span-5">
              <Reveal delay={300}>
                <div className="editorial-img" style={{ aspectRatio: "4 / 5", borderRadius: 4 }}>
                  <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div>
                      <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-70">— Posture brief</p>
                      <h3 className="font-display text-3xl mt-4">
                        We'd rather meet you<br /><em style={{ color: "var(--accent)" }}>in the room</em>.
                      </h3>
                    </div>
                    <div className="space-y-3 font-mono text-[11px] tracking-wider opacity-80">
                      <p>HQ · Karachi · Pakistan</p>
                      <p>Field · Islamabad · Singapore · Geneva</p>
                      <p className="flex items-center gap-2 pt-2"><span className="pulse-dot" /> Founders on-call · 24h</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={500}>
                <div className="mt-8 grid grid-cols-2 gap-px" style={{ background: "var(--rule)" }}>
                  <div className="p-6" style={{ background: "var(--bg)" }}>
                    <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">First response</p>
                    <p className="font-display text-4xl mt-2">&lt; 24h</p>
                  </div>
                  <div className="p-6" style={{ background: "var(--bg)" }}>
                    <p className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">Pilot setup</p>
                    <p className="font-display text-4xl mt-2">72h</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
