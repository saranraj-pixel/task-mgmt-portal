import { useEffect, useState } from "react";
import { getTaskStats } from "../services/taskService";
import {
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiList,
  FiAlertCircle,
} from "react-icons/fi";
import Skeleton from "../components/Skeleton";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTaskStats();

      setStats(data.stats);
    } catch (err) {
      setError("Failed to load task statistics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats?.totalTasks || 0,
      icon: <FiLayers />,
    },
    {
      title: "Completed",
      value: stats?.completedTasks || 0,
      icon: <FiCheckCircle />,
    },
    {
      title: "In Progress",
      value: stats?.inProgressTasks || 0,
      icon: <FiClock />,
    },
    {
      title: "Todo",
      value: stats?.todoTasks || 0,
      icon: <FiList />,
    },
    {
      title: "Overdue",
      value: stats?.overdueTasks || 0,
      icon: <FiAlertCircle />,
    },
  ];

  const completion = stats?.completionPercentage || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6 flex justify-between">
          <span>{error}</span>

          <button
            onClick={fetchStats}
            className="bg-red-500 text-white cursor-pointer px-3 py-1 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <>
          {/* Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white border rounded-lg p-4 flex justify-between items-center"
              >
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>

                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>

          {/* Progress Bar Skeleton */}
          <div className="bg-white border rounded-lg p-5">
            <div className="flex justify-between mb-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-10" />
            </div>

            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && stats?.totalTasks === 0 && (
        <div className="text-center py-16 bg-white">
          <h2 className="text-lg font-semibold mb-2">No tasks yet</h2>

          <p className="text-gray-500 mb-4">
            Start by creating your first task
          </p>

          <button className="bg-blue-600 text-white font-bold cursor-pointer px-4 py-2 rounded">
            Create your first task
          </button>
        </div>
      )}

      {/* STATS */}
      {!loading && stats?.totalTasks > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {statCards.map((card, i) => (
              <div
                key={i}
                className="bg-white border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>

                <div className="text-blue-600 text-xl">{card.icon}</div>
              </div>
            ))}
          </div>

          {/* PROGRESS BAR */}

          <div className="bg-white border rounded-lg p-5">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Task Completion</span>

              <span className="text-sm font-medium">
                {completion.toFixed(0)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              ></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
