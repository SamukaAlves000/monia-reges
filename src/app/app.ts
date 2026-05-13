import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { animate, stagger } from 'motion';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private snackBar = inject(MatSnackBar);
  
  isScrolled = signal(false);
  isMenuOpen = signal(false);
  canInstall = signal(false);
  deferredPrompt: any;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkInstallState();
      
      // Captura o evento se ele já tiver disparado ou quando disparar
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.canInstall.set(true);
        console.log('[PWA] Evento beforeinstallprompt capturado via addEventListener');
      });
    }
  }

  private checkInstallState() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone 
                         || document.referrer.includes('android-app://');
    
    // Se já estiver instalado, não mostramos o botão
    this.canInstall.set(!isStandalone);
  }

  @HostListener('window:beforeinstallprompt', ['$event'])
  onbeforeinstallprompt(e: any) {
    // Mantendo HostListener por redundância, mas o addEventListener no ngOnInit costuma ser mais confiável em alguns casos
    e.preventDefault();
    this.deferredPrompt = e;
    this.canInstall.set(true);
    console.log('[PWA] Evento beforeinstallprompt capturado via HostListener');
  }

  @HostListener('window:appinstalled', ['$event'])
  onAppInstalled(e: any) {
    console.log('[PWA] Aplicativo instalado com sucesso');
    this.deferredPrompt = null;
    this.canInstall.set(false);
    this.snackBar.open('Aplicativo instalado com sucesso!', 'Fechar', { duration: 3000 });
  }

  async installPwa() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Usuário aceitou a instalação');
        this.canInstall.set(false);
      } else {
        console.log('[PWA] Usuário recusou a instalação');
      }
      this.deferredPrompt = null;
    } else {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                           || (window.navigator as any).standalone 
                           || document.referrer.includes('android-app://');
      
      if (isStandalone) {
        this.snackBar.open('O aplicativo já está instalado e em execução.', 'Entendi');
      } else {
        // Se for iOS ou o browser não suportar o prompt automático
        this.snackBar.open(
          'Para instalar: No Chrome clique nos três pontos (⋮) > "Instalar App". No iOS/Safari clique em Compartilhar (↑) > "Adicionar à Tela de Início".',
          'Fechar',
          { duration: 10000 }
        );
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      this.isScrolled.set(window.scrollY > 50);
    }
  }

  stats = [
    { value: 'R$ 800mil', label: 'Investimento em Saúde', icon: 'medical_services' },
    { value: 'R$ 436mil', label: 'Investimento em Educação', icon: 'school' },
    { value: '+Destaque', label: 'Mais citada pela população', icon: 'trending_up' },
  ];

  projects = [
    {
      title: 'Saúde Mental nas Escolas',
      desc: 'Projeto de Lei Nº 004/2026 que institui a Semana de Promoção da Saúde Mental na rede municipal.',
      status: 'Aprovado',
      impact: 'Combate ao bullying e ansiedade',
      icon: 'psychology',
    },
    {
      title: 'Transporte Escolar Digno',
      desc: 'Conquista de R$ 436 mil para aquisição de novos ônibus escolares para o município.',
      status: 'Entregue',
      impact: 'Segurança para os estudantes',
      icon: 'directions_bus',
    },
    {
      title: 'Van para TFD',
      desc: 'Investimento de R$ 300 mil para aquisição de van destinada ao Tratamento Fora do Domicílio.',
      status: 'Concluído',
      impact: 'Qualidade no transporte de pacientes',
      icon: 'airport_shuttle',
    },
    {
      title: 'Custeio da Saúde',
      desc: 'Destinação de R$ 500 mil para fortalecer o atendimento básico e suporte à população.',
      status: 'Em execução',
      impact: 'Melhoria no atendimento local',
      icon: 'health_and_safety',
    },
  ];

  transparency = [
    { label: 'Saúde Mental e Bem-estar', value: 95, color: 'bg-pink-600' },
    { label: 'Apoio à Agricultura Familiar', value: 85, color: 'bg-pink-500' },
    { label: 'Presença em Sessões', value: 100, color: 'bg-pink-700' },
    { label: 'Escuta Comunitária', value: 98, color: 'bg-pink-400' },
  ];

  testimonials = [
    {
      name: 'Maria Divina',
      role: 'Agricultora Familiar',
      text: 'Mônia conhece nossa realidade de perto e sempre lutou pela valorização do homem e da mulher do campo.',
      stars: 5,
    },
    {
      name: 'Antônio José',
      role: 'Usuário do TFD',
      text: 'A nova van para o tratamento fora do domicílio trouxe muito mais conforto para quem precisa viajar para consultas.',
      stars: 5,
    },
    {
      name: 'Fernanda Lima',
      role: 'Professora',
      text: 'O projeto de saúde mental nas escolas é um marco necessário para proteger nossas crianças e jovens.',
      stars: 5,
    },
  ];

  news = [
    {
      title: 'R$ 800 mil garantidos para a Saúde de Campos Belos',
      date: '10 Maio, 2026',
      summary: 'Recursos destinados ao custeio e aquisição de van para transporte de pacientes.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'Novo ônibus escolar para nossos estudantes',
      date: '05 Maio, 2026',
      summary: 'Investimento de R$ 436 mil assegura transporte digno e seguro para a zona rural e urbana.',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'Destaque na Câmara Municipal segundo opinião pública',
      date: '01 Maio, 2026',
      summary: 'Vereadora Mônia Reges aparece entre os nomes mais citados por sua atuação ativa.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    },
  ];

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnimations();
    }
  }

  private initAnimations() {
    if (!isPlatformBrowser(this.platformId)) return;
    // Initial entrance animations
    animate(
      '.reveal',
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.8, delay: 0.2, ease: 'easeOut' }
    );

    // Staggered lists if visible (simplified for demonstration)
    animate(
      '.stagger-item',
      { opacity: [0, 1], scale: [0.95, 1] },
      { delay: stagger(0.1), duration: 0.5 }
    );
  }

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  scrollToContact() {
    if (isPlatformBrowser(this.platformId)) {
      const el = document.getElementById('contato');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
