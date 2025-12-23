import { ActionIcon, Image, Progress, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { ImageType } from "../pages/ProjectOnly";
const ImageThumbnail = ({
  image,
  isSelected,
  onSelect,
  onDelete,
}: {
  image: ImageType;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        cursor: "pointer",
        border: isSelected ? "2px solid #6366F1" : "2px solid transparent",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "all 0.2s",
        width: "100%",
      }}
    >
      {/* Progress bar */}
      {image.uploading && (
        <Progress
          value={100}
          striped
          animated
          size="xs"
          color="violet"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      )}
      <Image
        src={image.url}
        alt={image.name}
        height={120}
        fit="cover"
        style={{ width: "100%" }}
      />
      <Text size="xs" p="xs" c="dimmed" truncate>
        {image.name}
      </Text>
      <ActionIcon
        color="red"
        variant="filled"
        size="md"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(image.id);
        }}
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          opacity: 0.9,
        }}
      >
        <IconTrash size={14} />
      </ActionIcon>
    </div>
  );
};

export default ImageThumbnail;
