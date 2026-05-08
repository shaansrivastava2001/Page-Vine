// Page-wide decorative watermark — book icons drifting slowly behind the
// content. Mounted once at the app root so it appears on every route.
// Pure decoration: pointer-events: none, z-index: -1, aria-hidden.
const AppBackdrop = () => (
  <div className="app-backdrop" aria-hidden="true">
    <i className="fa-solid fa-book      app-backdrop__icon app-backdrop__icon--1" />
    <i className="fa-solid fa-book-open app-backdrop__icon app-backdrop__icon--2" />
    <i className="fa-solid fa-bookmark  app-backdrop__icon app-backdrop__icon--3" />
    <i className="fa-solid fa-book      app-backdrop__icon app-backdrop__icon--4" />
    <i className="fa-solid fa-book-open app-backdrop__icon app-backdrop__icon--5" />
    <i className="fa-solid fa-book      app-backdrop__icon app-backdrop__icon--6" />
    <i className="fa-solid fa-book-open app-backdrop__icon app-backdrop__icon--7" />
    <i className="fa-solid fa-book      app-backdrop__icon app-backdrop__icon--8" />
    <i className="fa-solid fa-bookmark  app-backdrop__icon app-backdrop__icon--9" />
  </div>
);

export default AppBackdrop;
