"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface SafePrintPortalProps {
  children: React.ReactNode;
  portalId?: string;
}

export function SafePrintPortal({
  children,
  portalId = "siskeudes-print-mount-root"
}: SafePrintPortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(portalId);
    if (!el) {
      el = document.createElement("div");
      el.id = portalId;
      el.className = "siskeudes-print-portal-mount";
      document.body.appendChild(el);
    } else {
      el.className = "siskeudes-print-portal-mount";
    }
    setContainer(el);
  }, [portalId]);

  if (!container) return null;

  return createPortal(children, container);
}
