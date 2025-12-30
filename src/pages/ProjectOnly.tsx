import { AppShell, Button, Flex, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ImageAnnotationTool from "../components/ImageAnnotationTool";
import ListTool from "../components/ListTool";
import Slidebar from "../components/SlideBar";
import imageApi from "../services/imageApi";
import projectApi from "../services/projectApi";
import samApi from "../services/samApi";
import type { ProjectType } from "./HomePage";

export type ImageType = {
  id?: string;
  _id: string;
  filename: string;
  url: string;
  file: File;
  uploading?: boolean;
  error?: boolean;
};

// 1️⃣ Point trong mask (tọa độ x, y)
export type Point = [number, number];

// 2️⃣ SAM result
export interface SamResult {
  mask: Point[];
  mask_shape: [number, number];
  success: boolean;
}

// 3️⃣ Prompt data (có thể mở rộng sau)
export interface PromptData {
  text: string;
}

// 4️⃣ Annotation type (nếu sau này có thêm loại khác)
export type AnnotationKind = "text_prompt";

// 5️⃣ Annotation chính
export interface AnnotationType {
  id: number;
  image_id: number;
  label: string;
  annotation_type: AnnotationKind;
  prompt_data: PromptData;
  sam_result: SamResult;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  confidence: number;
  created_at: string; // ISO string
}

const ProjectOnly = () => {
  const [images, setImages] = useState<ImageType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [selectedTool, setSelectedTool] = useState("mouse");
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [annotations, setAnnotations] = useState<AnnotationType[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [project, setProject] = useState<ProjectType | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const fetchProjects = async () => {
    try {
      const res = await projectApi.getProject();

      setProjects(res.data);
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

    const formData = new FormData();

    formData.append("files", image.file);

    const res = await imageApi.uploadImages(projectId, formData);

    const uploadedImages = res.data.images;
    if (uploadedImages.length > 0) {
      return uploadedImages[0];
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    const newImages = files.map((file, index) => ({
      _id: Date.now().toString() + index.toString(),
      url: URL.createObjectURL(file as Blob),
      uploading: true,
      file: file,
      filename: file?.name,
    }));

    setImages((prev: ImageType[]) => [...prev, ...newImages]);

    for (const img of newImages) {
      try {
        const imageUploaded = await uploadSingleImage(img);

        if (!imageUploaded) {
          notifications.show({
            color: "red",
            title: "Đã có lỗi xảy ra",
            message: "Tải lên ảnh không thành công",
            position: "top-right",
          });
          setImages((prev) =>
            prev.map((i) =>
              i._id === img._id
                ? {
                    ...i,
                    error: true,
                    uploading: false,
                  }
                : i
            )
          );
          return;
        }

        setImages((prev) =>
          prev.map((i) =>
            i._id === img._id
              ? {
                  ...imageUploaded,
                  uploading: false,
                }
              : i
          )
        );

        if (!selectedImage) {
          setSelectedImage(imageUploaded);
        }
      } catch {
        notifications.show({
          color: "red",
          title: "Đã có lỗi xảy ra",
          message: "Tải lên ảnh không thành công",
          position: "top-right",
        });
        setImages((prev) =>
          prev.map((i) =>
            i._id === img._id
              ? {
                  ...i,
                  error: true,
                  uploading: false,
                }
              : i
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
    setSelectedImage(null);
  }, [projectId]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUndo = async () => {
    if (annotations.length > 0) {
      const endAnnotation = annotations[annotations.length - 1];

      await samApi.deleteAnnotation(endAnnotation.id.toString());

      setAnnotations((pre) => pre.filter((ann) => ann.id !== endAnnotation.id));
    }
  };

  const clearAll = () => {
    if (annotations.length > 0) {
      annotations.forEach(async (ann) => {
        await samApi.deleteAnnotation(ann.id.toString());
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
          projects={projects}
          selectedProject={project}
          setSelectedProject={setProject}
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
              images={images}
              setImages={setImages}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              selectedImage={selectedImage}
              setSelectedIamge={setSelectedImage}
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
