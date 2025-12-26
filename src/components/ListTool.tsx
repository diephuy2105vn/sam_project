import { ActionIcon, Card } from "@mantine/core";
import { MousePointer2, Save, Trash2, Undo, WandSparkles } from "lucide-react";
import type { AnnotationType, ImageType } from "../pages/ProjectOnly";

const ListTool = ({
  selectedTool,
  setSelectedTool,
  selectedImage,
  handleUndo,
  handleSave,
  clearAll,
  history,
}: {
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  selectedImage: ImageType | null;
  handleUndo: () => void;
  handleSave: () => void;
  clearAll: () => void;
  history: AnnotationType[][];
}) => {
  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="xl"
      withBorder
      style={{ display: "flex", flexDirection: "row", gap: "4px" }}
    >
      <ActionIcon
        variant={selectedTool === "mouse" ? "filled" : "subtle"}
        size="lg"
        color="gray"
        onClick={() => setSelectedTool("mouse")}
        disabled={!selectedImage || history?.length === 0}
      >
        <MousePointer2 size={18} />
      </ActionIcon>
      <ActionIcon
        variant={selectedTool === "pointer" ? "filled" : "subtle"}
        size="lg"
        color="gray"
        onClick={() => setSelectedTool("pointer")}
        disabled={!selectedImage || history?.length === 0}
      >
        <WandSparkles size={18} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        color="gray"
        onClick={handleUndo}
        disabled={!selectedImage || history?.length === 0}
      >
        <Undo size={18} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        size="lg"
        color="gray"
        disabled={!selectedImage}
        onClick={handleSave}
      >
        <Save size={18} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        color="red"
        size="lg"
        disabled={!selectedImage}
        onClick={clearAll}
      >
        <Trash2 size={18} />
      </ActionIcon>
    </Card>
  );
};

export default ListTool;
