import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { getTaskStats } from "../services/taskService";
import {
  FiLayers,
  FiCheckCircle,
  FiClock,
  FiList,
  FiAlertCircle,
} from "react-icons/fi";
import Skeleton from "../components/Skeleton";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  Todo: "#64748b", // slate
  "In Progress": "#f59e0b", // amber
  Done: "#22c55e", // green
};

const PRIORITY_COLORS = {
  Low: "#22c55e", // green
  Medium: "#f59e0b", // amber
  High: "#ef4444", // red
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartFontSize, setChartFontSize] = useState(() => {
    const w = window.innerWidth;
    if (w < 640) return 10;
    if (w < 768) return 12;
    if (w < 1024) return 14;
    if (w < 1280) return 16;
    return 18;
  });

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

    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setChartFontSize(10);
      else if (w < 768) setChartFontSize(12);
      else if (w < 1024) setChartFontSize(14);
      else if (w < 1280) setChartFontSize(16);
      else setChartFontSize(18);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const statCards = [
    { title: "Total Tasks", value: stats?.totalTasks || 0, icon: <FiLayers /> },
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
    { title: "Todo", value: stats?.todoTasks || 0, icon: <FiList /> },
    {
      title: "Overdue",
      value: stats?.overdueTasks || 0,
      icon: <FiAlertCircle />,
    },
  ];

  const completion = stats?.completionPercentage || 0;

  /* ---------------- Chart Data ---------------- */

  const statusData = [
    { name: "Todo", value: stats?.todoTasks || 0 },
    { name: "In Progress", value: stats?.inProgressTasks || 0 },
    { name: "Done", value: stats?.completedTasks || 0 },
  ];

  const priorityData = [
    { name: "Low", value: stats?.tasksByPriority?.low || 0 },
    { name: "Medium", value: stats?.tasksByPriority?.medium || 0 },
    { name: "High", value: stats?.tasksByPriority?.high || 0 },
  ];

  const totalStatus = statusData.reduce((a, b) => a + b.value, 0);

  /* ---------------- Custom Tooltip ---------------- */

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percent = ((value / totalStatus) * 100).toFixed(0);

      return (
        <div className="bg-white border shadow-sm px-3 py-2 rounded text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{value} tasks</p>
          <p className="text-gray-500">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title> Dashboard | Task Manager</title>
        <meta
          name="description"
          content="Overview of your tasks and productivity stats"
        />
      </Helmet>

      <div className="p-6">
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="order-2 sm:order-1 space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>

                  <Skeleton className="order-1 sm:order-2 h-10 w-10 rounded-lg" />
                </div>
              ))}
            </div>

            {/* Progress Bar Skeleton */}
            <div className="bg-white border rounded-lg p-5 mb-8 shadow-sm">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="flex items-center justify-center h-75">
                  <div className="h-48 w-48 rounded-full bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-white shadow-inner" />
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <Skeleton className="h-6 w-40 mb-6" />
                <div className="flex items-end justify-around h-75 pt-10 px-4">
                  <Skeleton className="h-32 w-12 md:w-16" />
                  <Skeleton className="h-48 w-12 md:w-16" />
                  <Skeleton className="h-24 w-12 md:w-16" />
                </div>
              </div>
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

            <Link to="/tasks">
              <button className="bg-blue-600 text-white font-bold cursor-pointer px-4 py-2 rounded">
                Create your first task
              </button>
            </Link>
          </div>
        )}

        {/* DASHBOARD */}
        {!loading && stats?.totalTasks > 0 && (
          <>
            {/* STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {statCards.map((card, i) => (
                <div
                  key={i}
                  className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="order-2 sm:order-1">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 leading-tight">
                      {card.value}
                    </p>
                  </div>

                  <div className="order-1 sm:order-2 self-start sm:self-auto w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xl shrink-0">
                    {card.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* PROGRESS BAR */}

            <div className="bg-white border rounded-lg p-5 mb-8">
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
                />
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* STATUS PIE */}
              <div className="bg-white border rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart tabIndex={-1} style={{ outline: "none" }}>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      stroke="none"
                      strokeWidth={0}
                      activeShape={false}
                      style={{ outline: "none" }}
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={STATUS_COLORS[entry.name]}
                          stroke="none"
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* PRIORITY BAR */}
              <div className="bg-white border rounded-lg p-5">
                <h3 className="text-lg font-semibold mb-4">
                  Tasks by Priority
                </h3>

                <ResponsiveContainer
                  width="100%"
                  height={300}
                  style={{ outline: "none", border: "none" }}
                >
                  <BarChart
                    data={priorityData}
                    tabIndex={-1}
                    style={{ outline: "none" }}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" pointerEvents="none" />
                    <XAxis
                      dataKey="name"
                      interval={0}
                      tick={{ fontSize: chartFontSize, fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      pointerEvents="none"
                    />
                    <YAxis
                      allowDecimals={false}
                      pointerEvents="none"
                      tick={{ fontSize: chartFontSize }}
                    />
                    <Tooltip cursor={false} />

                    <Bar
                      dataKey="value"
                      stroke="none"
                      strokeWidth={0}
                      activeBar={false}
                      style={{ outline: "none" }}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={PRIORITY_COLORS[entry.name]}
                          stroke="none"
                          strokeWidth={0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
