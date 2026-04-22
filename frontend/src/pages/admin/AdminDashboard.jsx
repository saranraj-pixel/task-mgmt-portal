import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/authService";
import {
  Users,
  CheckCircle,
  ListTodo,
  Clock,
  Loader2,
} from "lucide-react";
import TaskModal from "../../components/TaskModal";
import { FiPlus } from "react-icons/fi";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

const openCreateTask = () => setIsTaskModalOpen(true);
const closeCreateTask = () => setIsTaskModalOpen(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboard();
      setData(res.data);
    } catch (err) {
      setError("Failed to load dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" />
        Loading dashboard...
      </div>
    );
  }

  /* ================= ERROR ================= */
  if (error) {
    return (
      <div className="p-6 text-red-500 font-medium">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const completed =
    data.tasksByStatus?.find((s) => s._id === "done")?.count || 0;

  const inProgress =
    data.tasksByStatus?.find((s) => s._id === "in-progress")?.count || 0;

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
  <div>
    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
      Admin Dashboard
    </h1>
    <p className="text-gray-500 text-sm">
      Overview of users, tasks, and system activity
    </p>
  </div>

  <button
    onClick={openCreateTask}
    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
  >
    <FiPlus />
    Create Task
  </button>
</div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={<Users />}
          color="from-blue-500 to-blue-600"
        />

        <StatCard
          title="Total Tasks"
          value={data.totalTasks}
          icon={<ListTodo />}
          color="from-purple-500 to-purple-600"
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={<CheckCircle />}
          color="from-green-500 to-green-600"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<Clock />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Panel title="Tasks by Status">
          {data.tasksByStatus?.map((item) => (
            <ProgressRow
              key={item._id}
              label={item._id}
              value={item.count}
            />
          ))}
        </Panel>

        <Panel title="Tasks by Priority">
          {data.tasksByPriority?.map((item) => (
            <ProgressRow
              key={item._id}
              label={item._id}
              value={item.count}
            />
          ))}
        </Panel>

      </div>

      {/* ================= USERS TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Users Overview</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th>Email</th>
                <th>Total</th>
                <th>Completed</th>
              </tr>
            </thead>

            <tbody>
              {data.usersWithTasks?.map((user) => (
                <tr
                  key={user._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="text-gray-600">{user.email}</td>
                  <td>{user.totalTasks}</td>
                  <td>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                      {user.completedTasks}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= RECENT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <Panel title="Recent Users">
          {data.recentUsers?.map((u) => (
            <div key={u._id} className="py-2 border-b">
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-gray-500">{u.email}</p>
            </div>
          ))}
        </Panel>

        <Panel title="Recent Tasks">
          {data.recentTasks?.map((t) => (
            <div key={t._id} className="py-2 border-b">
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-gray-500">
                Assigned: {t.assignedTo?.name || "Unassigned"}
              </p>
            </div>
          ))}
        </Panel>

      </div>
      <TaskModal
  isOpen={isTaskModalOpen}
  onClose={closeCreateTask}
  task={null}
  onSave={fetchDashboard} // refresh dashboard after task creation
/>
    </div>
  );
};

export default AdminDashboard;

/* ================= UI COMPONENTS ================= */

const StatCard = ({ title, value, icon, color }) => (
  <div className={`p-5 rounded-2xl shadow-md bg-linear-to-r ${color} text-white hover:scale-[1.02] transition`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
      <div className="opacity-80">{icon}</div>
    </div>
  </div>
);

const Panel = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-md p-4">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

const ProgressRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b text-sm">
    <span className="capitalize text-gray-700">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);