import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import { FiClock, FiCheckCircle } from "react-icons/fi";
import { LuListTodo } from "react-icons/lu";

export default function KanbanColumn({
  id,
  title,
  tasks,
  activeTask,
  overColumn,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  // highlight column while dragging
  const isActiveColumn = isOver || overColumn === id;

  // column styling configuration
  const columnStyles = {
    todo: {
      banner: "bg-indigo-600",
      badge: "bg-indigo-100 text-indigo-700",
      icon: <LuListTodo className="text-white" size={18} />,
    },
    "in-progress": {
      banner: "bg-orange-500",
      badge: "bg-orange-100 text-orange-700",
      icon: <FiClock className="text-white" size={18} />,
    },
    done: {
      banner: "bg-green-600",
      badge: "bg-green-100 text-green-700",
      icon: <FiCheckCircle className="text-white" size={18} />,
    },
  };

  // Safe fallback
  const style = columnStyles[id] || {
    banner: "bg-gray-500",
    badge: "bg-gray-100 text-gray-700",
    icon: null,
  };

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl overflow-hidden transition-all ${
        isActiveColumn ? "bg-blue-50 shadow-md" : "bg-white"
      }`}
    >
      {/* Header Banner */}
      <div
        className={`flex items-center justify-between px-4 py-4 ${style.banner} rounded-t-xl`}
      >
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          {style.icon}
          {title}
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${style.badge}`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Tasks Area */}
      <div
        className={`p-4 space-y-3 min-h-55 border border-gray-500 border-t-0 rounded-b-xl ${
          isActiveColumn ? "border-blue-600" : ""
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}

        {/* Drag Drop Preview */}
        {activeTask && isActiveColumn && (
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 bg-blue-100 animate-pulse">
            <div className="text-xs text-blue-600 font-medium">
              Drop task here
            </div>
          </div>
        )}

        {/* Empty Column */}
        {tasks.length === 0 && !activeTask && (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No tasks here!
          </div>
        )}
      </div>
    </div>
  );
}
