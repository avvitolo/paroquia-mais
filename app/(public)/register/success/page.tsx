// Página de sucesso pós-pagamento Stripe (Story 1.3)
// Exibida após o checkout ser concluído com sucesso
export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#002045] to-[#1a365d] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8 text-center">
        {/* Ícone de sucesso */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="font-heading text-2xl font-bold text-[#002045] mb-3">
          Paróquia registrada!
        </h1>

        <p className="text-muted-foreground mb-6">
          Verifique seu e-mail para acessar o sistema. Você receberá um link de acesso em breve.
        </p>

        <a
          href="/login"
          className="inline-block w-full rounded-md bg-[#002045] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a365d] transition-colors"
        >
          Ir para o login
        </a>
      </div>
    </main>
  )
}
