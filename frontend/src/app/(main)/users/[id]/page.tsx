import { UserProfileContent } from "@/components/user/UserProfileContent";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <UserProfileContent userId={id} />;
}
