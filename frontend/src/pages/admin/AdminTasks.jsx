import { useEffect, useState } from "react";
import { getTasks, updateTask } from "../../services/taskService";
import { getUsers } from "../../services/authService";
import TaskModal from "../../components/TaskModal";
import Skeleton from "../../components/Skeleton";
import { FiPlus, FiUser, FiUserCheck, FiUserPlus } from "react-icons/fi";
import { logError } from "../../../utils/logger";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [relationshipFilter, setRelationshipFilter] = useState("all"); // New filter

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

  // Helper function to safely get user ID
  const getUserId = (user) => {
    if (!user) return null;
    return user._id?.toString() || user.toString();
  };

  /* ASSIGN USER */
  const handleAssign = async (taskId, userId) => {
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
    } catch (err) {
      logError(err, { action: "ASSIGN_USER_FAILED" });
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Admin Task Manager
          </h1>
          
          <p className="text-sm text-gray-500 mt-1">
            Total Tasks: <span className="font-semibold text-gray-700">{totalTasks}</span> | 
            Showing: <span className="font-semibold text-blue-600">{filteredCount}</span>
          </p>

          {/* STATUS COUNTS */}
          <div className="flex flex-wrap gap-3 mt-2 text-xs sm:text-sm">
            <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700">
              Todo: {statusCounts.todo}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-700">
              In Progress: {statusCounts.inProgress}
            </span>
            <span className="px-3 py-1 rounded-full bg-green-300 text-green-700">
              Done: {statusCounts.done}
            </span>
          </div>

          {/* RELATIONSHIP SUMMARY (for admin) */}
          {currentUser && (
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                ✨ Created by me: {relationshipSummary.createdByMe}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
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
          className="flex cursor-pointer items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        >
          <FiPlus />
          Create Task
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-700">Filter Tasks</h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* STATUS DROPDOWN */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
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
              className="border px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1"
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
              className="border px-3 py-2 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1"
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
          <p className="text-gray-500 text-center py-10">No tasks found</p>
        ) : (
          filteredTasks.map((task) => {
            const relationship = getTaskRelationship(task);
            
            return (
              <div
                key={task._id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                {/* RELATIONSHIP BADGE - for admin to see their relation to task */}
                {relationship && (
                  <div className="mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1 ${getRelationshipBadgeStyle(relationship.type)}`}>
                      <span>{relationship.icon}</span>
                      {relationship.text}
                    </span>
                  </div>
                )}

                {/* GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  {/* TITLE & CREATED BY */}
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                      {task.title}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <FiUserPlus size={12} />
                        Created by: 
                        <span className="font-medium">
                          {task.createdBy?.name || "Unknown"}
                          {getUserId(task.createdBy) === (currentUser?._id?.toString() || currentUser?.id?.toString()) && 
                            <span className="text-purple-600 ml-1">(You)</span>
                          }
                        </span>
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <FiUserCheck size={12} />
                          Assigned to: 
                          <span className="font-medium">
                            {task.assignedTo?.name || "Unassigned"}
                            {getUserId(task.assignedTo) === (currentUser?._id?.toString() || currentUser?.id?.toString()) && 
                              <span className="text-blue-600 ml-1">(You)</span>
                            }
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* STATUS */}
                  <div>
                    <span
                      className={`inline-block text-xs sm:text-sm px-3 py-1 rounded-full font-medium ${getStatusStyle(
                        task.status,
                      )}`}
                    >
                      {formatStatus(task.status)}
                    </span>
                  </div>

                  {/* PRIORITY */}
                  <div>
                    <span
                      className={`inline-block text-xs sm:text-sm px-3 py-1 rounded-full font-medium ${getPriorityStyle(
                        task.priority,
                      )}`}
                    >
                      {formatPriority(task.priority || "low")}
                    </span>
                    {task.deadline && (
                      <p className="text-xs text-gray-500 mt-1">
                        📅 {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
                    {/* ASSIGN DROPDOWN */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <FiUser className="text-gray-400 shrink-0" />
                      <select
                        value={task.assignedTo?._id || ""}
                        onChange={(e) => handleAssign(task._id, e.target.value)}
                        className="border px-2 py-1.5 rounded-md text-sm w-full sm:w-auto focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} {getUserId(u) === (currentUser?._id?.toString() || currentUser?.id?.toString()) ? "(You)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setOpenModal(true);
                      }}
                      className="text-blue-600 text-sm hover:underline text-left sm:text-right"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        task={selectedTask}
        users={users}
        onSave={() => window.location.reload()}
      />
    </div>
  );
};

export default AdminTasks;