// Achievement and streak tracking

export const achievements = [
  {
    id: 'first_record',
    title: 'Getting Started',
    description: 'Log your first health record',
    icon: '🎯',
    condition: (stats) => stats.total_records >= 1
  },
  {
    id: 'week_streak',
    title: 'Week Warrior',
    description: 'Log records for 7 consecutive days',
    icon: '🔥',
    condition: (stats) => stats.streak >= 7
  },
  {
    id: 'month_streak',
    title: 'Monthly Master',
    description: 'Log records for 30 consecutive days',
    icon: '⭐',
    condition: (stats) => stats.streak >= 30
  },
  {
    id: 'ten_records',
    title: 'Health Enthusiast',
    description: 'Log 10 health records',
    icon: '💪',
    condition: (stats) => stats.total_records >= 10
  },
  {
    id: 'first_medication',
    title: 'Medication Manager',
    description: 'Add your first medication',
    icon: '💊',
    condition: (stats) => stats.active_medications >= 1
  },
  {
    id: 'consistent_tracker',
    title: 'Consistency Champion',
    description: 'Log records for 14 consecutive days',
    icon: '🏆',
    condition: (stats) => stats.streak >= 14
  }
];

export function calculateStreak(records) {
  if (!records || records.length === 0) return 0;

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at)
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const record of sortedRecords) {
    const recordDate = new Date(record.recorded_at);
    recordDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === streak) {
      streak++;
      currentDate = new Date(recordDate);
    } else if (daysDiff > streak) {
      break;
    }
  }

  return streak;
}

export function getUnlockedAchievements(stats) {
  return achievements.filter(achievement => achievement.condition(stats));
}

export function getMotivationalMessage(streak) {
  if (streak === 0) return "Start your health journey today! 🌟";
  if (streak === 1) return "Great start! Keep going! 💪";
  if (streak < 7) return `${streak} days strong! Don't break the chain! 🔥`;
  if (streak === 7) return "One week streak! Amazing commitment! 🎉";
  if (streak < 14) return `${streak} days in a row! You're unstoppable! 🚀`;
  if (streak === 14) return "Two weeks! You're a health champion! 🏆";
  if (streak < 30) return `${streak} day streak! Incredible dedication! ⭐`;
  if (streak === 30) return "30 days! You've built a solid habit! 🌟";
  return `${streak} days! You're an inspiration! 👑`;
}
