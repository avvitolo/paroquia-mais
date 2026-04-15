// Layout público — passthrough; cada página controla seu próprio layout de tela cheia
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
