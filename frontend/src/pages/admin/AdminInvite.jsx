import { useState } from "react";
import { inviteUser } from "../../services/authService";
import { toast } from "react-toastify";

const AdminInvite = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Email is required");
    }

    try {
      setLoading(true);

      await inviteUser({ email });

      toast.success("Invitation sent successfully!");
      setSent(true);
      setEmail("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Invite User
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Send an invitation link to add a new user to the system
        </p>

        <form onSubmit={handleInvite} className="space-y-4">
          <input
            type="email"
            placeholder="Enter user email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Sending Invite..." : "Send Invitation"}
          </button>
        </form>

        {sent && (
          <p className="text-green-600 text-sm mt-4 text-center">
            Invitation sent successfully. User will receive email link.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminInvite;