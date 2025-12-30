import {
  ActionIcon,
  Button,
  Card,
  Flex,
  Image,
  Popover,
  Progress,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
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
  onDelete: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card
      withBorder
      onClick={onSelect}
      styles={{
        root: {
          position: "relative",
          cursor: "pointer",
          border: isSelected ? "1px solid #6366F1" : "",
          borderRadius: "8px",
          overflow: "hidden",
          transition: "all 0.2s",

          width: "100%",
          padding: "0",
        },
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
        src={`https://api-label.tado.vn/api/images/${image.id}`}
        alt={image.filename}
        height={120}
        fit="cover"
        style={{ width: "100%" }}
      />

      <Text
        size="xs"
        p="xs"
        style={{
          maxWidth: "280px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {image.filename}
      </Text>
      <Popover
        width={220}
        position="top-end"
        opened={isOpen}
        onChange={setIsOpen}
        withArrow
        shadow="md"
      >
        <Popover.Target>
          <ActionIcon
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            color="red"
            variant="filled"
            size="md"
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              opacity: 0.9,
            }}
          >
            <IconTrash size={14} />
          </ActionIcon>
        </Popover.Target>
        <Popover.Dropdown
          p="xs"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Text size="sm" c="red" fw="500" style={{ marginBottom: "8px" }}>
            Xác nhận xóa
          </Text>
          <Text size="xs" style={{ marginBottom: "8px" }}>
            Hành động này không thể khôi phục xác nhận xóa
          </Text>
          <Flex justify="end" gap="xs">
            <Button
              size="xs"
              color="gray"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
            >
              Xác nhận
            </Button>
          </Flex>
        </Popover.Dropdown>
      </Popover>
    </Card>
  );
};

export default ImageThumbnail;
