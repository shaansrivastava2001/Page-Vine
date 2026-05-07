/**
 * BookLoader — a small, on-brand loading indicator. Five short "book spines"
 * sitting on a shelf, gently waving in sequence. Pure CSS animation, no extra
 * dependencies. Use anywhere we'd otherwise show plain "Loading…" text.
 */
const BookLoader = ({ label = "Loading…", inline = false }) => (
  <div className={`book-loader${inline ? " book-loader--inline" : ""}`}>
    <div className="book-loader__shelf" aria-hidden="true">
      <span className="book-loader__bar" />
      <span className="book-loader__bar" />
      <span className="book-loader__bar" />
      <span className="book-loader__bar" />
      <span className="book-loader__bar" />
    </div>
    {label && <div className="book-loader__label">{label}</div>}
  </div>
);

export default BookLoader;
