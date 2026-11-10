import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="nf">
      <h1>404</h1>
      <p>That page doesn&apos;t exist — but plenty of others do.</p>
      <Link className="btn btn-primary" href="/">Back to Home</Link>
    </div>
  );
}
