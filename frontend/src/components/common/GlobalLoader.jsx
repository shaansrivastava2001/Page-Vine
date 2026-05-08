import { useLoaderActive } from "../../utils/loaderStore";

// Floating, non-blocking page-turn animation that appears while any axios
// request is in flight. Mounted once at the app root. Auto-debounced via
// useLoaderActive — won't flash for fast requests.
const GlobalLoader = () => {
  const active = useLoaderActive();

  return (
    <div
      className={`global-loader${active ? " global-loader--active" : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!active}
    >
      <div className="page-turn" aria-hidden="true">
        <div className="page-turn__page page-turn__page--left" />
        <div className="page-turn__page page-turn__page--right" />
        <div className="page-turn__flap page-turn__flap--1" />
        <div className="page-turn__flap page-turn__flap--2" />
        <div className="page-turn__flap page-turn__flap--3" />
        <div className="page-turn__flap page-turn__flap--4" />
        <div className="page-turn__spine" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default GlobalLoader;
