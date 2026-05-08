const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <span className="app-footer__copy">
        © {year} Shaan Srivastava · All rights reserved.
      </span>
      <div className="app-footer__contact-group">
        <a
          className="app-footer__contact"
          href="tel:+916306435882"
          aria-label="Call +91 63064 35882"
        >
          <i className="fa-solid fa-phone app-footer__icon" aria-hidden="true"></i>
          <span className="app-footer__contact-text">+91 63064 35882</span>
        </a>
        <a
          className="app-footer__contact"
          href="mailto:shaansrivastava2001@gmail.com"
          aria-label="Email shaansrivastava2001@gmail.com"
        >
          <i className="fa-solid fa-envelope app-footer__icon" aria-hidden="true"></i>
          <span className="app-footer__contact-text">shaansrivastava2001@gmail.com</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
