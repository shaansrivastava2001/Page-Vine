const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <span className="app-footer__copy">
        © {year} Shaan Srivastava · All rights reserved.
      </span>
    </footer>
  );
};

export default Footer;
