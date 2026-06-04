import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/shared/EmptyState";
import { LoadingSkeleton } from "../components/shared/LoadingSkeleton";
import { Modal } from "../components/shared/Modal";
import { SearchBar } from "../components/shared/SearchBar";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ProjectForm } from "../components/projects/ProjectForm";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../services/api";
import { projectService } from "../services/project.service";
import type { Project } from "../types";

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  async function load() {
    try {
      setLoading(true);
      setProjects(await projectService.list({ search }));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [search]);

  async function save(data: any) {
    try {
      if (editing) await projectService.update(editing._id, data);
      else await projectService.create(data);
      toast.success(editing ? "Project updated" : "Project created");
      setModalOpen(false);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function remove(project: Project) {
    if (!confirm("Delete this project?")) return;
    await projectService.remove(project._id);
    toast.success("Project deleted");
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">Track meaningful work without turning it into a corporate dashboard.</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true); }}><Plus className="h-4 w-4" /> New project</Button>
      </div>
      <div className="max-w-xl"><SearchBar value={search} onChange={setSearch} placeholder="Search projects..." /></div>
      {loading ? <LoadingSkeleton rows={4} /> : projects.length === 0 ? <EmptyState title="No projects yet" description="Create one project for work that needs steady attention this month." action={<Button onClick={() => setModalOpen(true)}>Create project</Button>} /> : <div className="space-y-3">{projects.map((project) => <ProjectCard key={project._id} project={project} onEdit={() => { setEditing(project); setModalOpen(true); }} onDelete={() => remove(project)} />)}</div>}
      <Modal open={modalOpen} title={editing ? "Edit project" : "New project"} onClose={() => setModalOpen(false)}>
        <ProjectForm project={editing} onSubmit={save} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
