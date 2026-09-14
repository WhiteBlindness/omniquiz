import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <nav className="footer-links" aria-label="Legal">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms &amp; Conditions</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </nav>
        <p className="footer-copy">
          OMNIQUIZ is a free trivia game. No account required. No personal data collected.
        </p>
      </div>
    </footer>
  );
}
