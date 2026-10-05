// “Why Jarz Digital” comparison, from site-imports/jarz-digital-usa/source/src/us/WhyJarz.tsx (CompareSection).
const COMPARE: [string, string, string][] = [
  ["Where ads send people", "Your homepage", "A landing page built to get calls and bookings"],
  ["Tracking", "Clicks and impressions", "Every call, form and booking, so we know what makes money"],
  ["Keywords", "Broad keywords that waste budget", "Buyer keywords only, with wasted searches blocked every week"],
  ["Answering leads", "Up to you, often hours later", "AI replies in seconds, day and night, with follow-ups"],
  ["Google Maps & SEO", "Not included", "Local SEO brings free leads that grow every month"],
  ["Website", "Separate project with another company", "Fast website or web app built by our own developers"],
  ["AI search", "Not offered", "Optimized to appear in ChatGPT and Google AI answers"],
  ["Reporting", "Clicks and impressions", "Leads, customers, revenue and cost per customer"],
];

export function CompareSection({ title }: { title: string }) {
  return (
    <section id="why-jarz" className="anchor block">
      <header className="sec-head">
        <p className="eyebrow">Why Jarz Digital</p>
        <h2>{title}</h2>
        <p className="lead">
          The same ad budget can bring very different results. What changes the result is everything around the ads: the website, the tracking, how fast leads get an answer, and free traffic from SEO.
        </p>
      </header>
      <div className="tbl-wrap">
        <table className="tbl why">
          <thead>
            <tr>
              <th scope="col">What matters</th>
              <th scope="col">Typical agency</th>
              <th scope="col">Jarz Digital</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([a, b, c]) => (
              <tr key={a}>
                <td data-label="">
                  <b>{a}</b>
                </td>
                <td data-label="Typical agency" className="muted">
                  {b}
                </td>
                <td data-label="Jarz Digital" className="good">
                  {c}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
