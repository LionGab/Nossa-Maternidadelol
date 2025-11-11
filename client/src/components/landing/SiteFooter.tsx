import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-serif font-bold text-foreground mb-3">
              Nossa Maternidade
            </h3>
            <p className="text-sm text-muted-foreground">
              Acolhimento, orientação e rotina leve para mães que querem menos culpa e mais apoio.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacidade" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-muted-foreground hover:text-foreground transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-3">Sobre</h4>
            <p className="text-sm text-muted-foreground">
              Criado com carinho pela Nathália Valente e sua equipe.
            </p>
          </div>
        </div>

        <div className="border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 Nossa Maternidade · Teste fechado para avaliação</p>
        </div>
      </div>
    </footer>
  );
}
