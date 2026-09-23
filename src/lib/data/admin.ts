import "server-only";
import { connectDB } from "@/lib/db/connect";
import { Post, Project, Service } from "@/models/content";
import { ActivityLog, Lead, ProjectRequest } from "@/models/operations";
import { User } from "@/models/User";

/** Buckets dates into the last `weeks` ISO weeks (oldest → newest). */
function weekly(dates: Date[], weeks = 12) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay() - (weeks - 1) * 7);
  const buckets = Array.from({ length: weeks }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i * 7);
    return { start: d, value: 0 };
  });
  for (const date of dates) {
    const idx = Math.floor((date.getTime() - start.getTime()) / (7 * 86400_000));
    if (idx >= 0 && idx < weeks) buckets[idx].value++;
  }
  const f = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return buckets.map((b) => ({ label: f.format(b.start), value: b.value }));
}

export async function getDashboardData({ includeLeads, includeUsers }: { includeLeads: boolean; includeUsers: boolean }) {
  await connectDB();
  const since = new Date(Date.now() - 12 * 7 * 86400_000);
  const month = new Date(Date.now() - 30 * 86400_000);

  const [posts, publishedPosts, services, projects, topPosts, topProjects] = await Promise.all([
    Post.countDocuments(),
    Post.countDocuments({ status: "published" }),
    Service.countDocuments({ published: true }),
    Project.countDocuments({ published: true }),
    Post.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(6).select("title views").lean(),
    Project.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(6).select("client views").lean(),
  ]);

  const leadsBlock = includeLeads
    ? await Promise.all([
        Lead.countDocuments({ createdAt: { $gte: month } }),
        Lead.countDocuments({ status: { $in: ["NEW", "CONTACTED", "QUALIFIED"] } }),
        ProjectRequest.countDocuments({ status: "COMPLETED" }),
        Lead.find({ createdAt: { $gte: since } }).select("createdAt").lean(),
        Lead.aggregate<{ _id: string; count: number }>([
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: { $ifNull: ["$serviceName", "Not specified"] }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
        Lead.find().sort({ createdAt: -1 }).limit(6).select("name email serviceName status createdAt").lean(),
        ProjectRequest.countDocuments({ status: { $in: ["NEW", "CONTACTED", "QUALIFIED", "IN_PROGRESS"] } }),
      ])
    : null;

  const usersBlock = includeUsers
    ? await Promise.all([User.countDocuments(), User.countDocuments({ createdAt: { $gte: month } }), User.find({ createdAt: { $gte: since } }).select("createdAt").lean()])
    : null;

  const activity = await ActivityLog.find().sort({ createdAt: -1 }).limit(8).lean();

  return {
    content: { posts, publishedPosts, services, projects },
    leads: leadsBlock && {
      newThisMonth: leadsBlock[0],
      pending: leadsBlock[1],
      completedProjects: leadsBlock[2],
      weekly: weekly(leadsBlock[3].map((l) => new Date(l.createdAt))),
      byService: leadsBlock[4].map((r) => ({ label: r._id, value: r.count })),
      recent: leadsBlock[5],
      openRequests: leadsBlock[6],
    },
    users: usersBlock && {
      total: usersBlock[0],
      newThisMonth: usersBlock[1],
      weekly: weekly(usersBlock[2].map((u) => new Date(u.createdAt))),
    },
    engagement: {
      posts: topPosts.map((p) => ({ label: p.title, value: p.views ?? 0 })),
      projects: topProjects.map((p) => ({ label: p.client, value: p.views ?? 0 })),
    },
    activity,
  };
}
