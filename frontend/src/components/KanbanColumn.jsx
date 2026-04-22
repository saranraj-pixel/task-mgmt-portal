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
  users,            
  onAssignUser,     
  onMoveTask,
  currentUserId,    
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const isActiveColumn = isOver || overColumn === id;

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

  const style = columnStyles[id] || {
    banner: "bg-gray-500",
    badge: "bg-gray-100 text-gray-700",
    icon: null,
  };

  // Helper function to safely get user ID
  const getUserId = (user) => {
    if (!user) return null;
    return user._id?.toString() || user.toString();
  };

  // Filter and group tasks based on current user
  const filteredTasks = tasks.filter(task => {
    if (!currentUserId) return true;
    
    const createdById = getUserId(task.createdBy);
    const assignedToId = getUserId(task.assignedTo);
    const currentUserIdStr = currentUserId.toString();
    
    // Show tasks that are either created by current user OR assigned to current user
    return createdById === currentUserIdStr || assignedToId === currentUserIdStr;
  });

  const groupedTasks = {
    assigned: filteredTasks.filter(task => {
      const assignedToId = getUserId(task.assignedTo);
      return assignedToId === currentUserId?.toString();
    }),
    created: filteredTasks.filter(task => {
      const createdById = getUserId(task.createdBy);
      const assignedToId = getUserId(task.assignedTo);
      return createdById === currentUserId?.toString() && 
             assignedToId !== currentUserId?.toString();
    }),
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
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${style.badge}`}>
          {filteredTasks.length}
        </span>
      </div>

      {/* Tasks Area */}
      <div
        className={`p-4 space-y-3 min-h-55 border border-gray-200 border-t-0 rounded-b-xl ${
          isActiveColumn ? "border-blue-600" : ""
        }`}
      >
        {/* Assigned Tasks Section */}
        {groupedTasks.assigned.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-blue-200">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                📋 Assigned to me ({groupedTasks.assigned.length})
              </span>
            </div>
            <div className="space-y-3">
              {groupedTasks.assigned.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  users={users}                 
                  onAssignUser={onAssignUser}   
                  onMoveTask={onMoveTask}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Created Tasks Section */}
        {groupedTasks.created.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-purple-200">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                ✨ Created by me ({groupedTasks.created.length})
              </span>
            </div>
            <div className="space-y-3">
              {groupedTasks.created.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  users={users}                 
                  onAssignUser={onAssignUser}   
                  onMoveTask={onMoveTask}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && !activeTask && (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No tasks here!
          </div>
        )}

        {/* Drag Drop Preview */}
        {activeTask && isActiveColumn && (
          <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 bg-blue-100 animate-pulse">
            <div className="text-xs text-blue-600 font-medium">
              Drop task here
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
