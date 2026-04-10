import { useEffect, useState, useCallback } from "react";
import { getTasks } from "../services/taskService";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);

  // search + filters
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getTasks(
        page,
        10,
        search,
        priorityFilter,
        statusFilter,
      );

      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, priorityFilter, statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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

    return value
      .replace("-", " ") // remove hyphen
      .replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}

      <div className="flex flex-col [@media(min-width:350px)]:flex-row [@media(min-width:350px)]:justify-between [@media(min-width:350px)]:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-2xl cursor-default font-bold text-gray-800">
          Tasks <span className="text-blue-500">({totalCount})</span>
        </h1>

        <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full [@media(min-width:350px)]:w-auto cursor-pointer">
          <FiPlus />
          Add Task
        </button>
      </div>

      {/* Search + Filters */}

      <div className="bg-white border border-gray-400 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}

          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}

          <div className="grid grid-cols-2 sm:flex sm:justify-end gap-3 w-full lg:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPage(1);
                setPriorityFilter(e.target.value);
              }}
              className="border cursor-pointer rounded-lg px-3 py-2 w-full sm:w-auto"
            >
              <option value="">Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="border cursor-pointer rounded-lg px-3 py-2 w-full sm:w-auto"
            >
              <option value="">Status</option>
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setPriorityFilter("");
                setStatusFilter("");
                setPage(1);
              }}
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
                    No tasks found {search && `for "${search}"`}
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr
                    key={task.id}
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
                      <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        <FiEdit />
                      </button>

                      <button className="text-red-600 hover:text-red-800 cursor-pointer">
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
            No tasks found {search && `for "${search}"`}
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
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
                    className={`inline-block px-2 py-1 text-sm rounded-md ${statusColor(
                      task.status,
                    )}`}
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
                  <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                    <FiEdit />
                  </button>

                  <button className="text-red-600 hover:text-red-800 cursor-pointer">
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
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg border cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Previous
        </button>

        <span className="text-sm cursor-default text-gray-600">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded-lg border cursor-pointer text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Tasks;
