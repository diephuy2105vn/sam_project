import { Button, Card, Flex, MultiSelect } from "@mantine/core";
import { useEffect, useRef, useState } from "react";

const ImageAnnotationTool = ({ imageUrl, selectedTool, onSave }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [allLabels, setAllLabels] = useState([]);
  const [scale, setScale] = useState(1);
  const [editingLabel, setEditingLabel] = useState(null);
  const [labelInput, setLabelInput] = useState([]);
  const [labelSerachInput, setLabelSearchInput] = useState("");
  const [labelPosition, setLabelPosition] = useState({ x: 0, y: 0 });
  const [image, setImage] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setImage(img);

        // Tính toán kích thước để hiển thị toàn bộ ảnh
        const containerWidth = window.innerWidth * 0.8;
        const containerHeight = window.innerHeight * 0.8;

        let width = img.width;
        let height = img.height;

        // Tính tỷ lệ để fit toàn bộ ảnh vào container
        const widthRatio = containerWidth / width;
        const heightRatio = containerHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        // Áp dụng tỷ lệ để ảnh vừa vặn
        width = width * ratio;
        height = height * ratio;

        setCanvasSize({ width, height });

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = width;
          canvas.height = height;

          // Vẽ ảnh ngay lập tức
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  useEffect(() => {
    if (image && canvasRef.current && canvasSize.width > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);
      }
    }
  }, [image, canvasSize, scale]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.3));
  };

  const handleResetZoom = () => {
    setScale(1);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Zoom Controls */}
      <Card
        p="xs"
        shadow="sm"
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 1000,
        }}
      >
        <Flex>
          <Button onClick={handleZoomOut} size="sm" variant="light">
            -
          </Button>
          <span
            style={{ minWidth: "80px", textAlign: "center", color: "#fff" }}
          >
            {Math.round(scale * 100)}%
          </span>
          <Button onClick={handleZoomIn} size="sm" variant="light">
            +
          </Button>
          <Button onClick={handleResetZoom} size="sm" variant="outline">
            Reset
          </Button>
        </Flex>
      </Card>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100vh - 160px)",
          overflow: "auto",
          backgroundColor: "#25262B",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            minWidth: "100%",
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
              margin: `${(canvasSize.height * (scale - 1)) / 2}px ${
                (canvasSize.width * (scale - 1)) / 2
              }px`,
            }}
          />
        </div>

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
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageAnnotationTool;
