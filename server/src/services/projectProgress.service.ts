import Project from "../models/Project.js";
import Task from "../models/Task.js";

// Recalculates a project's progress from its linked tasks and saves it.
// If the project has no linked tasks, this is a no-op — progress stays
// exactly as the user set it manually, since there's nothing to derive it from.
export async function syncProjectProgress(projectId: string, userId: string) {
  if (!projectId) return;

  const total = await Task.countDocuments({ userId, projectId });

  if (total === 0) {
    // No linked tasks — leave the manual `progress` value untouched, but the
    // count itself should still read zero.
    await Project.findOneAndUpdate({ _id: projectId, userId }, { $set: { linkedTaskCount: 0 } });
    return;
  }

  const completed = await Task.countDocuments({
    userId,
    projectId,
    status: { $in: ["completed", "archived"] },
  });

  const progress = Math.round((completed / total) * 100);
  await Project.findOneAndUpdate({ _id: projectId, userId }, { $set: { progress, linkedTaskCount: total } });
}
