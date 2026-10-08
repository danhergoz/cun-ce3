import { OrganigramaNodo } from '../../types/project';

interface LayoutNode {
  node: OrganigramaNodo;
  x: number;
  y: number;
  width: number;
  height: number;
  subtreeWidth: number;
  staffNodes: OrganigramaNodo[];
  children: LayoutNode[];
}

/**
 * Genera una imagen PNG nítida en alta resolución (2x) del organigrama completo
 * usando la API Canvas de HTML5 estándar del navegador.
 * Garantiza que todos los niveles, dependencias y órganos de staff queden 100% visibles.
 */
export function generateOrganigramaImage(
  nodos: OrganigramaNodo[],
  tipoEstructura = 'Estructura Funcional por Procesos',
  companyName = 'EcoPack Solutions S.A.S.'
): string {
  if (typeof document === 'undefined' || !nodos || nodos.length === 0) {
    return '';
  }

  const idMap = new Map<string, OrganigramaNodo>();
  nodos.forEach((n) => idMap.set(n.id, n));

  const rootNodos = nodos.filter((n) => !n.parentId || !idMap.has(n.parentId));
  if (rootNodos.length === 0 && nodos.length > 0) {
    rootNodos.push(nodos[0]);
  }

  const CARD_W = 190;
  const CARD_H = 72;
  const GAP_X = 26;
  const GAP_Y = 56;
  const STAFF_GAP_X = 24;

  // 1. Construir árbol jerárquico recursivo
  function buildTree(node: OrganigramaNodo, visited = new Set<string>()): LayoutNode {
    visited.add(node.id);
    const allChildren = nodos.filter((n) => n.parentId === node.id && !visited.has(n.id));
    const staffNodes = allChildren.filter((n) => n.tipo === 'staff');
    const directChildren = allChildren.filter((n) => n.tipo !== 'staff');

    const childrenLayout = directChildren.map((c) => buildTree(c, new Set(visited)));

    // Ancho del subárbol de hijos directos
    let directChildrenWidth = 0;
    if (childrenLayout.length > 0) {
      directChildrenWidth =
        childrenLayout.reduce((acc, c) => acc + c.subtreeWidth, 0) +
        (childrenLayout.length - 1) * GAP_X;
    }

    // Ancho ocupado por staff a la derecha
    const staffWidth = staffNodes.length > 0 ? STAFF_GAP_X + CARD_W : 0;
    const nodeSelfWidth = CARD_W + staffWidth;

    const subtreeWidth = Math.max(nodeSelfWidth, directChildrenWidth);

    return {
      node,
      x: 0,
      y: 0,
      width: CARD_W,
      height: CARD_H,
      subtreeWidth,
      staffNodes,
      children: childrenLayout,
    };
  }

  const treeRoots = rootNodos.map((r) => buildTree(r));

  // 2. Asignar coordenadas (X, Y)
  let currentStartX = 40;
  const START_Y = 80;

  function layoutCoords(layoutNode: LayoutNode, leftX: number, depth: number) {
    layoutNode.y = START_Y + depth * (CARD_H + GAP_Y);

    // Centrar la tarjeta principal dentro de su subárbol
    const staffExtra = layoutNode.staffNodes.length > 0 ? STAFF_GAP_X + CARD_W : 0;
    const mainCenterX = leftX + (layoutNode.subtreeWidth - staffExtra) / 2;
    layoutNode.x = mainCenterX - CARD_W / 2;

    // Distribuir hijos directos
    let childLeft = leftX + Math.max(0, (layoutNode.subtreeWidth - staffExtra - getChildrenTotalWidth(layoutNode)) / 2);
    layoutNode.children.forEach((child) => {
      layoutCoords(child, childLeft, depth + 1);
      childLeft += child.subtreeWidth + GAP_X;
    });
  }

  function getChildrenTotalWidth(node: LayoutNode): number {
    if (node.children.length === 0) return 0;
    return (
      node.children.reduce((acc, c) => acc + c.subtreeWidth, 0) +
      (node.children.length - 1) * GAP_X
    );
  }

  treeRoots.forEach((root) => {
    layoutCoords(root, currentStartX, 0);
    currentStartX += root.subtreeWidth + GAP_X * 1.5;
  });

  // 3. Medir límites totales para el Canvas
  let minX = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function measureBounds(node: LayoutNode) {
    minX = Math.min(minX, node.x);
    maxX = Math.max(maxX, node.x + node.width);
    if (node.staffNodes.length > 0) {
      maxX = Math.max(maxX, node.x + node.width + STAFF_GAP_X + CARD_W);
    }
    maxY = Math.max(maxY, node.y + node.height);
    node.children.forEach(measureBounds);
  }

  treeRoots.forEach(measureBounds);

  const paddingX = 40;
  const paddingY = 40;
  const contentWidth = Math.max(maxX - minX + paddingX * 2, 780);
  const contentHeight = Math.max(maxY + paddingY, 380);

  // Ajustar coordenadas para que ningún nodo se desborde y quede centrado
  const offsetX = paddingX - minX + Math.max(0, (contentWidth - (maxX - minX + paddingX * 2)) / 2);
  function shiftCoords(node: LayoutNode, dx: number) {
    node.x += dx;
    node.children.forEach((c) => shiftCoords(c, dx));
  }
  treeRoots.forEach((root) => shiftCoords(root, offsetX));

  // 4. Crear canvas con escala x2 para nitidez en exportación e impresión
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(contentWidth * scale);
  canvas.height = Math.round(contentHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // Fondo blanco puro
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, contentWidth, contentHeight);

  // Encabezado superior del gráfico
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`ORGANIGRAMA ESTRUCTURAL — ${companyName.toUpperCase()}`, paddingX, 36);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Tipo de Estructura: ${tipoEstructura}`, paddingX, 54);

  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${nodos.length} cargos • Guía Oficial CUN`, contentWidth - paddingX, 54);

  // Línea divisoria superior
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingX, 64);
  ctx.lineTo(contentWidth - paddingX, 64);
  ctx.stroke();

  // Función para dibujar líneas conectoras ortogonales
  function drawConnectors(layoutNode: LayoutNode) {
    const parentBottomX = layoutNode.x + layoutNode.width / 2;
    const parentBottomY = layoutNode.y + layoutNode.height;

    // Conector a nodos Staff (línea horizontal punteada)
    if (layoutNode.staffNodes.length > 0) {
      const staffX = layoutNode.x + layoutNode.width + STAFF_GAP_X;
      layoutNode.staffNodes.forEach((_, sIdx) => {
        const staffY = layoutNode.y + sIdx * (CARD_H + 12);
        ctx.save();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(layoutNode.x + layoutNode.width, layoutNode.y + CARD_H / 2);
        ctx.lineTo(staffX, staffY + CARD_H / 2);
        ctx.stroke();
        ctx.restore();
      });
    }

    // Conectores a hijos directos
    if (layoutNode.children.length > 0) {
      const midY = parentBottomY + GAP_Y / 2;

      ctx.save();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.75;
      ctx.setLineDash([]);

      // 1. Línea vertical desde el padre hasta el punto medio
      ctx.beginPath();
      ctx.moveTo(parentBottomX, parentBottomY);
      ctx.lineTo(parentBottomX, midY);
      ctx.stroke();

      // 2. Barra horizontal que conecta a todos los hijos
      const firstChildX = layoutNode.children[0].x + layoutNode.children[0].width / 2;
      const lastChildX =
        layoutNode.children[layoutNode.children.length - 1].x +
        layoutNode.children[layoutNode.children.length - 1].width / 2;

      ctx.beginPath();
      ctx.moveTo(firstChildX, midY);
      ctx.lineTo(lastChildX, midY);
      ctx.stroke();

      // 3. Bajadas verticales hacia cada hijo directo
      layoutNode.children.forEach((child) => {
        const childTopX = child.x + child.width / 2;
        ctx.beginPath();
        ctx.moveTo(childTopX, midY);
        ctx.lineTo(childTopX, child.y);
        ctx.stroke();
      });

      ctx.restore();

      layoutNode.children.forEach(drawConnectors);
    }
  }

  // Función para dibujar una tarjeta de cargo
  function drawCard(
    node: OrganigramaNodo,
    x: number,
    y: number,
    isStaff = false
  ) {
    const w = CARD_W;
    const h = CARD_H;
    const radius = 8;

    ctx.save();

    // Fondo y borde redondeado
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = isStaff ? '#f8fafc' : '#ffffff';
    ctx.fill();

    ctx.strokeStyle = isStaff ? '#94a3b8' : '#cbd5e1';
    ctx.lineWidth = isStaff ? 1.5 : 1;
    if (isStaff) {
      ctx.setLineDash([4, 3]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();

    // Franja superior de color
    const stripeColor =
      node.color ||
      (node.tipo === 'directivo'
        ? '#003366'
        : node.tipo === 'staff'
        ? '#475569'
        : node.tipo === 'departamento'
        ? '#059669'
        : '#2563eb');

    ctx.beginPath();
    ctx.roundRect(x, y, w, 4, [radius, radius, 0, 0]);
    ctx.fillStyle = stripeColor;
    ctx.fill();

    // Badge de tipo (Directivo, Staff, Departamento, Operativo)
    const tipoLabel = (node.tipo || 'operativo').toUpperCase();
    ctx.fillStyle = isStaff ? '#475569' : stripeColor;
    ctx.font = 'bold 8px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(tipoLabel, x + 10, y + 17);

    // Área en la esquina superior derecha
    if (node.area) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'normal 8px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      const truncatedArea = node.area.length > 18 ? node.area.slice(0, 16) + '...' : node.area;
      ctx.fillText(truncatedArea, x + w - 10, y + 17);
    }

    // Cargo (texto principal en negrita con ajuste de 2 líneas si es largo)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'left';

    const cargoText = node.cargo || 'Cargo';
    if (cargoText.length > 25) {
      const words = cargoText.split(' ');
      let line1 = '';
      let line2 = '';
      for (const word of words) {
        if ((line1 + word).length < 24) {
          line1 += (line1 ? ' ' : '') + word;
        } else {
          line2 += (line2 ? ' ' : '') + word;
        }
      }
      ctx.fillText(line1, x + 10, y + 33);
      ctx.fillText(line2.slice(0, 26), x + 10, y + 45);
    } else {
      ctx.fillText(cargoText, x + 10, y + 36);
    }

    // Nombre o Responsable
    if (node.nombre) {
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 9px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      const truncatedNombre = node.nombre.length > 26 ? node.nombre.slice(0, 24) + '...' : node.nombre;
      ctx.fillText(truncatedNombre, x + 10, y + 59);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'normal 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Puesto asignado', x + 10, y + 59);
    }

    ctx.restore();
  }

  function drawNodes(layoutNode: LayoutNode) {
    drawCard(layoutNode.node, layoutNode.x, layoutNode.y, false);

    // Dibujar tarjetas staff
    if (layoutNode.staffNodes.length > 0) {
      const staffX = layoutNode.x + layoutNode.width + STAFF_GAP_X;
      layoutNode.staffNodes.forEach((sNode, sIdx) => {
        const staffY = layoutNode.y + sIdx * (CARD_H + 12);
        drawCard(sNode, staffX, staffY, true);
      });
    }

    layoutNode.children.forEach(drawNodes);
  }

  // Ejecutar dibujo en capas: primero conectores (fondo) luego tarjetas (frente)
  treeRoots.forEach(drawConnectors);
  treeRoots.forEach(drawNodes);

  return canvas.toDataURL('image/png');
}
