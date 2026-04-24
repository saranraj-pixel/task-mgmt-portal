import { useEffect, useState } from "react";
import { getTasks, updateTask, deleteTask } from "../../services/taskService";
import { getUsers } from "../../services/authService";
import TaskModal from "../../components/TaskModal";
import TaskDetailsModal from "../../components/TaskDetailsModal";
import Skeleton from "../../components/Skeleton";
import ConfirmDialog from "../../components/ConfirmDialog"; 
import { FiPlus, FiUser, FiUserCheck, FiUserPlus, FiTrash2, FiEye } from "react-icons/fi";
import { logError } from "../../../utils/logger";
import { toast } from "react-toastify";

const AdminTasks = () => { 
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // State for Task Details Modal
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all");

  /* LOAD DATA & CURRENT USER */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [taskRes, userRes] = await Promise.all([
          getTasks({ page: 1, limit: 1000 }),
          getUsers(),
        ]);

        setTasks(taskRes?.tasks || []);
        setUsers(userRes?.users || []);
        
        // Get current user from localStorage or context
        const currentUserData = getCurrentUser();
        setCurrentUser(currentUserData);
      } catch (err) {
        logError(err, { action: "ADMIN_TASKS_LOAD_FAILED" });
        toast.error(err.response?.data?.message || err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get current user
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
      const token = localStorage.getItem('token');
      if (token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  };

  // Handle row click to show details
  const handleTaskClick = (task, event) => {
    // Prevent opening details modal when clicking on buttons or selects
    if (event.target.closest('button') || event.target.closest('select')) {
      return;
    }
    setSelectedTaskForDetails(task);
    setIsDetailsModalOpen(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTaskForDetails(null);
  };

  // Helper function to safely get user ID
  const getUserId = (user) => {
    if (!user) return null;
    return user._id?.toString() || user.toString();
  };

  /* DELETE TASK FUNCTION */
  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      setDeletingTaskId(taskToDelete._id);
      
      await deleteTask(taskToDelete._id);
      
      // Remove task from state
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskToDelete._id));
      
      // Show success toast
      toast.success(`Task "${taskToDelete.title}" deleted successfully`);
      
      // Close confirmation dialog
      setTaskToDelete(null);
      
    } catch (err) {
      logError(err, { action: "DELETE_TASK_FAILED", taskId: taskToDelete._id });
      
      toast.error(err.response?.data?.message || err.message || "Failed to delete task. Please try again.");
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Refresh tasks function
  const refreshTasks = async () => {
    try {
      const taskRes = await getTasks({ page: 1, limit: 1000 });
      setTasks(taskRes?.tasks || []);
    } catch (err) {
      logError(err, { action: "REFRESH_TASKS_FAILED" });
      toast.error(err.response?.data?.message || err.message || "Failed to refresh tasks");
    }
  };

  /* ASSIGN USER */
  const handleAssign = async (taskId, userId, event) => {
    if (event) event.stopPropagation(); 
    try {
      await updateTask(taskId, {
        assignedTo: userId || null,
      });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                assignedTo: users.find((u) => u._id === userId) || null,
              }
            : t,
        ),
      );
      
      toast.success("Task assigned successfully");
    } catch (err) {
      logError(err, { action: "ASSIGN_USER_FAILED" });
      toast.error(err.response?.data?.message || err.message || "Failed to assign task");
    }
  };

  const formatStatus = (status) => {
    if (status === "in-progress") return "In Progress";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-700";
      case "in-progress":
        return "bg-amber-200 text-amber-700";
      case "done":
        return "bg-green-300 text-green-700";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low":
        return "bg-blue-200 text-blue-700";
      case "medium":
        return "bg-orange-200 text-orange-700";
      case "high":
        return "bg-red-200 text-red-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  // Get relationship badge for task
  const getTaskRelationship = (task) => {
    if (!currentUser) return null;
    
    const createdById = getUserId(task.createdBy);
    const assignedToId = getUserId(task.assignedTo);
    const currentUserIdStr = currentUser._id?.toString() || currentUser.id?.toString();
    
    const isCreatedByMe = createdById === currentUserIdStr;
    const isAssignedToMe = assignedToId === currentUserIdStr;
    
    if (isCreatedByMe && isAssignedToMe) {
      return { text: "Created & Assigned to me", type: "both", icon: "✨📋" };
    } else if (isAssignedToMe) {
      return { text: "Assigned to me", type: "assigned", icon: "📋" };
    } else if (isCreatedByMe) {
      return { text: "Created by me", type: "created", icon: "✨" };
    }
    return null;
  };

  const getRelationshipBadgeStyle = (type) => {
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

  // Check if user can delete task
  const canDeleteTask = (task) => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const createdById = getUserId(task.createdBy);
    const currentUserIdStr = currentUser._id?.toString() || currentUser.id?.toString();
    
    // Admin can delete all tasks
    if (userRole === "admin") return true;
    
    // Regular users can only delete their own tasks
    return createdById === currentUserIdStr;
  };

  /* FILTERS */
  const filteredTasks = tasks.filter((t) => {
    const statusMatch = filter === "all" || t.status === filter;
    const priorityMatch = priorityFilter === "all" || 
      (t.priority || "low").toLowerCase() === priorityFilter;
    
    // Relationship filter
    let relationshipMatch = true;
    if (relationshipFilter !== "all" && currentUser) {
      const createdById = getUserId(t.createdBy);
      const assignedToId = getUserId(t.assignedTo);
      const currentUserIdStr = currentUser._id?.toString() || currentUser.id?.toString();
      
      if (relationshipFilter === "created_by_me") {
        relationshipMatch = createdById === currentUserIdStr;
      } else if (relationshipFilter === "assigned_to_me") {
        relationshipMatch = assignedToId === currentUserIdStr;
      } else if (relationshipFilter === "others") {
        relationshipMatch = createdById !== currentUserIdStr && assignedToId !== currentUserIdStr;
      }
    }
    
    return statusMatch && priorityMatch && relationshipMatch;
  });

  const totalTasks = tasks.length;
  const filteredCount = filteredTasks.length;

  const statusCounts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  // Summary by relationship
  const relationshipSummary = {
    createdByMe: tasks.filter(t => {
      const createdById = getUserId(t.createdBy);
      return createdById === (currentUser?._id?.toString() || currentUser?.id?.toString());
    }).length,
    assignedToMe: tasks.filter(t => {
      const assignedToId = getUserId(t.assignedTo);
      return assignedToId === (currentUser?._id?.toString() || currentUser?.id?.toString());
    }).length,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* CONFIRM DIALOG FOR DELETE */}
      <ConfirmDialog
        isOpen={!!taskToDelete}
        message={`Are you sure you want to delete task "${taskToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* TASK DETAILS MODAL */}
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        task={selectedTaskForDetails}
      />

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Admin Task Manager
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1">
          <p className="text-sm text-gray-500">
            Total Tasks: <span className="font-semibold text-gray-700">{totalTasks}</span> | 
            Showing: <span className="font-semibold text-blue-600">{filteredCount}</span>
          </p>

          {/* STATUS COUNTS - Scrollable on mobile */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-200 text-gray-700 whitespace-nowrap">
              Todo: {statusCounts.todo}
            </span>
            <span className="px-2 sm:px-3 py-1 rounded-full bg-amber-200 text-amber-700 whitespace-nowrap">
              In Progress: {statusCounts.inProgress}
            </span>
            <span className="px-2 sm:px-3 py-1 rounded-full bg-green-300 text-green-700 whitespace-nowrap">
              Done: {statusCounts.done}
            </span>
            </div>
          </div>

          {/* RELATIONSHIP SUMMARY (for admin) */}
          {currentUser && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">
                ✨ Created by me: {relationshipSummary.createdByMe}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                📋 Assigned to me: {relationshipSummary.assignedToMe}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setSelectedTask(null);
            setOpenModal(true);
          }}
          className="flex cursor-pointer items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <FiPlus className="text-sm sm:text-base" />
          <span>Create Task</span>
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-700">Filter Tasks</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* STATUS DROPDOWN */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            {/* PRIORITY DROPDOWN */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            {/* RELATIONSHIP DROPDOWN - New for admin */}
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Tasks</option>
              <option value="created_by_me">✨ Created by me</option>
              <option value="assigned_to_me">📋 Assigned to me</option>
              <option value="others">👥 Other Tasks</option>
            </select>
          </div>
        </div>
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const relationship = getTaskRelationship(task);
            const userCanDelete = canDeleteTask(task);
            const isDeleting = deletingTaskId === task._id;
            
            return (
              <div
                key={task._id}
                onClick={(e) => handleTaskClick(task, e)}
                className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition relative cursor-pointer ${
                  task.isOverdue ? "bg-red-300 border-red-400" : ""
                }`}
              >
                {/* Loading overlay while deleting */}
                {isDeleting && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-600">Deleting...</span>
                    </div>
                  </div>
                )}

                {/* RELATIONSHIP BADGE - for admin to see their relation to task */}
                {relationship && (
                  <div className="mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1 ${getRelationshipBadgeStyle(relationship.type)}`}>
                      <span className="text-sm">{relationship.icon}</span>
                      <span className="hidden xs:inline">{relationship.text}</span>
                      <span className="xs:hidden">
                        {relationship.type === "both" ? "Created & Assigned" : 
                         relationship.type === "assigned" ? "Assigned" : "Created"}
                      </span>
                    </span>
                  </div>
                )}

                {/* GRID LAYOUT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  
                  {/* LEFT SECTION - Title and metadata - spans 7 columns on large screens */}
                  <div className="lg:col-span-7 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base wrap-break-words flex-1">
                        {task.title}
                      </h3>
                      {/* View details indicator */}
                      <div className="text-gray-400 hover:text-blue-500 transition-colors shrink-0">
                        <FiEye size={18} className="cursor-pointer" />
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
                        <FiUserPlus className="shrink-0" size={12} />
                        <span>Created by:</span>
                        <span className="font-medium truncate max-w-37.5 sm:max-w-50">
                          {task.createdBy?.name || "Unknown"}
                        </span>
                        {getUserId(task.createdBy) === (currentUser?._id?.toString() || currentUser?.id?.toString()) && 
                          <span className="text-purple-600 whitespace-nowrap text-[11px] sm:text-xs">(You)</span>
                        }
                      </p>
                      
                      {task.assignedTo && (
                        <p className="text-xs text-gray-600 flex items-center gap-1.5 flex-wrap">
                          <FiUserCheck className="shrink-0" size={12} />
                          <span>Assigned to:</span>
                          <span className="font-medium truncate max-w-37.5 sm:max-w-50">
                            {task.assignedTo?.name || "Unassigned"}
                          </span>
                          {getUserId(task.assignedTo) === (currentUser?._id?.toString() || currentUser?.id?.toString()) && 
                            <span className="text-blue-600 whitespace-nowrap text-[11px] sm:text-xs">(You)</span>
                          }
                        </p>
                      )}
                      
                      {/* Description preview */}
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 sm:line-clamp-1">
                          {task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* STATUS AND PRIORITY - spans 2 columns on large screens */}
                  <div className="lg:col-span-2 flex flex-row lg:flex-col gap-3 lg:gap-2">
                  <div className="shrink-0">
                    <span className={`inline-flex text-xs sm:text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap ${getStatusStyle(task.status)}`}>
                      {formatStatus(task.status)}
                    </span>
                  </div>

                    <div className="shrink-0">
                      <span className={`inline-flex text-xs sm:text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap ${getPriorityStyle(task.priority || "low")}`}>
                        {formatPriority(task.priority || "low")}
                      </span>
                      {task.deadline && (
                        <p className={`text-xs mt-1.5 whitespace-nowrap ${task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          📅 {new Date(task.deadline).toLocaleDateString()}
                          {task.isOverdue && " (Overdue)"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS - spans 3 columns on large screens */}
                  <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-3">
                    {/* ASSIGN DROPDOWN */}
                    <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                      <FiUser className="text-gray-400 shrink-0" size={14} />
                      <select
                        value={task.assignedTo?._id || ""}
                        onChange={(e) => handleAssign(task._id, e.target.value, e)}
                        className="border border-gray-300 px-2 py-1.5 rounded-md text-xs sm:text-sm flex-1 min-w-30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                        disabled={isDeleting}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} {getUserId(u) === (currentUser?._id?.toString() || currentUser?.id?.toString()) ? "(You)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-4 justify-start lg:justify-end items-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setOpenModal(true);
                        }}
                        className="text-blue-600 text-xs sm:text-sm hover:text-blue-800 hover:underline py-1 cursor-pointer transition-colors font-medium"
                        disabled={isDeleting}
                      >
                        Edit
                      </button>

                      {userCanDelete && (
                        <button
                          onClick={() => setTaskToDelete(task)}
                          className="text-red-600 text-xs sm:text-sm hover:text-red-800 hover:underline flex items-center gap-1 py-1 cursor-pointer transition-colors font-medium"
                          disabled={isDeleting}
                        >
                          <FiTrash2 size={14} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TASK MODAL */}
      <TaskModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        task={selectedTask}
        users={users}
        onSave={() => refreshTasks()}
        currentUser={currentUser}
      />
    </div>
  );
};

export default AdminTasks;