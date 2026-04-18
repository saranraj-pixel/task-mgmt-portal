import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createTask, updateTask } from "../services/taskService";
import { toast } from "react-toastify";
import { logError } from "../../utils/logger";

const TaskModal = ({ isOpen, onClose, task, onSave }) => {
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline?.slice(0, 10),
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        deadline: "",
      });
    }
  }, [task, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateTask(task.id, data);
        toast.success("Task updated successfully");
      } else {
        await createTask(data);
        toast.success("Task created successfully");
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
      logError(error, {
        action: isEdit ? "UPDATE_TASK" : "CREATE_TASK",
        payload: data,
        taskId: task?.id,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? "Edit Task" : "Create Task"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* TITLE */}
          <div>
            <label className="block font-medium text-sm mb-1">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full border outline-none rounded-lg px-3 py-2"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-medium text-sm mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows="3"
              className="w-full border outline-none rounded-lg px-3 py-2"
            />
          </div>

          {/* PRIORITY */}
          <div>
            <label className="block font-medium text-sm mb-1">Priority</label>
            <select
              {...register("priority")}
              className="w-full border cursor-pointer outline-none rounded-lg px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* STATUS (ONLY EDIT) */}
          {isEdit && (
            <div>
              <label className="block font-medium text-sm mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full border cursor-pointer outline-none rounded-lg px-3 py-2"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          )}

          {/* DEADLINE */}
          <div>
            <label className="block font-medium text-sm mb-1">Deadline</label>
            <input
              type="date"
              {...register("deadline", {
                required: "Deadline required",
                validate: (value) =>
                  new Date(value) > new Date() ||
                  "Deadline must be future date",
              })}
              className="w-full border cursor-pointer outline-none rounded-lg px-3 py-2"
            />
            {errors.deadline && (
              <p className="text-red-500 text-sm">{errors.deadline.message}</p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
            >
              {isEdit ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
