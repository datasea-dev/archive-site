import { redirect } from "next/navigation";

export default function AdminRoot() {
  // Langsung alihkan traffic ke halaman login
  redirect("/admin/login");
}