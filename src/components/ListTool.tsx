import { ActionIcon, Card, Tooltip } from "@mantine/core";
import {
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  Trash2,
  Undo,
  WandSparkles,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { AnnotationType, ImageType } from "../pages/ProjectOnly";

const ListTool = ({
  images,
  setImages: _setImages,
  selectedTool,
  setSelectedTool,
  selectedImage,
  setSelectedIamge,
  annotations,
  setAnnotations: _setAnnotations,
  handleUndo,
  clearAll,
}: {
  images: ImageType[];
  setImages: Dispatch<SetStateAction<ImageType[]>>;
  selectedTool: string;
  setSelectedTool: Dispatch<SetStateAction<string>>;
  annotations: AnnotationType[];
  setAnnotations: Dispatch<SetStateAction<AnnotationType[]>>;
  selectedImage: ImageType | null;
  setSelectedIamge: Dispatch<SetStateAction<ImageType | null>>;
  handleUndo: () => void;
  handleSave: () => void;
  clearAll: () => void;
}) => {
  const currentIndex = images.findIndex((img) => img.id === selectedImage?.id);

  const isFirst = currentIndex <= 0;
  const isLast = currentIndex === images.length - 1;
  const handleNextImage = () => {
    if (isLast) return;
    setSelectedIamge(images[currentIndex + 1]);
  };

  const handlePrevImage = () => {
    if (isFirst) return;
    setSelectedIamge(images[currentIndex - 1]);
  };

  return (
    <Card
      shadow="sm"
      padding="xs"
      radius="xl"
      withBorder
      style={{ display: "flex", flexDirection: "column", gap: "4px" }}
    >
      <Tooltip
        label="Ảnh tiếp theo"
        color="gray"
        disabled={!selectedImage || isLast}
      >
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={handleNextImage}
          disabled={!selectedImage || isLast}
        >
          <ChevronRight size={18} />
        </ActionIcon>
      </Tooltip>

      <Tooltip
        label="Ảnh trước"
        color="gray"
        disabled={!selectedImage || isFirst}
      >
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={handlePrevImage}
          disabled={!selectedImage || isFirst}
        >
          <ChevronLeft size={18} />
        </ActionIcon>
      </Tooltip>
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
