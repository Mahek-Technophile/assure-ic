import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link href="/">Home</Link>
      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/admin">Admin</Link>
    </nav>
  );
}
