import { DailyCheckIn, StudyGoal, StudySession } from './types';

export type StudySuggestion = { minutes: 2 | 5 | 10 | 15 | 25; title: string; reason: string };

export function suggestStudyAction(goal: StudyGoal | undefined, checkIn: DailyCheckIn): StudySuggestion {
  const available = checkIn.availableMinutes;
  const minutes: StudySuggestion['minutes'] = checkIn.energy <= 2
    ? (available >= 5 ? 5 : 2)
    : available >= 25 ? 25 : available >= 15 ? 15 : available >= 10 ? 10 : available >= 5 ? 5 : 2;
  const action = goal?.smallestAction?.trim() || '教材を開き、見出しを1つ読む';
  return {
    minutes,
    title: `${minutes}分だけ：${action}`,
    reason: checkIn.energy <= 2 ? 'エネルギーが低い日は、開始できたことを成果にします。' : '使える時間に収まり、次回へつながる長さです。',
  };
}

export function weeklyStudyMinutes(sessions: StudySession[], now = new Date()): number {
  const from = new Date(now);
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);
  return sessions.filter((session) => session.completed && new Date(session.startedAt) >= from).reduce((sum, session) => sum + session.minutes, 0);
}
