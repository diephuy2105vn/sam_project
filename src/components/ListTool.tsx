import { ActionIcon, Card, Tooltip } from "@mantine/core";
import { MousePointer2, Save, Trash2, Undo, WandSparkles } from "lucide-react";
import type { AnnotationType, ImageType } from "../pages/ProjectOnly";
import type { Dispatch, SetStateAction } from "react";

const ListTool = ({
  selectedTool,
  setSelectedTool,
  selectedImage,
  annotations,
  setAnnotations,
  handleUndo,
  clearAll,
}: {
  selectedTool: string;
  setSelectedTool: Dispatch<SetStateAction<string>>;
  annotations: AnnotationType[];
  setAnnotations: Dispatch<SetStateAction<AnnotationType[]>>;
  selectedImage: ImageType | null;
  handleUndo: () => void;
  handleSave: () => void;
  clearAll: () => void;
}) => {
  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="xl"
      withBorder
      style={{ display: "flex", flexDirection: "column", gap: "4px" }}
    >
      <ActionIcon
        variant={selectedTool === "mouse" ? "filled" : "subtle"}
        size="lg"
        onClick={() => setSelectedTool("mouse")}
        disabled={!selectedImage}
      >
        <MousePointer2 size={18} />
      </ActionIcon>
      <ActionIcon
        variant={selectedTool === "magic" ? "filled" : "subtle"}
        size="lg"
        onClick={() => setSelectedTool("magic")}
        disabled={!selectedImage}
      >
        <WandSparkles size={18} />
      </ActionIcon>

      <Tooltip label="Khôi phục" color="gray">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={handleUndo}
          disabled={!selectedImage || annotations?.length <= 0}
        >
          <Undo size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Xóa tất cả" color="red">
        <ActionIcon
          variant="subtle"
          color="red"
          size="lg"
          onClick={clearAll}
          disabled={!selectedImage || annotations?.length <= 0}
        >
          <Trash2 size={18} />
        </ActionIcon>
      </Tooltip>
    </Card>
  );
};

export default ListTool;
