import { redirect } from "next/navigation"

export default async function StaffInviteRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token
  if (token) {
    redirect(`/staff/accept-invite?token=${encodeURIComponent(token)}`)
  }
  redirect("/staff/accept-invite")
}
