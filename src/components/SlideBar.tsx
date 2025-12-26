import {
  ActionIcon,
  Button,
  Card,
  Flex,
  Group,
  MultiSelect,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Textarea,
  Badge,
  type MultiSelectProps,
} from "@mantine/core";
import {
  Delete,
  DeleteIcon,
  Image,
  Sparkles,
  Tag,
  Trash,
  Upload,
} from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { ImageType } from "../pages/ProjectOnly";
import ImageThumbnail from "./ImageThumbnail";
import imageApi from "../services/imageApi";
import { notifications } from "@mantine/notifications";
import type { ProjectType } from "../pages/HomePage";
import { IconTrash } from "@tabler/icons-react";

const Slidebar = ({
  project,
  setProject,
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  handleSelectFileUpload,
}: {
  project: ProjectType | null;
  setProject: Dispatch<SetStateAction<ProjectType | null>>;
  images: ImageType[];
  setImages: Dispatch<SetStateAction<ImageType[]>>;
  selectedImage: ImageType | null;
  setSelectedImage: (image: ImageType | null) => void;
  handleSelectFileUpload: () => void;
}) => {
  const [activeSection, setActiveSection] = useState("images");

  const [projectLabels, setProjectLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState<string[]>([]);
  const [labelSerachInput, setLabelSearchInput] = useState("");

  const deleteImage = async (id: string) => {
    try {
      await imageApi.deleteImage(id);
      setImages((prev: ImageType[]) => prev?.filter((img) => img.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
      notifications.show({
        position: "top-right",
        color: "green",
        title: "Xóa ảnh thành công",
        message: "",
      });
    } catch (err) {
      notifications.show({
        position: "top-right",
        color: "red",
        title: "Xóa thất bại",
        message: "Đã có lỗi xảy ra vui lòng thử lại sau",
      });
    }
  };

  const renderMultiSelectOption: MultiSelectProps["renderOption"] = ({
    option,
  }) => {
    return (
      <Flex
        gap="sm"
        justify="space-between"
        align="center"
        style={{ width: "100%" }}
      >
        <Flex justify="start" align="center">
          <Text size="sm">{option.value}</Text>
        </Flex>
        <ActionIcon
          onClick={(e) => {
            e.stopPropagation();
          }}
          size="sm"
          color="red"
          variant="light"
        >
          <Trash size={16} />
        </ActionIcon>
      </Flex>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        color: "white",
      }}
    >
      {/* Left Sidebar Navigation */}
      <Flex
        direction="column"
        gap={12}
        style={{ borderRight: "1px solid #2c2e33", padding: "16px 0" }}
      >
        <Button
          onClick={() => setActiveSection("images")}
          variant={activeSection === "images" ? "filled" : "subtle"}
          size="lg"
          style={{
            borderRadius: "0 8px 8px 0px",
            padding: "4px 20px",
            maxHeight: "auto",
            height: "auto",
          }}
        >
          <Flex direction="column" align="center" gap={6}>
            <Image size={24} />
            <Text size="xs" fw={500}>
              Images
            </Text>
          </Flex>
        </Button>

        <Button
          onClick={() => setActiveSection("labels")}
          variant={activeSection === "labels" ? "filled" : "subtle"}
          size="lg"
          style={{
            borderRadius: "0 8px 8px 0px",
            padding: "4px 20px",
            maxHeight: "auto",
            height: "auto",
          }}
        >
          <Flex direction="column" align="center" gap={6}>
            <Tag size={24} />
            <Text size="xs" fw={500}>
              Labels
            </Text>
          </Flex>
        </Button>
      </Flex>

      {/* Content Panel */}
      {activeSection === "images" ? (
        <Card
          styles={{
            root: {
              width: "100%",
              display: "flex",
              flexDirection: "column",
              padding: 0,
            },
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #2c2e33" }}>
            <Text size="xl" fw={700} mb="md">
              Danh sách ảnh
            </Text>

            <Button
              leftSection={<Upload size={20} />}
              onClick={() => handleSelectFileUpload()}
              fullWidth
              size="md"
            >
              Upload Ảnh
            </Button>
          </div>

          <ScrollArea style={{ flex: 1, padding: "16px", width: "100%" }}>
            <Text size="sm" fw={500} c="dimmed" mb="md">
              Ảnh đã tải ({images.length})
            </Text>

            {images.length === 0 ? (
              <Stack align="center" gap="xs" style={{ padding: "64px 0" }}>
                <Image size={48} color="gray" strokeWidth={1.5} />
                <Text size="sm" c="dimmed">
                  Chưa có ảnh nào
                </Text>
              </Stack>
            ) : (
              <Stack gap="xs" style={{ width: "100%" }}>
                {images.map((image: ImageType) => (
                  <ImageThumbnail
                    key={image.id}
                    image={image}
                    isSelected={selectedImage?.id === image.id}
                    onSelect={() => setSelectedImage(image)}
                    onDelete={deleteImage}
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Card>
      ) : (
        <Card
          styles={{
            root: {
              width: "100%",
              display: "flex",
              flexDirection: "column",
              padding: 0,
            },
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #2c2e33" }}>
            <Text size="xl" fw={700} mb="md">
              Danh sách nhãn
            </Text>
            {project?.labels.map((label, idx) => (
              <Badge key={idx} size="sm" variant="dot" color="gray">
                {label}
              </Badge>
            ))}
          </div>

          <Stack gap="md" style={{ flex: 1, padding: "16px", width: "100%" }}>
            <MultiSelect
              label={
                <Text
                  style={{ display: "inline-block", marginBottom: "8px" }}
                  size="sm"
                >
                  Danh sách nhãn
                </Text>
              }
              required
              data={project?.labels ? project.labels : []}
              value={labelInput ? labelInput : []}
              onChange={(value) => setLabelInput(value)}
              searchValue={labelSerachInput}
              onSearchChange={setLabelSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && labelSerachInput.trim() !== "") {
                  if (labelInput.includes(labelSerachInput.trim())) return;

                  if (!projectLabels.includes(labelSerachInput.trim())) {
                    const newLabels = [
                      ...projectLabels,
                      labelSerachInput.trim(),
                    ];
                    setLabelInput((prev) => [...prev, labelSerachInput.trim()]);
                    setProject((pre) =>
                      pre ? { ...pre, labels: newLabels } : null
                    );
                    setLabelSearchInput("");
                  } else {
                    setLabelInput((prev) => [...prev, labelSerachInput.trim()]);
                  }
                }
              }}
              renderOption={renderMultiSelectOption}
              placeholder="Enter để thêm nhãn mới"
              hidePickedOptions
              searchable
              size="md"
            />
            <Textarea
              label={
                <Text
                  style={{ display: "inline-block", marginBottom: "8px" }}
                  size="sm"
                >
                  Promt xử lý
                </Text>
              }
              rows={5}
              placeholder="Nhập prompt xử lý"
            />
            <Button
              leftSection={<Sparkles size={20} />}
              variant="light"
              color="violet"
              fullWidth
              size="md"
            >
              Tìm đối tượng với AI
            </Button>
          </Stack>
        </Card>
      )}
    </div>
  );
};

export default Slidebar;
