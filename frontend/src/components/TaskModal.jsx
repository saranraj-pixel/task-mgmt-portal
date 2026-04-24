import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { createTask, updateTask } from "../services/taskService";
import { toast } from "react-toastify";
import { logError } from "../../utils/logger";
import CustomDatePicker from "../components/CustomDatePicker";

const TaskModal = ({ isOpen, onClose, task, onSave, users = [], currentUser }) => {
  const isEdit = !!task;
  
  // State to track user permissions
  const [canEditAllFields, setCanEditAllFields] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAssignedOnly, setIsAssignedOnly] = useState(false);
  
  // API validation errors
  const [apiErrors, setApiErrors] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError, 
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      deadline: "",
      assignedTo: "",
    }
  });

  // Check permissions when modal opens with a task
  useEffect(() => {
    if (isEdit && task && currentUser) {
      const creatorId = task.createdBy?._id || task.createdBy;
      const assignedId = task.assignedTo?._id || task.assignedTo;
      const currentUserId = currentUser.id || currentUser._id;
      
      const isTaskCreator = creatorId === currentUserId;
      const isTaskAssigned = assignedId === currentUserId;
      const isUserAdmin = currentUser.role === "admin";
      
      setIsCreator(isTaskCreator);
      setIsAdmin(isUserAdmin);
      setIsAssignedOnly(isTaskAssigned && !isTaskCreator && !isUserAdmin);
      
      // Allow full edit for admin or creator, limited for assigned only
      const hasFullAccess = isUserAdmin || isTaskCreator;
      setCanEditAllFields(hasFullAccess);
    } else {
      // For create mode, everyone can edit all fields
      setCanEditAllFields(true);
      setIsCreator(false);
      setIsAdmin(false);
      setIsAssignedOnly(false);
    }
  }, [task, currentUser, isEdit]);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
    if (task) {
        // Edit mode - populate with task data
      reset({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        deadline: task.deadline?.slice(0, 10),
        assignedTo: task.assignedTo?._id || task.assignedTo || "",
      });
    } else {
        // Create mode - reset to empty form
      reset({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        deadline: "",
        assignedTo: "",
      });
    }
    setApiErrors({});
    }
  }, [task, reset, isOpen]); 

  // Clean up when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to ensure modal is closed before resetting
      const timer = setTimeout(() => {
        reset({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          deadline: "",
          assignedTo: "",
        });
        setApiErrors({});
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiErrors({});
    
    try {
      if (isEdit) {
        // 🔑 KEY FIX: Only send allowed fields based on permissions
        let updateData;
        
        if (!canEditAllFields) {
          // Assigned user can ONLY update status
          updateData = { status: data.status };
          console.log("Limited update - only status:", updateData);
        } else {
          // Admin or creator can update all fields
          updateData = data;
          console.log("Full update - all fields:", updateData);
        }
        
        await updateTask(task._id || task.id, updateData);
        toast.success("Task updated successfully");
      } else {
        await createTask(data);
        toast.success("Task created successfully");
        
        // Reset form after successful creation for next task
        reset({
          title: "",
          description: "",
          priority: "medium",
          status: "todo",
          deadline: "",
          assignedTo: "",
        });
      }

      onSave();
      onClose();
    } catch (error) {
      console.error("Update error:", error);
      
      // Handle validation errors from API
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Process field-specific errors
        const validationErrors = error.response.data.errors;
        
        validationErrors.forEach((err) => {
          if (err.type === "field" && err.path) {
            // Set error for specific field using react-hook-form
            setError(err.path, {
              type: "manual",
              message: err.msg
            });
            
            // Also store in apiErrors state for any custom display needs
            setApiErrors(prev => ({
              ...prev,
              [err.path]: err.msg
            }));
          }
        });
        
        // Show a single toast with validation error summary
        const errorMessages = validationErrors.map(err => `${err.path}: ${err.msg}`).join(', ');
        toast.error(`Validation Error: ${errorMessages}`);
      } else {
        // Handle other types of errors
        const errorMessage = error.response?.data?.message || "Something went wrong";
        toast.error(errorMessage);
      }
      
      logError(error, {
        action: isEdit ? "UPDATE_TASK" : "CREATE_TASK",
        payload: data,
        taskId: task?._id || task.id,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle modal close with reset
  const handleClose = () => {
    reset({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      deadline: "",
      assignedTo: "",
    });
    setApiErrors({});
    onClose();
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

        {/* Role-based info messages */}
        {isEdit && (
          <div className={`mb-4 p-3 rounded-lg ${
            isAdmin ? "bg-purple-50 border border-purple-200" :
            isCreator ? "bg-green-50 border border-green-200" :
            isAssignedOnly ? "bg-blue-50 border border-blue-200" :
            "bg-gray-50 border border-gray-200"
          }`}>
            <p className={`text-sm ${
              isAdmin ? "text-purple-800" :
              isCreator ? "text-green-800" :
              isAssignedOnly ? "text-blue-800" :
              "text-gray-800"
            }`}>
              {isAdmin && "👑 Admin: You have full access to edit all fields"}
              {isCreator && "✏️ Creator: You have full access to edit all fields"}
              {isAssignedOnly && "ℹ️ Assigned: You can only update the status of this task"}
              {!isAdmin && !isCreator && !isAssignedOnly && isEdit && "👀 View Only: You cannot edit this task"}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* TITLE */}
          <div>
            <label className="block font-medium text-sm mb-1">Title</label>
            <input
              {...register("title", { 
                required: "Title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters"
                }
              })}
              disabled={isEdit && !canEditAllFields}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(isEdit && !canEditAllFields) ? "bg-gray-100 cursor-not-allowed" : ""}
                ${(errors.title || apiErrors.title) ? "border-red-500" : "border-gray-300"}
              `}
            />
            {/* Show both react-hook-form errors and API errors */}
            {(errors.title || apiErrors.title) && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.title?.message || apiErrors.title}
              </p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-medium text-sm mb-1">Description</label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 5,
                  message: "Description must be at least 5 characters",
                },
                maxLength: {
                  value: 500,
                  message: "Description cannot exceed 500 characters",
                },
                validate: (value) =>
                  value.trim().length > 0 || "Description cannot be empty",
              })}
              rows="3"
              disabled={isEdit && !canEditAllFields}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(isEdit && !canEditAllFields) ? "bg-gray-100 cursor-not-allowed" : ""}
                ${(errors.description || apiErrors.description) ? "border-red-500" : "border-gray-300"}
              `}
            />
            {(errors.description || apiErrors.description) && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.description?.message || apiErrors.description}
              </p>
            )}
          </div>

          {/* PRIORITY + STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* PRIORITY */}
            <div>
              <label className="block font-medium text-sm mb-1">Priority</label>
              <select
                {...register("priority")}
                disabled={isEdit && !canEditAllFields}
                className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${(isEdit && !canEditAllFields) ? "bg-gray-100 cursor-not-allowed" : ""}
                  ${(errors.priority || apiErrors.priority) ? "border-red-500" : "border-gray-300"}
                `}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {(errors.priority || apiErrors.priority) && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.priority?.message || apiErrors.priority}
                </p>
              )}
            </div>

            {/* STATUS - Always enabled for edit mode, but disabled for create if needed */}
            <div>
              <label className="block font-medium text-sm mb-1">Status</label>
              <select
                {...register("status")}
                disabled={false} // Status is always editable for assigned users
                className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${(errors.status || apiErrors.status) ? "border-red-500" : "border-gray-300"}
                `}
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              {(errors.status || apiErrors.status) && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">
                  {errors.status?.message || apiErrors.status}
                </p>
              )}
            </div>
          </div>

          {/* ASSIGN USER */}
          <div>
            <label className="block font-medium text-sm mb-1">Assign To</label>
            <select
              {...register("assignedTo")}
              disabled={isEdit && !canEditAllFields}
              className={`w-full border rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                ${(isEdit && !canEditAllFields) ? "bg-gray-100 cursor-not-allowed" : ""}
                ${(errors.assignedTo || apiErrors.assignedTo) ? "border-red-500" : "border-gray-300"}
              `}
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name || user.email} {user.role === "admin" && "(Admin)"}
                </option>
              ))}
            </select>
            {(errors.assignedTo || apiErrors.assignedTo) && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.assignedTo?.message || apiErrors.assignedTo}
              </p>
            )}
          </div>

          {/* DEADLINE - Completely disabled for assigned users */}
          <div>
            <label className="block font-medium text-sm mb-1">Deadline</label>
            <Controller
              name="deadline"
              control={control}
              rules={{
                required: "Deadline is required",
                validate: (value) => {
                  if (!value) return "Deadline is required";
                  const [y, m, d] = value.split("-");
                  const selected = new Date(y, m - 1, d);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return selected >= today || "Deadline must be today or a future date";
                },
              }}
              render={({ field }) => (
                <CustomDatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select deadline"
                  className={`w-full ${
                    (isEdit && !canEditAllFields) 
                      ? "bg-gray-100 cursor-not-allowed opacity-60 pointer-events-none" 
                      : ""
                  } ${(errors.deadline || apiErrors.deadline) ? "border-red-500" : ""}`}
                  minDate={new Date()}
                  disabled={isEdit && !canEditAllFields}
                  // Additional props to completely disable the date picker
                  readOnly={isEdit && !canEditAllFields}
                  onFocus={(e) => {
                    if (isEdit && !canEditAllFields) {
                      e.preventDefault();
                      return false;
                    }
                  }}
                  onClick={(e) => {
                    if (isEdit && !canEditAllFields) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  }}
                />
              )}
            />
            {/* Show both client-side and API validation errors for deadline */}
            {(errors.deadline || apiErrors.deadline) && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.deadline?.message || apiErrors.deadline}
              </p>
            )}
            
            {/* Optional: Show a summary of all API errors */}
            {Object.keys(apiErrors).length > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-xs font-semibold">Validation Errors:</p>
                <ul className="list-disc list-inside text-red-500 text-xs mt-1">
                  {Object.entries(apiErrors).map(([field, message]) => (
                    <li key={field}>
                      <span className="font-medium">{field}:</span> {message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 border hover:bg-gray-100 rounded-lg cursor-pointer disabled:opacity-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || (isEdit && !canEditAllFields && !isAssignedOnly)}
              className={`w-full sm:w-auto px-4 py-2 font-bold rounded-lg cursor-pointer transition
                ${(isLoading || (isEdit && !canEditAllFields && !isAssignedOnly)) 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                }
              `}
            >
              {isLoading ? "Processing..." : (isEdit ? "Update Task" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;