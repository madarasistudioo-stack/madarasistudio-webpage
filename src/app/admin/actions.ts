"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdminEmail, requireAdmin } from "@/lib/admin";
import { getProductBySlug } from "@/lib/products";

function int(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  const n = Math.round(Number(s));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function saveProductSetting(form: FormData) {
  await requireAdmin();
  const slug = String(form.get("slug"));
  if (!getProductBySlug(slug)) return;
  const data = {
    price: int(form.get("price")),
    compareAt: int(form.get("compareAt")),
    stock: int(form.get("stock")),
    hidden: form.get("visible") !== "on",
  };
  await prisma.productSetting.upsert({ where: { slug }, create: { slug, ...data }, update: data });
  revalidatePath("/", "layout");
}

export async function resetProductSetting(form: FormData) {
  await requireAdmin();
  await prisma.productSetting.deleteMany({ where: { slug: String(form.get("slug")) } });
  revalidatePath("/", "layout");
}

export async function setUserBlocked(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || isAdminEmail(user.email)) return; // never lock the owner out
  await prisma.user.update({ where: { id }, data: { blocked: form.get("blocked") === "true" } });
  revalidatePath("/admin/users");
}

export async function deleteUser(form: FormData) {
  await requireAdmin();
  if (form.get("confirm") !== "on") return;
  const id = String(form.get("id"));
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || isAdminEmail(user.email)) return;
  await prisma.user.delete({ where: { id } }); // orders are kept, detached from the account
  revalidatePath("/admin/users");
}

export async function addUser(form: FormData) {
  await requireAdmin();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const name = String(form.get("name") ?? "").trim() || null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  await prisma.user.upsert({ where: { email }, create: { email, name }, update: { name: name ?? undefined } });
  revalidatePath("/admin/users");
}

export async function setOrderStatus(form: FormData) {
  await requireAdmin();
  const status = String(form.get("status"));
  if (!ORDER_STATUSES.includes(status)) return;
  await prisma.order.update({ where: { id: String(form.get("id")) }, data: { status } });
  revalidatePath("/admin/orders");
}

const ORDER_STATUSES = ["created", "paid", "printing", "shipped", "delivered", "cancelled", "refunded", "failed"];
