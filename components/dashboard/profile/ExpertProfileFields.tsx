"use client";

import { uploadImageToBlob } from "@/lib/blob-upload";
import { useRef, useState } from "react";

type LinkRow = { key: string; label: string; url: string };
type ProjectRow = {
  key: string;
  title: string;
  url: string;
  imageUrl: string;
  uploading: boolean;
};

type ExpertProfileFieldsProps = {
  userId: string;
  specialty: string;
  rate: number | null;
  links: { label: string; url: string }[];
  selectedProjects: { title: string; url: string; imageUrl: string }[];
  onUploadingChange: (uploading: boolean) => void;
};

const MAX_PROJECTS = 6;

let keyCounter = 0;
const nextKey = () => `row-${keyCounter++}`;

const ExpertProfileFields = ({
  userId,
  specialty,
  rate,
  links: initialLinks,
  selectedProjects: initialProjects,
  onUploadingChange,
}: ExpertProfileFieldsProps) => {
  const [links, setLinks] = useState<LinkRow[]>(() =>
    initialLinks.map((link) => ({ key: nextKey(), ...link })),
  );
  const [projects, setProjects] = useState<ProjectRow[]>(() =>
    initialProjects.map((project) => ({
      key: nextKey(),
      uploading: false,
      ...project,
    })),
  );

  const uploadingCount = useRef(0);

  const adjustUploadingCount = (delta: number) => {
    uploadingCount.current += delta;
    onUploadingChange(uploadingCount.current > 0);
  };

  const addLink = () => {
    setLinks((prev) => [...prev, { key: nextKey(), label: "", url: "" }]);
  };

  const removeLink = (key: string) => {
    setLinks((prev) => prev.filter((link) => link.key !== key));
  };

  const addProject = () => {
    setProjects((prev) =>
      prev.length >= MAX_PROJECTS
        ? prev
        : [
            ...prev,
            { key: nextKey(), title: "", url: "", imageUrl: "", uploading: false },
          ],
    );
  };

  const removeProject = (key: string) => {
    setProjects((prev) => prev.filter((project) => project.key !== key));
  };

  const handleProjectImageChange = async (
    key: string,
    file: File | undefined,
  ) => {
    if (!file) return;

    setProjects((prev) =>
      prev.map((project) =>
        project.key === key ? { ...project, uploading: true } : project,
      ),
    );
    adjustUploadingCount(1);

    try {
      const url = await uploadImageToBlob(userId, "projects", file);
      setProjects((prev) =>
        prev.map((project) =>
          project.key === key
            ? { ...project, imageUrl: url, uploading: false }
            : project,
        ),
      );
    } finally {
      adjustUploadingCount(-1);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 grid-cols-2">
        <div>
          <label className="form-label" htmlFor="specialty">
            Specialty
          </label>
          <input
            type="text"
            name="specialty"
            id="specialty"
            defaultValue={specialty}
            className="form-input"
            placeholder="e.g. Brand Direction"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="rate">
            Starting rate
          </label>
          <input
            type="number"
            name="rate"
            id="rate"
            min={0}
            step={1}
            defaultValue={rate ?? ""}
            className="form-input"
            placeholder="e.g. 4500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="form-label">Links</p>
          <button
            type="button"
            onClick={addLink}
            className="uppercase text-xs bg-secondary/10 px-3 py-1 rounded-full border border-primary-light hover:border-secondary transition-colors"
          >
            Add link
          </button>
        </div>
        <div className="space-y-2">
          {links.map((link, index) => (
            <div key={link.key} className="flex gap-2 items-center">
              <input
                type="text"
                name={`links[${index}][label]`}
                defaultValue={link.label}
                className="form-input w-1/3"
                placeholder="Website, Instagram, ..."
              />
              <input
                type="text"
                name={`links[${index}][url]`}
                defaultValue={link.url}
                className="form-input flex-1"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => removeLink(link.key)}
                className="uppercase text-xs text-body hover:text-[#d35555] transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="form-label">
            Selected projects ({projects.length}/{MAX_PROJECTS})
          </p>
          <button
            type="button"
            onClick={addProject}
            disabled={projects.length >= MAX_PROJECTS}
            className="uppercase text-xs bg-secondary/10 px-3 py-1 rounded-full border border-primary-light hover:border-secondary transition-colors disabled:opacity-50"
          >
            Add project
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {projects.map((project, index) => (
            <div
              key={project.key}
              className="bg-secondary/5 rounded-xl p-3 space-y-2"
            >
              <div className="aspect-video rounded-lg bg-secondary/10 overflow-hidden flex items-center justify-center">
                {project.uploading && (
                  <span className="text-xs text-body">Uploading...</span>
                )}
                {!project.uploading && project.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.imageUrl}
                    alt={project.title || "Project image"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <input
                type="hidden"
                name={`projects[${index}][imageUrl]`}
                value={project.imageUrl}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleProjectImageChange(project.key, e.target.files?.[0])
                }
                className="text-xs w-full"
              />
              <input
                type="text"
                name={`projects[${index}][title]`}
                defaultValue={project.title}
                className="form-input w-full"
                placeholder="Project title"
              />
              <input
                type="text"
                name={`projects[${index}][url]`}
                defaultValue={project.url}
                className="form-input w-full"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={() => removeProject(project.key)}
                className="uppercase text-xs text-body hover:text-[#d35555] transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpertProfileFields;
