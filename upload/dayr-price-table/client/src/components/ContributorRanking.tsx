import { Card } from "@/components/ui/card";
import { Trophy, Medal, Flame } from "lucide-react";

export interface ContributorStats {
  nickname: string;
  reportCount: number;
  lastReportDate: number;
}

interface ContributorRankingProps {
  contributors: ContributorStats[];
}

export function ContributorRanking({ contributors }: ContributorRankingProps) {
  const sorted = [...contributors].sort((a, b) => b.reportCount - a.reportCount);
  const topContributors = sorted.slice(0, 10);

  if (topContributors.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700 p-6">
        <h3 className="text-lg font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          🏆 Ranking de Contribuidores
        </h3>
        <p className="text-slate-400 text-sm">
          Nenhum reporte ainda. Seja o primeiro a contribuir!
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700 p-6">
      <h3 className="text-lg font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        🏆 Ranking de Contribuidores
      </h3>

      <div className="space-y-2">
        {topContributors.map((contributor, index) => {
          const medal =
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`;
          const isHot = contributor.reportCount >= 10;

          return (
            <div
              key={contributor.nickname}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                index < 3
                  ? "bg-orange-900/20 border border-orange-700/50"
                  : "bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl font-bold w-6 text-center">{medal}</span>
                <div className="flex-1">
                  <p className="text-slate-100 font-medium flex items-center gap-2">
                    {contributor.nickname}
                    {isHot && (
                      <span title="Contribuidor ativo!">
                        <Flame className="w-4 h-4 text-orange-500" />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Atualizado há{" "}
                    {Math.floor(
                      (Date.now() - contributor.lastReportDate) / (1000 * 60 * 60 * 24)
                    )}{" "}
                    dias
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-orange-400 font-mono font-bold">
                  {contributor.reportCount}
                </p>
                <p className="text-xs text-slate-500">reportes</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          <Medal className="w-3 h-3 inline mr-1" />
          Total de contribuidores: <strong>{contributors.length}</strong>
        </p>
      </div>
    </Card>
  );
}
