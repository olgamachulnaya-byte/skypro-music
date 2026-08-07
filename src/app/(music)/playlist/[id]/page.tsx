import CenterBlock from "@/components/CenterBlock/CenterBlock";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const titles: Record<string, string> = {
    "2": "Плейлист дня",
    "3": "100 танцевальных хитов",
    "4": "Инди-заряд",
  };

  return <CenterBlock selectionId={id} title={titles[id] ?? "Подборка"} />;
}