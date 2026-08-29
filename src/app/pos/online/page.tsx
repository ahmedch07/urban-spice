import { redirect } from 'next/navigation';

// Backwards-compatible customer ordering URL.
export default function OnlineOrderingRedirect() {
  redirect('/');
}
