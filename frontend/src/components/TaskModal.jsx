import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { createTask, updateTask } from "../services/taskService";
import { toast } from "react-toastify";
import { logError } from "../../utils/logger";
import CustomDatePicker from "../components/CustomDatePicker";

const TaskModal = ({ isOpen, onClose, task, onSave, users = [] }) => {
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    reset,
    control,
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
        assignedTo: task.assignedTo?._id || "",
      });
    } else {
      reset({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        deadline: "",
        assignedTo: "",
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-3 sm:px-4">
      <div
        className="bg-white w-full max-w-lg sm:max-w-xl rounded-xl shadow-lg 
                    max-h-[90vh] overflow-y-auto p-4 sm:p-6"
      >
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          {isEdit ? "Edit Task" : "Create Task"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* TITLE */}
          <div>
            <label className="block font-medium text-sm mb-1">Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm sm:text-base"
            />
            {errors.title && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-medium text-sm mb-1">
              Description
            </label>

            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
                maxLength: {
                  value: 200,
                  message: "Description cannot exceed 200 characters",
                },
                validate: (value) =>
                  value.trim().length > 0 || "Description cannot be empty",
              })}
              rows="3"
              className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm sm:text-base resize-none"
            />

            {errors.description && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* PRIORITY + STATUS (GRID on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-sm mb-1">Priority</label>
              <select
                {...register("priority")}
                className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm sm:text-base"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {isEdit && (
              <div>
                <label className="block font-medium text-sm mb-1">Status</label>
                <select
                  {...register("status")}
                  className="w-full border focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm sm:text-base"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>

          {/* ASSIGN USER */}
          <div>
            <label className="block font-medium text-sm mb-1">Assign To</label>

            <select
              {...register("assignedTo")}
              className="w-full border focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm sm:text-base"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* DEADLINE */}
          <div>
            <label className="block font-medium text-sm mb-1">Deadline</label>

            <Controller
              name="deadline"
              control={control}
              rules={{
                required: "Deadline required",
                validate: (value) => {
                  if (!value) return true;

                  const [y, m, d] = value.split("-");
                  const selected = new Date(y, m - 1, d);

                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  return selected > today || "Deadline must be future date";
                },
              }}
              render={({ field }) => (
                <CustomDatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select deadline"
                  className="w-full"
                  minDate={new Date()}
                />
              )}
            />

            {errors.deadline && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.deadline.message}
              </p>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 border hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
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
