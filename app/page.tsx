// Landing page do Paróquia+ — apresentação do produto, features e planos
import Link from 'next/link'
import {
  Calendar,
  Users,
  Bell,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  Church,
  ClipboardList,
  Layers,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#002045]">
      {/* ─── Navbar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-[#002045]">Paróquia+</span>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-[#002045] hover:text-[#1a365d] transition-colors px-3 py-1.5"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-[#002045] text-white rounded-lg px-4 py-1.5 hover:bg-[#1a365d] transition-colors"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="bg-gradient-to-br from-[#002045] to-[#1a365d] pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#fed65b]/20 border border-[#fed65b]/40 rounded-full px-4 py-1.5 mb-8">
            <Church className="h-4 w-4 text-[#fed65b]" />
            <span className="text-sm font-medium text-[#fed65b]">Gestão litúrgica simplificada</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Organize sua paróquia
            <br />
            <span className="text-[#fed65b]">sem complicação</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Escalas, membros, celebrações e pastorais em um único lugar.
            Notificações automáticas e confirmações de presença para toda a equipe.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-[#fed65b] text-[#002045] font-semibold rounded-xl px-8 py-3.5 hover:bg-[#fece3e] transition-colors text-base shadow-lg shadow-black/20"
            >
              Cadastrar minha paróquia
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-medium rounded-xl px-8 py-3.5 hover:bg-white/10 transition-colors text-base"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#002045] mb-4">
              Tudo que sua comunidade precisa
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas pensadas para coordenadores, membros e administradores paroquiais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ClipboardList,
                title: 'Escalas inteligentes',
                desc: 'Crie e publique escalas com detecção automática de conflitos e indisponibilidades.',
              },
              {
                icon: Users,
                title: 'Gestão de membros',
                desc: 'Cadastre membros, associe a pastorais e acompanhe disponibilidade em tempo real.',
              },
              {
                icon: Bell,
                title: 'Notificações por e-mail',
                desc: 'Membros escalados recebem aviso automático ao publicar a escala.',
              },
              {
                icon: Calendar,
                title: 'Agenda de celebrações',
                desc: 'Organize missas, novenas e celebrações com data, horário e tipo.',
              },
              {
                icon: Layers,
                title: 'Pastorais organizadas',
                desc: 'Crie grupos ministeriais e associe membros a cada pastoral da paróquia.',
              },
              {
                icon: CheckCircle,
                title: 'Confirmação de presença',
                desc: 'Membros confirmam ou recusam presença diretamente pelo e-mail ou painel.',
              },
              {
                icon: ShieldCheck,
                title: 'Controle de acesso',
                desc: 'Papéis distintos para administradores, coordenadores e membros.',
              },
              {
                icon: Church,
                title: 'Multi-paróquia',
                desc: 'Cada paróquia tem seu ambiente isolado, seguro e independente.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-[#002045]/20 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#002045]/8 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-[#002045]" />
                </div>
                <h3 className="font-heading font-semibold text-[#002045] mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Como funciona ─── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#002045] mb-4">
              Simples de começar
            </h2>
            <p className="text-muted-foreground text-lg">
              Em minutos sua paróquia está organizada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Cadastre sua paróquia',
                desc: 'Ative o trial gratuito de 30 dias e acesse o painel imediatamente, sem informar cartão.',
              },
              {
                step: '02',
                title: 'Configure membros e pastorais',
                desc: 'Cadastre sua equipe, associe a grupos ministeriais e registre disponibilidades.',
              },
              {
                step: '03',
                title: 'Crie escalas e publique',
                desc: 'Monte a escala, o sistema valida conflitos e notifica todos automaticamente.',
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#002045] text-white font-heading font-bold text-lg flex items-center justify-center mb-5 shadow-lg shadow-[#002045]/30">
                  {s.step}
                </div>
                <h3 className="font-heading font-semibold text-[#002045] text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Planos ─── */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#002045] mb-4">
              Planos acessíveis
            </h2>
            <p className="text-muted-foreground text-lg">
              Escolha o plano ideal para o tamanho da sua paróquia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Plano Teste */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trial</span>
                <div className="flex items-end gap-1 mt-2">
                  <span className="font-heading text-4xl font-bold text-[#002045]">30 dias</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Grátis — sem cobrança agora</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Membros ilimitados',
                  'Pastorais ilimitadas',
                  'Celebrações ilimitadas',
                  'Escalas e publicação',
                  'Notificações por e-mail',
                  'Confirmação de presença',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#002045]/60 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register?plan=basico"
                className="w-full inline-flex items-center justify-center border-2 border-[#002045] text-[#002045] font-semibold rounded-xl px-6 py-3 hover:bg-[#002045] hover:text-white transition-colors"
              >
                Iniciar trial gratuito
              </Link>
            </div>

            {/* Plano Pro */}
            <div className="bg-[#002045] rounded-2xl border-2 border-[#002045] p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-[#fed65b] text-[#002045] text-xs font-bold rounded-full px-3 py-1">
                  RECOMENDADO
                </span>
              </div>

              <div className="mb-6">
                <span className="text-sm font-semibold text-white/60 uppercase tracking-wider">Pro</span>
                <div className="flex items-end gap-1 mt-2">
                  <span className="font-heading text-4xl font-bold text-white">R$&nbsp;99</span>
                  <span className="text-white/60 mb-1">/mês</span>
                </div>
                <p className="text-sm text-white/60 mt-2">Para paróquias em crescimento</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {[
                  'Membros ilimitados',
                  'Pastorais ilimitadas',
                  'Celebrações ilimitadas',
                  'Escalas e publicação',
                  'Notificações por e-mail',
                  'Confirmação de presença',
                  'Suporte prioritário',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-[#fed65b] shrink-0" />
                    <span className="text-white">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register?plan=pro"
                className="w-full inline-flex items-center justify-center bg-[#fed65b] text-[#002045] font-semibold rounded-xl px-6 py-3 hover:bg-[#fece3e] transition-colors"
              >
                Começar com Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-[#002045] to-[#1a365d]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
            Pronto para organizar sua paróquia?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Junte-se a paróquias que já usam o Paróquia+ para escalar com simplicidade.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#fed65b] text-[#002045] font-semibold rounded-xl px-10 py-4 hover:bg-[#fece3e] transition-colors text-base shadow-lg shadow-black/20"
          >
            Cadastrar minha paróquia
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#001530] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-lg font-bold text-white">Paróquia+</span>
          <p className="text-sm text-white/40 text-center">
            © {new Date().getFullYear()} Paróquia+. Gestão litúrgica para comunidades católicas.
          </p>
          <div className="flex gap-4 text-sm text-white/50">
            <Link href="/login" className="hover:text-white/80 transition-colors">Entrar</Link>
            <Link href="/register" className="hover:text-white/80 transition-colors">Cadastrar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
