import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityColors = {
    low: "bg-green-200 text-green-700",
    medium: "bg-yellow-200 text-yellow-700",
    high: "bg-red-200 text-red-700",
  };

  let deadlineStatusClass = "text-blue-500";

  if (task.deadline) {
    const today = new Date();
    const deadline = new Date(task.deadline);

    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) {
      deadlineStatusClass = "text-red-500 font-semibold";
    } else if (deadline.getTime() === today.getTime()) {
      deadlineStatusClass = "text-yellow-500 font-semibold";
    } else {
      deadlineStatusClass = "text-blue-500";
    }
  }

  const formattedPriority =
    task.priority.charAt(0).toUpperCase() +
    task.priority.slice(1).toLowerCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition
      ${isDragging ? "opacity-40 scale-95" : ""}
      `}
    >
      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
        <h3 className="text-sm font-medium mb-2 truncate">{task.title}</h3>

        <div className="flex justify-between text-xs items-center">
          <span
            className={`px-2 py-1 rounded ${
              priorityColors[task.priority] || "bg-gray-100"
            }`}
          >
            {formattedPriority}
          </span>

          {task.deadline && (
            <span className={deadlineStatusClass}>
              {new Date(task.deadline).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
