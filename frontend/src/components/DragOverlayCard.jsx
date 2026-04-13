export default function DragOverlayCard({ task }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-2xl">
      <h3 className="text-sm font-medium mb-2">{task.title}</h3>

      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
        {task.priority}
      </span>
    </div>
  );
}
