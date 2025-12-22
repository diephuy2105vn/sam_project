import { Button, MultiSelect } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import type { AnnotationType } from "../pages/MainPage";

const ImageAnnotationTool = ({
  imageUrl,
  selectedTool,
}: {
  imageUrl: string;
  onSave: (annotations: AnnotationType[]) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [allLabels, setAllLabels] = useState<string[]>([]);

  const [editingLabel, setEditingLabel] = useState(null);
  const [labelInput, setLabelInput] = useState<string[]>([]);
  const [labelSerachInput, setLabelSearchInput] = useState<string>("");
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Thêm useEffect này để vẽ ảnh lên canvas
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Xóa canvas trước
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Vẽ ảnh
        ctx.drawImage(image, 0, 0);
      }
    }
  }, [image]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: "100%",
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
          backgroundColor: "#25262B",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            maxWidth: "100%",
            height: "auto",
          }}
        />

        {editingLabel && (
          <div
            style={{
              position: "absolute",
              top: `${labelPosition.y}px`,
              left: `${labelPosition.x}px`,
              backgroundColor: "#1a1b1e",
              padding: "8px",
              borderRadius: "6px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
              zIndex: 1000,
              border: "2px solid #3b82f6",
            }}
          >
            <MultiSelect
              data={allLabels ? allLabels : []}
              value={labelInput ? labelInput : []}
              onChange={(value: string[]) => setLabelInput(value)}
              searchValue={labelSerachInput}
              onSearchChange={setLabelSearchInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && labelSerachInput.trim() !== "") {
                  if (!allLabels.includes(labelSerachInput.trim() as string)) {
                    const newLabels = [...allLabels, labelSerachInput.trim()];
                    console.log("New Labels:", newLabels);
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
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnnotationTool;
