import "dotenv/config";
import { connectToDatabase } from "../config/database";
import { AdminModel } from "../models/Admin";
import { RevenueDataModel } from "../models/RevenueData";

// Helper function to get week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

// Helper function to get day of week
const getDayOfWeek = (date: Date): "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  const day = days[date.getDay()];
  if (!day) throw new Error("Invalid day");
  return day;
};

// Generate random number within range
const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seed...");

    await connectToDatabase();

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await AdminModel.deleteMany({});
    await RevenueDataModel.deleteMany({});

    // Create admin users
    console.log("👤 Creating admin users...");
    const adminUser = await AdminModel.create({
      email: "admin@restaurant.com",
      password: "admin123",
      name: "Admin User",
      role: "admin",
    });

    const superAdminUser = await AdminModel.create({
      email: "superadmin@restaurant.com",
      password: "superadmin123",
      name: "Super Admin User",
      role: "super_admin",
    });

    console.log("✅ Created admin users:");
    console.log(`   - Admin: ${adminUser.email} / admin123`);
    console.log(`   - Super Admin: ${superAdminUser.email} / superadmin123`);

    // Generate revenue data for the last 3 weeks
    console.log("\n📊 Generating revenue data...");

    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const currentYear = today.getFullYear();

    const revenueData = [];

    // Generate data for 3 weeks (current + 2 previous)
    for (let weekOffset = 2; weekOffset >= 0; weekOffset--) {
      let targetWeek = currentWeek - weekOffset;
      let targetYear = currentYear;

      // Handle year boundary
      if (targetWeek <= 0) {
        targetYear = currentYear - 1;
        targetWeek = 52 + targetWeek;
      }

      // Generate 7 days of data for this week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (weekOffset * 7 + today.getDay()));

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + dayOffset);

        const dayOfWeek = getDayOfWeek(date);

        // Weekend has higher revenue
        const isWeekend = dayOfWeek === "Sat" || dayOfWeek === "Sun";
        const baseRevenue = isWeekend ? 2000 : 1500;

        // Add some events randomly
        const events = [];
        if (Math.random() > 0.8) {
          events.push({
            name: Math.random() > 0.5 ? "Local Festival" : "Bad Weather",
            impact: Math.random() > 0.5 ? "positive" : "negative",
          });
        }

        revenueData.push({
          date,
          dayOfWeek,
          posRevenue: randomInRange(baseRevenue - 400, baseRevenue + 400),
          eatclubRevenue: randomInRange(300, 700),
          labourCosts: randomInRange(500, 900),
          totalCovers: randomInRange(isWeekend ? 100 : 80, isWeekend ? 150 : 120),
          events,
          weekNumber: targetWeek,
          year: targetYear,
        });
      }
    }

    await RevenueDataModel.insertMany(revenueData);

    console.log(`✅ Created ${revenueData.length} revenue records`);
    console.log(
      `   - Covering ${Math.floor(revenueData.length / 7)} weeks of data`
    );

    // Display summary
    const totalRevenue = revenueData.reduce(
      (sum, d) => sum + d.posRevenue + d.eatclubRevenue,
      0
    );
    const totalCovers = revenueData.reduce((sum, d) => sum + d.totalCovers, 0);

    console.log("\n📈 Summary:");
    console.log(`   - Total Revenue: $${totalRevenue.toLocaleString()}`);
    console.log(`   - Total Covers: ${totalCovers}`);
    console.log(
      `   - Average per Day: $${Math.round(totalRevenue / revenueData.length).toLocaleString()}`
    );

    console.log("\n✨ Database seeded successfully!");
    console.log("\n🔑 Admin Credentials:");
    console.log("   Email: admin@restaurant.com");
    console.log("   Password: admin123");
    console.log("\n   Email: superadmin@restaurant.com");
    console.log("   Password: superadmin123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

void seedDatabase();
