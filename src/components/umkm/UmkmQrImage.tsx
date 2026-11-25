"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function UmkmQrImage({
  value,
  size = 180,
  alt = "QR Code",
  className = "",
}: {
  value: string;
  size?: number;
  alt?: string;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    let active = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-[10px] text-slate-400 font-bold ${className}`}
      >
        Memuat QR...
      </div>
    );
  }

  return <img src={dataUrl} alt={alt} width={size} height={size} className={`rounded-xl ${className}`} />;
}

