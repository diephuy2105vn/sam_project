import {
  ActionIcon,
  Button,
  Card,
  Flex,
  Image,
  Select,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { ChevronsLeft, ChevronsRight, Trash } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ProjectType } from "../pages/HomePage";
import type { AnnotationType, ImageType } from "../pages/ProjectOnly";
import projectApi from "../services/projectApi";
import samApi from "../services/samApi";

type BoundingBoxType = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
};

type ResizeHandle = "nw" | "ne" | "sw" | "se" | null;

const ImageAnnotationTool = ({
  project,
  setProject,
  image,
  annotations,
  setAnnotations,
  selectedTool,
}: {
  project: ProjectType | null;
  setProject: Dispatch<SetStateAction<ProjectType | null>>;
  image: ImageType;
  annotations: AnnotationType[];
  setAnnotations: Dispatch<SetStateAction<AnnotationType[]>>;
  selectedTool: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [labelInput, setLabelInput] = useState<string | null>("");
  const [labelSerachInput, setLabelSearchInput] = useState("");

  const [labelInputDrawBox, setLabelInputDrawBox] = useState<string | null>("");
  const [labelSerachInputDrawBox, setLabelSearchInputDrawBox] = useState("");

  const [updatingAnnotation, setUpdatingAnnotation] =
    useState<AnnotationType | null>(null);
  const [isUpdateLabel, setIsUpdateLabel] = useState<boolean>(false);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [boundingBoxAnnotations, setBoundingBoxAnnotations] = useState<
    Array<BoundingBoxType>
  >([]);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pointToLabel, setPointToLabel] = useState<number[][]>([]);

  // States for resizing
  const [resizingBox, setResizingBox] = useState<string | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [originalBox, setOriginalBox] = useState<BoundingBoxType | null>(null);

  // States for drawing new bbox
  const [isLabelDrawing, setIsLabelDrawing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [currentDrawBox, setCurrentDrawBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleUpdateLabels = async () => {
    if (!project?.id || labelInput?.includes(labelSerachInput.trim())) return;
    try {
      if (!project.labels.includes(labelSerachInput.trim())) {
        const newLabels = [...project.labels, labelSerachInput.trim()];

        await projectApi.updateProject(project?.id, {
          ...project,
          labels: newLabels,
        });

        setLabelInput(labelSerachInput.trim());

        setProject((pre) => (pre ? { ...pre, labels: newLabels } : null));

        setLabelSearchInput("");
      } else {
        setLabelInput(labelSerachInput.trim());
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

  const handleUpdateLabelsDrawBox = async () => {
    if (!project?.id || labelInput?.includes(labelSerachInput.trim())) return;
    try {
      if (!project.labels.includes(labelSerachInput.trim())) {
        const newLabels = [...project.labels, labelSerachInput.trim()];

        await projectApi.updateProject(project?.id, {
          ...project,
          labels: newLabels,
        });

        setLabelInput(labelSerachInput.trim());

        setProject((pre) => (pre ? { ...pre, labels: newLabels } : null));

        setLabelSearchInput("");
      } else {
        setLabelInput(labelSerachInput.trim());
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
    if (pointToLabel.length <= 0 || !labelInput?.trim()) {
      notifications.show({
        title: "Thông tin chưa hợp lệ",
        message: "Vui lòng chọn nhãn và vị trí trên ảnh",
        color: "red",
        position: "top-right",
      });
      return;
    }

    const data = {
      image_id: image.id,
      points: pointToLabel,
      point_labels: Array(pointToLabel.length).fill(1),
      label: labelInput,
    };

    const res = await samApi.labelWithPointPrompt(data);

    if (res.data.annotations) {
      setAnnotations((pre) => [...pre, ...res.data.annotations]);
    }
    clearPoints();
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "magic") return;

    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const img = imageRef.current;
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - img.naturalWidth * scale) / 2;
    const offsetY = (canvas.height - img.naturalHeight * scale) / 2;

    const originalX = (clickX - offsetX) / scale;
    const originalY = (clickY - offsetY) / scale;

    if (
      originalX >= 0 &&
      originalX <= img.naturalWidth &&
      originalY >= 0 &&
      originalY <= img.naturalHeight
    ) {
      const point = [Math.round(originalX), Math.round(originalY)];

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const canvasX = point[0] * scale + offsetX;
      const canvasY = point[1] * scale + offsetY;

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      setPointToLabel((pre) => [...pre, point]);
    }
  };

  const getCursorStyle = () => {
    if (selectedTool === "magic") {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>`;
      const encodedSvg = encodeURIComponent(svg);
      return `url("data:image/svg+xml,${encodedSvg}") 12 12, auto`;
    }
    return "auto";
  };

  const clearPoints = () => {
    setPointToLabel([]);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current;
    if (!canvas || !container || !image || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - img.width * scale) / 2;
    const offsetY = (canvas.height - img.height * scale) / 2;
    annotations.forEach((annotation) => {
      if (
        (annotation.sam_result?.mask && annotation.sam_result.success) ||
        (annotation.bbox && annotation.bbox.length >= 4)
      ) {
        const mask =
          annotation?.sam_result?.mask ?? bboxToMask(annotation.bbox);

        ctx.beginPath();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";

        mask.forEach((point: number[], index: number) => {
          const x = point[0] * scale + offsetX;
          const y = point[1] * scale + offsetY;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });

        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
  };

  const handleUpdateLabelBox = async () => {
    try {
      if (!updatingAnnotation) return;

      const response = await samApi.updateAnnotation(
        updatingAnnotation.id.toString(),
        {
          bbox: updatingAnnotation.bbox,
          label: labelInputDrawBox,
        },
      );

      const updatedAnnotation = response.data;

      setAnnotations((prev) =>
        prev.map((ann) =>
          ann.id.toString() === updatedAnnotation.id.toString()
            ? updatedAnnotation
            : ann,
        ),
      );
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

    setIsUpdateLabel(false);
    setUpdatingAnnotation(null);
  };

  // Handle resize move - SỬA LẠI
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingBox || !resizeHandle || !resizeStart || !originalBox) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - resizeStart.x;
    const dy = currentY - resizeStart.y;

    setBoundingBoxAnnotations((prev) =>
      prev.map((box) => {
        if (box.id !== resizingBox) return box;

        const newBox = { ...box };

        switch (resizeHandle) {
          case "nw": // Top-left
            newBox.x = originalBox.x + dx;
            newBox.y = originalBox.y + dy;
            newBox.width = originalBox.width - dx;
            newBox.height = originalBox.height - dy;
            break;
          case "ne": // Top-right
            newBox.y = originalBox.y + dy;
            newBox.width = originalBox.width + dx;
            newBox.height = originalBox.height - dy;
            break;
          case "sw": // Bottom-left
            newBox.x = originalBox.x + dx;
            newBox.width = originalBox.width - dx;
            newBox.height = originalBox.height + dy;
            break;
          case "se": // Bottom-right
            newBox.width = originalBox.width + dx;
            newBox.height = originalBox.height + dy;
            break;
        }

        // Ensure minimum size
        const minSize = 20;
        if (newBox.width < minSize) {
          newBox.width = minSize;
          if (resizeHandle === "nw" || resizeHandle === "sw") {
            newBox.x = originalBox.x + originalBox.width - minSize;
          }
        }
        if (newBox.height < minSize) {
          newBox.height = minSize;
          if (resizeHandle === "nw" || resizeHandle === "ne") {
            newBox.y = originalBox.y + originalBox.height - minSize;
          }
        }

        return newBox;
      }),
    );
  };

  function convertBoxToImageBox(box: BoundingBoxType) {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return null;

    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;

    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - img.naturalWidth * scale) / 2;
    const offsetY = (canvas.height - img.naturalHeight * scale) / 2;

    // Quy ngược từ canvas về ảnh gốc
    let imgX = (box.x - offsetX) / scale;
    let imgY = (box.y - offsetY) / scale;
    let imgW = box.width / scale;
    let imgH = box.height / scale;

    // (Optional) Clamp cho không vượt ảnh
    imgX = Math.max(0, Math.min(imgX, img.width));
    imgY = Math.max(0, Math.min(imgY, img.height));
    imgW = Math.max(0, Math.min(imgW, img.width - imgX));
    imgH = Math.max(0, Math.min(imgH, img.height - imgY));

    return {
      x: imgX,
      y: imgY,
      width: imgW,
      height: imgH,
    };
  }

  const handleLabelWithDrawnBox = async () => {
    if (!currentDrawBox || !labelInputDrawBox?.trim()) {
      return;
    }

    try {
      const bbox = convertBoxToImageBox({
        id: "temp",
        ...currentDrawBox,
        label: labelInputDrawBox,
      });

      if (!bbox) return;

      const response = await samApi.createAnnotation({
        image_id: image.id,
        bbox: [bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height],
        label: labelInputDrawBox || "unknown",
      });

      setAnnotations((prev) => [...prev, response.data]);

      setIsLabelDrawing(false);
      setDrawStart(null);
      setCurrentDrawBox(null);
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

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "mouse" || isLabelDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDrawBox({ x, y, width: 0, height: 0 });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || selectedTool !== "mouse") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = currentX - drawStart.x;
    const height = currentY - drawStart.y;

    setCurrentDrawBox({
      x: width < 0 ? currentX : drawStart.x,
      y: height < 0 ? currentY : drawStart.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  // Handle drawing bbox - Mouse Up
  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentDrawBox || selectedTool !== "mouse") return;

    // Chỉ tạo bbox nếu kích thước đủ lớn
    if (currentDrawBox.width > 10 && currentDrawBox.height > 10) {
      // Reset drawing state
      setIsDrawing(false);
      setIsLabelDrawing(true);
    } else {
      setCurrentDrawBox(null);
      setIsDrawing(false);
    }
  };

  // Handle resize start
  const handleResizeStart = (
    e: React.MouseEvent,
    boxId: string,
    handle: ResizeHandle,
  ) => {
    e.stopPropagation();
    const box = boundingBoxAnnotations.find((b) => b.id === boxId);
    if (!box) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    setResizingBox(boxId);
    setResizeHandle(handle);
    setResizeStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOriginalBox({ ...box });
  };

  // Handle resize end
  const handleResizeEnd = async () => {
    if (!resizingBox || !originalBox) return;

    const updatedBox = boundingBoxAnnotations.find((b) => b.id === resizingBox);

    if (updatedBox) {
      const bbox = convertBoxToImageBox(updatedBox);

      if (!bbox) return;

      const response = await samApi.updateAnnotation(updatedBox.id, {
        bbox: [bbox.x, bbox.y, bbox.x + bbox.width, bbox.y + bbox.height],
        label: updatedBox.label || "unknown",
      });

      const updatedAnnotation = response.data;

      setAnnotations((prev) =>
        prev.map((ann) =>
          ann.id.toString() === updatedAnnotation.id.toString()
            ? updatedAnnotation
            : ann,
        ),
      );
    }

    setResizingBox(null);
    setResizeHandle(null);
    setResizeStart(null);
    setOriginalBox(null);
  };

  const handleDeleteAnnotation = async (id: string) => {
    await samApi.deleteAnnotation(id);
    setAnnotations((prev) =>
      prev.filter((ann) => ann.id.toString() !== id.toString()),
    );
  };

  // Update useEffect - THÊM DEPENDENCIES
  useEffect(() => {
    if (resizingBox) {
      window.addEventListener("mousemove", handleResizeMove);
      window.addEventListener("mouseup", handleResizeEnd);
      return () => {
        window.removeEventListener("mousemove", handleResizeMove);
        window.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [
    resizingBox,
    resizeHandle,
    resizeStart,
    originalBox,
    boundingBoxAnnotations, // THÊM dependency này
  ]);
  const bboxToMask = (bbox: number[]): number[][] => {
    if (!bbox || bbox.length < 4) return [];

    const [x, y, x2, y2] = bbox;

    // Tạo các điểm góc của hình chữ nhật (theo chiều kim đồng hồ)
    return [
      [x, y], // Góc trên trái
      [x2, y], // Góc trên phải
      [x2, y2], // Góc dưới phải
      [x, y2], // Góc dưới trái
    ];
  };

  // Draw annotations on canvas or calculate positions for point mode
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new window.Image();
    img.onload = () => {
      imageRef.current = img;
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.min(scaleX, scaleY);

      const offsetX = (canvas.width - img.width * scale) / 2;
      const offsetY = (canvas.height - img.height * scale) / 2;

      if (selectedTool === "mouse") {
        const boundingBoxs: BoundingBoxType[] = [];

        annotations
          .filter((ann) => ann.bbox && ann.bbox.length >= 4)
          .map((annotation) => {
            const [imgX, imgY, imgX2, imgY2] = annotation.bbox;

            boundingBoxs.push({
              id: annotation.id.toString(),
              x: imgX * scale + offsetX,
              y: imgY * scale + offsetY,
              width: (imgX2 - imgX) * scale,
              height: (imgY2 - imgY) * scale,
              label: annotation.label,
            });
          });
        setBoundingBoxAnnotations(boundingBoxs);
      } else {
        annotations.forEach((annotation) => {
          if (
            (annotation.sam_result?.mask && annotation.sam_result.success) ||
            (annotation.bbox && annotation.bbox.length >= 4)
          ) {
            const mask =
              annotation.sam_result.mask ?? bboxToMask(annotation.bbox);

            ctx.beginPath();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.fillStyle = "rgba(59, 130, 246, 0.2)";

            mask.forEach((point: number[], index: number) => {
              const x = point[0] * scale + offsetX;
              const y = point[1] * scale + offsetY;

              if (index === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            });

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        });
      }
    };
    img.src = `https://api-label.tado.vn/api/images/${image?.id}`;
  }, [annotations, image, selectedTool, containerSize]);

  useEffect(() => {
    setPointToLabel([]);

    if (selectedTool === "magic") {
      setIsCollapsed(false);
    }
  }, [selectedTool, image]);

  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Flex
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        userSelect: "none",
      }}
    >
      <Card
        withBorder
        ref={containerRef}
        style={{
          position: "relative",
          padding: "0",
          flex: "1",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: getCursorStyle(),
          userSelect: "none",
        }}
      >
        {image && (
          <>
            <canvas
              onClick={(e) => {
                handleCanvasClick(e);
              }}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                userSelect: "none",
              }}
            />
            <Image
              fit="contain"
              style={{
                width: "100%",
                height: "100%",
                userSelect: "none",
                pointerEvents: "none",
              }}
              src={`https://api-label.tado.vn/api/images/${image?.id}`}
            />

            {/* Bounding boxes with resize handles */}
            {selectedTool === "mouse" &&
              boundingBoxAnnotations.map((box) => (
                <div key={box.id} style={{ userSelect: "none" }}>
                  {/* Main bounding box */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                      border: "2px solid #3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      borderRadius: "4px",
                      zIndex: "10",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    <Flex
                      style={{
                        padding: "2px 4px",
                        position: "absolute",
                        top: "0",
                        left: "0",
                        userSelect: "none",
                        pointerEvents: "auto", // THÊM DÒNG NÀY - cho phép sự kiện chuột
                        cursor: "pointer", // THÊM DÒNG NÀY - hiển thị con trỏ khi hover
                      }}
                      bg={"brand"}
                      color="brand"
                      onClick={(e) => {
                        console.log(e);
                        setIsUpdateLabel(true);
                        setUpdatingAnnotation(
                          annotations.find(
                            (a) => a?.id.toString() === box?.id,
                          ) ?? null,
                        );
                        setLabelInputDrawBox(box.label);
                      }}
                    >
                      <Text size="xs" style={{ userSelect: "none" }}>
                        {box.label}
                      </Text>
                    </Flex>
                  </div>

                  {/* Resize handles */}
                  {/* Top-left */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, box.id, "nw")}
                    style={{
                      position: "absolute",
                      left: `${box.x - 4}px`,
                      top: `${box.y - 4}px`,
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#3b82f6",
                      border: "2px solid white",
                      borderRadius: "50%",
                      cursor: "nw-resize",
                      zIndex: "2",
                      userSelect: "none",
                    }}
                  />

                  {/* Top-right */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, box.id, "ne")}
                    style={{
                      position: "absolute",
                      left: `${box.x + box.width - 4}px`,
                      top: `${box.y - 4}px`,
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#3b82f6",
                      border: "2px solid white",
                      borderRadius: "50%",
                      cursor: "ne-resize",
                      zIndex: "2",
                      userSelect: "none",
                    }}
                  />

                  {/* Bottom-left */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, box.id, "sw")}
                    style={{
                      position: "absolute",
                      left: `${box.x - 4}px`,
                      top: `${box.y + box.height - 4}px`,
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#3b82f6",
                      border: "2px solid white",
                      borderRadius: "50%",
                      cursor: "sw-resize",
                      zIndex: "2",
                      userSelect: "none",
                    }}
                  />

                  {/* Bottom-right */}
                  <div
                    onMouseDown={(e) => handleResizeStart(e, box.id, "se")}
                    style={{
                      position: "absolute",
                      left: `${box.x + box.width - 4}px`,
                      top: `${box.y + box.height - 4}px`,
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#3b82f6",
                      border: "2px solid white",
                      borderRadius: "50%",
                      cursor: "se-resize",
                      zIndex: "2",
                      userSelect: "none",
                    }}
                  />

                  {/* Delete button */}
                  <ActionIcon
                    style={{
                      position: "absolute",
                      left: `${box.x + box.width}px`,
                      top: `${box.y}px`,
                      zIndex: "1000",
                      transform: "translateX(-100%)",
                      userSelect: "none",
                    }}
                    radius={0}
                    color="red"
                    size={"xs"}
                    onClick={() => {
                      handleDeleteAnnotation(box.id);
                    }}
                  >
                    <Trash size={14} />
                  </ActionIcon>
                </div>
              ))}
            {(isDrawing || isLabelDrawing) && currentDrawBox && (
              <div style={{ userSelect: "none" }}>
                <div
                  style={{
                    position: "absolute",
                    left: `${currentDrawBox.x}px`,
                    top: `${currentDrawBox.y}px`,
                    width: `${currentDrawBox.width}px`,
                    height: `${currentDrawBox.height}px`,
                    border: "2px solid #3b82f6",
                    backgroundColor: "rgba(59, 130, 246, 0.2)",
                    borderRadius: "4px",
                    zIndex: "1",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              </div>
            )}
          </>
        )}

        {selectedTool === "mouse" && isLabelDrawing && (
          <Card
            withBorder
            p="0"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              overflow: "hidden",
              transition: "all 0.2s ease",
              userSelect: "none",
            }}
          >
            <Flex style={{ height: "128px", userSelect: "none" }}>
              <Flex p="sm" direction="column" style={{ userSelect: "none" }}>
                <Text
                  size="sm"
                  mb={8}
                  c="brand"
                  fw={500}
                  style={{ userSelect: "none" }}
                >
                  Gắn nhãn vùng chọn
                </Text>

                <Select
                  data={project?.labels ? project.labels : []}
                  value={labelInputDrawBox}
                  onChange={(value) => setLabelInputDrawBox(value)}
                  searchValue={labelSerachInputDrawBox}
                  onSearchChange={setLabelSearchInputDrawBox}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      labelSerachInputDrawBox.trim() !== ""
                    ) {
                      handleUpdateLabelsDrawBox();
                    }
                  }}
                  placeholder="Chọn hoặc nhập nhãn mới"
                  searchable
                  size="sm"
                  style={{ userSelect: "none" }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "8px",
                    userSelect: "none",
                  }}
                >
                  <Button
                    onClick={() => {
                      setIsLabelDrawing(false);
                      setDrawStart(null);
                      setCurrentDrawBox(null);
                    }}
                    size="xs"
                    color="gray"
                    fullWidth
                    style={{ userSelect: "none" }}
                  >
                    Xóa vùng
                  </Button>

                  <Button
                    onClick={handleLabelWithDrawnBox}
                    size="xs"
                    color="brand"
                    fullWidth
                    disabled={
                      currentDrawBox === null || !labelInputDrawBox?.trim()
                    }
                    style={{ userSelect: "none" }}
                  >
                    Gán nhãn
                  </Button>
                </div>
              </Flex>
            </Flex>
          </Card>
        )}

        {selectedTool === "mouse" && isUpdateLabel && (
          <Card
            withBorder
            p="0"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              overflow: "hidden",
              transition: "all 0.2s ease",
              userSelect: "none",
            }}
          >
            <Flex style={{ height: "128px", userSelect: "none" }}>
              <Flex p="sm" direction="column" style={{ userSelect: "none" }}>
                <Text
                  size="sm"
                  mb={8}
                  c="brand"
                  fw={500}
                  style={{ userSelect: "none" }}
                >
                  Gắn nhãn vùng chọn
                </Text>

                <Select
                  data={project?.labels ? project.labels : []}
                  value={labelInputDrawBox}
                  onChange={(value) => setLabelInputDrawBox(value)}
                  searchValue={labelSerachInputDrawBox}
                  onSearchChange={setLabelSearchInputDrawBox}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      labelSerachInputDrawBox.trim() !== ""
                    ) {
                      handleUpdateLabelsDrawBox();
                    }
                  }}
                  placeholder="Chọn hoặc nhập nhãn mới"
                  searchable
                  size="sm"
                  style={{ userSelect: "none" }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "8px",
                    userSelect: "none",
                  }}
                >
                  <Button
                    onClick={() => {
                      setIsUpdateLabel(false);
                      setUpdatingAnnotation(null);
                    }}
                    size="xs"
                    color="gray"
                    fullWidth
                    style={{ userSelect: "none" }}
                  >
                    Hủy
                  </Button>

                  <Button
                    onClick={handleUpdateLabelBox}
                    size="xs"
                    color="brand"
                    fullWidth
                    disabled={!labelInputDrawBox?.trim()}
                    style={{ userSelect: "none" }}
                  >
                    Cập nhật
                  </Button>
                </div>
              </Flex>
            </Flex>
          </Card>
        )}

        {/* Label input panel */}
        {selectedTool === "magic" && (
          <Card
            withBorder
            p="0"
            style={{
              position: "absolute",
              bottom: 10,
              right: 0,
              zIndex: 10,
              width: !isCollapsed ? "250px" : "28px",
              overflow: "hidden",
              transition: "all 0.2s ease",
              userSelect: "none",
            }}
          >
            <Flex style={{ height: "128px", userSelect: "none" }}>
              <ActionIcon
                style={{ height: "100%", flex: "1", userSelect: "none" }}
                radius="0"
                onClick={() => {
                  setIsCollapsed((pre) => !pre);
                }}
                variant="light"
                color="gray"
              >
                {isCollapsed ? <ChevronsLeft /> : <ChevronsRight />}
              </ActionIcon>
              <Flex p="sm" direction="column" style={{ userSelect: "none" }}>
                <Text
                  size="sm"
                  mb={8}
                  c="brand"
                  fw={500}
                  style={{ userSelect: "none" }}
                >
                  Gắn nhãn điểm đã chọn
                </Text>

                <Select
                  data={project?.labels ? project.labels : []}
                  value={labelInput}
                  onChange={(value) => setLabelInput(value)}
                  searchValue={labelSerachInput}
                  onSearchChange={setLabelSearchInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && labelSerachInput.trim() !== "") {
                      handleUpdateLabels();
                    }
                  }}
                  placeholder="Chọn hoặc nhập nhãn mới"
                  searchable
                  size="sm"
                  style={{ userSelect: "none" }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    marginTop: "8px",
                    userSelect: "none",
                  }}
                >
                  <Button
                    onClick={() => {
                      setLabelInput("");
                      clearPoints();
                    }}
                    size="xs"
                    color="gray"
                    fullWidth
                    style={{ userSelect: "none" }}
                  >
                    Xóa điểm
                  </Button>

                  <Button
                    onClick={handleLabelWithTextPrompt}
                    size="xs"
                    color="brand"
                    fullWidth
                    disabled={pointToLabel.length <= 0}
                    style={{ userSelect: "none" }}
                  >
                    Gán nhãn
                  </Button>
                </div>
              </Flex>
            </Flex>
          </Card>
        )}
      </Card>
    </Flex>
  );
};

export default ImageAnnotationTool;
