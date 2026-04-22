import { useState } from "react";
import { inviteUser } from "../../services/authService";
import { toast } from "react-toastify";
import { Mail, Send } from "lucide-react";

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
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-200 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg bg-white/90 backdrop-blur-lg border border-gray-200 rounded-3xl shadow-2xl p-6 sm:p-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Invite User
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Send an invitation link to onboard a new user
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleInvite} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                placeholder="Enter user email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm sm:text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            {loading ? "Sending Invite..." : "Send Invitation"}
          </button>
        </form>

        {/* Success Message */}
        {sent && (
          <div className="mt-5 text-center text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg py-2 px-3">
            Invitation sent successfully. User will receive an email link.
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Make sure the email is correct before sending the invite
        </p>
      </div>
    </div>
  );
};

export default AdminInvite;