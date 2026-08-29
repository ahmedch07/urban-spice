import { Landing } from "@/components/landing/landing";
import { getPublicMenu } from "@/lib/public-menu";

export default async function Page() {
  const initialMenu = await getPublicMenu().catch(() => undefined);

  return <Landing initialMenu={initialMenu} />;
}
