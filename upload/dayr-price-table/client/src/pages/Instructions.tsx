import { Card } from "@/components/ui/card";
import { BookOpen, Share2, TrendingUp, Calculator, Edit, Trophy } from "lucide-react";

export default function Instructions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container py-6">
          <h1 className="text-4xl font-bold text-orange-500 font-mono flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Guia de Uso
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Aprenda como usar o Terminal de Comércio Sobrevivente do Day R Survival
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="space-y-6">
          {/* Seção 1: Visualizar Preços */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              1. Visualizar Preços
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>
                A tabela principal mostra todos os itens negociáveis do Day R Survival organizados por categoria.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2 text-sm">
                <p>
                  <strong>📊 Colunas da Tabela:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>
                    <strong>Item:</strong> Nome do item com ícone representativo
                  </li>
                  <li>
                    <strong>Aço ($):</strong> Preço em moeda Aço
                  </li>
                  <li>
                    <strong>Cimento (€):</strong> Preço em moeda Cimento
                  </li>
                  <li>
                    <strong>Tendência:</strong> Gráfico mostrando se o preço está subindo/descendo (aparece após reportes)
                  </li>
                  <li>
                    <strong>Demanda:</strong> Nível de procura do item (BAIXA, MÉDIA, ALTA, MTO ALTA)
                  </li>
                  <li>
                    <strong>Reportado por:</strong> Nome do player que compartilhou o preço mais recente
                  </li>
                  <li>
                    <strong>Notas:</strong> Informações adicionais sobre o item
                  </li>
                </ul>
              </div>
              <p className="text-sm">
                💡 <strong>Dica:</strong> Use as abas no topo para filtrar por categoria (Comida, Ervas, Componentes, Medicina, Munição, Animais).
              </p>
            </div>
          </Card>

          {/* Seção 2: Reportar Preços */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
              <Share2 className="w-6 h-6" />
              2. Reportar Preços (Crowdsourcing)
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>
                Compartilhe os preços que você vê no jogo para ajudar a comunidade a identificar tendências e oportunidades de lucro!
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-sm">
                <p>
                  <strong>📝 Como Reportar:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-400">
                  <li>Clique no botão <strong className="text-teal-400">Reportar</strong> no header</li>
                  <li>Digite seu apelido (será salvo para próximos reportes)</li>
                  <li>Selecione o item que você viu no jogo</li>
                  <li>Insira o preço em Aço e o preço em Cimento</li>
                  <li>Clique em <strong className="text-green-400">Reportar</strong> para enviar</li>
                </ol>
              </div>
              <p className="text-sm">
                💡 <strong>Dica:</strong> Quanto mais players reportarem preços, mais precisas serão as tendências! Seu apelido aparecerá na coluna "Reportado por".
              </p>
            </div>
          </Card>

          {/* Seção 3: Calculadora de Lucro */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              3. Calculadora de Lucro
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>
                Calcule o lucro de produção de itens considerando tempo de preparo, custo e preço de venda.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-sm">
                <p>
                  <strong>🧮 Como Usar:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-400">
                  <li>Clique no botão <strong className="text-orange-400">Calculadora</strong> no header</li>
                  <li>Digite o nome do item (ex: Carne Salgada)</li>
                  <li>Insira a quantidade que você vai produzir</li>
                  <li>Digite o tempo de preparo em minutos</li>
                  <li>Insira o custo total em Aço e o preço de venda em Aço</li>
                  <li>Veja o lucro por item, lucro total e lucro por hora</li>
                </ol>
              </div>
              <p className="text-sm">
                💡 <strong>Dica:</strong> Use a coluna "Lucro/Hora" para identificar quais itens são mais rentáveis em relação ao tempo investido.
              </p>
            </div>
          </Card>

          {/* Seção 4: Editor de Preços */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
              <Edit className="w-6 h-6" />
              4. Editar Preços
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>
                Se você é administrador ou deseja atualizar os preços base da tabela, use o editor de preços.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-sm">
                <p>
                  <strong>✏️ Como Editar:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-2 text-slate-400">
                  <li>Clique no botão <strong className="text-orange-400">Editar Preços</strong> no header</li>
                  <li>Selecione a categoria do item</li>
                  <li>Procure o item usando a barra de busca (opcional)</li>
                  <li>Clique no ícone de edição <strong className="text-orange-400">✏️</strong> ao lado do item</li>
                  <li>Altere os preços em Aço e Cimento</li>
                  <li>Clique em <strong className="text-green-400">✓</strong> para salvar ou <strong className="text-red-400">✕</strong> para cancelar</li>
                </ol>
              </div>
              <p className="text-sm">
                💡 <strong>Dica:</strong> As mudanças são salvas localmente no seu navegador. Use esta ferramenta para manter a tabela atualizada com os preços atuais do mercado.
              </p>
            </div>
          </Card>

          {/* Seção 5: Ranking de Contribuidores */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              5. Ranking de Contribuidores
            </h2>
            <div className="space-y-3 text-slate-300">
              <p>
                Veja os players que mais contribuíram com reportes de preços para a comunidade.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-sm">
                <p>
                  <strong>🏆 Como Funciona:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>O ranking mostra os top 10 contribuidores</li>
                  <li>🥇 Ouro: 1º lugar | 🥈 Prata: 2º lugar | 🥉 Bronze: 3º lugar</li>
                  <li>
                    <strong className="text-orange-500">🔥 Indicador de atividade:</strong> Aparece para contribuidores com 10+ reportes
                  </li>
                  <li>Cada reporte que você faz aumenta sua contagem</li>
                  <li>A data de atualização mostra há quantos dias foi o último reporte</li>
                </ul>
              </div>
              <p className="text-sm">
                💡 <strong>Dica:</strong> Contribua regularmente para aparecer no ranking e ajudar a comunidade a ter dados de mercado mais precisos!
              </p>
            </div>
          </Card>

          {/* Seção 6: Busca e Filtros */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4">🔍 Busca e Filtros</h2>
            <div className="space-y-3 text-slate-300">
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-sm">
                <p>
                  <strong>Recursos de Busca:</strong>
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>
                    <strong>Busca por nome:</strong> Digite na barra de busca para filtrar itens (ex: "Carne")
                  </li>
                  <li>
                    <strong>Filtro por categoria:</strong> Clique nas abas (Comida, Ervas, etc.) para ver apenas aquela categoria
                  </li>
                  <li>
                    <strong>Ordenação:</strong> Clique nos headers das colunas (Item, Aço, Cimento) para ordenar crescente/decrescente
                  </li>
                  <li>
                    <strong>Raridade:</strong> O ponto colorido ao lado do item indica: Comum (cinza), Incomum (laranja), Raro (vermelho)
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Seção 7: Dicas Gerais */}
          <Card className="bg-slate-800 border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-orange-500 font-mono mb-4">💡 Dicas Gerais</h2>
            <div className="space-y-2 text-slate-300 text-sm">
              <p>
                ✅ <strong>Reporte preços regularmente:</strong> Quanto mais dados, melhor as tendências!
              </p>
              <p>
                ✅ <strong>Use a calculadora:</strong> Identifique quais itens são mais lucrativos para produzir.
              </p>
              <p>
                ✅ <strong>Acompanhe as tendências:</strong> Veja se os preços estão subindo ou descendo para tomar melhores decisões.
              </p>
              <p>
                ✅ <strong>Compartilhe com sua guilda:</strong> Quanto mais players usarem a tabela, melhor para todos!
              </p>
              <p>
                ✅ <strong>Dados locais:</strong> Todos os seus reportes são salvos no seu navegador (30 dias de histórico).
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
