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
import samApi from "../services/samApi";
import { notifications } from "@mantine/notifications";
import axios from "axios";

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
  const [selectedTool, setSelectedTool] = useState("mouse");
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);
  const [history, setHistory] = useState<AnnotationType[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<ProjectType | null>(null);
  const { projectId } = useParams<{ projectId: string }>();

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      const res = await projectApi.getProjectById(projectId);

      setProject(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: err.response?.data?.message || err.message,
          position: "top-right",
        });
      } else {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: "Lỗi không xác định",
          position: "top-right",
        });
      }
    }
  };

  const fetchProjectImages = async () => {
    if (!projectId) return;
    try {
      const res = await imageApi.getProjectImages(projectId);

      setImages(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: err.response?.data?.message || err.message,
          position: "top-right",
        });
      } else {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: "Lỗi không xác định",
          position: "top-right",
        });
      }
    }
  };

  const fetchAnnotations = async () => {
    if (!selectedImage?.id) return;
    try {
      const res = await samApi.getImageAnnotations(selectedImage?.id);

      setAnnotations(res.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: err.response?.data?.message || err.message,
          position: "top-right",
        });
      } else {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: "Lỗi không xác định",
          position: "top-right",
        });
      }
    }
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
    if (selectedImage) {
      fetchAnnotations();
    }
  }, [selectedImage]);

  useEffect(() => {
    fetchProject();
    fetchProjectImages();
  }, [projectId]);

  const handleUndo = async () => {
    if (annotations.length > 0) {
      const endAnnotation = annotations[annotations.length - 1];

      await samApi.deleteAnnotation(endAnnotation.id);

      setAnnotations((pre) => pre.filter((ann) => ann.id !== endAnnotation.id));
    }
  };

  const clearAll = () => {
    if (annotations.length > 0) {
      annotations.forEach(async (ann) => {
        await samApi.deleteAnnotation(ann.id);
      });

      setAnnotations([]);
    }
  };

  const handleSave = () => {};

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
          annotations={annotations}
          setAnnotations={setAnnotations}
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
            height: "calc(100vh - 32px)",
            position: "relative",
          }}
        >
          {selectedImage ? (
            <Flex
              gap="md"
              direction="column"
              align="center"
              style={{ width: "100%", height: "100%" }}
            >
              <ImageAnnotationTool
                project={project}
                setProject={setProject}
                annotations={annotations}
                setAnnotations={setAnnotations}
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
          >
            <ListTool
              selectedTool={selectedTool}
              selectedImage={selectedImage}
              setSelectedTool={setSelectedTool}
              handleUndo={handleUndo}
              handleSave={handleSave}
              clearAll={clearAll}
              annotations={annotations}
              setAnnotations={setAnnotations}
            />
          </div>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ProjectOnly;
