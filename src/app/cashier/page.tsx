import { redirect } from 'next/navigation';

export default function CashierLogin() {
  redirect('/login?role=CASHIER');
}
