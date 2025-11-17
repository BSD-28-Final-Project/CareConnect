export const POINT_RULES = {
  DONATION_PER_10K: 1,        // 1 point per 10,000 rupiah
  VOLUNTEER_REGISTER: 50,      // 50 points untuk register volunteer
  ACTIVITY_COMPLETE: 100,      // 100 points ketika activity selesai (bonus untuk volunteers)
  DAILY_LOGIN: 5,              // 5 points daily login (optional)
};

export const LEVELS = [
  { level: 1, name: "Pemula", minPoints: 0, maxPoints: 99, badge: "🌱" },
  { level: 2, name: "Penolong", minPoints: 100, maxPoints: 299, badge: "🤝" },
  { level: 3, name: "Pejuang", minPoints: 300, maxPoints: 599, badge: "💪" },
  { level: 4, name: "Pahlawan", minPoints: 600, maxPoints: 999, badge: "⭐" },
  { level: 5, name: "Legenda", minPoints: 1000, maxPoints: 1999, badge: "🏆" },
  { level: 6, name: "Champion", minPoints: 2000, maxPoints: Infinity, badge: "👑" },
];

export const ACHIEVEMENTS = {
  FIRST_DONATION: {
    id: "first_donation",
    name: "Donatur Pertama",
    description: "Melakukan donasi pertama kali",
    badge: "💝",
    points: 10,
  },
  FIRST_VOLUNTEER: {
    id: "first_volunteer",
    name: "Relawan Pertama",
    description: "Mendaftar sebagai relawan pertama kali",
    badge: "🙋",
    points: 20,
  },
  GENEROUS_DONOR: {
    id: "generous_donor",
    name: "Donatur Dermawan",
    description: "Total donasi mencapai 1 juta rupiah",
    badge: "💎",
    points: 100,
  },
  ACTIVE_VOLUNTEER: {
    id: "active_volunteer",
    name: "Relawan Aktif",
    description: "Terdaftar di 5 kegiatan",
    badge: "🔥",
    points: 150,
  },
  SUPER_DONOR: {
    id: "super_donor",
    name: "Super Donatur",
    description: "Total donasi mencapai 5 juta rupiah",
    badge: "🌟",
    points: 500,
  },
};

// Helper function to get user level
export const getUserLevel = (points) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
};

// Helper function to calculate points from donation
export const calculateDonationPoints = (amount) => {
  return Math.floor(amount / 10000) * POINT_RULES.DONATION_PER_10K;
};