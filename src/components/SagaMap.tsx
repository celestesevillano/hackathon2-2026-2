import React from 'react';
import type { Palette, SagaStage } from '../types/api';

interface SagaMapProps {
  width: number;
  height: number;
  stages: SagaStage[];
  activeStageIndex: number;
  palette: Palette;
  onSelectStage: (index: number) => void;
}

export const SagaMap: React.FC<SagaMapProps> = ({
  width,
  height,
  stages,
  activeStageIndex,
  palette,
  onSelectStage,
}) => {
  const activeStage = stages[activeStageIndex] ?? stages[0];

  // Coordenadas de todas las islas para la ruta
  const allPoints = stages.map((s) => `${s.island.x},${s.island.y}`).join(' ');

  // Coordenadas de la ruta recorrida hasta la etapa activa
  const completedPoints = stages
    .slice(0, activeStageIndex + 1)
    .map((s) => `${s.island.x},${s.island.y}`)
    .join(' ');

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border shadow-inner"
      style={{
        backgroundColor: palette.surface,
        borderColor: `${palette.primary}44`,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Mapa interactivo del Grand Line"
      >
        {/* Fondo marítimo con textura de cartas de navegación */}
        <defs>
          <pattern id="seaGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={palette.primary}
              strokeWidth="0.5"
              strokeOpacity="0.12"
            />
          </pattern>
        </defs>

        <rect width={width} height={height} fill={`url(#seaGrid)`} />

        {/* Ruta proyectada total (línea discontinua) */}
        {stages.length > 1 && (
          <polyline
            points={allPoints}
            fill="none"
            stroke={palette.text}
            strokeWidth="2.5"
            strokeDasharray="6,6"
            strokeOpacity="0.3"
          />
        )}

        {/* Ruta navegada recorrida (línea continua resaltada) */}
        {stages.length > 1 && completedPoints && (
          <polyline
            points={completedPoints}
            fill="none"
            stroke={palette.primary}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Islas */}
        {stages.map((stage, idx) => {
          const isActive = idx === activeStageIndex;
          const isVisited = idx <= activeStageIndex;

          return (
            <g
              key={stage.id}
              tabIndex={0}
              role="button"
              aria-label={`Isla: ${stage.island.name}. Etapa ${idx + 1}: ${stage.title}`}
              onClick={() => onSelectStage(idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStage(idx);
                }
              }}
              className="cursor-pointer focus:outline-none"
            >
              {/* Resplandor isla activa */}
              {isActive && (
                <circle
                  cx={stage.island.x}
                  cy={stage.island.y}
                  r="20"
                  fill={palette.accent}
                  opacity="0.3"
                  className="animate-ping"
                />
              )}

              {/* Punto de la isla */}
              <circle
                cx={stage.island.x}
                cy={stage.island.y}
                r={isActive ? 11 : isVisited ? 8 : 6}
                fill={isActive ? palette.accent : isVisited ? palette.primary : palette.text}
                stroke={palette.surface}
                strokeWidth="2"
                style={{
                  transition: 'r 0.3s ease, fill 0.3s ease',
                }}
              />

              {/* Nombre de la isla */}
              <text
                x={stage.island.x}
                y={stage.island.y > height - 30 ? stage.island.y - 14 : stage.island.y + 20}
                textAnchor="middle"
                fontSize="12"
                fontWeight={isActive ? 'bold' : 'normal'}
                fill={palette.text}
                opacity={isActive ? 1 : 0.75}
                className="pointer-events-none select-none font-sans"
              >
                {stage.island.name}
              </text>
            </g>
          );
        })}

        {/* Barco en la isla activa */}
        {activeStage && (
          <g
            style={{
              transform: `translate(${activeStage.island.x}px, ${activeStage.island.y}px)`,
              transition: 'transform 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)',
            }}
            className="pointer-events-none select-none ship-marker"
          >
            <circle cx="0" cy="0" r="14" fill={palette.background} opacity="0.8" />
            <text
              x="0"
              y="5"
              textAnchor="middle"
              fontSize="16"
              className="select-none"
            >
              ⛵
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
