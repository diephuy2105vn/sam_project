import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  MultiSelect,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  type MultiSelectProps,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import {
  Download,
  Home,
  Image,
  Sparkles,
  Tag,
  Trash,
  Upload,
} from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ProjectType } from "../pages/HomePage";
import type { AnnotationType, ImageType } from "../pages/ProjectOnly";
import exportApi from "../services/exportApi";
import imageApi from "../services/imageApi";
import projectApi from "../services/projectApi";
import samApi from "../services/samApi";
import ImageThumbnail from "./ImageThumbnail";

const Slidebar = ({
  projects,
  selectedProject,
  setSelectedProject,
  annotations: _annotations,
  setAnnotations,
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  handleSelectFileUpload,
}: {
  projects: ProjectType[];
  selectedProject: ProjectType | null;
  setSelectedProject: Dispatch<SetStateAction<ProjectType | null>>;
  annotations: AnnotationType[];
  setAnnotations: Dispatch<SetStateAction<AnnotationType[]>>;
  images: ImageType[];
  setImages: Dispatch<SetStateAction<ImageType[]>>;
  selectedImage: ImageType | null;
  setSelectedImage: Dispatch<SetStateAction<ImageType | null>>;
  handleSelectFileUpload: () => void;
}) => {
  const navigator = useNavigate();

  const [loadingBtn, setLoadingBtn] = useState({
    exportProject: false,
    labelWithTextPromt: false,
  });
  const [activeSection, setActiveSection] = useState("images");
  const [labelInput, setLabelInput] = useState<string[]>([]);
  const [labelSerachInput, setLabelSearchInput] = useState("");
  const [prompts, setPrompts] = useState<Record<string, string>>({});

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
    } catch (_err) {
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
          onClick={async (e) => {
            e.stopPropagation();
            if (!selectedProject?.id) return;

            const newLabels = selectedProject.labels?.filter(
              (l) => l != option.value
            );

            await projectApi.updateProject(selectedProject.id, {
              ...selectedProject,
              labels: newLabels,
            });
            setSelectedProject((pre) =>
              pre ? { ...pre, labels: newLabels } : null
            );
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

  const handleUpdateLabels = async () => {
    if (!selectedProject?.id || labelInput.includes(labelSerachInput.trim()))
      return;
    try {
      if (!selectedProject.labels.includes(labelSerachInput.trim())) {
        const newLabels = [...selectedProject.labels, labelSerachInput.trim()];

        await projectApi.updateProject(selectedProject?.id, {
          ...selectedProject,
          labels: newLabels,
        });

        setLabelInput((prev) => [...prev, labelSerachInput.trim()]);

        setSelectedProject((pre) =>
          pre ? { ...pre, labels: newLabels } : null
        );

        setLabelSearchInput("");
      } else {
        setLabelInput((prev) => [...prev, labelSerachInput.trim()]);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        notifications.show({
          title: "Đã có lỗi xảy ra",
          message: err.message,
          color: "red",
          position: "top-right",
        });
      }
    }
  };

  const handleLabelWithTextPrompt = async () => {
    if (!selectedImage || loadingBtn.labelWithTextPromt) return;

    const promptsArray = labelInput.map((label) => prompts[label] || "");

    const hasEmptyPrompt = promptsArray.some(
      (prompt) => !prompt || prompt.length === 0
    );

    if (hasEmptyPrompt) {
      notifications.show({
        color: "yellow",
        title: "Thiếu prompt",
        message: "Vui lòng nhập prompt cho tất cả label trước khi tiếp tục.",
      });
      return;
    }

    setLoadingBtn((prev) => ({ ...prev, labelWithTextPromt: true }));

    const res = await samApi.labelWithTextPrompt({
      image_id: selectedImage.id,
      labels: labelInput,
      prompts: promptsArray,
    });

    const data = res.data;
    if (data?.annotations?.length > 0) {
      setAnnotations((pre) => [...pre, ...data.annotations]);
    }

    setLoadingBtn((prev) => ({ ...prev, labelWithTextPromt: false }));
  };

  const handleExportProject = async () => {
    if (!selectedProject?.id) return;

    setLoadingBtn((prev) => ({ ...prev, exportProject: true }));
    try {
      const res = await exportApi.exportProject(selectedProject.id, {
        responseType: "blob",
      });
      if (res.data) {
        const blob = new Blob([res.data], {
          type: "application/zip",
        });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;

        link.download = `project_${selectedProject.name}.zip`;

        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);

        notifications.show({
          title: "Thành công",
          message: "Xuất project thành công",
          color: "green",
          position: "top-right",
        });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        notifications.show({
          title: "Đã có lỗi xảy ra",
          message: err.message,
          color: "red",
          position: "top-right",
        });
      }
    }

    setLoadingBtn((prev) => ({ ...prev, exportProject: false }));
  };

  return (
    <Card
      radius={0}
      withBorder
      styles={{
        root: {
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          height: "100%",
        },
      }}
    >
      {/* Project Selector Header - Ở trên cùng */}
      <div
        style={{
          borderBottom: "1px solid #2c2e33",
          backgroundColor: "var(--mantine-color-dark-7)",
        }}
      >
        <Flex
          align={"center"}
          justify={"space-between"}
          style={{ height: "60px" }}
        >
          <Link to="/">
            <Button
              variant="subtle"
              size="md"
              style={{
                width: "80px",
              }}
            >
              <Home size={24} />
            </Button>
          </Link>
          <Flex m="sm" gap={8}>
            <Select
              placeholder="Chọn dự án"
              size="sm"
              value={selectedProject?.id?.toString()}
              onChange={(value) => {
                const project = projects.find(
                  (p) => p.id?.toString() === value?.toString()
                );
                if (project) {
                  navigator(`/project/${project.id}`);
                }
              }}
              data={
                projects
                  ? projects?.map((pro) => ({
                      value: pro.id ? pro.id.toString() : "",
                      label: pro.name,
                    }))
                  : []
              }
              searchable
              styles={{
                root: {
                  flex: "1",
                },
                input: {
                  fontWeight: 600,
                },
              }}
            />
            <Button
              onClick={() => {
                handleExportProject();
              }}
              loading={loadingBtn.exportProject}
              size="sm"
              rightSection={<Download size={16} />}
            >
              Export
            </Button>
          </Flex>
        </Flex>
      </div>

      <Flex
        style={{
          flex: "1",
        }}
      >
        {/* Left Sidebar Navigation */}
        <Flex
          direction="column"
          style={{
            borderRight: "1px solid #2c2e33",
            backgroundColor: "var(--mantine-color-gray-9)",
            width: "80px",
          }}
        >
          <Button
            onClick={() => setActiveSection("images")}
            variant={activeSection === "images" ? "filled" : "subtle"}
            size="lg"
            style={{
              borderRadius: "0 8px 8px 0px",
              width: "100%",
              padding: "4px",
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
              width: "100%",
              padding: "4px",
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
          <Flex direction={"column"} style={{ flex: 1 }}>
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
                      onSelect={() => {
                        if (selectedImage?.id === image.id) {
                          return;
                        }

                        setAnnotations([]);
                        setSelectedImage(image);
                      }}
                      onDelete={deleteImage}
                    />
                  ))}
                </Stack>
              )}
            </ScrollArea>
          </Flex>
        ) : (
          <Flex direction={"column"} style={{ flex: 1 }}>
            <div style={{ padding: "16px", borderBottom: "1px solid #2c2e33" }}>
              <Text size="xl" fw={700} mb="md">
                Danh sách nhãn
              </Text>
              <Flex gap="4">
                {selectedProject?.labels.map((label, idx) => (
                  <Badge key={idx} size="sm" variant="dot" color="brand">
                    {label}
                  </Badge>
                ))}
              </Flex>
            </div>

            <Stack gap="md" style={{ flex: 1, padding: "16px", width: "100%" }}>
              <MultiSelect
                variant="filled"
                label={
                  <Text
                    style={{ display: "inline-block", marginBottom: "8px" }}
                    size="sm"
                  >
                    Danh sách nhãn
                  </Text>
                }
                required
                data={selectedProject?.labels ? selectedProject.labels : []}
                value={labelInput ? labelInput : []}
                onChange={(value) => setLabelInput(value)}
                searchValue={labelSerachInput}
                onSearchChange={setLabelSearchInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && labelSerachInput.trim() !== "") {
                    handleUpdateLabels();
                  }
                }}
                renderOption={renderMultiSelectOption}
                placeholder="Enter để thêm nhãn mới"
                hidePickedOptions
                searchable
                size="md"
              />
              <ScrollArea style={{ maxHeight: "50vh" }}>
                {labelInput?.map((label, index) => (
                  <Textarea
                    key={index}
                    required
                    variant="filled"
                    label={
                      <Text
                        style={{ display: "inline-block", marginBottom: "8px" }}
                        size="sm"
                      >
                        Promt xử lý của {label}
                      </Text>
                    }
                    value={prompts[label] ? prompts[label] : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPrompts((prev) => {
                        const next = { ...prev };
                        next[label] = value;
                        return next;
                      });
                    }}
                    rows={3}
                    placeholder="Nhập prompt xử lý"
                  />
                ))}
              </ScrollArea>
              <Button
                leftSection={<Sparkles size={20} />}
                variant="light"
                color="violet"
                fullWidth
                size="md"
                onClick={() => {
                  handleLabelWithTextPrompt();
                }}
                loading={loadingBtn.labelWithTextPromt}
              >
                Tìm đối tượng với AI
              </Button>
            </Stack>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default Slidebar;
