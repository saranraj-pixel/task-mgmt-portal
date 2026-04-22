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

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
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
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlus />
          Create Task
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-5">
        {["all", "todo", "in-progress", "done"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TASK LIST */}
      <div className="space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : filteredTasks.length === 0 ? (
          <p className="text-gray-500">No tasks found</p>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              {/* LEFT */}
              <div>
                <h3 className="font-semibold text-gray-800">
                  {task.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Created by: {task.createdBy?.name || "Unknown"}
                </p>
              </div>

              {/* STATUS */}
              <span className="text-sm px-3 py-1 rounded-full bg-gray-100 w-fit">
                {task.status}
              </span>

              {/* ASSIGN USER */}
              <div className="flex items-center gap-2">
                <FiUser className="text-gray-400" />

                <select
                  value={task.assignedTo?._id || ""}
                  onChange={(e) =>
                    handleAssign(task._id, e.target.value)
                  }
                  className="border px-2 py-1 rounded-md text-sm"
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
                className="text-blue-600 text-sm hover:underline"
              >
                Edit
              </button>
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