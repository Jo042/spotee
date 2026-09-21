import { FollowListContent } from "@/components/user/FollowListContent";

export default async function FollowingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FollowListContent userId={id} tab="following" />;
}
