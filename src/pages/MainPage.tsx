import { AppShell, Button, Stack, Text } from "@mantine/core";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import ImageAnnotationTool from "../components/ImageAnnotationTool";
import ListTool from "../components/ListTool";
import Slidebar from "../components/SlideBar";

export type ImageType = {
  id: number;
  name: string;
  url: string;
};

export type AnnotationType = {
  id: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export default function MainPage() {
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);
  const [history, setHistory] = useState<AnnotationType[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file as Blob),
      file: file,
      name: file?.name,
    }));

    setImages((prev: ImageType[]) => [...prev, ...newImages]);
    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0]);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setAnnotations(previousState);
      setHistory(history.slice(0, -1));
    }
  };

  const clearAll = () => {
    setHistory([...history, annotations]);
    setAnnotations([]);
  };

  const handleSave = () => {};

  return (
    <AppShell
      navbar={{ width: 400, breakpoint: "sm" }}
      padding="md"
      styles={{
        main: {
          backgroundColor: "#1A1B1E",
          minHeight: "100vh",
        },
      }}
    >
      <AppShell.Navbar
        style={{ backgroundColor: "#25262B", borderRight: "1px solid #373A40" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <Slidebar
          images={images}
          setImages={setImages}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          handleSelectFileUpload={() => {
            fileInputRef.current?.click();
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "calc(100vh - 32px)",
            padding: "20px",
            position: "relative",
          }}
        >
          {selectedImage ? (
            <ImageAnnotationTool
              imageUrl={selectedImage.url}
              onSave={() => {}}
            />
          ) : (
            <Stack align="center" gap="md">
              <IconPhoto size={80} color="#5C5F66" />
              <Text size="xl" c="dimmed">
                Chọn một ảnh để bắt đầu
              </Text>
              <Button
                leftSection={<IconUpload size={20} />}
                onClick={() => fileInputRef.current?.click()}
                variant="light"
                size="lg"
              >
                Upload Ảnh Ngay
              </Button>
            </Stack>
          )}
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
            }}
          >
            <ListTool
              selectedTool={selectedTool}
              selectedImage={selectedImage}
              setSelectedTool={setSelectedTool}
              handleUndo={handleUndo}
              handleSave={handleSave}
              clearAll={clearAll}
              history={history}
            />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
