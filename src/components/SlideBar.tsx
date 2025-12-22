import {
  Button,
  Flex,
  Group,
  ScrollArea,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import { Image, Sparkles, Tag, Upload } from "lucide-react";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { ImageType } from "../pages/MainPage";
import ImageThumbnail from "./ImageThumbnail";

const Slidebar = ({
  images,
  setImages,
  selectedImage,
  setSelectedImage,
  handleSelectFileUpload,
}: {
  images: ImageType[];
  setImages: Dispatch<SetStateAction<ImageType[]>>;
  selectedImage: ImageType | null;
  setSelectedImage: (image: ImageType | null) => void;
  handleSelectFileUpload: () => void;
}) => {
  const [activeSection, setActiveSection] = useState("images");

  const deleteImage = (id: number) => {
    setImages((prev: ImageType[]) => prev?.filter((img) => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#1a1b1e",
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
        <Flex
          direction="column"
          style={{
            width: "100%",
            background: "#25262b",
            borderRight: "1px solid #2c2e33",
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

          <ScrollArea style={{ flex: 1, padding: "16px" }}>
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
              <Stack gap="xs">
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
        </Flex>
      ) : (
        <div
          style={{
            width: "100%",
            background: "#25262b",
            borderRight: "1px solid #2c2e33",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <ScrollArea style={{ flex: 1 }}>
            <Group justify="space-between" mb="xs" p="sm">
              <Text size="lg" fw={700}>
                Labels
              </Text>
            </Group>

            <Tabs defaultValue="classes">
              <Tabs.List mb="lg" p={0}>
                <Tabs.Tab value="classes">Labels</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="classes" p="sm">
                <Stack gap="md">
                  <Button
                    leftSection={<Sparkles size={20} />}
                    variant="light"
                    color="violet"
                    fullWidth
                    size="md"
                  >
                    Find Objects with AI
                  </Button>
                </Stack>
              </Tabs.Panel>

              <Tabs.Panel value="layers">
                <Text c="dimmed" ta="center" py="xl">
                  No layers yet
                </Text>
              </Tabs.Panel>
            </Tabs>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Slidebar;
