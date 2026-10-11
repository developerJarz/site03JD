import "server-only";
import { connectDB } from "@/lib/db/connect";
import { BuilderOrder, BuilderQuote } from "@/models/builder";
import { CONFIRMED_STATUSES, ORDER_STATUSES, type OrderStatus } from "./constants";
import { loadPublishedPricebook } from "./server";

/** Builder statistics computed from stored quotes and orders — nothing estimated or invented. */
export async function getBuilderStats() {
  await connectDB();
  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const weeks = 8;
  const weekStart = new Date();
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() - (weeks - 1) * 7);

  const [quotes, quotes30, quotesOrdered, orders30, byStatus, values, templates, features, weekly, pb] = await Promise.all([
    BuilderQuote.countDocuments({}),
    BuilderQuote.countDocuments({ createdAt: { $gte: since30 } }),
    BuilderQuote.countDocuments({ order: { $ne: null } }),
    BuilderOrder.countDocuments({ createdAt: { $gte: since30 } }),
    BuilderOrder.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    BuilderOrder.aggregate<{ _id: null; estimated: number; confirmed: number; paid: number }>([
      {
        $group: {
          _id: null,
          estimated: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 0, "$total"] } },
          confirmed: { $sum: { $cond: [{ $in: ["$status", CONFIRMED_STATUSES] }, "$total", 0] } },
          paid: { $sum: "$amountPaid" },
        },
      },
    ]),
    BuilderOrder.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$templateName", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 10 }]),
    BuilderOrder.aggregate<{ _id: string; n: number }>([{ $unwind: "$featureIds" }, { $group: { _id: "$featureIds", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 12 }]),
    BuilderOrder.aggregate<{ _id: Date; n: number }>([
      { $match: { createdAt: { $gte: weekStart } } },
      { $group: { _id: { $dateTrunc: { date: "$createdAt", unit: "week", startOfWeek: "sunday" } }, n: { $sum: 1 } } },
    ]),
    loadPublishedPricebook(),
  ]);

  const orders = byStatus.reduce((s, x) => s + x.n, 0);
  const featureName = new Map(pb.features.map((f) => [f.id, f.name]));
  const weekly8 = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * 7 * 86_400_000);
    const hit = weekly.find((w) => new Date(w._id).toISOString().slice(0, 10) === d.toISOString().slice(0, 10));
    return { label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: hit?.n ?? 0 };
  });

  return {
    quotes,
    quotes30,
    orders,
    orders30,
    /** Share of quotations that became an order. */
    conversion: quotes ? quotesOrdered / quotes : 0,
    byStatus: ORDER_STATUSES.map((s) => ({ status: s as OrderStatus, n: byStatus.find((x) => x._id === s)?.n ?? 0 })),
    estimatedValue: values[0]?.estimated ?? 0,
    confirmedValue: values[0]?.confirmed ?? 0,
    paidValue: values[0]?.paid ?? 0,
    topTemplates: templates.filter((t) => t._id).map((t) => ({ label: t._id, value: t.n })),
    topFeatures: features.map((f) => ({ label: featureName.get(f._id) ?? f._id, value: f.n })),
    weekly: weekly8,
  };
}
