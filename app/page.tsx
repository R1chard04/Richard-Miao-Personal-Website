import { links, education, skills, experience, projects, archive } from "./data";
import { Reveal } from "./reveal";
import { Background } from "./background";

function Org({ name, url }: { name: string; url: string }) {
  return (
    <h3>
      <a className="org" href={url} target="_blank" rel="noopener noreferrer">
        {name}
        <span className="ext" aria-hidden="true">↗</span>
      </a>
    </h3>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="section reveal">
      <h2 className="label">{label}</h2>
      <div>{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <Background />
      <Reveal />
      <header className="intro">
        <div>
          <h1 aria-label="Richard Miao">
            {"Richard Miao".split("").map((c, i) => (
              <span key={i} className="char" style={{ animationDelay: `${i * 35}ms` }} aria-hidden="true">
                {c === " " ? "\u00a0" : c}
              </span>
            ))}
          </h1>
          <p className="lede">
            Software engineer and student at the University of Waterloo. I build backend systems
            and infrastructure, most recently network addressing at Cloudflare. Before that,
            HubSpot and Shopify.
          </p>
          <p className="aside">Off the clock: morning swims, chess, and sipping on my latte.</p>
          <ul className="links">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <img
          className="portrait"
          src="/richard.jpg"
          alt="Richard smiling on a trail above Yosemite Valley"
          width={640}
          height={853}
        />
      </header>

      <Section label="Work">
        <ol className="work">
          {experience.map((e) => (
            <li key={e.company}>
              <div className="row">
                <Org name={e.company} url={e.url} />
                <span className="dates">{e.dates}</span>
              </div>
              <p className="meta">
                {e.team ? `${e.role}, ${e.team}` : e.role} · <span className="nowrap">{e.place}</span>
              </p>
              <ul>
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section label="Projects">
        {projects.map((p) => (
          <article key={p.name} className="project">
            <div className="row">
              {p.url ? <Org name={p.name} url={p.url} /> : <h3>{p.name}</h3>}
              <span className="dates">{p.kind}</span>
            </div>
            <p>{p.desc}</p>
          </article>
        ))}
        <details className="archive">
          <summary>Earlier projects</summary>
          <ul>
            {archive.map((p) => (
              <li key={p.name}>
                {p.url ? <a href={p.url}>{p.name}</a> : <span>{p.name}</span>} — {p.desc}
              </li>
            ))}
          </ul>
        </details>
      </Section>

      <Section label="Education">
        <div className="row">
          <Org name={education.school} url={education.url} />
          <span className="dates">{education.dates}</span>
        </div>
        <p className="meta">
          {education.degree} · {education.detail}
        </p>
        <p className="meta">{education.awards.join(" · ")}</p>
      </Section>

      <Section label="Toolbox">
        <dl className="skills">
          {skills.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section label="Contact">
        <dl className="skills">
          {links.map((l) => (
            <div key={l.label}>
              <dt>{l.label}</dt>
              <dd>
                <a href={l.href}>{l.text}</a>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <footer>© {new Date().getFullYear()} Richard Miao</footer>
    </main>
  );
}
