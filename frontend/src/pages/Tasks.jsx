import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getTasks, deleteTask } from "../services/taskService";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import TaskModal from "../components/TaskModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { toast } from "react-toastify";

const Tasks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  // Read values from URL
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") || "";
  const priority = searchParams.get("priority") || "";
  const status = searchParams.get("status") || "";
  const deadlineFrom = searchParams.get("deadlineFrom") || "";
  const deadlineTo = searchParams.get("deadlineTo") || "";

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Update URL params
  const updateParams = useCallback(
    (updates) => {
      const params = Object.fromEntries([...searchParams]);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
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
      updateParams({ search: searchInput, page: 1 });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, updateParams]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getTasks({
        page,
        limit: 10,
        search,
        priority,
        status,
        deadlineFrom,
        deadlineTo,
      });

      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, priority, status, deadlineFrom, deadlineTo]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Delete
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(deleteId);

      setTasks((prev) => prev.filter((t) => t._id !== deleteId));

      toast.success("Task deleted successfully");

      setConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete task", error);
    }
  };

  // Modal
  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
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
    return new Date(date).toLocaleDateString("en-GB");
  };

  const formatLabel = (value) => {
    if (!value) return "";
    return value.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="p-4 md:p-6">
      {/* HEADER */}

      <div className="flex flex-col [@media(min-width:350px)]:flex-row [@media(min-width:350px)]:justify-between [@media(min-width:350px)]:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl cursor-default font-bold text-gray-800">
          Tasks <span className="text-blue-500">({totalCount})</span>
        </h1>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full [@media(min-width:350px)]:w-auto cursor-pointer"
        >
          <FiPlus />
          Add Task
        </button>
      </div>

      {/* FILTER BAR */}

      <div className="bg-white border border-4gray-400 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* SEARCH */}

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 "
            />
          </div>

          {/* FILTERS */}

          <div className="grid grid-cols-2 sm:flex sm:justify-end gap-3 w-full lg:w-auto">
            <select
              value={priority}
              onChange={(e) =>
                updateParams({ priority: e.target.value, page: 1 })
              }
              className="border cursor-pointer rounded-lg px-3 py-2 w-full sm:w-auto"
            >
              <option value="">Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={status}
              onChange={(e) =>
                updateParams({ status: e.target.value, page: 1 })
              }
              className="border cursor-pointer rounded-lg px-3 py-2 w-full sm:w-auto"
            >
              <option value="">Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <input
              type="date"
              value={deadlineFrom}
              onChange={(e) =>
                updateParams({ deadlineFrom: e.target.value, page: 1 })
              }
              className="border rounded-lg px-3 py-2 w-full sm:w-auto"
            />

            <input
              type="date"
              value={deadlineTo}
              onChange={(e) =>
                updateParams({ deadlineTo: e.target.value, page: 1 })
              }
              className="border rounded-lg px-3 py-2 w-full sm:w-auto"
            />

            <button
              onClick={clearFilters}
              className="col-span-2 sm:col-span-1 text-sm text-red-600 hover:underline cursor-pointer text-right sm:text-left"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}

      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm cursor-default font-semibold">
                  Title
                </th>
                <th className="p-4 text-sm cursor-default font-semibold w-35">
                  Priority
                </th>
                <th className="p-4 text-sm cursor-default font-semibold w-40">
                  Status
                </th>
                <th className="p-4 text-sm cursor-default font-semibold">
                  Deadline
                </th>
                <th className="p-4 text-sm cursor-default font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-500 text-sm"
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task._id}
                    className={`border-b last:border-b-0 cursor-default hover:bg-gray-50 ${
                      task.isOverdue ? "bg-red-100" : ""
                    }`}
                  >
                    <td className="p-4 font-medium">{task.title}</td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center whitespace-nowrap px-3 py-1 text-md rounded-full ${priorityColor(
                          task.priority,
                        )}`}
                      >
                        {formatLabel(task.priority)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-md rounded-full ${statusColor(
                          task.status,
                        )}`}
                      >
                        {formatLabel(task.status)}
                      </span>
                    </td>

                    <td className="p-4 text-md text-gray-600">
                      {formatDate(task.deadline)}
                    </td>

                    <td className="p-4 flex gap-3 text-xl">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        <FiEdit />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(task._id)}
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                      >
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
        {!loading && tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No tasks found
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className={`border cursor-default rounded-xl p-4 ${
                task.isOverdue ? "bg-red-50" : "bg-white"
              }`}
            >
              <h3 className="font-semibold text-gray-800 mb-3">{task.title}</h3>

              {/* Priority + Status */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Priority</p>
                  <span
                    className={`inline-block px-2 py-1 text-sm rounded-md ${priorityColor(
                      task.priority,
                    )}`}
                  >
                    {formatLabel(task.priority)}
                  </span>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-sm rounded-md ${statusColor(task.status)}`}
                  >
                    {formatLabel(task.status)}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center justify-between mt-3">
                <p className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-500">Deadline:</span>
                  {formatDate(task.deadline)}
                </p>

                {/* Actions */}
                <div className="flex gap-4 text-xl">
                  <button
                    onClick={() => openEditModal(task)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    <FiEdit />
                  </button>

                  <button
                    onClick={() => handleDeleteClick(task._id)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => updateParams({ page: Math.max(page - 1, 1) })}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Previous
        </button>

        <span className="text-sm cursor-default text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => updateParams({ page: Math.min(page + 1, totalPages) })}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg border cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSave={fetchTasks}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        message="Are you sure you want to delete this task?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default Tasks;
