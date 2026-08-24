import { Body, Card, Notice, Screen, SectionTitle } from '@/src/ui/components';

export default function FormCamera() {
  return <Screen><Card><SectionTitle>姿勢を自分で見返す</SectionTitle><Body>Web版ではカメラを起動しません。フォームガイドの文章による自己確認を利用できます。</Body><Notice>映像の保存、自動採点、診断は行いません。ネイティブDevelopment Buildではライブプレビューを利用できます。</Notice></Card></Screen>;
}
