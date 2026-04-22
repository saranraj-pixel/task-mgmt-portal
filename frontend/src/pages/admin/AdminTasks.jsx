import { useEffect, useState } from "react";
import { getTasks, updateTask } from "../../services/taskService";
import { getUsers } from "../../services/authService";
import TaskModal from "../../components/TaskModal";
import Skeleton from "../../components/Skeleton";
import { FiPlus, FiUser } from "react-icons/fi";
import { logError } from "../../../utils/logger";

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [filter, setFilter] = useState("all");

  /* LOAD DATA */
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
      } catch (err) {
        logError(err, { action: "ADMIN_TASKS_LOAD_FAILED" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  /* FILTER */
  const filteredTasks =
    filter === "all"
      ? tasks
      : tasks.filter((t) => t.status === filter);

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

  {/* HEADER */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
        Admin Task Manager
      </h1>
      <p className="text-sm text-gray-500">
        Create, assign and manage all tasks
      </p>
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

  {/* FILTERS */}
  <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
    {["all", "todo", "in-progress", "done"].map((f) => (
      <button
        key={f}
        onClick={() => setFilter(f)}
        className={`shrink-0 px-4 py-1.5 cursor-pointer rounded-full text-sm border transition ${
          filter === f
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-600 hover:bg-gray-200"
        }`}
      >
            {f === "in-progress"
              ? "In Progress"
              : f.charAt(0).toUpperCase() + f.slice(1)}
      </button>
    ))}
  </div>

  {/* TASK LIST */}
  <div className="space-y-4">
    {loading ? (
      [...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))
    ) : filteredTasks.length === 0 ? (
      <p className="text-gray-500 text-center py-10">No tasks found</p>
    ) : (
      filteredTasks.map((task) => (
        <div
          key={task._id}
          className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
        >
          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">

            {/* TITLE */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                {task.title}
              </h3>
              <p className="text-xs text-gray-500">
                Created by: {task.createdBy?.name || "Unknown"}
              </p>
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

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">

              {/* ASSIGN */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FiUser className="text-gray-400 shrink-0" />

                <select
                  value={task.assignedTo?._id || ""}
                  onChange={(e) =>
                    handleAssign(task._id, e.target.value)
                  }
                  className="border px-2 py-1.5 rounded-md text-sm w-full sm:w-auto"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* EDIT */}
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
      ))
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