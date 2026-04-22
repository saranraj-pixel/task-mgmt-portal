import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({ 
  task, 
  users, 
  onAssignUser, 
  onMoveTask,
  currentUserId 
}) {
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

  // Helper function to safely get user ID
  const getUserId = (user) => {
    if (!user) return null;
    return user._id?.toString() || user.toString();
  };

  // Determine relationship with current user
  const getTaskRelationship = () => {
    if (!currentUserId) return null;
    
    const createdById = getUserId(task.createdBy);
    const assignedToId = getUserId(task.assignedTo);
    const currentUserIdStr = currentUserId.toString();
    
    const isCreatedByMe = createdById === currentUserIdStr;
    const isAssignedToMe = assignedToId === currentUserIdStr;
    
    if (isCreatedByMe && isAssignedToMe) {
      return { text: "📌 Assigned & Created by me", type: "both", show: true };
    } else if (isAssignedToMe) {
      return { text: "📋 Assigned to me", type: "assigned", show: true };
    } else if (isCreatedByMe) {
      return { text: "✨ Created by me", type: "created", show: true };
    }
    
    return { text: "", type: "other", show: false };
  };

  const getBadgeColor = (type) => {
    switch(type) {
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "created":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "both":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const relationship = getTaskRelationship();
  
  // Check if current user is the creator
  const isCreator = getUserId(task.createdBy) === currentUserId?.toString();
  
  // Check if current user is the assignee

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
        {/* RELATIONSHIP BADGE - Only show if task is related to current user */}
        {relationship.show && (
          <div className="mb-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${getBadgeColor(relationship.type)}`}>
              {relationship.text}
            </span>
          </div>
        )}

        {/* TITLE */}
        <h3 className="text-sm font-medium mb-2 truncate">{task.title}</h3>

        {/* PRIORITY & DEADLINE */}
        <div className="flex justify-between text-xs items-center mb-3">
          <span
            className={`px-2 py-1 rounded ${
              priorityColors[task.priority] || "bg-gray-100"
            }`}
          >
            {task.priority}
          </span>
          
          {task.deadline && (
            <span className="text-gray-500 text-xs">
              📅 {new Date(task.deadline).toLocaleDateString("en-GB")}
            </span>
          )}
        </div>

        {/* ASSIGN USER DROPDOWN */}
        <div onPointerDown={(e) => e.stopPropagation()} className="mb-3">
          <label className="text-xs text-gray-600 mb-1 block">Assign to:</label>
          <select
            value={task.assignedTo?._id || ""}
            onChange={(e) => onAssignUser(task._id, e.target.value)}
            className="w-full border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {users?.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} {getUserId(user) === currentUserId?.toString() ? "(You)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* CREATED BY INFO */}
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            Created by: {task.createdBy?.name || "Unknown"}
            {isCreator && " (You)"}
          </p>
          {/* {task.assignedTo && !isAssignee && task.assignedTo.name !== task.createdBy?.name && (
            <p className="text-xs text-gray-500 mt-1">
              Assigned to: {task.assignedTo?.name || "Unassigned"}
            </p>
          )} */}
        </div>

        {/* MOVE TASK BUTTONS */}
        <div
          className="flex flex-wrap gap-2"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => onMoveTask(task._id, s.id)}
              disabled={task.status === s.id}
              className={`text-xs px-2 py-1 rounded border transition ${
                task.status === s.id
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100 border-gray-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
