import { useState } from 'react';

import { weeklyRewardEligibility } from '@/src/domain/trainingRewards';
import { WeeklyAdjustment } from '@/src/domain/types';
import { useAppState } from '@/src/state/AppStateProvider';
import { Body, Card, Inline, Metric, Notice, PrimaryButton, SectionTitle } from '@/src/ui/components';

export function WeeklyAdjustmentCard({ weekStart, adjustment }: { weekStart: string; adjustment?: WeeklyAdjustment }) {
  const { state, actions } = useAppState();
  const [message, setMessage] = useState('');
  if (!adjustment) return <Card><SectionTitle>来週の調整案</SectionTitle><Body>今週の最低・理想ライン、振り返り、Training、回復を集計します。提案は自動適用されません。</Body><PrimaryButton label="今週を集計して案を作る" onPress={() => actions.createWeeklyAdjustment(weekStart)} /></Card>;
  const eligibility = weeklyRewardEligibility(adjustment.summary, state.journeyInventory.weeklyRewardClaims, weekStart);
  return <Card><SectionTitle>来週の調整案</SectionTitle><Inline><Metric label="最低ライン" value={`${adjustment.summary.minimumDays}日`} /><Metric label="理想ライン" value={`${adjustment.summary.idealDays}日`} /><Metric label="振り返り" value={`${adjustment.summary.reflectionDays}日`} /><Metric label="Training" value={`${adjustment.summary.workoutMinutes}分`} /></Inline><Body tone="normal">提案: {adjustment.proposal.level === 'lighter' ? '少し軽くする' : adjustment.proposal.level === 'slightly-more' ? '少し増やす' : '維持する'}</Body><Body>{adjustment.proposal.reason}</Body>
    {adjustment.decision === 'pending' ? <><Notice>本人が選ぶまで来週へ反映しません。</Notice><PrimaryButton label="このまま採用" onPress={() => actions.decideWeeklyAdjustment(adjustment.id, 'accepted')} /><PrimaryButton label="少し軽くする" tone="quiet" onPress={() => actions.decideWeeklyAdjustment(adjustment.id, 'edited', 'lighter')} /><PrimaryButton label="少し増やす" tone="quiet" onPress={() => actions.decideWeeklyAdjustment(adjustment.id, 'edited', 'slightly-more')} /><PrimaryButton label="今回は反映しない" tone="quiet" onPress={() => actions.decideWeeklyAdjustment(adjustment.id, 'rejected')} /></> : <Notice>{adjustment.decision === 'rejected' ? '今回は反映しないと決めました。' : `本人の決定: ${adjustment.acceptedLevel}`}</Notice>}
    {eligibility.eligible && eligibility.rewardId ? <PrimaryButton label="週の特別報酬を受け取る" onPress={() => setMessage(actions.claimWeeklyReward(weekStart, eligibility.rewardId!))} /> : <Body>特別報酬は最低ライン4日または理想ライン2日で候補になります。連続日数は不要です。</Body>}{message ? <Notice>{message}</Notice> : null}
  </Card>;
}
