export type ExerciseGuide = {
  id: string;
  title: string;
  category: '脚' | '押す' | '引く' | '体幹';
  summary: string;
  setup: string[];
  steps: string[];
  breathing: string;
  selfChecks: string[];
  stopConditions: string[];
  alternative: string;
};

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'supported-squat',
    title: '支持ありスクワット',
    category: '脚',
    summary: '椅子や机へ軽く手を添え、痛みのない範囲で立ち座りを練習します。',
    setup: ['動かない椅子または安定した机を選ぶ', '足を腰幅ほどに置く', '滑りにくい床と履物を確認する'],
    steps: ['支持へ軽く手を添える', 'お尻を少し後ろへ引く', '痛みのない深さまで曲げ、ゆっくり戻る'],
    breathing: '下がる前に息を整え、立ち上がりながらゆっくり吐きます。息を止めて力まないようにします。',
    selfChecks: ['膝とつま先がおおむね同じ方向を向く', '支持へ体重を預けすぎず、いつでも止まれる', '反動を使わず会話できる余力がある'],
    stopConditions: ['鋭い痛み、しびれ、めまい', '胸の症状、強い息苦しさ', '支持が動く、足元が滑る'],
    alternative: '椅子から完全に立たず、座ったまま足裏で床を押す感覚だけ確認します。',
  },
  {
    id: 'hip-hinge',
    title: 'ヒップヒンジ',
    category: '脚',
    summary: '背中を無理に反らさず、股関節からお辞儀する動きを練習します。',
    setup: ['足を腰幅にする', '壁を背にして一歩前へ立つ', '手を腰骨へ添える'],
    steps: ['膝を軽くゆるめる', 'お尻を壁へ近づけるように股関節を後ろへ引く', '足裏で床を押してゆっくり戻る'],
    breathing: '股関節を引くときに吸い、戻りながら細く吐きます。',
    selfChecks: ['腰ではなく股関節が主に動く', '首から背中を無理に反らさない', 'もも裏の軽い張りで止められる'],
    stopConditions: ['腰や脚へ走る痛み・しびれ', 'めまい、胸の症状、強い息苦しさ', '姿勢を保てず反動が必要になる'],
    alternative: '椅子へ座り、背中を保ったまま上体を数センチ前へ傾けて戻します。',
  },
  {
    id: 'wall-push-up',
    title: '壁プッシュアップ',
    category: '押す',
    summary: '壁を使い、負荷を小さく調整できる押す動きです。',
    setup: ['動かない壁を選ぶ', '手を肩幅より少し広く置く', '足元が滑らない距離を選ぶ'],
    steps: ['頭から踵まで無理のない一直線を作る', '肘を曲げて胸を壁へ近づける', '壁を押し、ゆっくり元へ戻る'],
    breathing: '壁へ近づくときに吸い、押し戻しながら吐きます。',
    selfChecks: ['肩をすくめない', '腰だけが反らない', '最後まで速度を制御できる'],
    stopConditions: ['胸・肩・手首の鋭い痛み', 'めまい、胸部症状、異常な息切れ', '壁や足元が不安定'],
    alternative: '壁へ立ったまま手のひらで軽く押し、3秒保って力を抜きます。',
  },
  {
    id: 'supported-row',
    title: '支持ありロウ',
    category: '引く',
    summary: '片手で支持を取り、軽い重さを身体へ引き寄せます。',
    setup: ['動かない支持へ片手を置く', '持ちやすい軽い物または無負荷を選ぶ', '肩を楽な位置へ下げる'],
    steps: ['肘を身体の横へゆっくり引く', '肩甲骨を無理に寄せ切らない', '同じ速度で腕を戻す'],
    breathing: '引きながら吐き、戻しながら吸います。',
    selfChecks: ['肩が耳へ近づかない', '胴体をひねって勢いをつけない', '左右それぞれ痛みなく止められる'],
    stopConditions: ['肩・首・背中の鋭い痛みやしびれ', '胸の症状、めまい、強い息苦しさ', '支持が不安定になる'],
    alternative: '腕を下ろしたまま、肩をすくめず肘を数センチ後ろへ動かします。',
  },
  {
    id: 'seated-brace',
    title: '座位ブレーシング',
    category: '体幹',
    summary: '呼吸を止めず、座った姿勢を穏やかに保つ練習です。',
    setup: ['背もたれのある椅子へ浅すぎない位置で座る', '両足を床へ置く', '肩とあごの力を抜く'],
    steps: ['静かに息を吸う', '息を吐きながら胴回りを軽く支える', '3呼吸以内で力を抜く'],
    breathing: '常に会話できる呼吸を保ち、息を止めません。',
    selfChecks: ['肩や首に力が集中しない', '腰を強く反らさない', '呼吸のたびに力を緩められる'],
    stopConditions: ['めまい、胸部症状、息苦しさ', '腰や腹部の痛み', '息を止めないと姿勢を保てない'],
    alternative: '背もたれへ身体を預け、ゆっくり吐く呼吸だけを2回行います。',
  },
];

export function findExerciseGuide(id: string | undefined): ExerciseGuide | undefined {
  return EXERCISE_GUIDES.find((guide) => guide.id === id);
}
