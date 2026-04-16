import { useEffect, useState } from "react";
import { getTasks, updateTask } from "../services/taskService";

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

  const [activeTask, setActiveTask] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  /* LOAD TASKS */

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await getTasks({
          page: 1,
          limit: 1000,
        });

        const tasks = res?.tasks || [];

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
        console.error("Failed to load tasks", err);
      }
    };

    fetchTasks();
  }, []);

  /* FIND COLUMN */

  const findColumn = (id) => {
    if (columns[id]) return id;

    return Object.keys(columns).find((col) =>
      columns[col].some((task) => task._id === id),
    );
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
      console.error("Failed to update task", err);
    }
  };

  return (
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
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay adjustScale={false}>
          {activeTask && <DragOverlayCard task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
