import { useEffect, useState } from "react";
import { getCoverUrl } from "../../utils/bookCover";
import GeneratedCover from "./GeneratedCover";

// Renders a book cover image, looked up from Open Library by title (+ author).
// Falls back to a procedurally-generated SVG cover (deterministic from the
// title) when no real cover is found or the image fails to load — so every
// book has a believable cover, never a blank placeholder.
//
// `size` controls visual scale ("xs" | "sm" | "md" | "lg") and maps to both
// the CSS class and the Open Library image size we request.
const SIZE_TO_OL = { xs: "S", sm: "S", md: "M", lg: "L" };

const BookCover = ({ title, author, size = "md", className = "" }) => {
  const [src, setSrc] = useState(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let alive = true;
    setSrc(null);
    setErrored(false);
    if (!title) return undefined;
    getCoverUrl(title, author, SIZE_TO_OL[size] || "M").then((url) => {
      if (alive) setSrc(url);
    });
    return () => { alive = false; };
  }, [title, author, size]);

  const showPlaceholder = !src || errored;

  return (
    <div className={`book-cover book-cover--${size} ${className}`.trim()}>
      {showPlaceholder ? (
        <GeneratedCover title={title} />
      ) : (
        <img
          src={src}
          alt={title ? `Cover of ${title}` : "Book cover"}
          loading="lazy"
          onError={() => setErrored(true)}
          className="book-cover__img"
        />
      )}
    </div>
  );
};

export default BookCover;
