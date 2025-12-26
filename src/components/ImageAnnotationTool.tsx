import { Button, Card, Flex, MultiSelect } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

const ImageAnnotationTool = ({ image, selectedTool, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [allLabels, setAllLabels] = useState<string[]>([]);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [labelInput, setLabelInput] = useState<string[]>([]);
  const [labelSerachInput, setLabelSearchInput] = useState("");
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (image && image?.id) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          // Canvas luôn là 800x600
          canvas.width = 1200;
          canvas.height = 720;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Xóa canvas
            ctx.clearRect(0, 0, 1200, 720);

            // Tính tỷ lệ để fit ảnh vào 800x600
            const widthRatio = 1200 / img.width;
            const heightRatio = 720 / img.height;
            const ratio = Math.min(widthRatio, heightRatio);

            // Kích thước ảnh sau khi scale
            const scaledWidth = img.width * ratio;
            const scaledHeight = img.height * ratio;

            // Vị trí căn giữa
            const x = (1200 - scaledWidth) / 2;
            const y = (720 - scaledHeight) / 2;

            // Vẽ ảnh
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
          }
        }
      };
      img.src = `https://api-label.tado.vn/api/images/${image?.id}`;
    }
  }, [image]);

  return (
    <Flex
      direction={"column"}
      style={{
        position: "relative",
      }}
    >
      {/* Div cố định 800x600 */}
      <Card
        ref={containerRef}
        style={{
          position: "relative",
          width: "1200px",
          height: "720px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Canvas đè lên trên */}
        {image && (
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        )}

        {/* Label input */}
        {editingLabel && (
          <Card
            style={{
              position: "absolute",
              top: `${labelPosition.y}px`,
              left: `${labelPosition.x}px`,
              padding: "8px",
              zIndex: 1000,
              border: "2px solid #3b82f6",
              minWidth: "250px",
            }}
          >
            <MultiSelect
              data={allLabels ? allLabels : []}
              value={labelInput ? labelInput : []}
              onChange={(value) => setLabelInput(value)}
              searchValue={labelSerachInput}
              onSearchChange={setLabelSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && labelSerachInput.trim() !== "") {
                  if (!allLabels.includes(labelSerachInput.trim())) {
                    const newLabels = [...allLabels, labelSerachInput.trim()];
                    setLabelInput((prev) => [...prev, labelSerachInput.trim()]);
                    setAllLabels(newLabels);
                    setLabelSearchInput("");
                  }
                }
              }}
              placeholder="Chọn hoặc nhập nhãn mới"
              searchable
              size="sm"
            />
            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
              <Button onClick={() => {}} size="xs" color="blue" fullWidth>
                OK
              </Button>
              <Button
                onClick={() => {
                  setEditingLabel(null);
                  setLabelInput([]);
                }}
                size="xs"
                color="gray"
                fullWidth
              >
                Bỏ qua
              </Button>
            </div>
          </Card>
        )}
      </Card>
    </Flex>
  );
};

export default ImageAnnotationTool;
