import { redirect } from "next/navigation";

/** Password resets now use an emailed code on /forgot-password; old reset links land there. */
export default function ResetPasswordPage() {
  redirect("/forgot-password");
}
