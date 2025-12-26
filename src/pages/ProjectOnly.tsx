import { AppShell, Button, Flex, Stack, Text } from "@mantine/core";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import ImageAnnotationTool from "../components/ImageAnnotationTool";
import ListTool from "../components/ListTool";
import Slidebar from "../components/SlideBar";
import { useParams } from "react-router-dom";
import imageApi from "../services/imageApi";
import projectApi from "../services/projectApi";
import type { ProjectType } from "./HomePage";

export type ImageType = {
  id: string;
  filename: string;
  url: string;
  file: File;
  uploading?: boolean;
};

export type AnnotationType = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const ProjectOnly = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);
  const [history, setHistory] = useState<AnnotationType[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<ProjectType | null>(null);
  const { projectId } = useParams<{ projectId: string }>();

  const fetchProject = async () => {
    if (!projectId) return;

    const res = await projectApi.getProjectById(projectId);
    setProject(res.data);
  };

  const fetchProjectImages = async () => {
    if (!projectId) return;

    const res = await imageApi.getProjectImages(projectId);
    setImages(res.data);
  };

  const uploadSingleImage = async (image: ImageType) => {
    if (!projectId) return;

    //Call upload and update list images
    const formData = new FormData();

    formData.append("files", image.file);

    try {
      const res = await imageApi.uploadImages(projectId, formData);
      console.log(res);
      const uploadedImages = res.data.images;
      if (uploadedImages.length > 0) {
        setImages((pre) =>
          pre.map((img) => (img.id === image.id ? res.data.images[0] : img))
        );
      }
    } catch (error) {
      console.error("Upload image failed:", error);
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const newImages = files.map((file, index) => ({
      id: Date.now().toString() + index.toString(),
      url: URL.createObjectURL(file as Blob),
      uploading: true,
      file: file,
      filename: file?.name,
    }));

    setImages((prev: ImageType[]) => [...prev, ...newImages]);

    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0]);
    }

    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0]);
    }

    for (const img of newImages) {
      try {
        await uploadSingleImage(img);

        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id
              ? {
                  ...i,
                  uploading: false,
                }
              : i
          )
        );
      } catch {
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id ? { ...i, uploading: false, error: true } : i
          )
        );
      }
    }
  };

  useEffect(() => {
    fetchProject();
    fetchProjectImages();
  }, []);

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

  useEffect(() => {}, []);

  return (
    <AppShell
      navbar={{ width: 400, breakpoint: "sm" }}
      padding="sm"
      styles={{
        main: {
          minHeight: "100vh",
        },
      }}
    >
      <AppShell.Navbar>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <Slidebar
          project={project}
          setProject={setProject}
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
            minHeight: "calc(100vh - 24px)",
            position: "relative",
          }}
        >
          {selectedImage ? (
            <Flex gap="md" direction="column" align="center">
              <ListTool
                selectedTool={selectedTool}
                selectedImage={selectedImage}
                setSelectedTool={setSelectedTool}
                handleUndo={handleUndo}
                handleSave={handleSave}
                clearAll={clearAll}
                history={history}
              />
              <ImageAnnotationTool
                image={selectedImage}
                selectedTool={selectedTool}
                onSave={() => {}}
              />
            </Flex>
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
              right: "8px",
              transform: "translateY(-50%)",
            }}
          ></div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ProjectOnly;
