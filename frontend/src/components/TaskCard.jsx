import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ task, users, onAssignUser, onMoveTask }) {
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

  // let deadlineStatusClass = "text-blue-500";

  // if (task.deadline) {
  //   const today = new Date();
  //   const deadline = new Date(task.deadline);

  //   today.setHours(0, 0, 0, 0);
  //   deadline.setHours(0, 0, 0, 0);

  //   if (deadline < today) {
  //     deadlineStatusClass = "text-red-500 font-semibold";
  //   } else if (deadline.getTime() === today.getTime()) {
  //     deadlineStatusClass = "text-yellow-500 font-semibold";
  //   } else {
  //     deadlineStatusClass = "text-blue-500";
  //   }
  // }

  // const formattedPriority =
  //   task.priority.charAt(0).toUpperCase() +
  //   task.priority.slice(1).toLowerCase();
  
  const statuses = [
    { id: "todo", label: "To Do" },
    { id: "in-progress", label: "In Progress" },
    { id: "done", label: "Done" },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition ${
        isDragging ? "opacity-40 scale-95" : ""
      }`}
    >
      <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition">
        {/* TITLE */}
        <h3 className="text-sm font-medium mb-2 truncate">{task.title}</h3>

        {/* PRIORITY */}
        <div className="flex justify-between text-xs items-center mb-2">
          <span
            className={`px-2 py-1 rounded ${
              priorityColors[task.priority] || "bg-gray-100"
            }`}
          >
             {/* {formattedPriority} */}
            {task.priority}
          </span>
          {/* {task.deadline && (
            <span className={deadlineStatusClass}>
              {new Date(task.deadline).toLocaleDateString("en-GB")}
            </span>
          )} */}
        </div>

        {/* ASSIGN USER */}
        <div onPointerDown={(e) => e.stopPropagation()}>
          <select
            value={task.assignedTo?._id || ""}
            onChange={(e) => onAssignUser(task._id, e.target.value)}
            className="w-full border rounded px-2 py-1 text-xs"
          >
            <option value="">Unassigned</option>
            {users?.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ MOVE BUTTONS */}
        <div
          className="flex flex-wrap gap-2 mt-3"
          onPointerDown={(e) => e.stopPropagation()} // prevent drag conflict
        >
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => onMoveTask(task._id, s.id)}
              disabled={task.status === s.id}
              className={`text-xs px-2 py-1 rounded border ${
                task.status === s.id
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Assigned By */}
        <p className="mt-2 text-[13px] text-gray-700">
          Assigned by: {task.createdBy?.name || "You"}
        </p>
        {/* MOVE TASK BUTTONS */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {task.status !== "todo" && (
            <button
              onClick={() => onMoveTask(task._id, "todo")}
              className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              To Do
            </button>
          )}

          {task.status !== "in-progress" && (
            <button
              onClick={() => onMoveTask(task._id, "in-progress")}
              className="text-xs px-2 py-1 bg-orange-200 rounded hover:bg-orange-300"
            >
              In Progress
            </button>
          )}

          {task.status !== "done" && (
            <button
              onClick={() => onMoveTask(task._id, "done")}
              className="text-xs px-2 py-1 bg-green-200 rounded hover:bg-green-300"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
