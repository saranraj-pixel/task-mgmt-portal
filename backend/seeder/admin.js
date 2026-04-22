const User = require("../models/user");

const seedAdmin = async () => {
  try {
    console.log("🚀 Seeder running...");

    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      console.log("🟡 No admin found, creating...");

      const admin = await User.create({
        name: "Saran Raj",
        email: "saranraj@gmail.com",
        password: "Hdk83#9DHdj748#",
        role: "admin",
      });

      console.log("✅ Admin created:", admin);
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Seeder error:", error.message);
  }
};

module.exports = seedAdmin;