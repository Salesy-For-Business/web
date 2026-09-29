"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  ResourceDetailPanel,
  type ResourceField,
  type ResourceFieldValue,
} from "@/components/admin/resource-detail-panel";
import {
  useAdminResourceDelete,
  useAdminResourceDetail,
  useAdminResourceUpdate,
  getApiError,
} from "@/lib/admin/resource-queries";

type UserDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  provider: string;
  emailVerified: boolean;
  isModerator: boolean;
  moderatorRole: string | null;
  suspended: boolean;
};

const fields: ResourceField[] = [
  { key: "firstName", label: "First name", type: "text" },
  { key: "lastName", label: "Last name", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "provider", label: "Sign-in method", type: "readonly" },
  { key: "moderatorRole", label: "Moderator role", type: "readonly" },
  { key: "suspended", label: "Suspended", type: "checkbox" },
];

function UserDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const { data, isPending } = useAdminResourceDetail<UserDetail>("users", "user", id);
  const update = useAdminResourceUpdate<UserDetail>("users", "user", id);
  const remove = useAdminResourceDelete("users", id);
  const [values, setValues] = useState<Record<string, ResourceFieldValue> | null>(null);

  useEffect(() => {
    if (!data) return;
    const t = window.setTimeout(() => setValues({ ...data }), 0);
    return () => window.clearTimeout(t);
  }, [data]);

  if (isPending || !values) {
    return <p className="text-[14px] text-muted">Loading…</p>;
  }

  async function onSave() {
    try {
      await update.mutateAsync({
        firstName: values!.firstName,
        lastName: values!.lastName,
        email: values!.email,
        phone: values!.phone,
        suspended: Boolean(values!.suspended),
      });
      toast.success("User updated");
    } catch (err) {
      toast.error(getApiError(err, "Could not update user."));
    }
  }

  async function onDelete() {
    try {
      await remove.mutateAsync();
      toast.success("User deleted");
      router.push("/admin/users");
    } catch (err) {
      toast.error(getApiError(err, "Could not delete user."));
    }
  }

  return (
    <div>
      <AdminPageHeader
        backHref="/admin/users"
        backLabel="All users"
        title={`${data?.firstName ?? ""} ${data?.lastName ?? ""}`.trim() || "User"}
        description={
          <>
            {data?.email}. Moderator role changes happen from{" "}
            <Link href="/admin/moderators" className="text-link hover:underline">
              Moderators
            </Link>
            .
          </>
        }
      />
      <ResourceDetailPanel
        title="User details"
        fields={fields}
        values={values}
        onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
        onSave={() => void onSave()}
        onDelete={() => void onDelete()}
        saving={update.isPending}
        deleting={remove.isPending}
        deleteLabel="Delete user"
        deleteConfirm="Delete this user account? This can't be undone."
      />
    </div>
  );
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AdminShell allow={["superadmin"]}>
      <UserDetailContent id={id} />
    </AdminShell>
  );
}
