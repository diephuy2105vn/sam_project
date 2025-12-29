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

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  // Calculate scaled positions for annotations
  const [boundingBoxAnnotations, setBoundingBoxAnnotations] = useState<
    Array<BoundingBoxType>
  >([]);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [pointToLabel, setPointToLabel] = useState<number[][]>([]);

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

  // Cập nhật handleCanvasClick
  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "magic") return;

    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Tính toán tọa độ gốc trên ảnh
    const img = imageRef.current;
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvas.width - img.naturalWidth * scale) / 2;
    const offsetY = (canvas.height - img.naturalHeight * scale) / 2;

    // Chuyển đổi từ tọa độ canvas về tọa độ ảnh gốc
    const originalX = (clickX - offsetX) / scale;
    const originalY = (clickY - offsetY) / scale;

    // Kiểm tra xem click có nằm trong vùng ảnh không
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
      // Magic wand cursor với sparkles từ lucide-react
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
      if (annotation.sam_result?.mask && annotation.sam_result.success) {
        const mask = annotation.sam_result.mask;

        ctx.beginPath();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";

        // Draw polygon from mask points
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

  // Draw annotations on canvas or calculate positions for point mode
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale factors
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
          .filter((ann) => ann.sam_result?.mask && ann.sam_result.success)
          .map((annotation) => {
            const mask = annotation.sam_result.mask;
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            mask.forEach((point: number[]) => {
              const x = point[0] * scale + offsetX;
              const y = point[1] * scale + offsetY;

              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            });
            boundingBoxs.push({
              id: annotation.id.toString(),
              x: minX,
              y: minY,
              width: maxX - minX,
              height: maxY - minY,
              label: annotation.label,
            });
          });
        setBoundingBoxAnnotations(boundingBoxs);
      } else {
        // Draw polygon annotations
        annotations.forEach((annotation) => {
          if (annotation.sam_result?.mask && annotation.sam_result.success) {
            const mask = annotation.sam_result.mask;

            ctx.beginPath();
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.fillStyle = "rgba(59, 130, 246, 0.2)";

            // Draw polygon from mask points
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
  }, [selectedTool, image]);

  // Thêm useEffect để lắng nghe sự kiện resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    // Gọi lần đầu để set kích thước ban đầu
    handleResize();

    // Thêm event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleDeleteAnnotation = async (id: string) => {
    await samApi.deleteAnnotation(id);
    setAnnotations((prev) =>
      prev.filter((ann) => ann.id.toString() !== id.toString())
    );
  };

  return (
    <Flex
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Div cố định 800x600 */}
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
        }}
      >
        {/* Canvas đè lên trên */}

        {image && (
          <>
            <canvas
              onClick={(e) => {
                handleCanvasClick(e);
              }}
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            <Image
              fit="contain"
              style={{ width: "100%", height: "100%" }}
              src={`https://api-label.tado.vn/api/images/${image?.id}`}
            />

            {/* Point mode annotations */}
            {selectedTool === "mouse" &&
              boundingBoxAnnotations.map((box) => (
                <>
                  <div
                    key={box.id}
                    style={{
                      position: "absolute",
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                      border: "2px solid #3b82f6",
                      backgroundColor: "rgba(59, 130, 246, 0.2)",
                      borderRadius: "4px",
                      zIndex: "1",
                    }}
                  >
                    <Flex
                      style={{
                        padding: "2px 4px",
                        position: "absolute",
                        top: "0",
                        left: "0",
                      }}
                      bg={"brand"}
                      color="brand"
                    >
                      <Text size="xs"> {box.label}</Text>
                    </Flex>
                  </div>
                  <ActionIcon
                    style={{
                      position: "absolute",
                      left: `${box.x + box.width}px`,
                      top: `${box.y}px`,
                      zIndex: "1000",
                      transform: "translateX(-100%)",
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
                </>
              ))}
          </>
        )}
        {/* Label input */}
        {selectedTool == "magic" && (
          <Card
            withBorder
            p="0"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              width: !isCollapsed ? "250px" : "28px",
              overflow: "hidden",
              transition: "all 0.2s ease",
            }}
          >
            {/* NÚT THU GỌN / MỞ */}

            <Flex style={{ height: "128px" }}>
              <ActionIcon
                style={{ height: "100%", flex: "1" }}
                radius="0"
                onClick={() => {
                  setIsCollapsed((pre) => !pre);
                }}
                variant="light"
                color="gray"
              >
                {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
              </ActionIcon>
              <Flex p="sm" direction="column">
                <Text size="sm" mb={8} c="brand" fw={500}>
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
                />

                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <Button
                    onClick={() => {
                      setLabelInput("");
                      clearPoints();
                    }}
                    size="xs"
                    color="gray"
                    fullWidth
                  >
                    Xóa điểm
                  </Button>

                  <Button
                    onClick={handleLabelWithTextPrompt}
                    size="xs"
                    color="brand"
                    fullWidth
                    disabled={pointToLabel.length <= 0}
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
