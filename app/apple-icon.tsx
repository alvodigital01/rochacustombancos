import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0B0C",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "78%",
            height: "78%",
            borderRadius: 28,
            background: "#F2B705",
            fontSize: 88,
            fontWeight: 800,
            fontFamily: "Arial, sans-serif",
            letterSpacing: -4,
            color: "#171308",
          }}
        >
          RC
        </div>
      </div>
    ),
    { ...size }
  );
}
