import { useState } from "react";
import { createRoot } from "react-dom/client";
import { routes } from "./router/routes";
import { FixturesPage } from "./pages/FixturesPage";
import { CuesPage } from "./pages/CuesPage";
import { TimelinePage } from "./pages/TimelinePage";
import { PreviewPage } from "./pages/PreviewPage";
import "./styles.css";

const pageByName: Record<string, () => JSX.Element> = {
  灯具布置: FixturesPage,
  场景编辑: CuesPage,
  时间轴编排: TimelinePage,
  舞台预览: PreviewPage
};

function Placeholder({ name }: { name: string }) {
  return (
    <section className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>{name}</h1>
        </div>
      </header>
      <div className="panel">
        <div className="empty">「{name}」页面建设中，灯具吊挂复核请前往「灯具布置」。</div>
      </div>
    </section>
  );
}

function App() {
  const [active, setActive] = useState<string>(routes[0]?.route ?? "/fixtures");
  const current = routes.find((route) => route.route === active) ?? routes[0];
  const CurrentPage = pageByName[current.name] ?? (() => <Placeholder name={current.name} />);
  return (
    <div className="shell">
      <aside>
        <div className="brand">舞台灯光编排模拟器</div>
        <nav>
          {routes.map((route) => (
            <button key={route.route} className={active === route.route ? "active" : ""} onClick={() => setActive(route.route)}>
              {route.name}
            </button>
          ))}
        </nav>
      </aside>
      <CurrentPage />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
