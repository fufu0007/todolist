import { useState } from 'react';
import { Folder, Plus, X } from 'lucide-react';
import type { Project } from '../types/todo';

interface ProjectListProps {
  projects: Project[];
  selectedProject: string;
  onSelectProject: (projectId: string) => void;
  onAddProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function ProjectList({
  projects,
  selectedProject,
  onSelectProject,
  onAddProject,
  onDeleteProject
}: ProjectListProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName.trim(),
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      };
      onAddProject(newProject);
      setNewProjectName('');
      setIsAddingProject(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">项目列表</h3>
        <button
          onClick={() => setIsAddingProject(true)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAddingProject && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="项目名称"
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
          />
          <button
            onClick={handleAddProject}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            添加
          </button>
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => onSelectProject('all')}
          className={`w-full flex items-center gap-2 p-2 rounded ${
            selectedProject === 'all' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <Folder size={20} />
          <span>所有项目</span>
        </button>

        {projects.map(project => (
          <div
            key={project.id}
            className={`flex items-center justify-between p-2 rounded ${
              selectedProject === project.id ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <button
              onClick={() => onSelectProject(project.id)}
              className="flex items-center gap-2 flex-1"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span>{project.name}</span>
            </button>
            <button
              onClick={() => onDeleteProject(project.id)}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 