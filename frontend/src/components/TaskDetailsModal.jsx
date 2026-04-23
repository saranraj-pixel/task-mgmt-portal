import React from "react";
import {
  FiX,
  FiCalendar,
  FiFlag,
  FiCheckCircle,
  FiUser,
  FiFileText,
  FiClock,
  FiInfo,
} from "react-icons/fi";

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!isOpen || !task) return null;

  const priorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "todo":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return (
      new Date(deadline) < new Date() && task.status?.toLowerCase() !== "done"
    );
  };

  // const getTaskBadges = () => {
  //   const badges = [];

  //   if (task.relationship?.isCreatedByMe) {
  //     badges.push({
  //       text: "Created by me",
  //       color: "bg-purple-100 text-purple-800 border-purple-200",
  //     });
  //   }

  //   if (task.relationship?.isAssignedToMe) {
  //     badges.push({
  //       text: "Assigned to me",
  //       color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  //     });
  //   }

  //   return badges;
  // };

  // Helper function to get user display info from populated user object
  const getUserInfo = (user) => {
    if (!user) return null;
    return {
      name: user.name || user.username || "Unknown User",
      email: user.email || "No email",
      initial: (user.name || user.username || "U").charAt(0).toUpperCase(),
    };
  };

  const assignedUserInfo = getUserInfo(task.assignedTo);
  const createdByUserInfo = getUserInfo(task.createdBy);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiInfo className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Task Details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title Section */}
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {task.title}
              </h3>
              {isOverdue(task.deadline) && (
                <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                  <FiClock className="text-red-600" />
                  Overdue
                </div>
              )}
            </div>

            {/* Badges */}
            {/* {getTaskBadges().length > 0 && (
              <div className="flex flex-wrap gap-2">
                {getTaskBadges().map((badge, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium border ${badge.color}`}
                  >
                    {badge.text}
                  </span>
                ))}
              </div>
            )} */}

            {/* Description */}
            {task.description && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiFileText className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Description</h4>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Priority */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiFlag className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Priority</h4>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${priorityColor(task.priority)}`}
                >
                  {task.priority
                    ? task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)
                    : "Not set"}
                </span>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCheckCircle className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Status</h4>
                </div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColor(task.status)}`}
                >
                  {task.status
                    ? task.status.replace("-", " ").charAt(0).toUpperCase() +
                      task.status.slice(1).replace("-", " ")
                    : "Not set"}
                </span>
              </div>

              {/* Deadline */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Deadline</h4>
                </div>
                <p
                  className={`text-gray-800 font-medium ${isOverdue(task.deadline) ? "text-red-600" : ""}`}
                >
                  {formatDate(task.deadline)}
                </p>
              </div>

              {/* Created Date */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiClock className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Created</h4>
                </div>
                <p className="text-gray-800">
                  {formatDateTime(task.createdAt)}
                </p>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Assigned To */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiUser className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Assigned To</h4>
                </div>
                {assignedUserInfo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {assignedUserInfo.initial}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {assignedUserInfo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {assignedUserInfo.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-semibold text-sm">
                        ?
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Not assigned</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Created By */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiUser className="text-gray-600" />
                  <h4 className="font-semibold text-gray-700">Created By</h4>
                </div>
                {createdByUserInfo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-sm">
                        {createdByUserInfo.initial}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {createdByUserInfo.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {createdByUserInfo.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-semibold text-sm">
                        ?
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Unknown user</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(task.updatedAt || task.completedAt) && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Additional Information
                </h4>
                <div className="space-y-2 text-sm">
                  {task.updatedAt && task.updatedAt !== task.createdAt && (
                    <p className="text-gray-600">
                      <span className="font-medium">Last updated:</span>{" "}
                      {formatDateTime(task.updatedAt)}
                    </p>
                  )}
                  {task.completedAt && (
                    <p className="text-gray-600">
                      <span className="font-medium">Completed on:</span>{" "}
                      {formatDateTime(task.completedAt)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 border hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
