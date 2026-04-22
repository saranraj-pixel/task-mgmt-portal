import { useEffect, useState } from "react";
import { getTasks, updateTask } from "../services/taskService";
import { getUsers } from "../services/authService";
import Skeleton from "../components/Skeleton";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import KanbanColumn from "../components/KanbanColumn";
import DragOverlayCard from "../components/DragOverlayCard";
import { logError } from "../../utils/logger";
import { Helmet } from "react-helmet-async";

const COLUMN_CONFIG = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function TaskBoard() {
  const [columns, setColumns] = useState({
    todo: [],
    "in-progress": [],
    done: [],
  });

  const [users, setUsers] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  /* LOAD TASKS */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [taskRes, userRes] = await Promise.all([
          getTasks({ page: 1, limit: 1000 }),
          getUsers(),
        ]);

        const tasks = taskRes?.tasks || [];
        const usersData = userRes?.users || [];

        setUsers(usersData);

        const grouped = {
          todo: [],
          "in-progress": [],
          done: [],
        };

        tasks.forEach((task) => {
          if (grouped[task.status]) {
            grouped[task.status].push(task);
          }
        });

        setColumns(grouped);
      } catch (err) {
        logError(err, { action: "FETCH_TASKS_FAILED", page: 1, limit: 1000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* FIND COLUMN */

  const findColumn = (id) => {
    if (columns[id]) return id;

    return Object.keys(columns).find((col) =>
      columns[col].some((task) => task._id === id),
    );
  };

  /* MOVE TASK (button action) */
const moveTask = async (taskId, targetCol) => {
  const sourceCol = findColumn(taskId);
  if (!sourceCol || sourceCol === targetCol) return;

  const task = columns[sourceCol].find((t) => t._id === taskId);
  if (!task) return;

  // update UI instantly
  setColumns((prev) => {
    const sourceTasks = prev[sourceCol].filter((t) => t._id !== taskId);
    const targetTasks = [...prev[targetCol], { ...task, status: targetCol }];

    return {
      ...prev,
      [sourceCol]: sourceTasks,
      [targetCol]: targetTasks,
    };
  });

  // update backend
  try {
    await updateTask(taskId, { status: targetCol });
  } catch (err) {
    logError(err, { action: "MOVE_TASK_FAILED" });
  }
};

  /* DRAG START */

  const handleDragStart = (event) => {
    const id = event.active.id;

    const column = findColumn(id);
    if (!column) return;

    const task = columns[column].find((t) => t._id === id);

    setActiveTask(task);
  };

  /* DRAG OVER */

  const handleDragOver = ({ over }) => {
    if (!over) return;

    const column = findColumn(over.id) || over.id;

    setOverColumn(column);
  };

  /* DRAG END */

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    setOverColumn(null);

    if (!over) return;

    const sourceCol = findColumn(active.id);
    const targetCol = findColumn(over.id) || over.id;

    if (!sourceCol || !targetCol) return;

    /* REORDER SAME COLUMN */

    if (sourceCol === targetCol) {
      const oldIndex = columns[sourceCol].findIndex((t) => t._id === active.id);

      const newIndex = columns[sourceCol].findIndex((t) => t._id === over.id);

      if (oldIndex !== newIndex && newIndex !== -1) {
        setColumns((prev) => ({
          ...prev,
          [sourceCol]: arrayMove(prev[sourceCol], oldIndex, newIndex),
        }));
      }

      return;
    }

    /* MOVE BETWEEN COLUMNS */

    const task = columns[sourceCol].find((t) => t._id === active.id);

    if (!task) return;

    const overIndex = columns[targetCol].findIndex((t) => t._id === over.id);

    setColumns((prev) => {
      const sourceTasks = prev[sourceCol].filter((t) => t._id !== active.id);
      const targetTasks = [...prev[targetCol]];

      const insertIndex = overIndex >= 0 ? overIndex : targetTasks.length;

      targetTasks.splice(insertIndex, 0, { ...task, status: targetCol });

      return {
        ...prev,
        [sourceCol]: sourceTasks,
        [targetCol]: targetTasks,
      };
    });

    try {
      await updateTask(active.id, { status: targetCol });
    } catch (err) {
      logError(err, {
        action: "DRAG_TASK_UPDATE_FAILED",
        taskId: active.id,
        from: sourceCol,
        to: targetCol,
      });
    }
  };

  /* ASSIGN USER */
  const handleAssignUser = async (taskId, userId) => {
    try {
      await updateTask(taskId, { assignedTo: userId || null });

      setColumns((prev) => {
        const updated = { ...prev };

        Object.keys(updated).forEach((col) => {
          updated[col] = updated[col].map((task) =>
            task._id === taskId
              ? {
                  ...task,
                  assignedTo: users.find((u) => u._id === userId) || null,
                }
              : task,
          );
        });

        return updated;
      });
    } catch (err) {
      logError(err, { action: "ASSIGN_USER_FAILED" });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMN_CONFIG.map((col) => (
            <div key={col.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
              {/* Header Skeleton */}
              <div className="h-14 bg-gray-100 flex items-center px-4">
                <Skeleton className="h-5 w-32" />
                <div className="ml-auto">
                    <Skeleton className="h-6 w-8 rounded-full" />
                </div>
              </div>
              
              {/* Cards Skeleton */}
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <Helmet>
        <title> Board | Task Manager</title>
        <meta
          name="description"
          content="Overview of your board todo, in progress, done everything you can see and drag and drop according to the task stats "
        />
      </Helmet>
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMN_CONFIG.map((col) => (
            <SortableContext
              key={col.id}
              items={columns[col.id].map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumn
                id={col.id}
                title={col.title}
                tasks={columns[col.id]}
                activeTask={activeTask}
                overColumn={overColumn}
                users={users}
                onAssignUser={handleAssignUser}
                onMoveTask={moveTask}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay adjustScale={false}>
          {activeTask && <DragOverlayCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  </>

  );
}
