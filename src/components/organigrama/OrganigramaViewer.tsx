import React from 'react';
import { OrganigramaNodo } from '../../types/project';
import { Crown, ShieldAlert, Layers, Users, Plus, Trash2, Edit3, CornerDownRight } from 'lucide-react';

interface OrganigramaViewerProps {
  nodos: OrganigramaNodo[];
  tipoEstructura?: string;
  selectedNodeId?: string | null;
  interactive?: boolean;
  compact?: boolean;
  onSelectNode?: (nodo: OrganigramaNodo) => void;
  onAddChild?: (parentId: string) => void;
  onAddSibling?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onEditNode?: (nodo: OrganigramaNodo) => void;
}

export const OrganigramaViewer: React.FC<OrganigramaViewerProps> = ({
  nodos,
  tipoEstructura,
  selectedNodeId,
  interactive = false,
  compact = false,
  onSelectNode,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onEditNode,
}) => {
  // Encontrar nodos raíz (parentId nulo o sin padre existente)
  const idMap = new Map<string, OrganigramaNodo>();
  nodos.forEach((n) => idMap.set(n.id, n));

  const rootNodes = nodos.filter((n) => !n.parentId || !idMap.has(n.parentId));

  const getNodeIcon = (tipo?: string) => {
    switch (tipo) {
      case 'directivo':
        return <Crown className="w-3.5 h-3.5 text-blue-700" />;
      case 'staff':
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />;
      case 'departamento':
        return <Layers className="w-3.5 h-3.5 text-emerald-700" />;
      case 'operativo':
      default:
        return <Users className="w-3.5 h-3.5 text-indigo-700" />;
    }
  };

  const getNodeBadgeClass = (tipo?: string) => {
    switch (tipo) {
      case 'directivo':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'staff':
        return 'bg-slate-100 text-slate-800 border-slate-300 border-dashed';
      case 'departamento':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'operativo':
      default:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    }
  };

  // Renderizador recursivo de nodo con sus hijos y staff
  const renderNodeBranch = (node: OrganigramaNodo, isRoot: boolean = false) => {
    // Distinguir hijos estándar de staff
    const allChildren = nodos.filter((n) => n.parentId === node.id);
    const staffChildren = allChildren.filter((n) => n.tipo === 'staff');
    const directChildren = allChildren.filter((n) => n.tipo !== 'staff');

    const isSelected = selectedNodeId === node.id;

    return (
      <div key={node.id} className="flex flex-col items-center relative">
        {/* Contenedor central del nodo y su eventual staff adyacente */}
        <div className="flex items-center justify-center relative z-10 gap-3">
          {/* Card del nodo */}
          <div
            onClick={() => onSelectNode && onSelectNode(node)}
            className={`transition-all duration-150 rounded-xl border p-3 bg-white text-left ${
              compact ? 'w-48 p-2 text-xs' : 'w-56 p-3 text-xs'
            } ${
              isSelected
                ? 'ring-2 ring-blue-600 border-blue-600 shadow-md bg-blue-50/20'
                : 'border-slate-300 hover:border-blue-400 shadow-2xs hover:shadow-sm'
            } ${interactive ? 'cursor-pointer' : ''}`}
            style={{
              borderTopWidth: '4px',
              borderTopColor: node.color || (node.tipo === 'directivo' ? '#1d4ed8' : node.tipo === 'staff' ? '#64748b' : node.tipo === 'departamento' ? '#059669' : '#4f46e5'),
            }}
          >
            {/* Header / Tipo y Área */}
            <div className="flex items-center justify-between mb-1">
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${getNodeBadgeClass(
                  node.tipo
                )}`}
              >
                {getNodeIcon(node.tipo)}
                <span>{node.tipo || 'Operativo'}</span>
              </span>
              {node.area && (
                <span className="text-[9px] text-slate-500 font-medium truncate max-w-[90px]" title={node.area}>
                  {node.area}
                </span>
              )}
            </div>

            {/* Cargo */}
            <h5 className="font-bold text-slate-900 leading-snug break-words text-[11px] mb-0.5">
              {node.cargo || 'Nuevo Cargo'}
            </h5>

            {/* Nombre o detalle */}
            {node.nombre && (
              <p className="text-[10px] text-slate-600 italic truncate" title={node.nombre}>
                {node.nombre}
              </p>
            )}

            {/* Acciones interactivas (cuando está habilitado) */}
            {interactive && (
              <div
                className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    title="Añadir subordinado"
                    onClick={() => onAddChild && onAddChild(node.id)}
                    className="p-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[10px] flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Hijo</span>
                  </button>
                  <button
                    type="button"
                    title="Añadir cargo al mismo nivel"
                    onClick={() => onAddSibling && onAddSibling(node.id)}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px]"
                  >
                    <span>+Paralelo</span>
                  </button>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    title="Editar cargo"
                    onClick={() => onEditNode && onEditNode(node)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  {nodos.length > 1 && (
                    <button
                      type="button"
                      title="Eliminar cargo"
                      onClick={() => onDeleteNode && onDeleteNode(node.id)}
                      className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nodos Staff conectados horizontalmente con línea punteada */}
          {staffChildren.length > 0 && (
            <div className="flex flex-col gap-2 relative pl-6">
              {/* Conector horizontal punteado hacia el staff */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 border-t-2 border-dashed border-slate-400" />
              {staffChildren.map((staffNode) => (
                <div
                  key={staffNode.id}
                  onClick={() => onSelectNode && onSelectNode(staffNode)}
                  className={`transition-all rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-2.5 ${
                    compact ? 'w-44 text-[10px]' : 'w-48 text-xs'
                  } ${
                    selectedNodeId === staffNode.id
                      ? 'ring-2 ring-slate-600 border-slate-600 bg-slate-100'
                      : 'hover:border-slate-500'
                  } ${interactive ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-1 py-0.5 rounded">
                      Staff / Asesor
                    </span>
                    <span className="text-[8px] text-slate-500">{staffNode.area}</span>
                  </div>
                  <h6 className="font-bold text-slate-800 text-[10.5px] leading-tight">
                    {staffNode.cargo}
                  </h6>
                  {staffNode.nombre && (
                    <p className="text-[9.5px] text-slate-500 italic truncate">{staffNode.nombre}</p>
                  )}
                  {interactive && (
                    <div
                      className="mt-1.5 pt-1 border-t border-slate-200 flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onEditNode && onEditNode(staffNode)}
                        className="p-0.5 text-slate-500 hover:text-blue-600"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNode && onDeleteNode(staffNode.id)}
                        className="p-0.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Línea vertical hacia abajo desde el nodo si tiene hijos directos */}
        {directChildren.length > 0 && (
          <div className="w-0.5 h-6 bg-slate-400 my-0" />
        )}

        {/* Nivel de hijos directos con conectores ortogonales */}
        {directChildren.length > 0 && (
          <div className="flex items-start justify-center relative pt-4">
            {/* Barra horizontal superior que conecta todos los hijos directos */}
            {directChildren.length > 1 && (
              <div
                className="absolute top-0 border-t-2 border-slate-400"
                style={{
                  left: `${100 / (2 * directChildren.length)}%`,
                  right: `${100 / (2 * directChildren.length)}%`,
                }}
              />
            )}

            {/* Rama de cada hijo directo */}
            <div className="flex gap-4 sm:gap-6 items-start justify-center">
              {directChildren.map((child) => (
                <div key={child.id} className="flex flex-col items-center relative">
                  {/* Pequeña línea vertical desde la barra horizontal hasta el hijo */}
                  <div className="w-0.5 h-4 bg-slate-400 -mt-4 mb-0" />
                  {renderNodeBranch(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto p-4 bg-slate-50/70 rounded-xl border border-slate-200">
      {tipoEstructura && (
        <div className="mb-4 pb-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              Diagrama Jerárquico:
            </span>
            <span className="text-xs font-semibold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
              {tipoEstructura}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {nodos.length} {nodos.length === 1 ? 'cargo registrado' : 'cargos registrados'}
          </span>
        </div>
      )}

      {nodos.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <Layers className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-xs font-medium">No hay cargos registrados en el organigrama.</p>
        </div>
      ) : (
        <div className="min-w-fit flex flex-col items-center py-4 px-2 space-y-6">
          {rootNodes.map((rootNode) => renderNodeBranch(rootNode, true))}
        </div>
      )}
    </div>
  );
};
