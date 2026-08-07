"use client";
import { useEffect, useCallback } from "react";

/**
 * Blindagem do site contra cópia, inspeção e devtools.
 * Camadas de proteção:
 * 1. Bloqueio de右键 (context menu)
 * 2. Bloqueio de atalhos de dev tools (F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S)
 * 3. Detecção de devtools aberto via resize (debugger trap)
 * 4. Bloqueio de seleção de texto
 * 5. Bloqueio de drag-and-drop
 * 6. Bloqueio de print screen (limitado ao navegador)
 * 7. Desabilitar cópia/corte no clipboard
 * 8. Prevenir "view-source"
 */

export default function SiteProtection() {
  // ── 1. Bloquear右键 (context menu) ───────────────────────────────────
  const blockContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // ── 2. Bloquear atalhos de dev tools e cópia ─────────────────────────
  const blockKeydown = useCallback((e: KeyboardEvent) => {
    // F12
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+I (devtools), Ctrl+Shift+J (console), Ctrl+Shift+C (inspector)
    if (e.ctrlKey && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+U (view source)
    if (e.ctrlKey && ["U", "u"].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+S (save page)
    if (e.ctrlKey && ["S", "s"].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+A (select all) — impedir seleção em massa
    if (e.ctrlKey && ["A", "a"].includes(e.key)) {
      // Permite apenas em inputs/textareas
      const tag = (e.target as HTMLElement).tagName;
      if (tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        return false;
      }
    }

    // Ctrl+P (print)
    if (e.ctrlKey && ["P", "p"].includes(e.key)) {
      e.preventDefault();
      return false;
    }

    // Ctrl+Shift+K (Firefox devtools)
    if (e.ctrlKey && e.shiftKey && ["K", "k"].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  }, []);

  // ── 3. Bloquear cópia/corte no clipboard ─────────────────────────────
  const blockCopy = useCallback((e: ClipboardEvent) => {
    // Permite copiar em inputs/textareas
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    e.preventDefault();
    return false;
  }, []);

  // ── 4. Bloquear drag-and-drop de imagens/conteúdo ─────────────────────
  const blockDragStart = useCallback((e: DragEvent) => {
    e.preventDefault();
    return false;
  }, []);

  useEffect(() => {
    // Context menu
    document.addEventListener("contextmenu", blockContextMenu);

    // Keyboard shortcuts
    document.addEventListener("keydown", blockKeydown, true);

    // Clipboard
    document.addEventListener("copy", blockCopy);
    document.addEventListener("cut", blockCopy);

    // Drag
    document.addEventListener("dragstart", blockDragStart);

    // ── 5. Debugger trap (detecção de devtools via resize) ─────────
    const threshold = 160;
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        // Dev tools pode estar aberto — limpa o console como contra-medida
        // e mostra aviso (apenas no console que o inspetor vai ver)
        console.clear();
        console.log(
          "%c⚠️ Acesso não autorizado detectado.",
          "color: #ff0000; font-size: 24px; font-weight: bold;"
        );
        console.log(
          "%cEste site é protegido. Feche as ferramentas de desenvolvedor.",
          "color: #ff6600; font-size: 16px;"
        );
      }
    };

    const resizeInterval = setInterval(checkDevTools, 1000);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeydown, true);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("cut", blockCopy);
      document.removeEventListener("dragstart", blockDragStart);
      clearInterval(resizeInterval);
    };
  }, [blockContextMenu, blockKeydown, blockCopy, blockDragStart]);

  // Não renderiza nada visível
  return null;
}
