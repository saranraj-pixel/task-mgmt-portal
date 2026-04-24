import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getTasks, deleteTask } from "../services/taskService";
import { getUsers } from "../services/authService";
import { FiEdit, FiTrash2, FiPlus, FiFilter, FiX } from "react-icons/fi";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { toast } from "react-toastify";
import { logError } from "../../utils/logger";
import CustomDatePicker from "../components/CustomDatePicker";
import Skeleton from "../components/Skeleton";
import { Helmet } from "react-helmet-async";

const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
 
  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  const [users, setUsers] = useState([]);

  // State for Task Details Modal
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  // Relationship filter state
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  
  // Overdue filter state
  const [overdueFilter, setOverdueFilter] = useState("all");

  // Mobile filter drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    // Get current user from localStorage or auth context
    const getUser = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          setCurrentUser(JSON.parse(userStr));
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    getUser();
  }, []);

  // Read values from URL
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "";
  const status = searchParams.get("status") || "";
  const deadlineFrom = searchParams.get("deadlineFrom") || "";
  const deadlineTo = searchParams.get("deadlineTo") || "";
  const urlRelationship = searchParams.get("relationship") || "all";
  const urlOverdue = searchParams.get("overdue") || "all";

  // Sync relationship filter with URL
  useEffect(() => {
    setRelationshipFilter(urlRelationship);
  }, [urlRelationship]);

  // Sync overdue filter with URL
  useEffect(() => {
    setOverdueFilter(urlOverdue);
  }, [urlOverdue]);

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res?.users || []);
      } catch (err) {
        logError(err, { action: "FETCH_USERS_FAILED" });
      }
    };

    fetchUsers();
  }, []);

  // Update URL params
  const updateParams = useCallback(
    (updates) => {
      const params = Object.fromEntries([...searchParams]);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") {
          delete params[key];
        } else {
          params[key] = value;
        }
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, search, updateParams]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const apiParams = {
        page,
        limit: 10,
        search,
        priority,
        status,
        deadlineFrom,
        deadlineTo,
      };
      
      // overdue filter to API call if not "all"
      if (overdueFilter !== "all") {
        apiParams.overdue = overdueFilter;
      }
      
      const data = await getTasks(apiParams);

      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      logError(error, {
        action: "FETCH_TASKS_LIST_FAILED",
        page,
        search,
        priority,
        status,
        hasDeadlineFilter: !!(deadlineFrom || deadlineTo),
        overdue: overdueFilter,
      });
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, search, priority, status, deadlineFrom, deadlineTo, overdueFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Client-side filtering based on relationship
  const getFilteredByRelationship = useCallback((tasksList) => {
    if (relationshipFilter === "all") return tasksList;
    
    return tasksList.filter(task => {
      if (relationshipFilter === "createdByMe") {
        return task.relationship?.isCreatedByMe;
      }
      if (relationshipFilter === "assignedToMe") {
        return task.relationship?.isAssignedToMe;
      }
      return true;
    });
  }, [relationshipFilter]);

  const getFilteredTasks = useCallback(() => {
    let filtered = tasks;
    
    // Apply relationship filter
    filtered = getFilteredByRelationship(filtered);
    
    return filtered;
  }, [tasks, getFilteredByRelationship]);

  const displayedTasks = getFilteredTasks();
  const displayCount = displayedTasks.length;

  // Check if relationship filter is active (client-side)
  const hasClientSideFilters = relationshipFilter !== "all";
  
  // Check if any filter is active
  const hasAnyFilter = priority || status || deadlineFrom || deadlineTo || search || relationshipFilter !== "all" || overdueFilter !== "all";

  // Get the appropriate count to display based on active filters
  const getDisplayCountText = () => {
    if (hasClientSideFilters) {
      // When relationship filter is active, show filtered count from client-side
      return `${displayCount} of ${totalCount}`;
    } else if (overdueFilter !== "all") {
      // When only overdue filter is active, show total count from API (server-side filtered)
      return `${totalCount}`;
    } else {
      // No filters active
      return `${totalCount}`;
    }
  };

  // Get the subtitle text
  const getSubtitleText = () => {
    if (hasClientSideFilters && relationshipFilter !== "all") {
      const relationshipText = relationshipFilter === "createdByMe" ? "Created by me" : "Assigned to me";
      if (overdueFilter !== "all") {
        const overdueText = overdueFilter === "overdue" ? "overdue" : "not overdue";
        return `${relationshipText} • ${overdueText} tasks`;
      }
      return `${relationshipText} tasks`;
    } else if (overdueFilter !== "all") {
      const overdueText = overdueFilter === "overdue" ? "Overdue" : "Not overdue";
      return `${overdueText} tasks`;
    }
    return "Total tasks";
  };

  // Delete
  const handleDeleteClick = (id, event) => {
    event.stopPropagation(); 
    setDeleteId(id);
    setConfirmOpen(true);
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    try {
      await deleteTask(deleteId);
      setTasks((prev) => prev.filter((t) => t._id !== deleteId));
      toast.success("Task deleted successfully");
      setConfirmOpen(false);
    } catch (error) {
    console.error("Delete error:", error);
    
    // Handle validation errors from API
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      // Process field-specific errors
      const validationErrors = error.response.data.errors;
      
      // Show each error message
      validationErrors.forEach((err) => {
        if (err.type === "field" && err.path) {
          toast.error(`${err.path}: ${err.msg}`);
        } else {
          toast.error(err.msg || "Validation error occurred");
        }
      });
      
      // Also show the main message if needed
      if (error.response.data.message) {
        toast.error(error.response.data.message);
      }
    } 
    // Handle other types of errors
    else if (error.response?.data?.message) {
      // Show the actual API error message
      toast.error(error.response.data.message);
    } 
    else if (error.message) {
      toast.error(error.message);
    }
    else {
      toast.error("Failed to delete task");
    }
    
    setConfirmOpen(false);
    }
  };

  // Modal
  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task, event) => {
    event.stopPropagation(); 
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle row click to show details
  const handleRowClick = (task) => {
    setSelectedTaskForDetails(task);
    setIsDetailsModalOpen(true);
  };

  // Close details modal
  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTaskForDetails(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
    setIsFilterDrawerOpen(false);
  };

  const priorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "bg-green-200 text-green-700";
      case "medium":
        return "bg-yellow-200 text-yellow-700";
      case "high":
        return "bg-red-200 text-red-700";
      default:
        return "";
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-300 text-gray-700";
      case "in-progress":
        return "bg-blue-200 text-blue-700";
      case "done":
        return "bg-green-200 text-green-700";
      default:
        return "";
    }
  };

  const formatDate = (date) => {
    if (!date) return "No date";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatLabel = (value) => {
    if (!value) return "";
    return value.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getTaskBadges = (task) => {
    const badges = [];

    if (task.relationship?.isCreatedByMe) {
      badges.push({
        text: "Created by me",
        color: "bg-purple-100 text-purple-800",
      });
    }

    if (task.relationship?.isAssignedToMe) {
      badges.push({
        text: "Assigned to me",
        color: "bg-indigo-100 text-indigo-800",
      });
    }

    if (task.isOverdue) {
      badges.push({
        text: "Overdue",
        color: "bg-red-100 text-red-800",
      });
    }

    return badges;
  };

  // Filter components for reuse
  const FilterControls = ({ isMobile = false }) => (
    <div className={isMobile ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 w-full lg:w-auto"}>
      <select
        value={priority}
        onChange={(e) => updateParams({ priority: e.target.value, page: 1 })}
        className="border cursor-pointer rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>

      <select
        value={status}
        onChange={(e) => updateParams({ status: e.target.value, page: 1 })}
        className="border cursor-pointer rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">All Statuses</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={relationshipFilter}
        onChange={(e) => updateParams({ relationship: e.target.value, page: 1 })}
        className="border cursor-pointer rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="all">All Tasks</option>
        <option value="createdByMe">Created by Me</option>
        <option value="assignedToMe">Assigned to Me</option>
      </select>

      <select
        value={overdueFilter}
        onChange={(e) => updateParams({ overdue: e.target.value, page: 1 })}
        className="border cursor-pointer rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="all">All Deadlines</option>
        <option value="overdue">Overdue Only</option>
        <option value="notOverdue">Not Overdue</option>
      </select>

      <div className="w-full">
        <CustomDatePicker
          value={deadlineFrom}
          onChange={(val) => updateParams({ deadlineFrom: val, page: 1 })}
          placeholder="From date"
        />
      </div>

      <div className="w-full">
        <CustomDatePicker
          value={deadlineTo}
          onChange={(val) => updateParams({ deadlineTo: val, page: 1 })}
          placeholder="To date"
        />
      </div>

      {isMobile && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={clearFilters}
            className="flex-1 cursor-pointer px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Clear All
          </button>
          <button
            onClick={() => setIsFilterDrawerOpen(false)}
            className="flex-1 cursor-pointer px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Helmet>
        <title> Tasks | Task Manager</title>
        <meta
          name="description"
          content="Overview of your tasks and priority, status, deadline everything you can see as a list"
        />
      </Helmet>
        
    <div className="p-4 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        {initialLoading ? (
          <>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </>
        ) : (
          <>
            <div>
              <h1 className="text-xl md:text-2xl cursor-default font-bold text-gray-800">
                Tasks
              </h1>
              <p className="text-base text-gray-500 mt-1">
                {getSubtitleText()}: <span className="font-semibold text-blue-600">{getDisplayCountText()}</span>
              </p>
            </div>

              <div className="flex gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  <FiFilter size={20} />
                  <span>Filters</span>
                  {hasAnyFilter && (
                    <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </button>

            <button
              onClick={openCreateModal}
              className="flex items-center font-bold justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto cursor-pointer"
            >
              <FiPlus size={20} />
              Add Task
            </button>
              </div>
          </>
        )}
      </div>

      {/* DESKTOP FILTER BAR */}
      <div className="hidden lg:block bg-white border border-gray-400 rounded-xl p-4 mb-6 shadow-sm">
        {initialLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* SEARCH */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* FILTERS */}
              <FilterControls isMobile={false} />
              
              {/* Clear All Button for Desktop */}
              {hasAnyFilter && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-sm cursor-pointer text-red-600 hover:text-red-700 font-medium hover:underline flex items-center gap-1"
                  >
                    <FiX size={16} />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE FILTER DRAWER */}
        {isFilterDrawerOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 lg:hidden animate-slide-up">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Filters</h3>
                  <button
                    onClick={() => setIsFilterDrawerOpen(false)}
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-lg"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>
              <div className="p-4 max-h-[80vh] overflow-y-auto">
                {/* Search in mobile drawer */}
                <div className="relative mb-4">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
                
                <FilterControls isMobile={true} />
              </div>
            </div>
          </>
        )}

        {/* Active Filters Display */}
        {hasAnyFilter && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {relationshipFilter !== "all" && (
              <span className="inline-flex cursor-default items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                {relationshipFilter === "createdByMe" ? "Created by me" : "Assigned to me"}
                <button
                  onClick={() => updateParams({ relationship: "all", page: 1 })}
                  className="ml-1 cursor-pointer hover:text-purple-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {overdueFilter !== "all" && (
              <span className="inline-flex cursor-default items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800">
                {overdueFilter === "overdue" ? "Overdue" : "Not overdue"}
                <button
                  onClick={() => updateParams({ overdue: "all", page: 1 })}
                  className="ml-1 cursor-pointer hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {priority && (
              <span className="inline-flex cursor-default items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                Priority: {priority}
                <button
                  onClick={() => updateParams({ priority: "", page: 1 })}
                  className="ml-1 cursor-pointer hover:text-blue-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {status && (
              <span className="inline-flex cursor-default items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                Status: {formatLabel(status)}
                <button
                  onClick={() => updateParams({ status: "", page: 1 })}
                  className="ml-1 cursor-pointer hover:text-green-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {(deadlineFrom || deadlineTo) && (
              <span className="inline-flex cursor-default items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                Deadline: {deadlineFrom && `from ${formatDate(deadlineFrom)}`} {deadlineTo && `to ${formatDate(deadlineTo)}`}
                <button
                  onClick={() => updateParams({ deadlineFrom: "", deadlineTo: "", page: 1 })}
                  className="ml-1 cursor-pointer hover:text-gray-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex cursor-default items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                Search: {search.length > 20 ? search.substring(0, 20) + "..." : search}
                <button
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: "", page: 1 });
                  }}
                  className="ml-1 cursor-pointer hover:text-gray-600 font-bold"
                >
                  ×
                </button>
              </span>
            )}
              <button
                onClick={clearFilters}
                className="text-xs cursor-pointer text-red-600 hover:text-red-700 font-medium ml-2"
              >
                Clear all
              </button>
          </div>
        )}

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm cursor-default font-semibold">Title</th>
                <th className="p-4 text-sm cursor-default font-semibold">Priority</th>
                <th className="p-4 text-sm cursor-default font-semibold">Status</th>
                <th className="p-4 text-sm cursor-default font-semibold">Deadline</th>
                  <th className="p-4 text-sm cursor-default font-semibold">Relationship</th>
                <th className="p-4 text-sm cursor-default font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="p-4"><Skeleton className="h-5 w-3/4" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-20 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-24 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-28" /></td>
                    <td className="p-4"><div className="flex gap-3"><Skeleton className="h-6 w-6" /><Skeleton className="h-6 w-6" /></div></td>
                  </tr>
                ))
              ) : displayedTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 text-sm">
                    No tasks found
                  </td>
                </tr>
              ) : (
                  displayedTasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => handleRowClick(task)}
                    className={`border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition ${
                      task.isOverdue && task.status !== "done" ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="p-4 font-medium">{task.title}</td>
                    <td className="p-4">
                      <span className={`inline-flex font-medium items-center whitespace-nowrap px-3 py-1 text-md rounded-full ${priorityColor(task.priority)}`}>
                        {formatLabel(task.priority)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-md text-nowrap font-medium rounded-full ${statusColor(task.status)}`}>
                        {formatLabel(task.status)}
                      </span>
                    </td>
                    <td className="p-4 text-md font-medium">
                        <span className={task.isOverdue && task.status !== "done" ? "text-red-600 font-bold" : "text-gray-600"}>
                      {formatDate(task.deadline)}
                          {task.isOverdue && task.status !== "done" && " ⚠️"}
                        </span>
                    </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {getTaskBadges(task).map((badge, idx) => (
                            <span key={idx} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                    </td>
                    <td className="p-4 flex gap-3 text-xl">
                      <button onClick={(e) => openEditModal(task, e)} className="text-blue-600 hover:text-blue-800 cursor-pointer transition">
                        <FiEdit />
                      </button>
                      <button onClick={(e) => handleDeleteClick(task._id, e)} className="text-red-600 hover:text-red-800 cursor-pointer transition">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4 bg-white">
              <Skeleton className="h-6 w-3/4 mb-3" />
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="h-8 w-20" /></div>
                <div><Skeleton className="h-4 w-16 mb-1" /><Skeleton className="h-8 w-20" /></div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <Skeleton className="h-5 w-32" />
                <div className="flex gap-4"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div>
              </div>
            </div>
          ))
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No tasks found</div>
        ) : (
            displayedTasks.map((task) => (
            <div
              key={task._id}
                onClick={() => handleRowClick(task)}
              className={`border cursor-pointer rounded-xl p-4 transition ${
                task.isOverdue && task.status !== "done" ? "bg-red-50 border-red-200" : "bg-white"
              }`}
            >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-800 flex-1">{task.title}</h3>
                  {task.isOverdue && task.status !== "done" && (
                    <span className="text-red-600 text-xs font-bold ml-2">⚠️ OVERDUE</span>
                  )}
                </div>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-500 font-semibold text-sm mb-1">Priority</p>
                  <span className={`inline-block font-medium px-2 py-1 text-sm rounded-md ${priorityColor(task.priority)}`}>
                    {formatLabel(task.priority)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold text-sm mb-1">Status</p>
                  <span className={`inline-block font-medium px-2 py-1 text-sm rounded-md ${statusColor(task.status)}`}>
                    {formatLabel(task.status)}
                  </span>
                </div>
              </div>

                {/* Badges for mobile */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {getTaskBadges(task).map((badge, idx) => (
                    <span key={idx} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.text}
                    </span>
                  ))}
                </div>
              
              {/* Deadline and Actions */}
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-gray-600 flex gap-2">
                  <span className="font-semibold text-gray-500">Deadline:</span>
                  <span className={`font-medium ${task.isOverdue && task.status !== "done" ? "text-red-600 font-bold" : ""}`}>
                    {formatDate(task.deadline)}
                  </span>
                </p>
                {/* Actions */}
                <div className="flex gap-4 text-xl">
                  <button onClick={(e) => openEditModal(task, e)} className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    <FiEdit size={24} />
                  </button>
                  <button onClick={(e) => handleDeleteClick(task._id, e)} className="text-red-600 hover:text-red-800 cursor-pointer">
                    <FiTrash2 size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {!loading && displayedTasks.length > 0 && totalPages > 1 && (
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
          disabled={page === 1}
          className="px-4 py-2 font-bold rounded-lg border cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Previous
        </button>
        <span className="text-sm font-medium cursor-default text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
          disabled={page === totalPages}
          className="px-4 py-2 font-bold rounded-lg border cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Next
        </button>
          </div>
        )}

      {/* Modals */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSave={fetchTasks}
        users={users}
        currentUser={currentUser}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        message="Are you sure you want to delete this task?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        task={selectedTaskForDetails}
        users={users}
      />
    </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
  </>
  );
};

export default Tasks;
